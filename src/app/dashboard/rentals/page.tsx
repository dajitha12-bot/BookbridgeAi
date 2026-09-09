import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getMyRentalsAction } from '../../../actions/rentalActions';
import { getAllBooks } from '../../../lib/db/books';
import { getUserById } from '../../../lib/db/users';
import { getRequestsByUser } from '../../../lib/db/bookRequests';
import RentalsClient from '../../../components/dashboard/RentalsClient';

export const dynamic = 'force-dynamic';

export default async function DashboardRentalsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const res = await getMyRentalsAction();
  const rentals = res.rentals || [];

  const allBooks = await getAllBooks();
  const userRequests = await getRequestsByUser(session.id);

  const availableRentBooksRaw = allBooks.filter((b) => b.status === 'AVAILABLE' && b.ownerId !== session.id);

  const availableRentBooks = await Promise.all(
    availableRentBooksRaw.map(async (b) => {
      const seller = await getUserById(b.ownerId);
      return {
        ...b,
        seller: seller ? { id: seller.id, name: seller.name } : null,
      };
    })
  );

  return (
    <RentalsClient
      userId={session.id}
      rentals={rentals as any}
      availableRentBooks={availableRentBooks as any}
      userRequests={userRequests as any}
    />
  );
}
