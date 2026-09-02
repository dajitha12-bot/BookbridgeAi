'use server';

import { getSession } from '../lib/auth/session';
import { createRental, getAllRentals } from '../lib/db/rentals';
import { getBookById, updateBook } from '../lib/db/books';
import { createNotification } from '../lib/db/notifications';
import { createOrder } from '../lib/db/orders';
import { createPayment } from '../lib/db/payments';
import { createDelivery } from '../lib/db/deliveries';
import { revalidatePath } from 'next/cache';

/**
 * Rent a book for a specific duration
 */
export async function createRentalAction(
  bookId: string,
  durationDays: number,
  paymentMethod: 'ONLINE' | 'COD'
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

    // Rental fee structure: ₹10/day + ₹50 base fee
    const rentalFee = (durationDays * 10) + 50;

    // 1. Reserve book status
    await updateBook(bookId, { status: 'RESERVED' });

    // 2. Log rental record
    const rental = await createRental({
      bookId,
      renterId: session.id,
      ownerId: book.ownerId,
      durationDays,
      rentalFee,
      paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'COD',
    });

    // 3. Create placeholder Order record for dashboard lists
    const order = await createOrder({
      buyerId: session.id,
      sellerId: book.ownerId,
      bookId: book.id,
      amount: rentalFee,
      deliveryMethod: 'DELIVERY',
      paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'COD',
      orderStatus: 'PENDING',
      pickupLocation: `Book Rental contract: ${durationDays} days`,
    });

    // 4. Create payment log
    await createPayment({
      orderId: order.id,
      amount: rentalFee,
      method: paymentMethod,
      status: paymentMethod === 'ONLINE' ? 'PAID' : 'COD',
    });

    // 5. Schedule delivery
    await createDelivery({
      orderId: order.id,
      staffId: '',
      status: 'PENDING',
    });

    // 6. Notify owner
    await createNotification(
      book.ownerId,
      'Book Rented out!',
      `Your book "${book.title}" has been rented out by ${session.name} for ${durationDays} days.`
    );

    // 7. Notify renter
    await createNotification(
      session.id,
      'Rental confirmed!',
      `You rented "${book.title}" for ${durationDays} days. Total fee: ₹${rentalFee}.`
    );

    revalidatePath('/dashboard/rentals');
    revalidatePath(`/books/${bookId}`);
    return { success: true };
  } catch (error: any) {
    console.error('createRentalAction error:', error);
    return { success: false, error: 'Failed to request rental.' };
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
    
    // Sort newest first
    userRentals.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    return { success: true, rentals: userRentals };
  } catch (error: any) {
    return { success: false, error: 'Failed to retrieve rentals.', rentals: [] };
  }
}
