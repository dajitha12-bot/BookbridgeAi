'use server';

import { getExchangeById, createExchange, updateExchange } from '../lib/db/exchanges';
import { getBookById, updateBook } from '../lib/db/books';
import { createNotification } from '../lib/db/notifications';
import { getSession } from '../lib/auth/session';
import { findSwapChains } from '../lib/utils/swapChainAlgorithm';
import { getSwapChainById, createSwapChain, updateSwapChain } from '../lib/db/swapchains';
import { getUserById } from '../lib/db/users';
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
      // Check if both books are still available
      if (offeredBook.status !== 'AVAILABLE' || requestedBook.status !== 'AVAILABLE') {
        return { success: false, error: 'One or both books are no longer available.' };
      }

      // Accept exchange
      await updateExchange(exchangeId, { status: 'ACCEPTED' });

      // Reserve books
      await updateBook(exchange.offeredBookId, { status: 'RESERVED' });
      await updateBook(exchange.requestedBookId, { status: 'RESERVED' });

      // Notify sender
      await createNotification(
        exchange.senderId,
        'Exchange Request Accepted!',
        `${session.name} accepted your exchange of "${offeredBook.title}" for "${requestedBook.title}".`
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

    // Complete Exchange status
    await updateExchange(exchangeId, { status: 'COMPLETED' });

    // Mark books as EXCHANGED
    await updateBook(exchange.offeredBookId, { status: 'EXCHANGED' });
    await updateBook(exchange.requestedBookId, { status: 'EXCHANGED' });

    // Notifications
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
    return { success: true };
  } catch (error: any) {
    console.error('Complete exchange error:', error);
    return { success: false, error: 'Failed to complete exchange.' };
  }
}

/**
 * Run Graph Algorithm to find SwapChain Paths
 */
export async function getSwapChainChainsAction() {
  try {
    const chains = await findSwapChains();
    return { success: true, chains };
  } catch (error: any) {
    console.error('Get SwapChains error:', error);
    return { success: false, error: 'Failed to run SwapChain graph algorithm.' };
  }
}

/**
 * Create a proposed SwapChain
 */
export async function createSwapChainAction(chain: { userId: string; offeredBookId: string; requestedBookId: string }[]) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    // Verify all books are available
    for (const member of chain) {
      const book = await getBookById(member.offeredBookId);
      if (!book || book.status !== 'AVAILABLE') {
        return { success: false, error: `Book "${book?.title || 'Unknown'}" is no longer available.` };
      }
    }

    // Create proposed SwapChain
    const sc = await createSwapChain({
      status: 'PENDING',
      members: chain.map(m => ({
        userId: m.userId,
        offeredBookId: m.offeredBookId,
        requestedBookId: m.requestedBookId,
        // The proposer accepts by default, others start as PENDING
        status: m.userId === session.id ? 'ACCEPTED' : 'PENDING',
      })),
    });

    // Notify other members
    for (const member of chain) {
      if (member.userId !== session.id) {
        await createNotification(
          member.userId,
          'Multi-User SwapChain Found!',
          'A SwapChain exchange chain has been proposed! Swap your book for the book you requested. Review in SwapChain tab.'
        );
      }
    }

    revalidatePath('/dashboard/swapchain');
    return { success: true, swapChainId: sc.id };
  } catch (error: any) {
    console.error('Create SwapChain error:', error);
    return { success: false, error: 'Failed to propose SwapChain.' };
  }
}

/**
 * Accept/Reject proposed SwapChain Member invitation
 */
export async function respondSwapChainMemberAction(memberId: string, accept: boolean) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    // Direct lookups in SwapChains list
    const chains = await findSwapChains(); // Mocking chains fetch to match members
    // Wait, in JSON DB we fetch swapchains from swapchains.json
    const allChains = await findSwapChains(); // We can directly look up the swapchain containing the member
    // Wait! Let's fetch using our JSON db `getSwapChainById` or loop through all chains:
    const dbChains = await require('../lib/db/swapchains').getAllSwapChains();
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
      return { success: false, error: 'SwapChain invitation not found or already processed.' };
    }

    if (!accept) {
      // If one member rejects, cancel the entire proposed SwapChain
      targetChain.status = 'CANCELLED';
      targetChain.members[memberIdx].status = 'DECLINED';
      await updateSwapChain(targetChain.id, targetChain);

      // Notify all members
      for (const m of targetChain.members) {
        if (m.userId !== session.id) {
          await createNotification(
            m.userId,
            'SwapChain Proposal Cancelled',
            'A proposed SwapChain exchange has been cancelled because a member declined.'
          );
        }
      }

      revalidatePath('/dashboard/swapchain');
      return { success: true, cancelled: true };
    }

    // Accept member
    targetChain.members[memberIdx].status = 'ACCEPTED';
    
    // Check if everyone accepted
    const allAccepted = targetChain.members.every((m: any) => m.status === 'ACCEPTED');

    if (allAccepted) {
      targetChain.status = 'CONFIRMED';
      await updateSwapChain(targetChain.id, targetChain);

      // Mark books as EXCHANGED
      for (const m of targetChain.members) {
        await updateBook(m.offeredBookId, { status: 'EXCHANGED' });
        await createNotification(
          m.userId,
          'SwapChain Swapped Successfully!',
          'Hooray! Everyone accepted the SwapChain. Your exchange is complete.'
        );
      }
    } else {
      await updateSwapChain(targetChain.id, targetChain);

      // Notify other members
      for (const m of targetChain.members) {
        if (m.userId !== session.id) {
          await createNotification(
            m.userId,
            'SwapChain Acceptance Update',
            `${session.name} has accepted the proposed SwapChain. Awaiting remaining members.`
          );
        }
      }
    }

    revalidatePath('/dashboard/swapchain');
    return { success: true };
  } catch (error: any) {
    console.error('Respond SwapChain member error:', error);
    return { success: false, error: 'Failed to process SwapChain acceptance.' };
  }
}
