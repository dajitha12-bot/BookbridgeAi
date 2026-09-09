'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, Clock, CheckCircle2, AlertCircle, PlusCircle, Trash, ShoppingBag, Calendar, RefreshCw, User, Sparkles } from 'lucide-react';
import { createBookRequestAction, deleteBookRequestAction } from '../../actions/requestActions';
import Link from 'next/link';

interface RequestsClientProps {
  initialRequests: any[];
  prefilledTitle?: string;
  availableBooks?: any[];
}

export default function RequestsClient({
  initialRequests,
  prefilledTitle = '',
  availableBooks = []
}: RequestsClientProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [showAddForm, setShowAddForm] = useState(prefilledTitle ? true : false);
  
  // Form fields
  const [title, setTitle] = useState(prefilledTitle);
  const [category, setCategory] = useState('Programming');
  const [maxPrice, setMaxPrice] = useState('500');
  const [preferredCondition, setPreferredCondition] = useState('GOOD');
  const [city, setCity] = useState('Chennai');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('maxPrice', maxPrice);
    formData.append('preferredCondition', preferredCondition);
    formData.append('city', city);

    try {
      const res = await createBookRequestAction(formData);
      if (res.success && res.request) {
        alert('Book request created successfully!');
        setRequests(prev => [res.request, ...prev]);
        setShowAddForm(false);
        setTitle('');
        setMaxPrice('500');
      } else {
        setError(res.error || 'Failed to create request.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to close/delete this book request?')) return;
    try {
      const res = await deleteBookRequestAction(id);
      if (res.success) {
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        alert(res.error || 'Failed to delete request.');
      }
    } catch (e) {
      alert('An error occurred.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-1.5">
            <MessageSquarePlus className="w-5.5 h-5.5 text-sky-500" />
            <span>Book Requests & Fulfillments</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Request books that are currently unavailable, or action matched listed books directly (Buy, Rent, Exchange).
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Request</span>
          </button>
        )}
      </div>

      {/* Add request form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">New Book Request</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 font-bold text-xs hover:text-slate-600">
              Cancel
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2 text-rose-600 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Book Title Requested</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clean Code"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white font-semibold"
                >
                  {['Programming', 'Artificial Intelligence', 'Database', 'Web Development', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Management', 'Novels', 'Competitive Exams'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Max Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Maximum Price Budget (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white font-medium"
                />
              </div>

              {/* Condition */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Preferred Condition</label>
                <select
                  value={preferredCondition}
                  onChange={(e) => setPreferredCondition(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white font-semibold"
                >
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="VERY_GOOD">Very Good</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Preferred City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white font-semibold"
                >
                  {['Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli', 'Tirunelveli'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {submitting ? 'Submitting request...' : 'Create Book Request'}
            </button>
          </form>
        </div>
      )}

      {/* Requests List with Matched Available Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        {requests.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">No active book requests found.</div>
        ) : (
          <div className="space-y-6 divide-y divide-slate-100">
            {requests.map((req) => {
              // Find matching available books in store for this request
              const matches = availableBooks.filter(b => 
                b.category.toLowerCase() === req.category.toLowerCase() ||
                b.title.toLowerCase().includes(req.title.toLowerCase())
              );

              return (
                <div key={req.id} className="pt-6 first:pt-0 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-slate-800 text-base">{req.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          req.status === 'MATCHED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-sky-50 text-sky-600 border border-sky-100'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-500 space-y-0.5 font-medium">
                        <div>Category: <span className="text-slate-800 font-semibold">{req.category}</span> | Max Budget: <span className="text-slate-800 font-semibold">₹{req.maxPrice}</span></div>
                        <div>Preferred Condition: <span className="text-slate-800 font-semibold">{req.preferredCondition.replace('_', ' ')}</span> | Location: <span className="text-slate-800 font-semibold">{req.city}</span></div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(req.id)}
                      className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Close request"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Matching Available Seller Books Action Banner */}
                  {matches.length > 0 && (
                    <div className="bg-sky-50/40 border border-sky-100 p-4 rounded-xl space-y-3">
                      <div className="flex items-center space-x-1.5 text-xs text-sky-700 font-bold">
                        <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
                        <span>{matches.length} Available Seller Match{matches.length > 1 ? 'es' : ''} Found:</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {matches.slice(0, 2).map((book) => (
                          <div key={book.id} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs space-y-2 flex flex-col justify-between">
                            <div>
                              <div className="font-bold text-slate-800 text-xs truncate">{book.title}</div>
                              <div className="text-[10px] text-slate-500">by {book.author} • ₹{book.expectedPrice}</div>
                              <div className="text-[10px] text-slate-600 font-semibold pt-1 flex items-center space-x-1">
                                <User className="w-3 h-3 text-sky-500" />
                                <span>Seller: <strong className="text-slate-800">{book.seller?.name || 'Reader'}</strong></span>
                              </div>
                            </div>

                            {/* 3 Explicit Action Buttons: Buy for Own, Rent, Exchange */}
                            <div className="grid grid-cols-3 gap-1.5 pt-2">
                              {/* Buy for Own */}
                              <Link
                                href={`/books/${book.id}`}
                                className="py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[10px] font-bold text-center transition-colors flex items-center justify-center space-x-1"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Buy</span>
                              </Link>

                              {/* Rent */}
                              <Link
                                href={`/books/${book.id}/rent`}
                                className="py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold text-center transition-colors flex items-center justify-center space-x-1"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Rent</span>
                              </Link>

                              {/* Exchange */}
                              <Link
                                href={`/dashboard/exchange`}
                                className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold text-center transition-colors flex items-center justify-center space-x-1"
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
