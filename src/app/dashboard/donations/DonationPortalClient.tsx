'use client';

import React, { useState, useEffect } from 'react';
import { DonationRequest, Book } from '../../../types';
import { createDonationRequestAction, fulfillDonationAction } from '../../../actions/donationActions';
import { Heart, Gift, Building2, HelpCircle, AlertCircle, Phone, MapPin, CheckCircle, PlusCircle, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';

interface DonationPortalClientProps {
  userId: string;
  userName: string;
  initialRequests: DonationRequest[];
  freeBooksPool: Book[];
  userDonationBooks: Book[];
}

export default function DonationPortalClient({
  userId,
  userName,
  initialRequests,
  freeBooksPool,
  userDonationBooks
}: DonationPortalClientProps) {
  const [activeTab, setActiveTab] = useState<'trusts' | 'free-pool' | 'request'>('trusts');
  const [requests, setRequests] = useState<DonationRequest[]>(initialRequests);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await createDonationRequestAction(null, formData);
    if (res.success) {
      alert('Charity Donation Request posted successfully!');
      window.location.reload();
    } else {
      setError(res.error || 'Failed to post donation request.');
    }
    setIsPending(false);
  };

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedBookId) return;

    const res = await fulfillDonationAction(selectedRequest.id, selectedBookId);
    if (res.success) {
      setSuccessMessage(`Successfully scheduled donation of your book to "${selectedRequest.institutionName}". Check notifications for details!`);
      setSelectedRequest(null);
      
      // Update local state reactively
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'FULFILLED' } : r));
      setTimeout(() => setSuccessMessage(''), 6000);
    } else {
      alert(res.error || 'Failed to process donation.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      {/* Header banner */}
      <div className="bg-[#0f172a] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
            <Heart className="w-4 h-4 fill-current animate-pulse text-rose-500" />
            <span>Community Care Portal</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight">Charitable Book Donations</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Give books a second life. Help schools, rural non-profits, and educational trusts acquire books for children who need them most.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('trusts')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'trusts' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Trust Requests
          </button>
          <button
            onClick={() => setActiveTab('free-pool')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'free-pool' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Free Books Pool ({freeBooksPool.length})
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'request' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Post Trust Request
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start space-x-3 text-emerald-700 text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ==========================================
          TAB 1: TRUST REQUESTS LIST
         ========================================== */}
      {activeTab === 'trusts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Active Non-Profit Book Requests</h2>
            <span className="text-xs text-slate-400 font-medium">Verify registration credentials before donating</span>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-3 shadow-xs">
              <Gift className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-sm">No active requests</h3>
              <p className="text-xs text-slate-400">There are no pending donation requests posted by charities at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                    req.status === 'FULFILLED' ? 'border-emerald-150 bg-emerald-50/5' : 'border-slate-100'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {req.category}
                        </span>
                        <h3 className="font-bold text-slate-800 text-base leading-tight mt-1">{req.title}</h3>
                      </div>
                      
                      {req.status === 'FULFILLED' ? (
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> FULFILLED
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                          PENDING ({req.quantityNeeded} needed)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{req.description}</p>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold border-t border-slate-50">
                      <div className="flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate text-slate-600">{req.institutionName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="truncate text-slate-600">{req.city}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate text-slate-600">{req.contactPhone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate text-slate-600">Reg: {req.regNumber}</span>
                      </div>
                    </div>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current text-white mr-1" />
                        <span>Donate Book</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 2: FREE BOOKS POOL (CLAIMS)
         ========================================== */}
      {activeTab === 'free-pool' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Free Donation Book Pool</h2>
            <span className="text-xs text-slate-400 font-medium">Claim books for free (Only delivery fee applicable if courier needed)</span>
          </div>

          {freeBooksPool.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-3 shadow-xs">
              <Gift className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-sm">No Free Books Currently Available</h3>
              <p className="text-xs text-slate-400">List your used books with 'Mark as Donation' to populate this pool!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
              {freeBooksPool.map((book) => (
                <div key={book.id} className="bg-white rounded-xl border border-slate-100 flex flex-col justify-between p-4 relative shadow-sm hover:shadow-md">
                  <div>
                    {/* Image block */}
                    <div className="w-full h-36 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center relative mb-3">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-12 h-12 text-slate-200" />
                      )}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {book.condition.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">{book.category}</span>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-1 leading-snug">{book.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">by {book.author}</p>
                      
                      <div className="flex items-center text-[9px] text-slate-400 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 mr-0.5 flex-shrink-0" />
                        <span className="truncate">{book.area}, {book.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-50 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-400 block font-medium">Value</span>
                      <span className="font-extrabold text-blue-600 text-sm">FREE (₹0)</span>
                    </div>
                    
                    <Link
                      href={`/books/${book.id}`}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>Claim Free</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 3: POST TRUST REQUEST FORM
         ========================================== */}
      {activeTab === 'request' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Trust / Institution Registration Request</h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Please provide registration credentials for verification</p>
          </div>

          {state.error && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2.5 text-rose-600 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trust name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Trust / Organization Name</label>
                <input
                  name="institutionName"
                  type="text"
                  required
                  placeholder="e.g. Vidya Seva Society"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Registration code */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Registration Reg Number</label>
                <input
                  name="regNumber"
                  type="text"
                  required
                  placeholder="e.g. TRUST/2024/MDU-77"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Book title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Requested Book Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Python Programming Guide"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                <select
                  name="category"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  {['Programming', 'Artificial Intelligence', 'Database', 'Web Development', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Management', 'Novels', 'Competitive Exams'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Quantity Needed</label>
                <input
                  name="quantityNeeded"
                  type="number"
                  required
                  min={1}
                  defaultValue={5}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">City</label>
                <select
                  name="city"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  {['Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli', 'Tirunelveli'].map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Contact Phone Number</label>
                <input
                  name="contactPhone"
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Organization Purpose & Request Reason</label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Explain what the requested books will be used for..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-sm transition-colors shadow-xs cursor-pointer"
            >
              {isPending ? 'Submitting Request...' : 'Post Donation Request'}
            </button>
          </form>
        </div>
      )}

      {/* ==========================================
          DONATION ASSIGNMENT DIALOG MODAL
         ========================================== */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-5 border border-slate-100 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">Donate to {selectedRequest.institutionName}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Assign one of your listed free books to fulfill this request</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleDonateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Your Free Donation Books</label>
                {userDonationBooks.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4 text-center text-xs text-slate-500 space-y-2">
                    <div>You do not have any active books listed with **'Mark as Donation'** toggled.</div>
                    <Link
                      href="/dashboard/add-book"
                      className="inline-block text-blue-600 font-bold hover:underline"
                    >
                      List a Free Donation Book Now →
                    </Link>
                  </div>
                ) : (
                  <select
                    required
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  >
                    <option value="">-- Select Book to Donate --</option>
                    {userDonationBooks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} (MRP: ₹{b.originalPrice})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {userDonationBooks.length > 0 && (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-current text-white" />
                  <span>Confirm Donation & Ship</span>
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
