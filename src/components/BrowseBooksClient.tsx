'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useBooks } from '../hooks/useBooks';
import { useWishlist } from '../hooks/useWishlist';
import { 
  Search, 
  MapPin, 
  Truck, 
  RefreshCw, 
  Heart, 
  BookOpen, 
  SlidersHorizontal,
  ChevronRight,
  User as UserIcon,
  Star,
  Sparkles,
  Calendar,
  ShoppingBag
} from 'lucide-react';

interface BrowseBooksClientProps {
  userId: string | null;
  coordinates?: { latitude: number; longitude: number } | null;
  userRequests?: any[];
}

export default function BrowseBooksClient({
  userId,
  coordinates,
  userRequests = []
}: BrowseBooksClientProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { wishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();

  // Initialize custom hook
  const {
    books,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    refetch
  } = useBooks('', {}, 'Newest', coordinates || undefined);

  // Calculate matching recommended books for user active requests
  const requestedCategories = new Set(userRequests.map(r => r.category?.toLowerCase()));
  const requestedTitles = userRequests.map(r => r.title?.toLowerCase() || '');

  const recommendedBooks = books.filter((book) => {
    const titleMatch = requestedTitles.some(t => t && book.title.toLowerCase().includes(t));
    const catMatch = requestedCategories.has(book.category?.toLowerCase());
    return titleMatch || catMatch;
  });

  // Form search handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputRef.current) {
      setSearch(searchInputRef.current.value);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      condition: 'All',
      city: 'All',
      area: '',
      minPrice: undefined,
      maxPrice: undefined,
      deliveryAvailable: false,
      exchangeAvailable: false,
    });
    setSearch('');
    if (searchInputRef.current) searchInputRef.current.value = '';
  };

  const isBookWishlisted = (bookId: string) => {
    return wishlist.some(item => item.bookId === bookId);
  };

  const handleWishlistToggle = async (bookId: string) => {
    if (!userId) {
      alert('Please log in to wishlist books.');
      window.location.href = '/login';
      return;
    }

    if (isBookWishlisted(bookId)) {
      await removeFromWishlist(bookId);
    } else {
      await addToWishlist(bookId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Browse Books</h1>
          <p className="text-xs text-slate-500 mt-1">Discover used books in your city and nearby areas.</p>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by title, author, ISBN..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Recommended Books for User Requests Banner */}
      {recommendedBooks.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-indigo-500/10 border border-sky-200/60 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sky-700">
              <Sparkles className="w-5 h-5 text-sky-600 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Recommended Books Matching Your Requests</h2>
            </div>
            <Link href="/dashboard/requests" className="text-xs font-bold text-sky-600 hover:underline">
              Manage Requests →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendedBooks.slice(0, 4).map((book) => (
              <div key={book.id} className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase">
                      {book.category}
                    </span>
                    <span className="text-xs font-bold text-slate-800">₹{book.expectedPrice}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm truncate">{book.title}</h3>
                  <p className="text-xs text-slate-500">by {book.author}</p>
                  <div className="text-[10px] text-slate-400">Location: {book.city}, {book.area}</div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1">
                  <Link
                    href={`/books/${book.id}`}
                    className="py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[10px] font-bold text-center transition-colors flex items-center justify-center space-x-0.5"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Buy</span>
                  </Link>

                  <Link
                    href={`/books/${book.id}/rent`}
                    className="py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold text-center transition-colors flex items-center justify-center space-x-0.5"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Rent</span>
                  </Link>

                  <Link
                    href={`/dashboard/exchange`}
                    className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold text-center transition-colors flex items-center justify-center space-x-0.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Swap</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ==========================================
            FILTERS SIDEBAR (DESKTOP)
           ========================================== */}
        <aside className="hidden lg:block w-64 bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6 self-start">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
              <SlidersHorizontal className="w-4 h-4 text-sky-500" />
              <span>Filters</span>
            </h3>
            <button onClick={handleResetFilters} className="text-xs text-sky-500 hover:text-sky-600 font-semibold">
              Reset All
            </button>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
            >
              <option value="All">All Categories</option>
              {['Programming', 'Artificial Intelligence', 'Database', 'Web Development', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Management', 'Novels', 'Competitive Exams'].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
            >
              <option value="All">All Cities</option>
              {['Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli', 'Tirunelveli'].map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
            >
              <option value="All">Any Condition</option>
              {['NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'FAIR'].map((cond) => (
                <option key={cond} value={cond}>{cond.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Pricing range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Expected Price</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-1/2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-1/2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Handover Methods */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Handover</label>
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.deliveryAvailable}
                onChange={(e) => setFilters({ ...filters, deliveryAvailable: e.target.checked })}
                className="rounded text-sky-500 focus:ring-sky-500 w-4 h-4 border-slate-200"
              />
              <span>Home Delivery Available</span>
            </label>
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.exchangeAvailable}
                onChange={(e) => setFilters({ ...filters, exchangeAvailable: e.target.checked })}
                className="rounded text-sky-500 focus:ring-sky-500 w-4 h-4 border-slate-200"
              />
              <span>Available for Exchange</span>
            </label>
          </div>
        </aside>

        {/* ==========================================
            MAIN CONTENT (BOOK GRID)
           ========================================== */}
        <main className="flex-1 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-wrap justify-between items-center gap-4">
            <div className="text-xs text-slate-500 font-semibold">
              Showing <span className="text-slate-800 font-bold">{books.length}</span> available book listings
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-xs text-slate-500 font-semibold">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white font-medium"
              >
                <option value="Newest">Newest First</option>
                <option value="PriceLowHigh">Price: Low to High</option>
                <option value="PriceHighLow">Price: High to Low</option>
                <option value="Oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Book Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-xl border border-slate-100 p-4 h-72 animate-pulse flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    <div className="h-20 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-8 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-xl text-center text-xs font-semibold">
              {error}
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white border border-slate-150 p-12 rounded-xl text-center text-slate-400 text-xs space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <div>No books match your selected search criteria or filters.</div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => {
                const wishlisted = isBookWishlisted(book.id);
                return (
                  <div 
                    key={book.id}
                    className="bg-white rounded-xl border border-slate-150 hover:border-sky-200 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 space-y-3">
                      {/* Top Badges */}
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 bg-sky-50 text-sky-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {book.category}
                        </span>
                        <button
                          onClick={() => handleWishlistToggle(book.id)}
                          className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Image or Book Icon */}
                      <div className="h-36 bg-slate-50 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-100">
                        {book.imageUrl ? (
                          <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center space-y-1">
                            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                            <div className="text-[10px] text-slate-400 font-semibold">{book.condition.replace('_', ' ')}</div>
                          </div>
                        )}
                        {book.donationAvailable && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-bold shadow-xs">
                            FREE DONATION
                          </span>
                        )}
                      </div>

                      {/* Title & Author */}
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-sky-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">by {book.author}</p>
                      </div>

                      {/* Details & Location */}
                      <div className="text-[11px] text-slate-500 space-y-1 font-medium border-t border-slate-100 pt-2">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{book.city}, {book.area}</span>
                          {book.distance !== undefined && book.distance > 0 && (
                            <span className="text-sky-600 font-bold ml-1">({book.distance} km away)</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                          {book.deliveryAvailable && (
                            <span className="flex items-center space-x-0.5">
                              <Truck className="w-3 h-3 text-sky-500" />
                              <span>Delivery</span>
                            </span>
                          )}
                          {book.exchangeAvailable && (
                            <span className="flex items-center space-x-0.5">
                              <RefreshCw className="w-3 h-3 text-emerald-500" />
                              <span>Exchange</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer price & Details button */}
                    <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Price</div>
                        <div className="text-base font-extrabold text-slate-800">
                          {book.donationAvailable ? 'FREE' : `₹${book.expectedPrice}`}
                        </div>
                      </div>

                      <Link
                        href={`/books/${book.id}`}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1 shadow-xs"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
