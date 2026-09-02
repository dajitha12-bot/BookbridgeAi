'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { respondExchangeAction, completeExchangeAction } from '../../actions/exchangeActions';
import { 
  RefreshCw, 
  ArrowRight, 
  Check, 
  X, 
  Clock, 
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface ExchangeClientProps {
  userId: string;
  sentExchanges: any[];
  receivedExchanges: any[];
}

export default function ExchangeClient({
  userId,
  sentExchanges,
  receivedExchanges
}: ExchangeClientProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleResponse = async (exchangeId: string, accept: boolean) => {
    setProcessingId(exchangeId);
    try {
      const res = await respondExchangeAction(exchangeId, accept);
      if (res.success) {
        alert(accept ? 'Exchange request accepted! Books reserved.' : 'Exchange request declined.');
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
        alert('Exchange marked complete! Both books are marked as exchanged.');
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
    <div className="space-y-8 text-slate-800 animate-fade-in font-sans">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <RefreshCw className="w-5.5 h-5.5 text-sky-500" />
          <span>Book Exchanges</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordinate book swaps directly with other readers.
        </p>
      </div>

      {/* Received Requests */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Incoming Exchange Requests</h2>
        {receivedExchanges.length === 0 ? (
          <div className="text-slate-400 text-xs text-center py-6">No incoming exchange requests received yet.</div>
        ) : (
          <div className="space-y-4">
            {receivedExchanges.map((req) => (
              <div key={req.id} className="p-4 bg-slate-50 border border-slate-150 rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{req.sender.name}</span>
                    <span className="text-slate-500"> offers their book: </span>
                    <span className="font-semibold text-sky-600">"{req.offeredBook.title}"</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                    req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                    req.status === 'ACCEPTED' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="text-xs leading-relaxed text-slate-600 pl-4 border-l-2 border-l-slate-200">
                  To receive your book: <span className="font-semibold text-slate-800">"{req.requestedBook.title}"</span>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      disabled={processingId === req.id}
                      onClick={() => handleResponse(req.id, true)}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      Accept Proposal
                    </button>
                    <button
                      disabled={processingId === req.id}
                      onClick={() => handleResponse(req.id, false)}
                      className="px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
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
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
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

      {/* Sent Requests */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">My Proposed Exchanges (Sent)</h2>
        {sentExchanges.length === 0 ? (
          <div className="text-slate-400 text-xs text-center py-6">You haven't proposed any book exchanges yet.</div>
        ) : (
          <div className="space-y-4">
            {sentExchanges.map((req) => (
              <div key={req.id} className="p-4 bg-slate-50 border border-slate-150 rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs">
                  <div>
                    <span>You proposed swapping your book </span>
                    <span className="font-semibold text-slate-800">"{req.offeredBook.title}"</span>
                    <span> to receive </span>
                    <span className="font-semibold text-sky-600">"{req.requestedBook.title}"</span>
                    <span> from </span>
                    <span className="font-bold text-slate-800">{req.receiver.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
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
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
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
    </div>
  );
}
