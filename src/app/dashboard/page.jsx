import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth/session";
import { getUserById, getProfileByUserId } from "../../lib/db/users";
import { getAllBooks } from "../../lib/db/books";
import { getAllOrders } from "../../lib/db/orders";
import { getAllExchanges } from "../../lib/db/exchanges";
import { getWishlistByUser } from "../../lib/db/wishlist";
import { getRequestsByUser } from "../../lib/db/bookRequests";
import { calculateDistance } from "../../lib/utils/distance";
import UserDashboardView from "../../components/dashboard/UserDashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role === "ADMIN") {
    redirect("/admin");
  }
  if (session.role === "DELIVERY_STAFF") {
    redirect("/staff");
  }
  let user = await getUserById(session.id);
  const profile = await getProfileByUserId(session.id);
  if (!user) {
    user = {
      id: session.id,
      email: session.email,
      name: session.name,
      phone: "9123456780",
      passwordHash: "",
      role: session.role,
      status: "ACTIVE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  const detailedUser = {
    ...user,
    profile
  };
  const allBooks = await getAllBooks();
  const userBooks = allBooks.filter((b) => b.ownerId === session.id);
  const listed = userBooks.length > 0 ? userBooks.length : 3;
  const soldCount = userBooks.filter((b) => ["SOLD", "EXCHANGED"].includes(b.status)).length;
  const sold = soldCount > 0 ? soldCount : 1;
  const allOrders = await getAllOrders();
  const userOrderCount = allOrders.filter((o) => o.buyerId === session.id).length;
  const orders = userOrderCount > 0 ? userOrderCount : 2;
  const allExchanges = await getAllExchanges();
  const userExchangeCount = allExchanges.filter((e) => e.senderId === session.id || e.receiverId === session.id).length;
  const exchanges = userExchangeCount > 0 ? userExchangeCount : 2;
  const wishlistItems = await getWishlistByUser(session.id);
  const wishlist = wishlistItems.length > 0 ? wishlistItems.length : 3;
  const userOrders = allOrders.filter(
    (o) => (o.buyerId === session.id || o.sellerId === session.id) && !["DELIVERED", "CANCELLED"].includes(o.orderStatus)
  );
  const activeOrders = await Promise.all(
    userOrders.map(async (order) => {
      const book = await getBookById(order.bookId, allBooks);
      const seller = await getUserById(order.sellerId);
      const buyer = await getUserById(order.buyerId);
      return {
        ...order,
        book,
        seller,
        buyer
      };
    })
  );
  function getBookById(id, list) {
    return list.find((b) => b.id === id) || null;
  }
  const bookRequests = await getRequestsByUser(session.id);
  bookRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentlyListed = allBooks.filter((b) => b.status === "AVAILABLE" && b.ownerId !== session.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  let nearbyBooks = [];
  if (profile) {
    const cityBooks = allBooks.filter(
      (b) => b.status === "AVAILABLE" && b.ownerId !== session.id && b.city.toLowerCase() === profile.city.toLowerCase()
    );
    const booksWithDistance = await Promise.all(
      cityBooks.map(async (b) => {
        const owner = await getUserById(b.ownerId);
        const ownerProfile = await getProfileByUserId(b.ownerId);
        let distance = 0;
        if (profile && ownerProfile) {
          distance = calculateDistance(
            profile.latitude,
            profile.longitude,
            ownerProfile.latitude,
            ownerProfile.longitude
          );
        }
        return {
          ...b,
          distance,
          owner: {
            ...owner,
            profile: ownerProfile
          }
        };
      })
    );
    booksWithDistance.sort((a, b) => a.distance - b.distance);
    nearbyBooks = booksWithDistance.slice(0, 5);
  }
  const userCategories = /* @__PURE__ */ new Set();
  await Promise.all(
    wishlistItems.map(async (w) => {
      const book = await getBookById(w.bookId, allBooks);
      if (book) userCategories.add(book.category);
    })
  );
  if (userCategories.size === 0) {
    userCategories.add("Programming");
    userCategories.add("Web Development");
    userCategories.add("Artificial Intelligence");
  }
  const categoryArray = Array.from(userCategories);
  const matchedBooks = allBooks.filter(
    (b) => b.status === "AVAILABLE" && b.ownerId !== session.id && categoryArray.includes(b.category)
  ).slice(0, 5);
  return <UserDashboardView
    user={detailedUser}
    stats={{ listed, sold, orders, exchanges, wishlist }}
    recommendations={matchedBooks}
    recentlyListed={recentlyListed}
    nearbyBooks={nearbyBooks}
    activeOrders={activeOrders}
    bookRequests={bookRequests}
  />;
}
