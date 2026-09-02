import { getSession } from '../../../../lib/auth/session';
import { getBookById } from '../../../../lib/db/books';
import { redirect } from 'next/navigation';
import RentBookClient from './RentBookClient';

export const dynamic = 'force-dynamic';

export default async function RentBookPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const book = await getBookById(id);
  
  if (!book) {
    redirect('/browse');
  }

  // Prevent renting own book
  if (book.ownerId === session.id) {
    redirect(`/books/${id}`);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 text-slate-800 font-sans">
      <RentBookClient book={book} />
    </div>
  );
}
