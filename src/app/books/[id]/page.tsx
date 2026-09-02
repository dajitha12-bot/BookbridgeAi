import { getSession } from '../../../lib/auth/session';
import { getBookById, getAllBooks } from '../../../lib/db/books';
import { getProfileByUserId, getUserById } from '../../../lib/db/users';
import { calculateDistance } from '../../../lib/utils/distance';
import BookDetailsClient from '../../../components/BookDetailsClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BookDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const session = await getSession();

  // 1. Fetch book details
  const book = await getBookById(id);

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-sm">
          <h2 className="text-lg font-bold text-rose-500">Book Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">The book details you are searching for are missing or invalid.</p>
          <Link href="/browse" className="mt-4 inline-block px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const owner = await getUserById(book.ownerId);
  const ownerProfile = await getProfileByUserId(book.ownerId);

  // Re-build include structure expected by client component
  const detailedBook = {
    ...book,
    owner: {
      ...owner,
      profile: ownerProfile,
    },
  };

  // 2. Fetch coordinates & viewer books
  let distanceKm = null;
  let userBooks: any[] = [];
  let userId = null;

  if (session) {
    userId = session.id;
    
    // Get viewer location
    const viewerProfile = await getProfileByUserId(session.id);

    if (viewerProfile && ownerProfile) {
      distanceKm = calculateDistance(
        viewerProfile.latitude,
        viewerProfile.longitude,
        ownerProfile.latitude,
        ownerProfile.longitude
      );
    }

    // Get viewer's available books for exchange options
    const allBooks = await getAllBooks();
    userBooks = allBooks
      .filter(b => b.ownerId === session.id && b.status === 'AVAILABLE')
      .map(b => ({
        id: b.id,
        title: b.title,
        category: b.category,
      }));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center font-extrabold text-white text-xl">B</div>
              <span className="font-extrabold text-slate-800 text-lg tracking-tight">BookBridge AI</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-6 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-sky-500 transition-colors">Home</Link>
            <Link href="/browse" className="hover:text-sky-500 transition-colors">Browse Books</Link>
            <Link href="/about" className="hover:text-sky-500 transition-colors">About</Link>
          </nav>

          <div className="flex items-center space-x-3">
            {session ? (
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-sm transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-slate-600 hover:text-sky-500 text-sm font-bold transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-sm transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Details Panel */}
      <div className="flex-1 py-4">
        <BookDetailsClient 
          book={detailedBook as any} 
          userId={userId} 
          userBooks={userBooks} 
          distanceKm={distanceKm} 
        />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs font-semibold mt-auto border-t border-slate-800">
        © {new Date().getFullYear()} BookBridge AI. All rights reserved.
      </footer>
    </div>
  );
}
