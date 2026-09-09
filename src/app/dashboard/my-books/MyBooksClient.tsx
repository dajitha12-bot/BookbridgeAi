'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteBookAction, markBookStatusAction } from '../../../actions/bookActions';
import { removeFromWishlistAction } from '../../../actions/wishlistActions';
import {
  BookOpen,
  PlusCircle,
  Trash,
  Eye,
  EyeOff,
  Heart,
  ShoppingBag,
  ClipboardList,
  MessageSquarePlus,
  DollarSign,
  RefreshCw,
  Gift,
  Truck,
  CheckCircle2,
  Clock,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  MapPin,
} from 'lucide-react';

interface MyBooksClientProps {
  userId: string;
  userName: string;
  initialListedBooks: any[];
  initialWishlist: any[];
  initialOrders: any[];
  initialRentals: any[];
  initialRequests: any[];
  initialSales: any[];
  initialExchanges: any[];
  initialDonatedBooks: any[];
}

export default function MyBooksClient({
  userId,
  userName,
  initialListedBooks,
  initialWishlist,
  initialOrders,
  initialRentals,
  initialRequests,
  initialSales,
  initialExchanges,
  initialDonatedBooks,
}: MyBooksClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'listed' | 'wishlist' | 'orders' | 'rentals' | 'requests' | 'sold' | 'exchanged' | 'donated'
  >('listed');

  const [listedBooks, setListedBooks] = useState(initialListedBooks);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const navTabs = [
    { id: 'listed', label: 'My Listed Books', count: listedBooks.length, icon: BookOpen },
    { id: 'wishlist', label: 'Wishlist', count: wishlist.length, icon: Heart },
    { id: 'orders', label: 'My Orders', count: initialOrders.length, icon: ShoppingBag },
    { id: 'rentals', label: 'My Rentals', count: initialRentals.length, icon: ClipboardList },
    { id: 'requests', label: 'My Requests', count: initialRequests.length, icon: MessageSquarePlus },
    { id: 'sold', label: 'Sold', count: initialSales.length, icon: DollarSign },
    { id: 'exchanged', label: 'Exchanged', count: initialExchanges.length, icon: RefreshCw },
    { id: 'donated', label: 'Donated', count: initialDonatedBooks.length, icon: Gift },
  ];

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    setDeletingId(bookId);
    try {
      const res = await deleteBookAction(bookId);
      if (res.success) {
        setListedBooks((prev) => prev.filter((b) => b.id !== bookId));
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
        setListedBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, status: nextStatus } : b))
        );
      } else {
        alert(res.error || 'Failed to update book.');
      }
    } catch (e) {
      alert('An error occurred.');
    }
  };

  const handleRemoveWishlist = async (bookId: string) => {
    const res = await removeFromWishlistAction(bookId);
    if (res.success) {
      setWishlist((prev) => prev.filter((item) => item.bookId !== bookId));
    }
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Books & Activity Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your published book listings, active orders, rentals, requests, and exchange history for <span className="font-bold text-blue-600">{userName}</span>.
          </p>
        </div>
        <Link
          href="/dashboard/add-book"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Book</span>
        </Link>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex overflow-x-auto border-b border-slate-200 pb-px gap-2 scrollbar-thin">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/60 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: MY LISTED BOOKS
         ======================================================== */}
      {activeTab === 'listed' && (
        <div className="space-y-4">
          {listedBooks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">No Book Listings Found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                You haven't posted any books yet. Click Add New Book to publish your textbook for sale or exchange!
              </p>
              <Link
                href="/dashboard/add-book"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List a Book Now</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listedBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all"
                >
                  <div>
                    <div className="w-full h-40 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center relative mb-4">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-slate-300" />
                      )}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          book.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : book.status === 'SOLD'
                            ? 'bg-slate-100 text-slate-500 border border-slate-200'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">by {book.author}</p>
                    <div className="text-xs text-blue-600 font-semibold mt-1">{book.category}</div>
                  </div>

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
                        className="p-2 bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition-colors border border-slate-100 cursor-pointer"
                        title={book.status === 'UNAVAILABLE' ? 'Make available' : 'Make unavailable'}
                      >
                        {book.status === 'UNAVAILABLE' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        disabled={deletingId === book.id}
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors border border-slate-100 cursor-pointer"
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
      )}

      {/* ========================================================
          TAB 2: WISHLIST
         ======================================================== */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlist.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-3">
              <Heart className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-400">Save textbooks you want to buy, rent, or exchange later!</p>
              <Link href="/browse" className="inline-block text-xs font-bold text-blue-600 hover:underline">
                Explore Browse Catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => {
                const book = item.book;
                if (!book) return null;
                return (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-full h-36 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center relative mb-3">
                        {book.imageUrl ? (
                          <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-10 h-10 text-slate-300" />
                        )}
                        <button
                          onClick={() => handleRemoveWishlist(book.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-rose-50 text-rose-500 rounded-full shadow-xs cursor-pointer"
                          title="Remove from Wishlist"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">by {book.author}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Seller: <span className="font-semibold text-slate-700">{item.seller?.name || 'Community Seller'}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="font-extrabold text-blue-600 text-base">₹{book.expectedPrice}</span>
                      <Link
                        href={`/books/${book.id}`}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>View / Checkout</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: MY ORDERS
         ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {initialOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">No Purchased Orders Yet</h3>
              <p className="text-xs text-slate-400">Order textbooks directly from nearby sellers with delivery or offline pickup.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {initialOrders.map((order) => (
                <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Order ID: {order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        order.orderStatus === 'IN_TRANSIT' ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-base">{order.book?.title || 'Ordered Book'}</h3>
                    <p className="text-xs text-slate-500">Seller: {order.seller?.name || 'Seller'} • Payment: {order.paymentStatus}</p>
                    <p className="text-[11px] text-slate-400">Handover: <span className="font-semibold text-slate-600">{order.deliveryMethod === 'DELIVERY' ? 'Home Delivery' : 'Offline Pickup'}</span></p>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                    <span className="font-extrabold text-slate-900 text-lg">₹{order.amount}</span>
                    <Link
                      href="/dashboard/tracking"
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 4: MY RENTALS
         ======================================================== */}
      {activeTab === 'rentals' && (
        <div className="space-y-4">
          {initialRentals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-3">
              <ClipboardList className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">No Rental Contracts Active</h3>
              <p className="text-xs text-slate-400">Rent textbooks at low cost for 7, 14, or 30 days.</p>
              <Link href="/dashboard/rentals" className="inline-block text-xs font-bold text-blue-600 hover:underline">
                Browse Rental Catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {initialRentals.map((rental) => (
                <div key={rental.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                        {rental.durationDays} Days Duration
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm mt-1">{rental.book?.title || 'Rented Book'}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {rental.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl">
                    <div>Owner: <span className="font-semibold text-slate-700">{rental.owner?.name || 'Owner'}</span></div>
                    <div>Rental Fee: <span className="font-bold text-slate-900">₹{rental.rentalFee}</span></div>
                    <div className="text-[10px] text-slate-400">
                      Contract: {new Date(rental.startDate).toLocaleDateString()} to {new Date(rental.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <Link
                    href={`/books/${rental.bookId}`}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Book Details</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 5: MY REQUESTS
         ======================================================== */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {initialRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-3">
              <MessageSquarePlus className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">No Active Book Requests</h3>
              <p className="text-xs text-slate-400">Need a specific book? Post a request to match with local sellers!</p>
              <Link href="/dashboard/requests" className="inline-block text-xs font-bold text-blue-600 hover:underline">
                Post a Book Request →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {initialRequests.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                      Urgency: {req.urgency || 'MEDIUM'}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {req.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{req.title}</h3>
                    <p className="text-xs text-slate-400">Author: {req.author}</p>
                    <p className="text-xs text-blue-600 font-semibold mt-1">Category: {req.category}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Posted on {new Date(req.createdAt).toLocaleDateString()}</span>
                    <Link
                      href="/dashboard/requests"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      View Seller Matches
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 6: SOLD
         ======================================================== */}
      {activeTab === 'sold' && (
        <div className="space-y-4">
          {initialSales.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-3">
              <DollarSign className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">No Sales Records Yet</h3>
              <p className="text-xs text-slate-400">Books bought by other users from your listings will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {initialSales.map((sale) => (
                <div key={sale.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      SOLD COMPLETE
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-1">{sale.book?.title || 'Sold Book'}</h3>
                    <p className="text-xs text-slate-500">Buyer: {sale.buyer?.name || 'Buyer'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-600 text-lg">Earned: ₹{sale.amount}</span>
                    <p className="text-[10px] text-slate-400">Method: {sale.deliveryMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 7: EXCHANGED
         ======================================================== */}
      {activeTab === 'exchanged' && (
        <div className="space-y-4">
          {initialExchanges.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">No Exchange Records</h3>
              <p className="text-xs text-slate-400">Propose exchanges with community members for mutual book swaps!</p>
              <Link href="/dashboard/exchange" className="inline-block text-xs font-bold text-blue-600 hover:underline">
                Explore Exchange Portal →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {initialExchanges.map((exc) => (
                <div key={exc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      Status: {exc.status}
                    </span>
                    <span className="text-[10px] text-slate-400">Partner: {exc.partnerUser?.name || 'Partner'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Offered Book</span>
                      <span className="font-semibold text-slate-800">{exc.offeredBook?.title || 'Offered Book'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Requested Book</span>
                      <span className="font-semibold text-slate-800">{exc.requestedBook?.title || 'Requested Book'}</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/exchange"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Exchange Details</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 8: DONATED
         ======================================================== */}
      {activeTab === 'donated' && (
        <div className="space-y-4">
          {initialDonatedBooks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-3">
              <Gift className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">No Donated Books Listed</h3>
              <p className="text-xs text-slate-400">Mark books as free donations to help schools and children in need.</p>
              <Link href="/dashboard/donations" className="inline-block text-xs font-bold text-blue-600 hover:underline">
                Visit Community Care Donations →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialDonatedBooks.map((book) => (
                <div key={book.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      FREE DONATION
                    </span>
                    <span className="text-[10px] text-slate-400">{book.city}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-slate-400">by {book.author}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{book.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                    <span className="font-bold text-emerald-600 text-sm">FREE (₹0)</span>
                    <Link
                      href={`/books/${book.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
