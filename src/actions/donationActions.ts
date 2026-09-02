'use server';

import { getSession } from '../lib/auth/session';
import { getAllDonationRequests, createDonationRequest, updateDonationRequest } from '../lib/db/donations';
import { getBookById, updateBook, getAllBooks } from '../lib/db/books';
import { createNotification } from '../lib/db/notifications';
import { createOrder } from '../lib/db/orders';
import { createDelivery } from '../lib/db/deliveries';
import { createPayment } from '../lib/db/payments';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all charity book requests
 */
export async function getDonationRequestsAction() {
  try {
    const list = await getAllDonationRequests();
    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, requests: list };
  } catch (error: any) {
    return { success: false, error: 'Failed to retrieve donation requests.' };
  }
}

/**
 * Create a new book donation request by a Trust/Institution
 */
export async function createDonationRequestAction(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'You must be logged in to request book donations.' };

    const institutionName = formData.get('institutionName') as string;
    const regNumber = formData.get('regNumber') as string;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const quantityNeeded = parseInt(formData.get('quantityNeeded') as string || '1');
    const description = formData.get('description') as string;
    const city = formData.get('city') as string;
    const contactPhone = formData.get('contactPhone') as string;

    if (!institutionName || !regNumber || !title || !category || isNaN(quantityNeeded) || !description || !city || !contactPhone) {
      return { success: false, error: 'Please fill in all donation request fields.' };
    }

    await createDonationRequest({
      institutionName,
      regNumber,
      title,
      category,
      quantityNeeded,
      description,
      city,
      contactPhone,
    });

    revalidatePath('/dashboard/donations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to post donation request.' };
  }
}

/**
 * Fulfill a donation request by assigning a user's free book to the trust
 */
export async function fulfillDonationAction(requestId: string, bookId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    // Get the book details
    const book = await getBookById(bookId);
    if (!book) return { success: false, error: 'Book not found.' };

    if (book.ownerId !== session.id) {
      return { success: false, error: 'You can only donate books that you own.' };
    }

    if (!book.donationAvailable) {
      return { success: false, error: 'This book is not marked for free donation.' };
    }

    if (book.status !== 'AVAILABLE') {
      return { success: false, error: 'This book has already been sold, swapped, or donated.' };
    }

    // Fulfill the donation request in db
    await updateDonationRequest(requestId, { status: 'FULFILLED' });

    // Mark book as DONATED
    await updateBook(bookId, { status: 'DONATED' });

    // Create a free order (amount = 0) representing the charity handover
    const order = await createOrder({
      buyerId: session.id, // Buyer stands as donation recipient placeholder
      sellerId: book.ownerId,
      bookId: book.id,
      amount: 0,
      deliveryMethod: 'DELIVERY',
      paymentStatus: 'COD',
      orderStatus: 'PENDING',
      pickupLocation: `Donated to Charity: Fulfilling Trust Request ID ${requestId}`,
    });

    // Mark order status and payment as PAID/DELIVERED
    // Set payment status as paid/COD
    await createPayment({
      orderId: order.id,
      amount: 0,
      method: 'COD',
      status: 'COD',
    });

    // Schedule delivery for this donation
    await createDelivery({
      orderId: order.id,
      staffId: '',
      status: 'PENDING',
    });

    // Notify donor
    await createNotification(
      session.id,
      'Donation Fulfilling!',
      `Thank you! Your donation of "${book.title}" to Charity is scheduled. Delivery staff will collect it shortly.`
    );

    revalidatePath('/dashboard/donations');
    revalidatePath('/dashboard/my-books');
    return { success: true };
  } catch (error: any) {
    console.error('fulfillDonationAction error:', error);
    return { success: false, error: 'Failed to process book donation fulfillment.' };
  }
}
