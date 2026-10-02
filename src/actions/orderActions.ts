'use server';

import { getOrderById, getAllOrders, createOrder, updateOrder } from '../lib/db/orders';
import { getBookById, updateBook } from '../lib/db/books';
import { getProfileByUserId, getUserById } from '../lib/db/users';
import { createPayment, getPaymentByOrderId, updatePayment } from '../lib/db/payments';
import { createDelivery, getDeliveryByOrderId, getDeliveryById, updateDelivery, getAllDeliveryStaff, getDeliveryStaffById, updateDeliveryStaff, getAllDeliveries } from '../lib/db/deliveries';
import { createNotification } from '../lib/db/notifications';
import { getSession } from '../lib/auth/session';
import { recommendDeliveryStaff } from '../lib/utils/deliveryStaffRules';
import { getSellerUpiByUserId } from '../lib/db/sellerUpi';
import { sendOrderConfirmationEmail, sendSellerOrderEmail, sendPaymentEmailToBuyer } from '../lib/utils/emailNotifier';
import { revalidatePath } from 'next/cache';

/**
 * Initiate Order Payment Action (Checkout workflow - Step 1: Create pending order & send payment email)
 */
export async function initiateOrderPaymentAction(
  bookId: string,
  deliveryMethod: 'DELIVERY' | 'PICKUP',
  paymentMethod: 'ONLINE' | 'COD',
  buyerEmailInput?: string
) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const book = await getBookById(bookId);
    if (!book) {
      return { success: false, error: 'Book record not found.' };
    }

    // Keep book available for repeated sample pay checkout demo testing
    if (book.status !== 'AVAILABLE') {
      await updateBook(bookId, { status: 'AVAILABLE' });
    }

    let sellerId = book.ownerId;
    if (sellerId === session.id) {
      sellerId = 'usr-user3'; // Fallback seller for self-checkout demo testing
    }

    let buyerProfile = await getProfileByUserId(session.id);
    if (!buyerProfile || !buyerProfile.address) {
      buyerProfile = {
        userId: session.id,
        city: 'Chennai',
        area: 'Adyar',
        address: '10, Kasturiba Nagar, Adyar',
        pincode: '600020',
        latitude: 13.0067,
        longitude: 80.2572,
      };
    }

    const seller = (await getUserById(sellerId)) || { id: sellerId, name: 'Sample Seller', email: 'dajitha12@gmail.com' };

    // Resolve buyer email recipient with default fallback to user's mail id dajitha12@gmail.com
    const buyerEmail = (buyerEmailInput && buyerEmailInput.includes('@') && !buyerEmailInput.includes('bookbridge.com'))
      ? buyerEmailInput
      : (session.email && session.email.includes('@') && !session.email.includes('bookbridge.com') ? session.email : 'dajitha12@gmail.com');

    const deliveryFee = deliveryMethod === 'DELIVERY' ? 40 : 0;
    const totalAmount = book.expectedPrice + deliveryFee;

    // Determine payment and order status
    const isOnline = paymentMethod === 'ONLINE';
    const paymentStatus = isOnline ? 'PENDING' : 'COD';
    const orderStatus = 'PENDING'; // Always starts as PENDING (Waiting for Admin Confirmation)

    // 1. Create the order
    const newOrder = await createOrder({
      buyerId: session.id,
      sellerId,
      bookId: book.id,
      amount: book.expectedPrice,
      deliveryMethod,
      paymentStatus: paymentStatus as any,
      orderStatus: orderStatus as any,
      pickupLocation: deliveryMethod === 'PICKUP' ? 'Anna Nagar Bus Stand' : null,
    });

    // 3. Create the payment log in SQLite
    const payment = await createPayment({
      orderId: newOrder.id,
      amount: book.expectedPrice,
      deliveryCharge: deliveryFee,
      totalAmount: totalAmount,
      method: paymentMethod,
      status: paymentStatus as any,
      transactionId: isOnline ? `PENDING-UPI-${Date.now()}` : `COD-${Date.now()}`,
    });

    // 4. Create delivery log if delivery selected (NO automatic delivery staff assignment)
    if (deliveryMethod === 'DELIVERY') {
      await createDelivery({
        orderId: newOrder.id,
        staffId: '', // Explicitly unassigned
        status: 'PENDING' as any,
      });
    }

    const sellerUpiId = await getSellerUpiByUserId(book.ownerId);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentUrl = `${baseUrl}/payment/confirm/${newOrder.id}`;

    if (isOnline) {
      // Dispatch Payment Request Email to Buyer
      const emailRes = await sendPaymentEmailToBuyer({
        buyerEmail,
        buyerName: session.name || 'Valued Buyer',
        orderId: newOrder.id,
        bookTitle: book.title,
        sellerName: seller.name,
        bookAmount: book.expectedPrice,
        deliveryCharge: deliveryFee,
        totalAmount,
        paymentUrl,
      }).catch(err => ({ success: false, error: err.message }));

      await createNotification(
        session.id,
        'Payment Email Sent!',
        `Payment request sent to ${buyerEmail} for "${book.title}". Order ID: ${newOrder.id}. Amount: ₹${totalAmount}.`
      );

      revalidatePath('/dashboard/orders');
      return {
        success: true,
        orderId: newOrder.id,
        paymentId: payment.id,
        isOnlinePayment: true,
        paymentUrl,
        totalAmount,
        sellerUpiId,
        emailDispatched: emailRes?.success ?? true,
        emailError: emailRes?.error,
      };
    } else {
      // COD Flow
      await createNotification(
        book.ownerId,
        'Book Ordered (COD)!',
        `Your book "${book.title}" has been ordered by ${session.name} (COD). Order ID: ${newOrder.id}.`
      );

      await createNotification(
        session.id,
        'Order Placed (COD)!',
        `Your order for "${book.title}" has been placed via Cash on Delivery. Order ID: ${newOrder.id}.`
      );

      if (buyerEmail) {
        await sendOrderConfirmationEmail({
          buyerEmail,
          buyerName: session.name,
          orderId: newOrder.id,
          bookTitle: book.title,
          sellerName: seller.name,
          sellerUpiId,
          bookAmount: book.expectedPrice,
          deliveryCharge: deliveryFee,
          totalAmount,
          paymentMethod: 'COD',
          orderStatus: 'PENDING',
        }).catch(err => console.warn('COD Buyer email error:', err));
      }

      if (seller.email) {
        await sendSellerOrderEmail({
          sellerEmail: seller.email,
          sellerName: seller.name,
          buyerName: session.name,
          orderId: newOrder.id,
          bookTitle: book.title,
          bookAmount: book.expectedPrice,
          sellerUpiId,
        }).catch(err => console.warn('COD Seller email error:', err));
      }

      revalidatePath('/dashboard/orders');
      revalidatePath('/dashboard/sales');
      return {
        success: true,
        orderId: newOrder.id,
        paymentId: payment.id,
        isOnlinePayment: false,
        totalAmount,
        sellerUpiId,
      };
    }
  } catch (error: any) {
    console.error('Initiate order payment error:', error);
    return { success: false, error: error.message || 'Failed to initiate order.' };
  }
}

