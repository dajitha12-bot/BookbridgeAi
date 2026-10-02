'use server';

import { getSession } from '../lib/auth/session';
import { createRental, getAllRentals, getRentalById } from '../lib/db/rentals';
import { getBookById, updateBook } from '../lib/db/books';
import { getProfileByUserId, getUserById } from '../lib/db/users';
import { createNotification } from '../lib/db/notifications';
import { createOrder, updateOrder } from '../lib/db/orders';
import { createPayment, getPaymentByOrderId, updatePayment } from '../lib/db/payments';
import { createDelivery, getDeliveryByOrderId, getAllDeliveries, updateDelivery } from '../lib/db/deliveries';
import { sendPaymentEmailToBuyer, sendOrderConfirmationEmail, sendSellerOrderEmail } from '../lib/utils/emailNotifier';
import { getSellerUpiByUserId } from '../lib/db/sellerUpi';
import { createTrackingEvent } from '../lib/db/trackingEvents';
import { revalidatePath } from 'next/cache';

/**
 * Rent a book for a specific duration with handover selection (Home Delivery vs Offline Pickup)
 * Matches the same payment model flow as book purchases (initiate payment & dispatch email with payment button).
 */
export async function createRentalAction(
  bookId: string,
  durationDays: number,
  paymentMethod: 'ONLINE' | 'COD',
  deliveryMethod: 'DELIVERY' | 'PICKUP' = 'DELIVERY',
  buyerEmailInput?: string
) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const book = await getBookById(bookId);
    if (!book || book.status !== 'AVAILABLE') {
      return { success: false, error: 'Book is no longer available.' };
    }

    if (book.ownerId === session.id) {
      return { success: false, error: 'You cannot rent your own book.' };
    }

    const seller = await getUserById(book.ownerId);
    if (!seller) return { success: false, error: 'Book owner not found.' };

    const buyerEmail = buyerEmailInput || session.email || 'buyer@bookbridge.com';

    // Rental fee structure: ₹10/day + ₹50 base fee + ₹40 delivery if home delivery
    const deliveryFee = deliveryMethod === 'DELIVERY' ? 40 : 0;
    const baseRentalFee = (durationDays * 10) + 50;
    const totalAmount = baseRentalFee + deliveryFee;

    // 1. Reserve book status
    await updateBook(bookId, { status: 'RESERVED' });

    // 2. Log rental record in SQLite
    const rental = await createRental({
      bookId,
      renterId: session.id,
      ownerId: book.ownerId,
      durationDays,
      rentalFee: baseRentalFee,
      paymentStatus: paymentMethod === 'ONLINE' ? 'PENDING' : 'COD',
    });

    // 3. Create Order record (PENDING state matching sales checkout)
    const order = await createOrder({
      buyerId: session.id,
      sellerId: book.ownerId,
      bookId: book.id,
      amount: baseRentalFee,
      deliveryMethod,
      paymentStatus: paymentMethod === 'ONLINE' ? 'PENDING' : 'COD',
      orderStatus: 'PENDING',
      pickupLocation: `Rental Contract: ${durationDays} Days (${deliveryMethod})`,
    });

    // 4. Create payment log
    const payment = await createPayment({
      orderId: order.id,
      rentalId: rental.id,
      amount: baseRentalFee,
      deliveryCharge: deliveryFee,
      totalAmount,
      method: paymentMethod,
      status: paymentMethod === 'ONLINE' ? 'PENDING' : 'COD',
      transactionId: paymentMethod === 'ONLINE' ? `PENDING-RENT-${Date.now()}` : `COD-RENT-${Date.now()}`,
    });

    // 5. Schedule outbound delivery if Home Delivery chosen (unassigned staff initially)
    let deliveryRecord = null;
    if (deliveryMethod === 'DELIVERY') {
      const buyerProfile = await getProfileByUserId(session.id);
      const sellerProfile = await getProfileByUserId(book.ownerId);

      const pickupAddress = sellerProfile ? `${sellerProfile.address}, ${sellerProfile.area}, ${sellerProfile.city}` : `${book.area}, ${book.city}`;
      const deliveryAddress = buyerProfile ? `${buyerProfile.address}, ${buyerProfile.area}, ${buyerProfile.city}` : 'Renter Delivery Address';

      deliveryRecord = await createDelivery({
        orderId: order.id,
        rentalId: rental.id,
        staffId: '', // Unassigned - Admin assigns staff
        deliveryType: 'RENTAL' as any,
        status: 'PENDING',
        pickupAddress,
        deliveryAddress,
        deliveryCharge: deliveryFee,
      });

      await createTrackingEvent({
        orderId: order.id,
        deliveryId: deliveryRecord.id,
        status: 'PENDING',
        stageName: 'Rental Order Placed',
        locationName: book.city,
        description: `Rental request initiated for ${durationDays} days. Awaiting Admin confirmation & staff assignment.`,
      });
    }

    const sellerUpiId = await getSellerUpiByUserId(book.ownerId);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentUrl = `${baseUrl}/payment/confirm/${order.id}`;

    if (paymentMethod === 'ONLINE') {
      // Dispatch Payment Email to Buyer with link redirecting to payment checkout & receipt page
      await sendPaymentEmailToBuyer({
        buyerEmail,
        buyerName: session.name || 'Valued Renter',
        orderId: order.id,
        bookTitle: book.title,
        sellerName: seller.name,
        bookAmount: baseRentalFee,
        deliveryCharge: deliveryFee,
        totalAmount,
        paymentUrl,
        paymentId: payment.id,
      }).catch(err => console.warn('Rental payment email error:', err));

      await createNotification(
        session.id,
        'Rental Payment Link Sent!',
        `Payment request sent to ${buyerEmail} for "${book.title}". Order #${order.id}. Total: ₹${totalAmount}.`
      );

      revalidatePath('/dashboard/rentals');
      return {
        success: true,
        orderId: order.id,
        rentalId: rental.id,
        paymentId: payment.id,
        paymentUrl,
        totalAmount,
        sellerUpiId,
        isOnlinePayment: true,
      };
    } else {
      // COD Flow
      await createNotification(
        book.ownerId,
        'Book Rented (COD)!',
        `Your book "${book.title}" was rented by ${session.name} for ${durationDays} days (COD). Order ID: ${order.id}.`
      );

      await createNotification(
        session.id,
        'Rental Confirmed (COD)!',
        `Your rental for "${book.title}" (${durationDays} days) has been placed via Cash on Delivery. Order ID: ${order.id}.`
      );

      revalidatePath('/dashboard/rentals');
      return {
        success: true,
        orderId: order.id,
        rentalId: rental.id,
        paymentId: payment.id,
        totalAmount,
        sellerUpiId,
        isOnlinePayment: false,
      };
    }
  } catch (error: any) {
    console.error('createRentalAction error:', error);
    return { success: false, error: error.message || 'Failed to request rental.' };
  }
}

