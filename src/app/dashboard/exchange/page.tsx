import { getSession } from '../../../lib/auth/session';
import { getAllExchanges } from '../../../lib/db/exchanges';
import { getBookById } from '../../../lib/db/books';
import { getUserById } from '../../../lib/db/users';
import ExchangeClient from '../../../components/dashboard/ExchangeClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ExchangePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const exchanges = await getAllExchanges();

  // 1. Sent Exchanges
  const sentRaw = exchanges.filter(e => e.senderId === session.id);
  const sentExchanges = await Promise.all(
    sentRaw.map(async (e) => {
      const offeredBook = await getBookById(e.offeredBookId);
      const requestedBook = await getBookById(e.requestedBookId);
      const receiver = await getUserById(e.receiverId);
      return {
        ...e,
        offeredBook,
        requestedBook,
        receiver,
      };
    })
  );
  sentExchanges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 2. Received Exchanges
  const receivedRaw = exchanges.filter(e => e.receiverId === session.id);
  const receivedExchanges = await Promise.all(
    receivedRaw.map(async (e) => {
      const offeredBook = await getBookById(e.offeredBookId);
      const requestedBook = await getBookById(e.requestedBookId);
      const sender = await getUserById(e.senderId);
      return {
        ...e,
        offeredBook,
        requestedBook,
        sender,
      };
    })
  );
  receivedExchanges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <ExchangeClient
      userId={session.id}
      sentExchanges={sentExchanges as any}
      receivedExchanges={receivedExchanges as any}
    />
  );
}
