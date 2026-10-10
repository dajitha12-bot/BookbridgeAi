import { getSession } from "../../../lib/auth/session";
import { getBooksByOwner, getBookById } from "../../../lib/db/books";
import { getWishlistByUser } from "../../../lib/db/wishlist";
import { getAllRentals } from "../../../lib/db/rentals";
import { getAllBookRequests } from "../../../lib/db/bookRequests";
import { getAllExchanges } from "../../../lib/db/exchanges";
import { getUserOrdersAction, getUserSalesAction } from "../../../actions/orderActions";
import { getUserById } from "../../../lib/db/users";
import MyBooksClient from "./MyBooksClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyBooksPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const currentUserId = session.id || "usr-user1";
  const listedBooks = await getBooksByOwner(currentUserId);
  listedBooks.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const rawWishlist = await getWishlistByUser(currentUserId);
  const wishlist = await Promise.all(
    rawWishlist.map(async (w) => {
      const book = await getBookById(w.bookId);
      const seller = book ? await getUserById(book.ownerId) : null;
      return { ...w, book, seller };
    })
  );
  const ordersRes = await getUserOrdersAction();
  const myOrders = ordersRes.orders || [];
  const allRentals = await getAllRentals();
  const userRentalsRaw = allRentals.filter((r) => r.renterId === currentUserId || r.ownerId === currentUserId);
  const myRentals = await Promise.all(
    userRentalsRaw.map(async (r) => {
      const book = await getBookById(r.bookId);
      const owner = await getUserById(r.ownerId);
      const renter = await getUserById(r.renterId);
      return { ...r, book, owner, renter };
    })
  );
  const allRequests = await getAllBookRequests();
  const myRequests = allRequests.filter((r) => r.userId === currentUserId || r.requesterId === currentUserId);
  const salesRes = await getUserSalesAction();
  const mySales = salesRes.sales || [];
  const allExchanges = await getAllExchanges();
  const userExchangesRaw = allExchanges.filter((e) => e.senderId === currentUserId || e.receiverId === currentUserId);
  const myExchanges = await Promise.all(
    userExchangesRaw.map(async (e) => {
      const offeredBook = await getBookById(e.offeredBookId);
      const requestedBook = await getBookById(e.requestedBookId);
      const otherUserId = e.senderId === currentUserId ? e.receiverId : e.senderId;
      const partnerUser = await getUserById(otherUserId);
      return { ...e, offeredBook, requestedBook, partnerUser };
    })
  );
  const myDonatedBooks = listedBooks.filter((b) => b.donationAvailable === true);
  const listedBooksDetailed = await Promise.all(
    listedBooks.map(async (book) => {
      const rental = allRentals.find((r) => r.bookId === book.id && (r.status === "ACTIVE" || r.status === "RENTED"));
      if (rental) {
        return {
          ...book,
          displayStatus: "RENTED",
          rentalDueDate: rental.endDate
        };
      }
      const sale = mySales.find((s) => s.bookId === book.id);
      if (sale || book.status === "SOLD") {
        return {
          ...book,
          displayStatus: "SOLD",
          buyerName: sale?.buyer?.name
        };
      }
      const exchange = userExchangesRaw.find((e) => (e.offeredBookId === book.id || e.requestedBookId === book.id) && e.status === "ACCEPTED");
      if (exchange) {
        return {
          ...book,
          displayStatus: "EXCHANGED"
        };
      }
      if (book.donationAvailable) {
        return {
          ...book,
          displayStatus: "DONATED"
        };
      }
      return {
        ...book,
        displayStatus: book.status || "AVAILABLE"
      };
    })
  );
  return <MyBooksClient
    userId={currentUserId}
    userName={session.name || "Ajitha"}
    initialListedBooks={listedBooksDetailed}
    initialWishlist={wishlist}
    initialOrders={myOrders}
    initialRentals={myRentals}
    initialRequests={myRequests}
    initialSales={mySales}
    initialExchanges={myExchanges}
    initialDonatedBooks={myDonatedBooks}
  />;
}
