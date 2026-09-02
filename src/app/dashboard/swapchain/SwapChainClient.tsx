'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GitBranch, 
  ArrowRight, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  getSwapChainChainsAction, 
  createSwapChainAction,
  respondSwapChainMemberAction
} from '../../../actions/exchangeActions';

interface SwapChainClientProps {
  userId: string;
  pendingInvitations: any[]; // SwapChainMember items that are PENDING
  confirmedChains: any[]; // SwapChain items that are CONFIRMED
}

export default function SwapChainClient({
  userId,
  pendingInvitations,
  confirmedChains
}: SwapChainClientProps) {
  const router = useRouter();
  const [chains, setChains] = useState<any[]>([]);
  const [loadingChains, setLoadingChains] = useState(true);
  const [proposingId, setProposingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load SwapChains on mount
  const loadChains = async () => {
    setLoadingChains(true);
    try {
      const res = await getSwapChainChainsAction();
      if (res.success && res.chains) {
        setChains(res.chains);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChains(false);
    }
  };

  useEffect(() => {
    loadChains();
  }, []);

  const handleProposeChain = async (chainIndex: number, members: any[]) => {
    setProposingId(chainIndex);
    try {
      // Map members to parameters expected by backend action
      const data = members.map(m => ({
        userId: m.userId,
        offeredBookId: m.offeredBookId,
        requestedBookId: m.requestedBookId
      }));

      const res = await createSwapChainAction(data);
      if (res.success) {
        alert('SwapChain proposal sent successfully! All members have been notified to review.');
        router.refresh();
      } else {
        alert(res.error || 'Failed to propose SwapChain.');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setProposingId(null);
    }
  };

  const handleRespondInvitation = async (memberId: string, accept: boolean) => {
    setProcessingId(memberId);
    try {
      const res = await respondSwapChainMemberAction(memberId, accept);
      if (res.success) {
        alert(accept ? 'You have accepted the SwapChain proposal.' : 'You have declined the SwapChain proposal.');
        router.refresh();
      } else {
        alert(res.error || 'Failed to submit response.');
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
          <GitBranch className="w-6 h-6 text-sky-500" />
          <span>SwapChain: Multi-User Book Exchange Chain</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Find trade loops between three or more readers to swap books when direct exchanges are unavailable.
        </p>
      </div>

      {/* Explanatory Banner */}
      <div className="bg-sky-50 border border-sky-100 p-5 rounded-xl flex items-start space-x-3 text-xs leading-relaxed text-slate-600">
        <HelpCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800">How SwapChain works (Depth First Search Cycles)</span>
          <p>
            If you want a Python book and have a DBMS book, but the Python owner wants Java, a direct swap isn't possible. SwapChain constructs a graph of readers in the city, traces exchange desires using cycle-detection algorithms (DFS), and discovers loops like:
          </p>
          <div className="flex items-center space-x-2 font-bold text-sky-700 py-1">
            <span>You (DBMS)</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Rahul (Python)</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Priya (Java)</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>You (DBMS)</span>
          </div>
        </div>
      </div>

      {/* 1. Pending SwapChain Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Proposed SwapChains Awaiting Your Approval</span>
          </h2>
          <div className="space-y-4">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="p-4 bg-amber-50/30 border border-amber-100 rounded-lg space-y-3">
                <div className="text-xs">
                  <span className="font-bold text-slate-800">SwapChain Proposal #{inv.swapChainId.slice(0, 8)}</span>
                  <div className="text-slate-500 mt-1 leading-relaxed">
                    Offer your book <span className="font-semibold text-slate-700">"{inv.offeredBook.title}"</span> in swap to receive <span className="font-semibold text-slate-700">"{inv.requestedBook.title}"</span>.
                  </div>
                </div>
                
                {/* Visual loop display */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                  {inv.swapChain.members.map((member: any, mIdx: number) => (
                    <React.Fragment key={member.id}>
                      {mIdx > 0 && <ArrowRight className="w-3.5 h-3.5 text-slate-300" />}
                      <span className={`px-2 py-0.5 rounded-full ${member.userId === userId ? 'bg-sky-500 text-white' : 'bg-slate-50 text-slate-600'}`}>
                        {member.user.name} ({member.offeredBook.title.slice(0, 15)}...)
                      </span>
                    </React.Fragment>
                  ))}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-slate-400">Loop complete</span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={processingId === inv.id}
                    onClick={() => handleRespondInvitation(inv.id, true)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    Accept Swap
                  </button>
                  <button
                    disabled={processingId === inv.id}
                    onClick={() => handleRespondInvitation(inv.id, false)}
                    className="px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Live SwapChain Finder */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Available Multi-User Loop Opportunities</h2>
        
        {loadingChains ? (
          <div className="text-center py-8 text-slate-500 text-sm animate-pulse">
            Analyzing book demand graph and detecting exchange loops...
          </div>
        ) : chains.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl text-center py-8 text-slate-500 text-xs">
            No trade loops found currently. Loop opportunities appear when users create requests matching available books listed for exchange.
          </div>
        ) : (
          <div className="space-y-4">
            {chains.map((chain, cIdx) => (
              <div key={cIdx} className="border border-slate-100 p-4 rounded-xl space-y-4 hover:border-sky-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3">
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                    {chain.members.length}-WAY SWAPCHAIN DETECTED
                  </span>
                  
                  <button
                    disabled={proposingId === cIdx}
                    onClick={() => handleProposeChain(cIdx, chain.members)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    {proposingId === cIdx ? 'Sending...' : 'Send Exchange Requests'}
                  </button>
                </div>

                {/* Chain Visualization */}
                <div className="flex flex-col space-y-3 pt-2 bg-slate-50 p-4 rounded-lg">
                  {chain.members.map((member: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-4 text-xs">
                      <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-800">{member.userName}</span>
                        <span className="text-slate-500"> offers </span>
                        <span className="font-semibold text-slate-700">"{member.offeredBookTitle}"</span>
                        <span className="text-slate-500"> to receive </span>
                        <span className="font-semibold text-sky-600">"{member.requestedBookTitle}"</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Confirmed SwapChains */}
      {confirmedChains.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Successfully Executed SwapChains</span>
          </h2>
          <div className="space-y-3 divide-y divide-slate-50">
            {confirmedChains.map((sc) => (
              <div key={sc.id} className="pt-3 first:pt-0 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>Chain ID: #{sc.id.slice(0, 8)}</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">Swapped</span>
                </div>
                <div className="text-slate-500 mt-2 leading-relaxed">
                  Loop completed with participants:{' '}
                  {sc.members.map((m: any) => m.user.name).join(', ')}. All books marked as EXCHANGED.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
