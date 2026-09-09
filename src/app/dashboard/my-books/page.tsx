import { getSession } from '../../../lib/auth/session';
import { getBooksByOwner, getBookById } from '../../../lib/db/books';
import { getWishlistByUser } from '../../../lib/db/wishlist';
import { getAllRentals } from '../../../lib/db/rentals';
import { getAllBookRequests } from '../../../lib/db/bookRequests';
import { getAllExchanges } from '../../../lib/db/exchanges';
import { getUserOrdersAction, getUserSalesAction } from '../../../actions/orderActions';
import { getUserById } from '../../../lib/db/users';
import MyBooksClient from './MyBooksClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MyBooksPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const currentUserId = session.id || 'usr-user1';

  // 1. My Listed Books
  const listedBooks = await getBooksByOwner(currentUserId);
  listedBooks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 2. Wishlist with joined book & seller
  const rawWishlist = await getWishlistByUser(currentUserId);
  const wishlist = await Promise.all(
    rawWishlist.map(async (w) => {
      const book = await getBookById(w.bookId);
      const seller = book ? await getUserById(book.ownerId) : null;
      return { ...w, book, seller };
    })
  );

  // 3. My Orders (Purchased)
  const ordersRes = await getUserOrdersAction();
  const myOrders = ordersRes.orders || [];

  // 4. My Rentals
  const allRentals = await getAllRentals();
  const userRentalsRaw = allRentals.filter(r => r.renterId === currentUserId || r.ownerId === currentUserId);
  const myRentals = await Promise.all(
    userRentalsRaw.map(async (r) => {
      const book = await getBookById(r.bookId);
      const owner = await getUserById(r.ownerId);
      const renter = await getUserById(r.renterId);
      return { ...r, book, owner, renter };
    })
  );

  // 5. My Requests
  const allRequests = await getAllBookRequests();
  const myRequests = allRequests.filter(r => (r as any).userId === currentUserId || (r as any).requesterId === currentUserId);

  // 6. Sold Books
  const salesRes = await getUserSalesAction();
  const mySales = salesRes.sales || [];

  // 7. Exchanged Books
  const allExchanges = await getAllExchanges();
  const userExchangesRaw = allExchanges.filter(e => e.senderId === currentUserId || e.receiverId === currentUserId);
  const myExchanges = await Promise.all(
    userExchangesRaw.map(async (e) => {
      const offeredBook = await getBookById(e.offeredBookId);
      const requestedBook = await getBookById(e.requestedBookId);
      const otherUserId = e.senderId === currentUserId ? e.receiverId : e.senderId;
      const partnerUser = await getUserById(otherUserId);
      return { ...e, offeredBook, requestedBook, partnerUser };
    })
  );

  // 8. Donated Books
  const myDonatedBooks = listedBooks.filter(b => b.donationAvailable === true);

  return (
    <MyBooksClient
      userId={currentUserId}
      userName={session.name || 'Ajitha'}
      initialListedBooks={listedBooks}
      initialWishlist={wishlist}
      initialOrders={myOrders}
      initialRentals={myRentals}
      initialRequests={myRequests}
      initialSales={mySales}
      initialExchanges={myExchanges}
      initialDonatedBooks={myDonatedBooks}
    />
  );
}
