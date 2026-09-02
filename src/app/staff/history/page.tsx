import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDeliveries } from '../../../lib/db/deliveries';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllBooks } from '../../../lib/db/books';
import { ClipboardList, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StaffDeliveryHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY_STAFF') redirect('/login');

  const allDeliveries = await getAllDeliveries();
  const completed = allDeliveries.filter((d) => d.staffId === session.id && d.status === 'DELIVERED');

  const orders = await getAllOrders();
  const books = await getAllBooks();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <ClipboardList className="w-5.5 h-5.5 text-blue-600" />
          <span>My Delivery History</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Audit parcels successfully delivered by you to final recipients.</p>
      </div>

      {completed.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-2 shadow-sm">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No History Recorded</h3>
          <p className="text-xs text-slate-400">You have not completed any deliveries yet. Accept runs to see them here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
              <thead>
                <tr className="font-bold text-slate-400 bg-slate-50/50">
                  <th className="p-4">Delivery ID</th>
                  <th className="p-4">Book Title</th>
                  <th className="p-4">Delivered Time</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {completed.map((d) => {
                  const order = orders.find((o) => o.id === d.orderId);
                  const book = books.find((b) => b.id === order?.bookId);
                  
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{d.id}</td>
                      <td className="p-4 truncate max-w-[200px]">{book?.title || 'Unknown Textbook'}</td>
                      <td className="p-4 text-slate-400 text-[10px]">{new Date(d.updatedAt).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <CheckCircle className="w-3 h-3 text-emerald-500 mr-0.5" /> DELIVERED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
