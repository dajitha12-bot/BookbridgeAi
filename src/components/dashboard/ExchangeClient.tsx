'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { respondExchangeAction, completeExchangeAction, requestExchangeAction } from '../../actions/exchangeActions';
import { 
  RefreshCw, 
  ArrowRight, 
  Check, 
  X, 
  Clock, 
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Search,
  Sparkles,
  User,
  Truck,
  MapPin,
  BookOpen,
  Send
} from 'lucide-react';
import Link from 'next/link';

interface ExchangeClientProps {
  userId: string;
  sentExchanges: any[];
  receivedExchanges: any[];
  availableExchangeBooks: any[];
  userOwnedBooks: any[];
  userRequests: any[];
}

export default function ExchangeClient({
  userId,
  sentExchanges,
  receivedExchanges,
  availableExchangeBooks = [],
  userOwnedBooks = [],
  userRequests = []
}: ExchangeClientProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Search & Filter State for Exchange Catalog
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State for initiating an exchange proposal
  const [targetBook, setTargetBook] = useState<any | null>(null);
  const [selectedOfferedBookId, setSelectedOfferedBookId] = useState<string>('');
  const [handoverMethod, setHandoverMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const categories = ['All', 'Programming', 'Artificial Intelligence', 'Database', 'Web Development', 'Operating Systems', 'Mathematics', 'Novels'];

  // Calculate matching recommended books based on active user requests
  const requestedCategories = new Set(userRequests.map(r => r.category?.toLowerCase()));
  const requestedTitles = userRequests.map(r => r.title?.toLowerCase() || '');

  const recommendedBooks = availableExchangeBooks.filter((book) => {
    const titleMatch = requestedTitles.some(t => t && book.title.toLowerCase().includes(t));
    const catMatch = requestedCategories.has(book.category?.toLowerCase());
    return titleMatch || catMatch;
  });

  // Filter available exchange catalog by search & category
  const filteredExchangeBooks = availableExchangeBooks.filter((book) => {
    const matchesSearch = !search.trim() || 
      book.title.toLowerCase().includes(search.toLowerCase()) || 
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      (book.seller?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || book.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const handleOpenProposeModal = (book: any) => {
    setTargetBook(book);
    setModalError(null);
    if (userOwnedBooks.length > 0) {
      setSelectedOfferedBookId(userOwnedBooks[0].id);
    }
  };

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBook) return;
    if (!selectedOfferedBookId) {
      setModalError('You must select one of your listed books to offer for exchange.');
      return;
    }

    setSubmittingProposal(true);
    setModalError(null);

    try {
      const res = await requestExchangeAction(selectedOfferedBookId, targetBook.id, handoverMethod);
      if (res.success) {
        alert('Exchange proposal submitted successfully!');
        setTargetBook(null);
        router.refresh();
      } else {
        setModalError(res.error || 'Failed to submit exchange proposal.');
      }
    } catch (e) {
      setModalError('An unexpected error occurred.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleResponse = async (exchangeId: string, accept: boolean) => {
    setProcessingId(exchangeId);
    try {
      const res = await respondExchangeAction(exchangeId, accept);
      if (res.success) {
        alert(accept ? 'Exchange request accepted! Order created.' : 'Exchange request declined.');
        router.refresh();
      } else {
        alert(res.error || 'Failed to respond to request.');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (exchangeId: string) => {
    if (!confirm('Are you sure the exchange is complete and you received your book?')) return;
    setProcessingId(exchangeId);
    try {
      const res = await completeExchangeAction(exchangeId);
      if (res.success) {
        alert('Exchange marked complete!');
        router.refresh();
      } else {
        alert(res.error || 'Failed to complete exchange.');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 text-slate-800 animate-fade-in font-sans pb-16">
      {/* Title Banner */}
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <RefreshCw className="w-5.5 h-5.5 text-sky-500" />
          <span>Smart Book Exchanges</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Propose direct book swaps with readers. Choose Home Delivery (Assign Staff) or Self Pickup.
        </p>
      </div>

      {/* Recommended Exchangeable Books Matching User Requests */}
      {recommendedBooks.length > 0 && (
        <div className="bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-indigo-500/10 border border-sky-200/60 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 text-sky-700">
            <Sparkles className="w-5 h-5 text-sky-600 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Recommended Exchange Books for Your Requests</h2>
          </div>
          <p className="text-xs text-slate-500">
            These books match your active book requests and listed interests. Swap directly with sellers below!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            {recommendedBooks.slice(0, 3).map((book) => (
              <div key={book.id} className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase">
                    {book.category}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm truncate">{book.title}</h3>
                  <p className="text-xs text-slate-500">by {book.author}</p>
                  
                  {/* Selling User Name */}
                  <div className="flex items-center space-x-1 text-xs text-slate-600 pt-1 font-semibold">
                    <User className="w-3.5 h-3.5 text-sky-500" />
                    <span>Seller: <strong className="text-slate-800">{book.seller?.name || 'Reader'}</strong></span>
                  </div>
                  <div className="text-[10px] text-slate-400">Location: {book.city}, {book.area}</div>
                </div>

                <button
                  onClick={() => handleOpenProposeModal(book)}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Propose Swap</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exchange Book Catalog with Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Browse Available Books for Exchange</h2>
            <p className="text-xs text-slate-500">Search textbooks listed by other readers available for trade.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, seller..."
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white w-full sm:w-60"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white font-semibold"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredExchangeBooks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">No books available for exchange matching your search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExchangeBooks.map((book) => (
              <div key={book.id} className="bg-slate-50/50 p-5 rounded-xl border border-slate-150 hover:border-sky-200 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase">
                      {book.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {book.condition.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{book.title}</h3>
                  <p className="text-xs text-slate-500">by {book.author}</p>
                  
                  {/* Selling User Name */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-700 font-semibold bg-white p-2.5 rounded-lg border border-slate-100">
                    <User className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <span className="truncate">Seller: <strong className="text-slate-900">{book.seller?.name || 'Reader'}</strong></span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5 font-medium">
                    <div>City: {book.city} ({book.area})</div>
                    <div>Original Price: ₹{book.originalPrice}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenProposeModal(book)}
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Propose Exchange</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming Exchange Requests */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Incoming Exchange Requests</h2>
        {receivedExchanges.length === 0 ? (
          <div className="text-slate-400 text-xs text-center py-6">No incoming exchange requests received yet.</div>
        ) : (
          <div className="space-y-4">
            {receivedExchanges.map((req) => (
              <div key={req.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{req.sender?.name || 'Reader'}</span>
                    <span className="text-slate-500"> offers their book: </span>
                    <span className="font-semibold text-sky-600">"{req.offeredBook?.title || 'Book'}"</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                    req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                    req.status === 'ACCEPTED' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="text-xs leading-relaxed text-slate-600 pl-4 border-l-2 border-l-sky-400">
                  To receive your book: <span className="font-semibold text-slate-800">"{req.requestedBook?.title || 'Book'}"</span>
                  {req.deliveryMethod && (
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Handover Mode: {req.deliveryMethod === 'DELIVERY' ? '🚚 Home Delivery (Assign Staff)' : '🤝 Self / Offline Pickup'}
                    </div>
                  )}
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      disabled={processingId === req.id}
                      onClick={() => handleResponse(req.id, true)}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Accept Proposal
                    </button>
                    <button
                      disabled={processingId === req.id}
                      onClick={() => handleResponse(req.id, false)}
                      className="px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                )}

                {req.status === 'ACCEPTED' && (
                  <button
                    disabled={processingId === req.id}
                    onClick={() => handleComplete(req.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Exchange Handover
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Exchange Proposals */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">My Proposed Exchanges (Sent)</h2>
        {sentExchanges.length === 0 ? (
          <div className="text-slate-400 text-xs text-center py-6">You haven't proposed any book exchanges yet.</div>
        ) : (
          <div className="space-y-4">
            {sentExchanges.map((req) => (
              <div key={req.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs">
                  <div>
                    <span>You proposed swapping your book </span>
                    <span className="font-semibold text-slate-800">"{req.offeredBook?.title || 'Book'}"</span>
                    <span> to receive </span>
                    <span className="font-semibold text-sky-600">"{req.requestedBook?.title || 'Book'}"</span>
                    <span> from </span>
                    <span className="font-bold text-slate-800">{req.receiver?.name || 'Reader'}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                    req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                    req.status === 'ACCEPTED' ? 'bg-indigo-50 text-indigo-600' :
                    req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {req.status}
                  </span>
                </div>

                {req.status === 'ACCEPTED' && (
                  <button
                    disabled={processingId === req.id}
                    onClick={() => handleComplete(req.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Exchange Handover
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Propose Exchange Modal */}
      {targetBook && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-sky-500" />
                <span>Propose Book Exchange</span>
              </h3>
              <button 
                onClick={() => setTargetBook(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2 text-rose-600 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleProposeSubmit} className="space-y-5">
              {/* Target Book Info */}
              <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 space-y-1">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Requested Book</span>
                <div className="font-bold text-slate-800 text-sm">{targetBook.title}</div>
                <div className="text-xs text-slate-500">by {targetBook.author}</div>
                <div className="text-xs text-slate-700 font-semibold pt-1">
                  Owner / Seller: <strong>{targetBook.seller?.name || 'Reader'}</strong> ({targetBook.city})
                </div>
              </div>

              {/* Select Offered Book */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select Your Book to Offer in Return
                </label>
                {userOwnedBooks.length === 0 ? (
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-rose-600 text-xs font-semibold">
                    You do not have any available books listed to exchange.{' '}
                    <Link href="/dashboard/add-book" className="underline font-bold">List a book first</Link>.
                  </div>
                ) : (
                  <select
                    value={selectedOfferedBookId}
                    onChange={(e) => setSelectedOfferedBookId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white font-semibold"
                  >
                    {userOwnedBooks.map((b) => (
                      <option key={b.id} value={b.id}>{b.title} ({b.category})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Handover Method Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Handover Delivery Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHandoverMethod('DELIVERY')}
                    className={`p-3 border rounded-xl font-bold text-xs text-left transition-all space-y-1 ${
                      handoverMethod === 'DELIVERY'
                        ? 'border-sky-500 bg-sky-50/50 text-sky-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-sky-500" />
                      <span>Online Delivery</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Admin assigns delivery staff for courier pickup.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHandoverMethod('PICKUP')}
                    className={`p-3 border rounded-xl font-bold text-xs text-left transition-all space-y-1 ${
                      handoverMethod === 'PICKUP'
                        ? 'border-sky-500 bg-sky-50/50 text-sky-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-sky-500" />
                      <span>Offline Pickup</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Meet seller directly for instant hand-to-hand swap.</p>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submittingProposal || userOwnedBooks.length === 0}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submittingProposal ? 'Submitting Proposal...' : 'Send Exchange Proposal'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
