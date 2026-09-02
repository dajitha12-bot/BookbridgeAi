import { getSession } from '../../../lib/auth/session';
import { getBooksByOwner } from '../../../lib/db/books';
import MyBooksClient from './MyBooksClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MyBooksPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const books = await getBooksByOwner(session.id);
  
  // Sort descending by timestamp
  books.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <MyBooksClient initialBooks={books} />;
}
