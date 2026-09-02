'use server';

import { getOrderById, getAllOrders, createOrder, updateOrder } from '../lib/db/orders';
import { getBookById, updateBook } from '../lib/db/books';
import { getProfileByUserId, getUserById } from '../lib/db/users';
import { createPayment, getPaymentByOrderId, updatePayment } from '../lib/db/payments';
import { createDelivery, getDeliveryByOrderId, getDeliveryById, updateDelivery, getAllDeliveryStaff, getDeliveryStaffById, updateDeliveryStaff, getAllDeliveries } from '../lib/db/deliveries';
import { createNotification } from '../lib/db/notifications';
import { getSession } from '../lib/auth/session';
import { recommendDeliveryStaff } from '../lib/utils/deliveryStaffRules';
import { revalidatePath } from 'next/cache';

/**
 * Create Order Action (Checkout workflow)
 */
export async function createOrderAction(
  bookId: string,
  deliveryMethod: 'DELIVERY' | 'PICKUP',
  paymentMethod: 'ONLINE' | 'COD',
  demoPaymentDetails?: { cardNumber?: string; transactionId?: string }
) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const book = await getBookById(bookId);
    if (!book || book.status !== 'AVAILABLE') {
      return { success: false, error: 'This book is no longer available.' };
    }

    if (book.ownerId === session.id) {
      return { success: false, error: 'You cannot purchase your own book.' };
    }

    const buyerProfile = await getProfileByUserId(session.id);
    if (!buyerProfile) {
      return { success: false, error: 'Please update your address profile before checkout.' };
    }

    const seller = await getUserById(book.ownerId);
    if (!seller) {
      return { success: false, error: 'Seller account not found.' };
    }

    // Determine payment status
    let paymentStatus = 'PENDING';
    if (paymentMethod === 'COD') {
      paymentStatus = 'COD';
    } else if (paymentMethod === 'ONLINE') {
      paymentStatus = 'PAID';
    }

    // Determine initial order status
    const orderStatus = deliveryMethod === 'PICKUP' ? 'READY_FOR_PICKUP' : 'PENDING';

    // 1. Reserve the book
    await updateBook(bookId, { status: 'RESERVED' });

    // 2. Create the order
    const newOrder = await createOrder({
      buyerId: session.id,
      sellerId: book.ownerId,
      bookId: book.id,
      amount: book.expectedPrice,
      deliveryMethod,
      paymentStatus: paymentStatus as any,
      orderStatus: orderStatus as any,
      pickupLocation: deliveryMethod === 'PICKUP' ? 'Anna Nagar Bus Stand' : null,
    });

    // 3. Create the payment log
    await createPayment({
      orderId: newOrder.id,
      amount: book.expectedPrice,
      method: paymentMethod,
      status: paymentStatus as any,
      transactionId: demoPaymentDetails?.transactionId || `TXN_DEMO_${Date.now()}`,
    });

    // 4. Create the delivery log if home delivery is selected
    if (deliveryMethod === 'DELIVERY') {
      await createDelivery({
        orderId: newOrder.id,
        staffId: '', // Unassigned initially
        status: 'PENDING' as any,
      });
    }

    // 5. Notifications
    await createNotification(
      book.ownerId,
      'Book Ordered!',
      `Your book "${book.title}" has been ordered by ${session.name}. Method: ${deliveryMethod}.`
    );

    await createNotification(
      session.id,
      'Order Placed successfully!',
      `Your order for "${book.title}" has been placed. Order ID: ${newOrder.id}.`
    );

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/sales');
    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    console.error('Checkout error:', error);
    return { success: false, error: error.message || 'Failed to place order.' };
  }
}

/**
 * Get Delivery Staff Recommendations for a specific Delivery
 */
export async function getDeliveryStaffRecommendationsAction(deliveryId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' };
    }

    const delivery = await getDeliveryByOrderId(deliveryId) || await getDeliveryById(deliveryId);
    if (!delivery) return { success: false, error: 'Delivery record not found.' };

    const order = await getOrderById(delivery.orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    const book = await getBookById(order.bookId);
    if (!book) return { success: false, error: 'Book not found.' };

    const sellerProfile = await getProfileByUserId(order.sellerId);
    if (!sellerProfile) return { success: false, error: 'Seller location is missing.' };

    const staffList = await getAllDeliveryStaff();

    // Map profiles
    const staffWithProfiles = await Promise.all(
      staffList.map(async (s) => {
        const profile = await getProfileByUserId(s.userId);
        return {
          id: s.userId,
          name: s.name,
          phone: s.phone,
          city: s.city,
          area: s.area,
          serviceArea: s.serviceArea,
          availability: s.availability,
          activeDeliveries: s.activeDeliveries,
          status: 'ACTIVE', // Default status mock
          user: {
            profile,
          },
        };
      })
    );

    const recommendations = recommendDeliveryStaff(
      book.city,
      book.area,
      sellerProfile.latitude,
      sellerProfile.longitude,
      staffWithProfiles
    );

    return { success: true, recommendations };
  } catch (error: any) {
    console.error('Staff recommendations error:', error);
    return { success: false, error: 'Failed to retrieve recommendations.' };
  }
}

