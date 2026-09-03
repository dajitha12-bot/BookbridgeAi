import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth/session';
import { getUserById, getProfileByUserId } from '../../lib/db/users';
import { getAllBooks } from '../../lib/db/books';
import { getAllOrders } from '../../lib/db/orders';
import { getAllExchanges } from '../../lib/db/exchanges';
import { getWishlistByUser } from '../../lib/db/wishlist';
import { getRequestsByUser } from '../../lib/db/bookRequests';
import { calculateDistance } from '../../lib/utils/distance';
import UserDashboardView from '../../components/dashboard/UserDashboardView';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  if (session.role === 'ADMIN') {
    redirect('/admin');
  }
  if (session.role === 'DELIVERY_STAFF') {
    redirect('/staff');
  }

  let user = await getUserById(session.id);
  const profile = await getProfileByUserId(session.id);
  
  if (!user) {
    user = {
      id: session.id,
      email: session.email,
      name: session.name,
      phone: '9123456780',
      passwordHash: '',
      role: session.role as any,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
  }

  const detailedUser = {
    ...user,
    profile,
  };

  // 1. Stats
  const allBooks = await getAllBooks();
  const userBooks = allBooks.filter(b => b.ownerId === session.id);
  const listed = userBooks.length;
  const sold = userBooks.filter(b => ['SOLD', 'EXCHANGED'].includes(b.status)).length;

  const allOrders = await getAllOrders();
  const orders = allOrders.filter(o => o.buyerId === session.id).length;

  const allExchanges = await getAllExchanges();
  const exchanges = allExchanges.filter(e => e.senderId === session.id || e.receiverId === session.id).length;

  const wishlistItems = await getWishlistByUser(session.id);
  const wishlist = wishlistItems.length;

  // 2. Active Orders & Deliveries
  const userOrders = allOrders.filter(o => 
    (o.buyerId === session.id || o.sellerId === session.id) &&
    !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)
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
        buyer,
      };
    })
  );

  // Helper to fetch book from preloaded list
  function getBookById(id: string, list: typeof allBooks) {
    return list.find(b => b.id === id) || null;
  }

  // 3. Book Requests
  const bookRequests = await getRequestsByUser(session.id);
  bookRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 4. Recently Listed Books (exclude own)
  const recentlyListed = allBooks
    .filter(b => b.status === 'AVAILABLE' && b.ownerId !== session.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // 5. Nearby Books
  let nearbyBooks: any[] = [];
  if (profile) {
    const cityBooks = allBooks.filter(b => 
      b.status === 'AVAILABLE' &&
      b.ownerId !== session.id &&
      b.city.toLowerCase() === profile.city.toLowerCase()
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
            profile: ownerProfile,
          },
        };
      })
    );

    booksWithDistance.sort((a, b) => a.distance - b.distance);
    nearbyBooks = booksWithDistance.slice(0, 5);
  }

  // 6. Smart Book Recommendations
  const userCategories = new Set<string>();
  
  await Promise.all(
    wishlistItems.map(async (w) => {
      const book = await getBookById(w.bookId, allBooks);
      if (book) userCategories.add(book.category);
    })
  );

  if (userCategories.size === 0) {
    userCategories.add('Programming');
    userCategories.add('Web Development');
    userCategories.add('Artificial Intelligence');
  }

  const categoryArray = Array.from(userCategories);
  const matchedBooks = allBooks
    .filter(b => 
      b.status === 'AVAILABLE' &&
      b.ownerId !== session.id &&
      categoryArray.includes(b.category)
    )
    .slice(0, 5);

  return (
    <UserDashboardView
      user={detailedUser as any}
      stats={{ listed, sold, orders, exchanges, wishlist }}
      recommendations={matchedBooks}
      recentlyListed={recentlyListed}
      nearbyBooks={nearbyBooks}
      activeOrders={activeOrders as any}
      bookRequests={bookRequests}
    />
  );
}
