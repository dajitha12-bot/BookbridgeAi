'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteBookAction, markBookStatusAction } from '../../../actions/bookActions';
import { BookOpen, PlusCircle, Trash, Eye, EyeOff, Heart, ShoppingBag, ClipboardList, MessageSquarePlus, DollarSign, RefreshCw, Gift } from 'lucide-react';

interface MyBooksClientProps {
  initialBooks: any[];
}

export default function MyBooksClient({ initialBooks }: MyBooksClientProps) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const navTabs = [
    { label: 'My Listed Books', href: '/dashboard/my-books', active: true, icon: BookOpen },
    { label: 'Wishlist', href: '/dashboard/wishlist', active: false, icon: Heart },
    { label: 'My Orders', href: '/dashboard/orders', active: false, icon: ShoppingBag },
    { label: 'My Rentals', href: '/dashboard/rentals', active: false, icon: ClipboardList },
    { label: 'My Requests', href: '/dashboard/requests', active: false, icon: MessageSquarePlus },
    { label: 'Sold', href: '/dashboard/sales', active: false, icon: DollarSign },
    { label: 'Exchanged', href: '/dashboard/exchange', active: false, icon: RefreshCw },
    { label: 'Donated', href: '/dashboard/donations', active: false, icon: Gift },
  ];

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
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">My Listed Books</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and track the books you have listed on the platform.</p>
        </div>
        <Link
          href="/dashboard/add-book"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Book</span>
        </Link>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex overflow-x-auto border-b border-slate-200 pb-px gap-2 scrollbar-thin">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
                tab.active
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Book List Grid */}
      {books.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-base">No Listings Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You don't have any book listings published yet. Click Add New Book to post your textbook!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all">
              <div>
                <div className="w-full h-40 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center relative mb-4">
                  {book.imageUrl ? (
                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-slate-300" />
                  )}
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    book.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    book.status === 'SOLD' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {book.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{book.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">by {book.author}</p>
                <div className="text-xs text-blue-600 font-semibold mt-1">{book.category}</div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-slate-50 flex items-center justify-between">
                <span className="font-extrabold text-slate-800 text-base">₹{book.expectedPrice}</span>
                <div className="flex space-x-1.5">
                  <Link
                    href={`/books/${book.id}`}
                    className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors border border-slate-100"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(book.id, book.status)}
                    className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition-colors border border-slate-100"
                    title={book.status === 'UNAVAILABLE' ? 'Make available' : 'Make unavailable'}
                  >
                    {book.status === 'UNAVAILABLE' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    disabled={deletingId === book.id}
                    onClick={() => handleDelete(book.id)}
                    className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors border border-slate-100"
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
