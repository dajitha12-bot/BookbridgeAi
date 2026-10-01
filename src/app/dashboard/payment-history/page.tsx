import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllPayments } from '../../../lib/db/payments';
import { getSellerUpiByUserId } from '../../../lib/db/sellerUpi';
import { CreditCard, Download, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function UserPaymentHistoryPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const allPayments = await getAllPayments();
  const userPayments = allPayments.filter((p: any) => p.userId === session.id || !p.userId);

  // Enhance payments with seller UPI
  const paymentsWithSellerUpi = await Promise.all(
    userPayments.map(async (p: any) => {
      const sellerUpi = await getSellerUpiByUserId(p.userId);
      return {
        ...p,
        sellerUpi,
      };
    })
  );

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <CreditCard className="w-5.5 h-5.5 text-blue-600" />
            <span>My Payment History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View your order payments, rental charges, seller UPI IDs, delivery fees, and download official PDF receipts.
          </p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          Total Transactions: {userPayments.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <th className="p-4">Payment ID</th>
                <th className="p-4">Order / Ref</th>
                <th className="p-4">Seller UPI ID</th>
                <th className="p-4">Book Fee</th>
                <th className="p-4">Delivery Fee</th>
                <th className="p-4">Total Paid</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paymentsWithSellerUpi.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{p.id}</td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{p.orderId || p.rentalId || 'N/A'}</td>
                  <td className="p-4 font-mono text-emerald-600 font-semibold">{p.sellerUpi}</td>
                  <td className="p-4 font-bold">₹{p.amount || 0}</td>
                  <td className="p-4 text-slate-600">₹{p.deliveryCharge || 0}</td>
                  <td className="p-4 font-extrabold text-blue-600 text-sm">₹{p.totalAmount || p.amount}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {p.method === 'ONLINE' ? 'Demo UPI' : 'COD'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      p.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`/api/payments/receipt/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors"
                    >
                      <Download className="w-3 h-3 text-blue-400" />
                      <span>Receipt</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
