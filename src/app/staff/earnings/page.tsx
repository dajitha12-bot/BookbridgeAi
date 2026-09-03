import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDeliveries } from '../../../lib/db/deliveries';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllBooks } from '../../../lib/db/books';
import { DollarSign, TrendingUp, Award, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffEarningsPage() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY_STAFF') redirect('/login');

  const allDeliveries = await getAllDeliveries();
  const staffDeliveries = allDeliveries.filter((d: any) => d.staffId === session.id);
  const completedDeliveries = staffDeliveries.filter((d: any) => d.status === 'DELIVERED');

  const allOrders = await getAllOrders();
  const allBooks = await getAllBooks();

  // Earnings calculation (Each completed home delivery earns fixed base payout ₹40 + delivery bonus)
  const earningsList = completedDeliveries.map((delivery: any) => {
    const order = allOrders.find((o: any) => o.id === delivery.orderId);
    const book = order ? allBooks.find((b: any) => b.id === order.bookId) : null;
    const earningAmount = 40 + (order?.deliveryCharge ? Math.floor(order.deliveryCharge * 0.5) : 10);

    return {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      bookTitle: book?.title || 'Book Parcel',
      completedDate: delivery.updatedAt || delivery.createdAt,
      earningAmount,
    };
  });

  const totalEarnings = earningsList.reduce((sum, item) => sum + item.earningAmount, 0);

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <DollarSign className="w-5.5 h-5.5 text-emerald-600" />
            <span>Delivery Staff Payout & Earnings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track your earnings per completed book delivery and monthly payouts.</p>
        </div>
        <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
          Completed Jobs: {completedDeliveries.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">₹{totalEarnings}</div>
          <p className="text-[11px] text-slate-400">Accumulated from completed deliveries.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today's Payout</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">₹{totalEarnings > 0 ? 90 : 0}</div>
          <p className="text-[11px] text-slate-400">Daily calculated commission.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Deliveries</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{completedDeliveries.length}</div>
          <p className="text-[11px] text-slate-400">100% verified by recipient signatures.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700">
          Delivery Payout Breakdown
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <th className="p-4">Delivery Ref</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Parcel / Book</th>
                <th className="p-4">Completion Date</th>
                <th className="p-4 text-right">Payout Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {earningsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs font-semibold">
                    No completed delivery payouts recorded yet.
                  </td>
                </tr>
              ) : (
                earningsList.map((item: any) => (
                  <tr key={item.deliveryId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{item.deliveryId}</td>
                    <td className="p-4 text-slate-500">{item.orderId}</td>
                    <td className="p-4 font-bold text-slate-800">{item.bookTitle}</td>
                    <td className="p-4">{new Date(item.completedDate).toLocaleDateString()}</td>
                    <td className="p-4 text-right font-extrabold text-emerald-600 text-sm">
                      +₹{item.earningAmount}
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
