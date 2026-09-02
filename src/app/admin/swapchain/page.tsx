import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllSwapchains } from '../../../lib/db/swapchains';
import { GitBranch, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSwapchainPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const swapchains = await getAllSwapchains();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <GitBranch className="w-5.5 h-5.5 text-blue-600" />
          <span>Platform SwapChain Loops</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Audit multi-party circular book trading cycles detected by DFS/BFS search algorithms.</p>
      </div>

      {swapchains.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-2">
          <GitBranch className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No Active Cycles</h3>
          <p className="text-xs text-slate-400">There are no multi-user exchange loops active in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {swapchains.map((chain) => (
            <div key={chain.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                <span className="text-xs font-bold text-slate-800">SwapChain ID: {chain.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                  chain.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {chain.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Circular Trading Members List</div>
                <div className="space-y-2">
                  {chain.members.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-700">Member {idx + 1} (User ID: {m.userId})</span>
                        <div className="text-[10px] text-slate-400">Wants book: {m.requestedBookId}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Offers book</span>
                        <span className="font-bold text-blue-600">{m.offeredBookId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
