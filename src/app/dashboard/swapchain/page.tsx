import { getSession } from '../../../lib/auth/session';
import { getAllSwapChains } from '../../../lib/db/swapchains';
import { getBookById } from '../../../lib/db/books';
import { getUserById } from '../../../lib/db/users';
import SwapChainClient from './SwapChainClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SwapChainPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const dbChains = await getAllSwapChains();

  // 1. Query pending proposed loop invitations for this user
  const rawPendingChains = dbChains.filter(c => 
    c.status === 'PENDING' &&
    c.members.some(m => m.userId === session.id && m.status === 'PENDING')
  );

  const pendingInvitations = await Promise.all(
    rawPendingChains.map(async (c) => {
      const userMember = c.members.find(m => m.userId === session.id)!;
      const offeredBook = await getBookById(userMember.offeredBookId);
      const requestedBook = await getBookById(userMember.requestedBookId);

      const mappedMembers = await Promise.all(
        c.members.map(async (m) => {
          const u = await getUserById(m.userId);
          const ob = await getBookById(m.offeredBookId);
          const rb = await getBookById(m.requestedBookId);
          return {
            ...m,
            user: u,
            offeredBook: ob,
            requestedBook: rb,
          };
        })
      );

      return {
        id: `${c.id}-${userMember.userId}`, // Combined unique ID
        userId: userMember.userId,
        offeredBookId: userMember.offeredBookId,
        requestedBookId: userMember.requestedBookId,
        status: userMember.status,
        offeredBook,
        requestedBook,
        swapChain: {
          id: c.id,
          status: c.status,
          members: mappedMembers,
        },
      };
    })
  );

  // 2. Query successfully executed loops that this user participated in
  const rawConfirmed = dbChains.filter(c => 
    c.status === 'CONFIRMED' &&
    c.members.some(m => m.userId === session.id)
  );

  const confirmedChains = await Promise.all(
    rawConfirmed.map(async (c) => {
      const mappedMembers = await Promise.all(
        c.members.map(async (m) => {
          const u = await getUserById(m.userId);
          const ob = await getBookById(m.offeredBookId);
          const rb = await getBookById(m.requestedBookId);
          return {
            ...m,
            user: u,
            offeredBook: ob,
            requestedBook: rb,
          };
        })
      );
      return {
        id: c.id,
        status: c.status,
        createdAt: c.createdAt,
        members: mappedMembers,
      };
    })
  );

  return (
    <SwapChainClient
      userId={session.id}
      pendingInvitations={pendingInvitations as any}
      confirmedChains={confirmedChains as any}
    />
  );
}