/**
 * Assign Staff Action (Invoked by Admin)
 */
export async function assignStaffAction(deliveryId: string, staffId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' };
    }

    const delivery = await getDeliveryByOrderId(deliveryId) || await getDeliveryById(deliveryId);
    if (!delivery) return { success: false, error: 'Delivery not found.' };

    const order = await getOrderById(delivery.orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    const book = await getBookById(order.bookId);
    if (!book) return { success: false, error: 'Book not found.' };

    const staff = await getDeliveryStaffById(staffId);
    if (!staff) return { success: false, error: 'Delivery staff not found.' };

    // 1. Link staff to delivery
    await updateDelivery(delivery.id, {
      staffId,
      status: 'CONFIRMED' as any,
    });

    // 2. Update order status to CONFIRMED
    await updateOrder(order.id, { orderStatus: 'CONFIRMED' });

    // 3. Increment active deliveries for staff
    await updateDeliveryStaff(staffId, { activeDeliveries: staff.activeDeliveries + 1 });

    // 4. Notifications
    await createNotification(
      staff.userId,
      'New Delivery Assigned',
      `You have been assigned to deliver the book "${book.title}".`
    );

    await createNotification(
      order.buyerId,
      'Delivery Staff Assigned',
      `Delivery staff ${staff.name} has been assigned to deliver your book "${book.title}".`
    );

    revalidatePath('/admin/deliveries');
    return { success: true };
  } catch (error: any) {
    console.error('Assign staff error:', error);
    return { success: false, error: 'Failed to assign staff.' };
  }
}

/**
 * Update Delivery Status Action (Invoked by Delivery Staff)
 */
export async function updateDeliveryStatusAction(deliveryId: string, status: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DELIVERY_STAFF') {
      return { success: false, error: 'Unauthorized.' };
    }

    const delivery = await getDeliveryById(deliveryId) || await getDeliveryByOrderId(deliveryId);
    if (!delivery) return { success: false, error: 'Delivery not found.' };

    const order = await getOrderById(delivery.orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    const book = await getBookById(order.bookId);
    if (!book) return { success: false, error: 'Book not found.' };

    // 1. Update delivery status
    await updateDelivery(delivery.id, { status: status as any });

    // 2. Map order status matching delivery status
    let orderStatus = 'PROCESSING';
    if (status === 'PICKED_UP') orderStatus = 'PICKED_UP';
    else if (status === 'IN_TRANSIT') orderStatus = 'IN_TRANSIT';
    else if (status === 'OUT_FOR_DELIVERY') orderStatus = 'OUT_FOR_DELIVERY';
    else if (status === 'DELIVERED') orderStatus = 'DELIVERED';

    await updateOrder(order.id, {
      orderStatus: orderStatus as any,
      paymentStatus: status === 'DELIVERED' ? 'PAID' : undefined,
    });

    // If delivered, finalize workload and mark book as SOLD
    if (status === 'DELIVERED') {
      const staff = await getDeliveryStaffById(delivery.staffId);
      if (staff) {
        await updateDeliveryStaff(delivery.staffId, {
          activeDeliveries: Math.max(0, staff.activeDeliveries - 1),
        });
      }

      await updateBook(order.bookId, { status: 'SOLD' });

      // Update payment log status
      const payment = await getPaymentByOrderId(order.id);
      if (payment) {
        await updatePayment(payment.id, { status: 'PAID' });
      }
    }

    // 3. Create notifications
    await createNotification(
      order.buyerId,
      'Delivery Status Updated',
      `Your package for "${book.title}" is now: ${status}.`
    );

    await createNotification(
      order.sellerId,
      'Book Delivery Updated',
      `The delivery status of "${book.title}" is now: ${status}.`
    );

    revalidatePath('/staff');
    revalidatePath('/dashboard/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Update delivery status error:', error);
    return { success: false, error: 'Failed to update status.' };
  }
}

/**
 * Confirm Pickup Action (For Offline Pickup completion)
 */
