import { getSession } from '../../lib/auth/session';
import { getProfileByUserId } from '../../lib/db/users';
import BrowseBooksClient from '../../components/BrowseBooksClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BrowsePage() {
  const session = await getSession();
  
  let coords = null;
  let userId = null;

  if (session) {
    userId = session.id;
    const profile = await getProfileByUserId(session.id);
    if (profile) {
      coords = {
        latitude: profile.latitude,
        longitude: profile.longitude,
      };
    }
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
            <Link href="/browse" className="text-sky-500">Browse Books</Link>
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

      {/* Main Browse Panel */}
      <div className="flex-1">
        <BrowseBooksClient userId={userId} coordinates={coords} />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs font-semibold mt-auto border-t border-slate-800">
        © {new Date().getFullYear()} BookBridge AI. All rights reserved.
      </footer>
    </div>
  );
}
