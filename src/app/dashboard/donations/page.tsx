import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDonationRequests } from '../../../lib/db/donations';
import { getAllBooks } from '../../../lib/db/books';
import DonationPortalClient from './DonationPortalClient';

export const dynamic = 'force-dynamic';

export default async function DonationsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Fetch active donation requests from registered Trusts/Institutions
  const allRequests = await getAllDonationRequests();
  
  // Fetch all books to filter for:
  // 1. All free books available for donation (donationAvailable = true)
  // 2. User's own books that can be donated to trusts
  const allBooks = await getAllBooks();
  const freeBooksPool = allBooks.filter(b => b.donationAvailable && b.status === 'AVAILABLE');
  const userDonationBooks = allBooks.filter(b => b.ownerId === session.id && b.donationAvailable && b.status === 'AVAILABLE');

  return (
    <DonationPortalClient
      userId={session.id}
      userName={session.name}
      initialRequests={allRequests}
      freeBooksPool={freeBooksPool}
      userDonationBooks={userDonationBooks}
    />
  );
}
