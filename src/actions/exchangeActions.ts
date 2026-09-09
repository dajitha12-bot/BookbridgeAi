'use server';

import { getExchangeById, createExchange, updateExchange } from '../lib/db/exchanges';
import { getBookById, updateBook } from '../lib/db/books';
import { getProfileByUserId, getUserById } from '../lib/db/users';
import { createNotification } from '../lib/db/notifications';
import { getSession } from '../lib/auth/session';
import { findSwapChains } from '../lib/utils/swapChainAlgorithm';
import { getSwapChainById, createSwapChain, updateSwapChain, getAllSwapChains } from '../lib/db/swapchains';
import { createOrder } from '../lib/db/orders';
import { createDelivery } from '../lib/db/deliveries';
import { revalidatePath } from 'next/cache';

/**
 * Request Direct Book Exchange with Handover selection
 */
export async function requestExchangeAction(
  offeredBookId: string, 
  requestedBookId: string,
  deliveryMethod: 'DELIVERY' | 'PICKUP' = 'DELIVERY'
) {
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
      deliveryMethod,
      status: 'PENDING',
    });

    await createNotification(
      requestedBook.ownerId,
      'New Exchange Request',
      `${session.name} has offered "${offeredBook.title}" in exchange for your book "${requestedBook.title}" (${deliveryMethod === 'DELIVERY' ? 'Home Delivery' : 'Self Pickup'}).`
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

      const deliveryMethod = exchange.deliveryMethod || 'DELIVERY';
      const orderStatus = deliveryMethod === 'PICKUP' ? 'READY_FOR_PICKUP' : 'PENDING';

      await updateExchange(exchangeId, { status: 'ACCEPTED' });
      await updateBook(exchange.offeredBookId, { status: 'RESERVED' });
      await updateBook(exchange.requestedBookId, { status: 'RESERVED' });

      const newOrder = await createOrder({
        buyerId: exchange.senderId,
        sellerId: exchange.receiverId,
        bookId: exchange.requestedBookId,
        amount: 0,
        deliveryMethod,
        paymentStatus: 'PAID',
        orderStatus: orderStatus as any,
        pickupLocation: `Direct Exchange (${deliveryMethod})`,
      });

      if (deliveryMethod === 'DELIVERY') {
        const buyerProfile = await getProfileByUserId(exchange.senderId);
        const sellerProfile = await getProfileByUserId(exchange.receiverId);

        const pickupAddress = sellerProfile ? `${sellerProfile.address}, ${sellerProfile.area}, ${sellerProfile.city} - ${sellerProfile.pincode}` : 'Seller Pickup Address, Chennai';
        const deliveryAddress = buyerProfile ? `${buyerProfile.address}, ${buyerProfile.area}, ${buyerProfile.city} - ${buyerProfile.pincode}` : 'Buyer Delivery Address, Chennai';

        await createDelivery({
          orderId: newOrder.id,
          staffId: '',
          status: 'PENDING' as any,
          pickupAddress,
          deliveryAddress,
        });
      }

      await createNotification(
        exchange.senderId,
        'Exchange Request Accepted!',
        `${session.name} accepted your exchange of "${offeredBook.title}" for "${requestedBook.title}". Order created with ${deliveryMethod === 'DELIVERY' ? 'Home Delivery (Assign Staff)' : 'Self Pickup'}.`
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
    return { success: false, error: 'Failed to process response.' };
  }
}

/**
 * Complete Exchange Action
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

    revalidatePath('/dashboard/exchange');
    revalidatePath('/dashboard/orders');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to complete exchange.' };
  }
}

/**
 * Get Swap Chains Action
 */
export async function getSwapChainChainsAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.', chains: [] };

    const chains = await getAllSwapChains();
    return { success: true, chains };
  } catch (e: any) {
    return { success: false, error: 'Failed to retrieve swap chains.', chains: [] };
  }
}

/**
 * Create Swap Chain Action
 */
export async function createSwapChainAction(members: any[]) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const chain = await createSwapChain({
      members,
      status: 'PROPOSED',
    });

    revalidatePath('/dashboard/swapchain');
    return { success: true, chainId: chain.id };
  } catch (e: any) {
    return { success: false, error: 'Failed to create swap chain.' };
  }
}

/**
 * Respond Swap Chain Member Action
 */
export async function respondSwapChainMemberAction(chainId: string, accept: boolean) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const chain = await getSwapChainById(chainId);
    if (!chain) return { success: false, error: 'Swap chain not found.' };

    const updatedMembers = chain.members.map((m: any) => {
      if (m.userId === session.id) {
        return { ...m, accepted: accept };
      }
      return m;
    });

    const allAccepted = updatedMembers.every((m: any) => m.accepted);
    const newStatus = allAccepted ? 'CONFIRMED' : accept ? 'PROPOSED' : 'CANCELLED';

    await updateSwapChain(chainId, {
      members: updatedMembers,
      status: newStatus as any,
    });

    revalidatePath('/dashboard/swapchain');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: 'Failed to update swap chain response.' };
  }
}
