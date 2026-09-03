import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllSwapChains } from '../../../lib/db/swapchains';
import { GitBranch } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSwapChainPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const swapchains = await getAllSwapChains();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <GitBranch className="w-5.5 h-5.5 text-blue-600" />
            <span>SwapChain Graph Auditing</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Monitor multi-user circular book exchange chains and status validations.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          Total Chains: {swapchains.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <th className="p-4">Chain ID</th>
                <th className="p-4">Members Involved</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {swapchains.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400 text-xs">
                    No multi-user SwapChains recorded yet.
                  </td>
                </tr>
              ) : (
                swapchains.map((sc: any) => (
                  <tr key={sc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{sc.id}</td>
                    <td className="p-4">{sc.members?.length || 0} Participants</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-100">
                        {sc.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
