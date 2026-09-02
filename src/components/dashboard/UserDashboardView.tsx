'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  ShoppingBag, 
  RefreshCw, 
  Heart, 
  DollarSign, 
  MapPin, 
  Search, 
  PlusCircle, 
  AlertCircle, 
  HelpCircle,
  Truck
} from 'lucide-react';

interface UserDashboardProps {
  user: any;
  stats: {
    listed: number;
    sold: number;
    orders: number;
    exchanges: number;
    wishlist: number;
  };
  recommendations: any[];
  recentlyListed: any[];
  nearbyBooks: any[];
  activeOrders: any[];
  bookRequests: any[];
}

export default function UserDashboardView({
  user,
  stats,
  recommendations,
  recentlyListed,
  nearbyBooks,
  activeOrders,
  bookRequests,
}: UserDashboardProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCreateRequest = () => {
    if (searchQuery.trim()) {
      router.push(`/dashboard/requests?newTitle=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/dashboard/requests');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-15 translate-y-4 translate-x-4">
          <BookOpen className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user.name}!</h1>
          <p className="text-sky-100 max-w-xl text-sm sm:text-base">
            Give books a second life. Buy, sell, exchange and coordinate home delivery or offline pickup directly in your neighborhood.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Books Listed', value: stats.listed, icon: BookOpen, color: 'text-sky-600 bg-sky-50' },
          { label: 'Books Sold', value: stats.sold, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'My Orders', value: stats.orders, icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Exchanges', value: stats.exchanges, icon: RefreshCw, color: 'text-amber-600 bg-amber-50' },
          { label: 'Wishlist', value: stats.wishlist, icon: Heart, color: 'text-rose-600 bg-rose-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Search Bar & Request */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-800">What book are you looking for?</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Try "I want a Python programming book under ₹500"'
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors shadow-xs"
            >
              Search Books
            </button>
            <button
              type="button"
              onClick={handleCreateRequest}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-600 font-medium rounded-lg text-sm border border-sky-200 transition-colors"
            >
              Create Book Request
            </button>
          </div>
        </form>
      </div>

      {/* Active Orders Widget */}
      {activeOrders.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Active Orders & Deliveries</h2>
          <div className="divide-y divide-slate-100">
            {activeOrders.map((order) => (
              <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center font-bold text-sky-600">
                    {order.book.title.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{order.book.title}</h3>
                    <p className="text-xs text-slate-500">
                      {order.buyerId === user.id ? `Buying from ${order.seller.name}` : `Selling to ${order.buyer.name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                    order.orderStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                    'bg-sky-50 text-sky-600 animate-pulse'
                  }`}>
                    {order.orderStatus}
                  </span>
                  {order.deliveryMethod === 'DELIVERY' && (
                    <Link
                      href={`/dashboard/orders`}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Track Delivery
                    </Link>
                  )}
                  {order.deliveryMethod === 'PICKUP' && order.orderStatus === 'READY_FOR_PICKUP' && (
                    <Link
                      href={`/dashboard/orders`}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Awaiting Pickup
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Recommended & Nearby */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Proximity / Nearby books */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Nearby Books in {user.profile?.city || 'Your Area'}</h2>
            <Link href="/browse?sort=Nearest" className="text-xs font-semibold text-sky-500 hover:text-sky-600">
              View All
            </Link>
          </div>
          {nearbyBooks.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-dashed border-slate-200 text-center py-8 text-slate-500 text-sm">
              No books listed in your city yet.
            </div>
          ) : (
            <div className="space-y-3">
              {nearbyBooks.map((book) => (
                <div key={book.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex justify-between items-center hover:border-sky-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-14 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 relative">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-sky-50 flex items-center justify-center font-bold text-sky-400 text-xs">Book</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">by {book.author}</p>
                      <div className="flex items-center text-[10px] text-slate-400 mt-1">
                        <MapPin className="w-3 h-3 text-sky-500 mr-0.5" />
                        <span>{book.area} ({book.distance} km)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">₹{book.expectedPrice}</div>
                    <Link
                      href={`/books/${book.id}`}
                      className="inline-block mt-2 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-semibold rounded-md transition-colors"
                    >
                      Buy
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Recommendations */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Smart Book Recommendations</h2>
            <Link href="/browse" className="text-xs font-semibold text-sky-500 hover:text-sky-600">
              Browse More
            </Link>
          </div>
          {recommendations.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-dashed border-slate-200 text-center py-8 text-slate-500 text-sm">
              Explore more books and add them to your wishlist to get personalized recommendations.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((book) => (
                <div key={book.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex justify-between items-center hover:border-sky-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-14 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 relative">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-sky-50 flex items-center justify-center font-bold text-sky-400 text-xs">Book</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">by {book.author}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {book.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">₹{book.expectedPrice}</div>
                    <Link
                      href={`/books/${book.id}`}
                      className="inline-block mt-2 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-semibold rounded-md transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recently Listed Books Banner */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Recently Listed Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {recentlyListed.map((book) => (
            <div key={book.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
              <div>
                <div className="w-full h-32 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center relative mb-3">
                  {book.imageUrl ? (
                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover animate-fade-in" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-sky-200" />
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    book.condition === 'NEW' || book.condition === 'LIKE_NEW' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {book.condition.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{book.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">by {book.author}</p>
                <div className="text-xs font-medium text-slate-400 mt-1">{book.category}</div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="font-bold text-slate-800 text-sm">₹{book.expectedPrice}</span>
                <Link
                  href={`/books/${book.id}`}
                  className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tips section */}
      <div className="bg-sky-50/50 border border-sky-100 p-6 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start space-x-3">
          <HelpCircle className="w-6 h-6 text-sky-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Want to sell your books quickly?</h3>
            <p className="text-xs text-slate-600 max-w-xl mt-1">
              Use our AI Fair Price Prediction tool when adding a book. It calculates optimal prices based on original cost, age, and condition to help attract local buyers.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/add-book"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-xs transition-colors self-start md:self-auto flex items-center space-x-1"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List a Book Now</span>
        </Link>
      </div>
    </div>
  );
}
