import React from 'react';
import { Book } from '../../types';
import Link from 'next/link';
import { BookOpen, MapPin } from 'lucide-react';

export function BookCard({ book }: { book: Book }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 font-sans">
      <div className="space-y-2">
        <div className="w-full aspect-[3/4] bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center">
          {book.imageUrl ? (
            <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-12 h-12 text-slate-200" />
          )}
        </div>
        <div>
          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
            {book.category}
          </span>
          <h4 className="font-extrabold text-slate-800 text-sm truncate mt-1">{book.title}</h4>
          <p className="text-xs text-slate-400">by {book.author}</p>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-50 flex justify-between items-center text-xs">
        <span className="font-extrabold text-slate-800 text-sm">₹{book.expectedPrice}</span>
        <Link
          href={`/books/${book.id}`}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}
