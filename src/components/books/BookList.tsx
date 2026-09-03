import React from 'react';
import { Book } from '../../types';
import { BookCard } from './BookCard';

export function BookList({ books }: { books: Book[] }) {
  if (!books || books.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-semibold">
        No books available in this selection.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
}
