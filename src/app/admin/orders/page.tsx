import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllBooks } from '../../../lib/db/books';
import { ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const orders = await getAllOrders();
  const books = await getAllBooks();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <ShoppingBag className="w-5.5 h-5.5 text-blue-600" />
            <span>Platform Transaction Orders</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit purchase contracts, pricing details, and logistic statuses.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total Orders: {orders.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50">
                <th className="p-4">Order ID</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Delivery Option</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orders.map((o) => {
                const book = books.find((b) => b.id === o.bookId);
                return (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-850">{o.id}</td>
                    <td className="p-4 truncate max-w-[200px]">{book?.title || 'Unknown Textbook'}</td>
                    <td className="p-4 font-extrabold text-slate-800">₹{o.amount}</td>
                    <td className="p-4">{o.deliveryMethod}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        o.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                        o.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                        o.orderStatus === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {o.orderStatus}
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
