'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '../../hooks/useWishlist';
import { Heart, BookOpen, Trash, Eye, ShoppingCart } from 'lucide-react';

interface WishlistClientProps {
  initialWishlist: any[];
}

export default function WishlistClient({ initialWishlist }: WishlistClientProps) {
  const { wishlist, remove, loading } = useWishlist();

  const handleRemove = async (bookId: string) => {
    const res = await remove(bookId);
    if (!res.success) {
      alert(res.error || 'Failed to remove from wishlist.');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans">
      <div>
        <h1 className="text-xl font-bold">My Saved Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">Keep track of books you want to purchase or swap.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
        {wishlist.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm space-y-3">
            <Heart className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-700">Wishlist is Empty</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Save books while browsing to keep them here for quick access later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs flex flex-col justify-between hover:border-sky-200 transition-colors">
                <div>
                  <div className="w-full h-32 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center relative mb-4">
                    <BookOpen className="w-12 h-12 text-sky-100" />
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.availability === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {item.availability}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">by {item.author}</p>
                  <div className="text-xs text-slate-400 mt-1.5 flex justify-between">
                    <span>Seller: {item.sellerName}</span>
                    <span className="font-bold">{item.condition}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-50 flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-sm">₹{item.price}</span>
                  <div className="flex space-x-1.5">
                    <Link
                      href={`/books/${item.bookId}`}
                      className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors flex items-center justify-center"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleRemove(item.bookId)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors border border-rose-100 flex items-center justify-center"
                      title="Remove from wishlist"
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
    </div>
  );
}
