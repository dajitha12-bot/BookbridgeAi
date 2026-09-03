'use server';

import { getExchangeById, createExchange, updateExchange } from '../lib/db/exchanges';
import { getBookById, updateBook } from '../lib/db/books';
import { createNotification } from '../lib/db/notifications';
import { getSession } from '../lib/auth/session';
import { findSwapChains } from '../lib/utils/swapChainAlgorithm';
import { getSwapChainById, createSwapChain, updateSwapChain } from '../lib/db/swapchains';
import { createOrder } from '../lib/db/orders';
import { createDelivery } from '../lib/db/deliveries';
import { revalidatePath } from 'next/cache';

/**
 * Request Direct Book Exchange
 */
export async function requestExchangeAction(offeredBookId: string, requestedBookId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const offeredBook = await getBookById(offeredBookId);
    const requestedBook = await getBookById(requestedBookId);

    if (!offeredBook || offeredBook.ownerId !== session.id || offeredBook.status !== 'AVAILABLE') {
      return { success: false, error: 'Your offered book is invalid or unavailable.' };
    }

    if (!requestedBook || requestedBook.status !== 'AVAILABLE') {
      return { success: false, error: 'The requested book is unavailable.' };
    }

    // Create exchange request
    const exchange = await createExchange({
      senderId: session.id,
      receiverId: requestedBook.ownerId,
      offeredBookId,
      requestedBookId,
      status: 'PENDING',
    });

    // Notify receiver
    await createNotification(
      requestedBook.ownerId,
      'New Exchange Request',
      `${session.name} has offered "${offeredBook.title}" in exchange for your book "${requestedBook.title}".`
    );

    revalidatePath('/dashboard/exchange');
    return { success: true, exchangeId: exchange.id };
  } catch (error: any) {
    console.error('Request exchange error:', error);
    return { success: false, error: 'Failed to submit exchange request.' };
  }
}

/**
 * Respond to Direct Exchange Request (Accept/Reject)
 */
export async function respondExchangeAction(exchangeId: string, accept: boolean) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const exchange = await getExchangeById(exchangeId);
    if (!exchange || exchange.receiverId !== session.id) {
      return { success: false, error: 'Exchange request not found.' };
    }

    if (exchange.status !== 'PENDING') {
      return { success: false, error: 'This request has already been processed.' };
    }

    const offeredBook = await getBookById(exchange.offeredBookId);
    const requestedBook = await getBookById(exchange.requestedBookId);

    if (!offeredBook || !requestedBook) {
      return { success: false, error: 'Book details not found.' };
    }

    if (accept) {
      if (offeredBook.status !== 'AVAILABLE' || requestedBook.status !== 'AVAILABLE') {
        return { success: false, error: 'One or both books are no longer available.' };
      }

      // 1. Accept exchange
      await updateExchange(exchangeId, { status: 'ACCEPTED' });

      // 2. Reserve books
      await updateBook(exchange.offeredBookId, { status: 'RESERVED' });
      await updateBook(exchange.requestedBookId, { status: 'RESERVED' });

      // 3. Automatically convert accepted exchange into an active Order in My Orders
      const newOrder = await createOrder({
        buyerId: exchange.senderId,
        sellerId: exchange.receiverId,
        bookId: exchange.requestedBookId,
        amount: 0, // Book Exchange trade
        deliveryMethod: 'DELIVERY',
        paymentStatus: 'PAID',
        orderStatus: 'PENDING',
      });

      // 4. Create delivery shipment for courier staff
      await createDelivery({
        orderId: newOrder.id,
        staffId: '',
        status: 'PENDING' as any,
      });

      // 5. Notify sender
      await createNotification(
        exchange.senderId,
        'Exchange Request Accepted!',
        `${session.name} accepted your exchange of "${offeredBook.title}" for "${requestedBook.title}". An order has been created in My Orders!`
      );
    } else {
      await updateExchange(exchangeId, { status: 'REJECTED' });

      // Notify sender
      await createNotification(
        exchange.senderId,
        'Exchange Request Rejected',
        `${session.name} has declined your exchange request for "${requestedBook.title}".`
      );
    }

    revalidatePath('/dashboard/exchange');
    revalidatePath('/dashboard/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Respond exchange error:', error);
    return { success: false, error: 'Failed to process exchange request.' };
  }
}

/**
 * Complete Exchange (Triggered upon pickup/delivery verification)
 */
export async function completeExchangeAction(exchangeId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const exchange = await getExchangeById(exchangeId);
    if (!exchange) return { success: false, error: 'Exchange not found.' };

    await updateExchange(exchangeId, { status: 'COMPLETED' });
    await updateBook(exchange.offeredBookId, { status: 'EXCHANGED' });
    await updateBook(exchange.requestedBookId, { status: 'EXCHANGED' });

    await createNotification(
      exchange.senderId,
      'Exchange Completed!',
      'Your exchange of books is now complete. Enjoy your new book!'
    );

    await createNotification(
      exchange.receiverId,
      'Exchange Completed!',
      'Your exchange of books is now complete. Enjoy your new book!'
    );

    revalidatePath('/dashboard/exchange');
    revalidatePath('/dashboard/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Complete exchange error:', error);
    return { success: false, error: 'Failed to complete exchange.' };
  }
}

export async function getSwapChainChainsAction() {
  try {
    const chains = await findSwapChains();
    return { success: true, chains };
  } catch (error: any) {
    return { success: false, error: 'Failed to run SwapChain graph algorithm.' };
  }
}
