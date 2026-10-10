import { getSession } from "../../../lib/auth/session";
import { getAllExchanges } from "../../../lib/db/exchanges";
import { getAllBooks, getBookById } from "../../../lib/db/books";
import { getUserById } from "../../../lib/db/users";
import { getRequestsByUser } from "../../../lib/db/bookRequests";
import ExchangeClient from "../../../components/dashboard/ExchangeClient";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
async function ExchangePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const exchanges = await getAllExchanges();
  const allBooks = await getAllBooks();
  const otherAvailableBooks = allBooks.filter(
    (b) => b.status === "AVAILABLE" && b.ownerId !== session.id && b.exchangeAvailable
  );
  const availableExchangeBooks = await Promise.all(
    otherAvailableBooks.map(async (b) => {
      const seller = await getUserById(b.ownerId);
      return {
        ...b,
        seller: seller ? { id: seller.id, name: seller.name, email: seller.email } : null
      };
    })
  );
  const userOwnedBooks = allBooks.filter(
    (b) => b.status === "AVAILABLE" && b.ownerId === session.id
  );
  const userRequests = await getRequestsByUser(session.id);
  const sentRaw = exchanges.filter((e) => e.senderId === session.id);
  const sentExchanges = await Promise.all(
    sentRaw.map(async (e) => {
      const offeredBook = await getBookById(e.offeredBookId);
      const requestedBook = await getBookById(e.requestedBookId);
      const receiver = await getUserById(e.receiverId);
      return {
        ...e,
        offeredBook,
        requestedBook,
        receiver
      };
    })
  );
  sentExchanges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const receivedRaw = exchanges.filter((e) => e.receiverId === session.id);
  const receivedExchanges = await Promise.all(
    receivedRaw.map(async (e) => {
      const offeredBook = await getBookById(e.offeredBookId);
      const requestedBook = await getBookById(e.requestedBookId);
      const sender = await getUserById(e.senderId);
      return {
        ...e,
        offeredBook,
        requestedBook,
        sender
      };
    })
  );
  receivedExchanges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return <ExchangeClient
    userId={session.id}
    sentExchanges={sentExchanges}
    receivedExchanges={receivedExchanges}
    availableExchangeBooks={availableExchangeBooks}
    userOwnedBooks={userOwnedBooks}
    userRequests={userRequests}
  />;
}
export {
  ExchangePage as default};