/**
 * Confirm Order Payment Action (Completes Demo UPI Payment from /payment/confirm/[orderId])
 */
export async function confirmOrderPaymentAction(
  orderId: string,
  demoUpiId?: string
) {
  try {
    const session = await getSession();
    const order = await getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    const payment = await getPaymentByOrderId(orderId);
    if (!payment) return { success: false, error: 'Payment record not found.' };

    const book = await getBookById(order.bookId);
    if (!book) return { success: false, error: 'Book record not found.' };

    const seller = await getUserById(order.sellerId);
    if (!seller) return { success: false, error: 'Seller not found.' };

    const buyer = await getUserById(order.buyerId);
    const buyerName = buyer?.name || session?.name || 'Valued Buyer';
    const buyerEmail = (buyer?.email && buyer.email.includes('@') && !buyer.email.includes('bookbridge.com'))
      ? buyer.email
      : (session?.email && session.email.includes('@') && !session.email.includes('bookbridge.com') ? session.email : 'dajitha12@gmail.com');

    const sellerUpiId = await getSellerUpiByUserId(order.sellerId);

    // Check if already paid
    if (payment.status === 'PAID') {
      return {
        success: true,
        orderId,
        paymentId: payment.id,
        transactionId: payment.transactionId,
        alreadyPaid: true,
        sellerUpiId,
      };
    }

    // Generate Demo UPI Transaction Reference
    const txnRef = `DEMO-UPI-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Update payment status in SQLite
    await updatePayment(payment.id, {
      status: 'PAID',
      transactionId: txnRef,
    });

    // 2. Update order status in SQLite -> paymentStatus: PAID, orderStatus: PENDING (Waiting for Admin Confirmation)
    // Note: NO automatic delivery staff assignment occurs here!
    await updateOrder(orderId, {
      paymentStatus: 'PAID',
      orderStatus: 'PENDING',
    });

    const deliveryFee = order.deliveryMethod === 'DELIVERY' ? 40 : 0;
    const totalAmount = order.amount + deliveryFee;

    // 3. System Notifications
    await createNotification(
      order.buyerId,
      'Payment Successful!',
      `Demo UPI payment of ₹${totalAmount} for "${book.title}" was confirmed. Order #${orderId} is now Waiting for Admin Confirmation. Txn Ref: ${txnRef}.`
    );

    await createNotification(
      order.sellerId,
      'Payment Received!',
      `Payment of ₹${order.amount} for "${book.title}" was confirmed via Demo UPI (${sellerUpiId}). Order #${orderId} is Waiting for Admin Confirmation.`
    );

    // 4. Send Confirmation Email to Buyer & Seller
    if (buyerEmail) {
      await sendOrderConfirmationEmail({
        buyerEmail,
        buyerName,
        orderId: order.id,
        bookTitle: book.title,
        sellerName: seller.name,
        sellerUpiId,
        bookAmount: order.amount,
        deliveryCharge: deliveryFee,
        totalAmount,
        paymentMethod: 'ONLINE',
        orderStatus: 'PENDING',
        paymentId: payment.id,
      }).catch(err => console.warn('Payment confirm buyer email error:', err));
    }

    if (seller.email) {
      await sendSellerOrderEmail({
        sellerEmail: seller.email,
        sellerName: seller.name,
        buyerName,
        orderId: order.id,
        bookTitle: book.title,
        bookAmount: order.amount,
        sellerUpiId,
      }).catch(err => console.warn('Payment confirm seller email error:', err));
    }

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/sales');

    return {
      success: true,
      orderId,
      paymentId: payment.id,
      transactionId: txnRef,
      sellerUpiId,
      totalAmount,
    };
  } catch (error: any) {
    console.error('Confirm order payment error:', error);
    return { success: false, error: error.message || 'Failed to confirm payment.' };
  }
}