/**
 * Schedule Rental Return Pickup for the SAME Delivery Staff after rental duration ends
 */
export async function scheduleRentalReturnPickupAction(rentalId: string) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'DELIVERY_STAFF')) {
      return { success: false, error: 'Unauthorized.' };
    }

    const rental = await getRentalById(rentalId);
    if (!rental) return { success: false, error: 'Rental record not found.' };

    const book = await getBookById(rental.bookId);
    const renter = await getUserById(rental.renterId);
    const owner = await getUserById(rental.ownerId);

    // Find original outbound delivery to get the SAME delivery staff ID
    const deliveries = await getAllDeliveries();
    const originalDelivery = deliveries.find(d => d.rentalId === rentalId || (d.orderId && d.orderId === rental.bookId));
    const staffId = originalDelivery?.staffId || session.id;

    const renterProfile = await getProfileByUserId(rental.renterId);
    const ownerProfile = await getProfileByUserId(rental.ownerId);

    const pickupAddress = renterProfile 
      ? `${renterProfile.address}, ${renterProfile.area}, ${renterProfile.city}` 
      : 'Renter Address (Book Collection)';
    const deliveryAddress = ownerProfile 
      ? `${ownerProfile.address}, ${ownerProfile.area}, ${ownerProfile.city}` 
      : 'Owner Address (Book Return)';

    // Create RENTAL_RETURN delivery task assigned to SAME staff
    const returnDelivery = await createDelivery({
      orderId: originalDelivery?.orderId || null,
      rentalId: rental.id,
      staffId, // SAME delivery staff!
      deliveryType: 'RENTAL_RETURN' as any,
      status: 'ASSIGNED',
      pickupAddress,
      deliveryAddress,
      deliveryCharge: 40,
    });

    await createNotification(
      staffId,
      'Rental Book Return Pickup Task Assigned!',
      `Rental duration ended for "${book?.title || 'Book'}". Please pickup book from renter ${renter?.name} and return to owner ${owner?.name}.`
    );

    revalidatePath('/staff');
    revalidatePath('/staff/assigned');
    revalidatePath('/staff/rental-deliveries');

    return { success: true, deliveryId: returnDelivery.id, staffId };
  } catch (error: any) {
    console.error('scheduleRentalReturnPickupAction error:', error);
    return { success: false, error: error.message || 'Failed to schedule return pickup.' };
  }
}

/**
 * Get active rentals for current user
 */
export async function getMyRentalsAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.', rentals: [] };

    const list = await getAllRentals();
    const userRentals = list.filter(r => r.renterId === session.id || r.ownerId === session.id);
    
    userRentals.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    return { success: true, rentals: userRentals };
  } catch (error: any) {
    return { success: false, error: 'Failed to retrieve rentals.', rentals: [] };
  }
}
