'use client';

import React, { useState } from 'react';
import { Calendar, Search, Sparkles, User, BookOpen, ArrowRight, Shield, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface RentalsClientProps {
  userId: string;
  rentals: any[];
  availableRentBooks: any[];
  userRequests: any[];
}

export default function RentalsClient({
  userId,
  rentals = [],
  availableRentBooks = [],
  userRequests = []
}: RentalsClientProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-rentals'>('catalog');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Programming', 'Artificial Intelligence', 'Database', 'Web Development', 'Operating Systems', 'Mathematics', 'Novels'];

  // Calculate matching recommended books based on active user requests
  const requestedCategories = new Set(userRequests.map(r => r.category?.toLowerCase()));
  const requestedTitles = userRequests.map(r => r.title?.toLowerCase() || '');

  const recommendedRentBooks = availableRentBooks.filter((book) => {
    const titleMatch = requestedTitles.some(t => t && book.title.toLowerCase().includes(t));
    const catMatch = requestedCategories.has(book.category?.toLowerCase());
    return titleMatch || catMatch;
  });

  // Filter available rent catalog by search & category
  const filteredRentBooks = availableRentBooks.filter((book) => {
    const matchesSearch = !search.trim() || 
      book.title.toLowerCase().includes(search.toLowerCase()) || 
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      (book.seller?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || book.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 text-slate-800 animate-fade-in font-sans pb-16">
      {/* Title & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Calendar className="w-5.5 h-5.5 text-blue-600" />
            <span>Book Rentals Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rent textbooks at ₹10/day from other readers, or manage your active rental agreements.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'catalog' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Browse Rent Catalog ({availableRentBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('my-rentals')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'my-rentals' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Rental Contracts ({rentals.length})
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <div className="space-y-8">
          {/* Recommended Books for User Requests */}
          {recommendedRentBooks.length > 0 && (
            <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-200/60 p-6 rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center space-x-2 text-blue-700">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Recommended Rentals for Your Requests</h2>
              </div>
              <p className="text-xs text-slate-500">
                These textbooks match your active book requests and saved preferences. Rent from verified sellers below!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                {recommendedRentBooks.slice(0, 3).map((book) => (
                  <div key={book.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                          {book.category}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          ₹10/day
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm truncate">{book.title}</h3>
                      <p className="text-xs text-slate-500">by {book.author}</p>
                      
                      {/* Owner / Sales User Name */}
                      <div className="flex items-center space-x-1 text-xs text-slate-700 pt-1 font-semibold">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span>Sales User: <strong className="text-slate-900">{book.seller?.name || 'Reader'}</strong></span>
                      </div>
                      <div className="text-[10px] text-slate-400">Location: {book.city}, {book.area}</div>
                    </div>

                    <Link
                      href={`/books/${book.id}/rent`}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Rent This Book</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Rent Catalog */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Available Books for Rent</h2>
                <p className="text-xs text-slate-500">Filter and search available textbooks listed for rental.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, author, owner..."
                    className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white w-full sm:w-60"
                  />
                </div>

                {/* Category Select */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-semibold"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredRentBooks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">No rental books found matching your search.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRentBooks.map((book) => (
                  <div key={book.id} className="bg-slate-50/50 p-5 rounded-xl border border-slate-150 hover:border-blue-200 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                          {book.category}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          ₹10/day (Deposit ₹100)
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{book.title}</h3>
                      <p className="text-xs text-slate-500">by {book.author}</p>
                      
                      {/* Owner / Sales User Name */}
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-semibold bg-white p-2.5 rounded-lg border border-slate-100">
                        <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="truncate">Sales User: <strong className="text-slate-900">{book.seller?.name || 'Reader'}</strong></span>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-0.5 font-medium">
                        <div>City: {book.city} ({book.area})</div>
                        <div>Condition: {book.condition.replace('_', ' ')}</div>
                      </div>
                    </div>

                    <Link
                      href={`/books/${book.id}/rent`}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Rent This Book</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* My Active Rental Contracts Tab */
        <div className="space-y-6">
          {rentals.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-4 shadow-sm">
              <BookOpen className="w-12 h-12 mx-auto text-slate-350" />
              <h3 className="font-bold text-slate-700 text-sm">No Active Rental Contracts</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                You don't have any current book rentals. Select books from the rent catalog above to get started.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
                  <thead>
                    <tr className="font-bold text-slate-400 bg-slate-50/50">
                      <th className="p-4">Book Title</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Calculated Fee</th>
                      <th className="p-4">Rental Term</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {rentals.map((rent) => {
                      const isRenter = rent.renterId === userId;
                      return (
                        <tr key={rent.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">
                                {rent.bookId}
                              </div>
                              <div className="text-[10px] text-slate-400">Contract #{rent.id.slice(0, 8)}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              isRenter ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-650'
                            }`}>
                              {isRenter ? 'Borrower' : 'Lender'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-800 font-bold">{rent.durationDays} Days</td>
                          <td className="p-4 text-slate-800 font-extrabold">₹{rent.rentalFee}</td>
                          <td className="p-4 text-[10px] text-slate-550 space-y-0.5">
                            <div>Start: {new Date(rent.startDate).toLocaleDateString()}</div>
                            <div>End: {new Date(rent.endDate).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              rent.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {rent.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase ${
                              rent.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 
                              rent.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {rent.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