export async function confirmPickupAction(orderId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const order = await getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    if (order.buyerId !== session.id && order.sellerId !== session.id && session.role !== 'ADMIN') {
      return { success: false, error: 'Permission denied.' };
    }

    // Update order status to DELIVERED
    await updateOrder(orderId, {
      orderStatus: 'DELIVERED',
      paymentStatus: 'PAID',
    });

    const book = await getBookById(order.bookId);
    if (!book) return { success: false, error: 'Book details not found.' };

    // Update book status to SOLD
    await updateBook(order.bookId, { status: 'SOLD' });

    // Update payment status
    const payment = await getPaymentByOrderId(orderId);
    if (payment) {
      await updatePayment(payment.id, { status: 'PAID' });
    }

    // Notify
    await createNotification(
      order.buyerId,
      'Pickup Confirmed!',
      `Your offline pickup for "${book.title}" has been completed successfully.`
    );

    await createNotification(
      order.sellerId,
      'Pickup Confirmed!',
      `Your book "${book.title}" has been picked up by the buyer.`
    );

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/sales');
    return { success: true };
  } catch (error: any) {
    console.error('Confirm pickup error:', error);
    return { success: false, error: 'Failed to confirm pickup.' };
  }
}

/**
 * Fetch orders bought by current user
 */
export async function getUserOrdersAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.', orders: [] };

    const allOrders = await getAllOrders();
    const userOrders = allOrders.filter(o => o.buyerId === session.id);

    const orders = await Promise.all(
      userOrders.map(async (order) => {
        const book = await getBookById(order.bookId);
        const seller = await getUserById(order.sellerId);
        const delivery = await getDeliveryByOrderId(order.id);
        const staff = delivery ? await getDeliveryStaffById(delivery.staffId) : null;

        return {
          ...order,
          book,
          seller,
          deliveries: delivery
            ? [
                {
                  ...delivery,
                  staff,
                },
              ]
            : [],
        };
      })
    );

    return { success: true, orders };
  } catch (error) {
    return { success: false, error: 'Failed to fetch orders.', orders: [] };
  }
}

/**
 * Fetch sales listed by current user
 */
export async function getUserSalesAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.', sales: [] };

    const allOrders = await getAllOrders();
    const userSales = allOrders.filter(o => o.sellerId === session.id);

    const sales = await Promise.all(
      userSales.map(async (order) => {
        const book = await getBookById(order.bookId);
        const buyer = await getUserById(order.buyerId);
        const delivery = await getDeliveryByOrderId(order.id);

        return {
          ...order,
          book,
          buyer,
          deliveries: delivery ? [delivery] : [],
        };
      })
    );

    return { success: true, sales };
  } catch (error) {
    return { success: false, error: 'Failed to fetch sales.', sales: [] };
  }
}

/**
 * Fetch deliveries assigned to delivery staff
 */
export async function getAssignedDeliveriesAction() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'DELIVERY_STAFF') {
      return { success: false, error: 'Unauthorized.', deliveries: [] };
    }

    const allDeliveries = await getAllDeliveries();
    const staffDeliveries = allDeliveries.filter(d => d.staffId === session.id);

    const deliveries = await Promise.all(
      staffDeliveries.map(async (delivery) => {
        const order = await getOrderById(delivery.orderId);
        let book = null;
        let buyer = null;
        let seller = null;

        if (order) {
          book = await getBookById(order.bookId);
          buyer = await getUserById(order.buyerId);
          seller = await getUserById(order.sellerId);
        }

        return {
          ...delivery,
          order: order
            ? {
                ...order,
                book,
                buyer,
                seller,
              }
            : null,
        };
      })
    );

    return { success: true, deliveries };
  } catch (error) {
    return { success: false, error: 'Failed to fetch assigned deliveries.', deliveries: [] };
  }
}

/**
 * Fetch all orders in the system (Admin only)
 */
export async function getAllSystemOrdersAction() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.', orders: [] };
    }

    const allOrders = await getAllOrders();

    const orders = await Promise.all(
      allOrders.map(async (order) => {
        const book = await getBookById(order.bookId);
        const buyer = await getUserById(order.buyerId);
        const seller = await getUserById(order.sellerId);
        const delivery = await getDeliveryByOrderId(order.id);
        const staff = delivery ? await getDeliveryStaffById(delivery.staffId) : null;

        return {
          ...order,
          book,
          buyer,
          seller,
          deliveries: delivery
            ? [
                {
                  ...delivery,
                  staff,
                },
              ]
            : [],
        };
      })
    );

    return { success: true, orders };
  } catch (error) {
    return { success: false, error: 'Failed to fetch all orders.', orders: [] };
  }
}
