'use server';

import { getExchangeById, createExchange, updateExchange } from '../lib/db/exchanges';
import { getBookById, updateBook } from '../lib/db/books';
import { createNotification } from '../lib/db/notifications';
import { getSession } from '../lib/auth/session';
import { findSwapChains } from '../lib/utils/swapChainAlgorithm';
import { getSwapChainById, createSwapChain, updateSwapChain, getAllSwapChains } from '../lib/db/swapchains';
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

    const exchange = await createExchange({
      senderId: session.id,
      receiverId: requestedBook.ownerId,
      offeredBookId,
      requestedBookId,
      status: 'PENDING',
    });

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

      await updateExchange(exchangeId, { status: 'ACCEPTED' });
      await updateBook(exchange.offeredBookId, { status: 'RESERVED' });
      await updateBook(exchange.requestedBookId, { status: 'RESERVED' });

      const newOrder = await createOrder({
        buyerId: exchange.senderId,
        sellerId: exchange.receiverId,
        bookId: exchange.requestedBookId,
        amount: 0,
        deliveryMethod: 'DELIVERY',
        paymentStatus: 'PAID',
        orderStatus: 'PENDING',
      });

      await createDelivery({
        orderId: newOrder.id,
        staffId: '',
        status: 'PENDING' as any,
      });

      await createNotification(
        exchange.senderId,
        'Exchange Request Accepted!',
        `${session.name} accepted your exchange of "${offeredBook.title}" for "${requestedBook.title}". An order has been created in My Orders!`
      );
    } else {
      await updateExchange(exchangeId, { status: 'REJECTED' });

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
 * Complete Exchange
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

export async function createSwapChainAction(chain: { userId: string; offeredBookId: string; requestedBookId: string }[]) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const sc = await createSwapChain({
      status: 'PENDING',
      members: chain.map(m => ({
        userId: m.userId,
        offeredBookId: m.offeredBookId,
        requestedBookId: m.requestedBookId,
        status: m.userId === session.id ? 'ACCEPTED' : 'PENDING',
      })),
    });

    revalidatePath('/dashboard/swapchain');
    return { success: true, swapChainId: sc.id };
  } catch (error: any) {
    return { success: false, error: 'Failed to create SwapChain.' };
  }
}

export async function respondSwapChainMemberAction(memberId: string, accept: boolean) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const dbChains = await getAllSwapChains();
    let targetChain = null;
    let memberIdx = -1;

    for (const c of dbChains) {
      const idx = c.members.findIndex((m: any) => m.userId === session.id && m.status === 'PENDING');
      if (idx !== -1) {
        targetChain = c;
        memberIdx = idx;
        break;
      }
    }

    if (!targetChain || memberIdx === -1) {
      return { success: false, error: 'SwapChain invitation not found.' };
    }

    if (!accept) {
      targetChain.status = 'CANCELLED';
      targetChain.members[memberIdx].status = 'DECLINED';
      await updateSwapChain(targetChain.id, targetChain);
    } else {
      targetChain.members[memberIdx].status = 'ACCEPTED';
      const allAccepted = targetChain.members.every((m: any) => m.status === 'ACCEPTED');
      if (allAccepted) {
        targetChain.status = 'CONFIRMED';
      }
      await updateSwapChain(targetChain.id, targetChain);
    }

    revalidatePath('/dashboard/swapchain');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to process SwapChain action.' };
  }
}
