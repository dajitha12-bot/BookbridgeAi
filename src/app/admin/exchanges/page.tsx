import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllExchanges } from '../../../lib/db/exchanges';
import { getAllBooks } from '../../../lib/db/books';
import { RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminExchangesPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const exchanges = await getAllExchanges();
  const books = await getAllBooks();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <RefreshCw className="w-5.5 h-5.5 text-blue-600 animate-spin-slow" />
            <span>Platform Book Exchanges</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit direct reader-to-reader book trade agreements.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total Exchanges: {exchanges.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50">
                <th className="p-4">Exchange ID</th>
                <th className="p-4">Requested Book</th>
                <th className="p-4">Offered Book</th>
                <th className="p-4">Initiation Date</th>
                <th className="p-4 text-right">Trade Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {exchanges.map((ex) => {
                const reqBook = books.find((b) => b.id === ex.requestedBookId);
                const offBook = books.find((b) => b.id === ex.offeredBookId);
                
                return (
                  <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{ex.id}</td>
                    <td className="p-4 truncate max-w-[180px]">{reqBook?.title || 'Unknown Book'}</td>
                    <td className="p-4 truncate max-w-[180px]">{offBook?.title || 'Unknown Book'}</td>
                    <td className="p-4 text-slate-450">{new Date(ex.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                        ex.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                        ex.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {ex.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