/**
 * Get Order details for Payment Confirmation Page
 */
export async function getOrderForPaymentConfirmAction(orderId: string) {
  try {
    const order = await getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    const book = await getBookById(order.bookId);
    if (!book) return { success: false, error: 'Book record not found.' };

    const seller = await getUserById(order.sellerId);
    const sellerUpiId = await getSellerUpiByUserId(order.sellerId);
    const buyer = await getUserById(order.buyerId);
    const payment = await getPaymentByOrderId(orderId);

    const deliveryCharge = order.deliveryMethod === 'DELIVERY' ? 40 : 0;
    const totalAmount = order.amount + deliveryCharge;

    return {
      success: true,
      data: {
        order,
        book,
        seller: {
          id: seller?.id || order.sellerId,
          name: seller?.name || 'Seller',
          email: seller?.email || '',
        },
        sellerUpiId,
        buyer: {
          id: buyer?.id || order.buyerId,
          name: buyer?.name || 'Buyer',
          email: buyer?.email || '',
        },
        payment,
        deliveryCharge,
        totalAmount,
      },
    };
  } catch (error: any) {
    console.error('Get order for payment error:', error);
    return { success: false, error: error.message || 'Failed to fetch order details.' };
  }
}

/**
 * Legacy Create Order Action wrapper for backward compatibility
 */
export async function createOrderAction(
  bookId: string,
  deliveryMethod: 'DELIVERY' | 'PICKUP',
  paymentMethod: 'ONLINE' | 'COD',
  demoPaymentDetails?: { cardNumber?: string; transactionId?: string }
) {
  return initiateOrderPaymentAction(bookId, deliveryMethod, paymentMethod);
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
    if (status === 'REACHED_SELLER') orderStatus = 'PROCESSING';
    else if (status === 'PICKED_UP' || status === 'BOOK_RECEIVED') orderStatus = 'IN_TRANSIT';
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
