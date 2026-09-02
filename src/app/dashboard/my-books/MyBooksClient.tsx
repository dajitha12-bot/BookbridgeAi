'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteBookAction, markBookStatusAction } from '../../../actions/bookActions';
import { BookOpen, PlusCircle, Trash, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface MyBooksClientProps {
  initialBooks: any[];
}

export default function MyBooksClient({ initialBooks }: MyBooksClientProps) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [activeTab, setActiveTab] = useState<'ALL' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'EXCHANGED' | 'DONATED'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tabs: { label: string; value: typeof activeTab }[] = [
    { label: 'All Listings', value: 'ALL' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Reserved', value: 'RESERVED' },
    { label: 'Sold', value: 'SOLD' },
    { label: 'Exchanged', value: 'EXCHANGED' },
    { label: 'Donated', value: 'DONATED' },
  ];

  // Filter books matching tab
  const filteredBooks = books.filter((book) => {
    if (activeTab === 'ALL') return true;
    return book.status === activeTab;
  });

  const handleDelete = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    setDeletingId(bookId);
    try {
      const res = await deleteBookAction(bookId);
      if (res.success) {
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
      } else {
        alert(res.error || 'Failed to delete listing.');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (bookId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'UNAVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE';
    try {
      const res = await markBookStatusAction(bookId, nextStatus);
      if (res.success) {
        setBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, status: nextStatus } : b))
        );
      } else {
        alert(res.error || 'Failed to update book.');
      }
    } catch (e) {
      alert('An error occurred.');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">My Listed Books</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and track the books you have listed on the platform.</p>
        </div>
        <Link
          href="/dashboard/add-book"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Book</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-100 pb-px gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex-shrink-0 ${
              activeTab === tab.value
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Book List Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-base">No Listings Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You don't have any book listings matching the current selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-sky-200 transition-colors">
              <div>
                <div className="w-full h-36 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center relative mb-4">
                  {book.imageUrl ? (
                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-sky-100" />
                  )}
                  <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    book.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' :
                    book.status === 'SOLD' ? 'bg-slate-100 text-slate-500' : 'bg-sky-50 text-sky-600'
                  }`}>
                    {book.status}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{book.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">by {book.author}</p>
                <div className="text-xs text-slate-400 font-semibold mt-1">{book.category}</div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-slate-50 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">₹{book.expectedPrice}</span>
                <div className="flex space-x-1">
                  <Link
                    href={`/books/${book.id}`}
                    className="p-1.5 bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-sky-500 rounded-lg transition-colors border border-slate-100"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(book.id, book.status)}
                    className="p-1.5 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition-colors border border-slate-100"
                    title={book.status === 'UNAVAILABLE' ? 'Make available' : 'Make unavailable'}
                  >
                    {book.status === 'UNAVAILABLE' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    disabled={deletingId === book.id}
                    onClick={() => handleDelete(book.id)}
                    className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors border border-slate-100"
                    title="Delete listing"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
