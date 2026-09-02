import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllPayments } from '../../../lib/db/payments';
import { CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const payments = await getAllPayments();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <CreditCard className="w-5.5 h-5.5 text-blue-600" />
            <span>Platform Payment Transactions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit billing logs, invoice status, and transaction methods.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total Transactions: {payments.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50">
                <th className="p-4">Payment ID</th>
                <th className="p-4">Associated Order ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Billing Mode</th>
                <th className="p-4">Transaction Reference</th>
                <th className="p-4 text-right">Invoice Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{p.id}</td>
                  <td className="p-4 text-slate-550">{p.orderId}</td>
                  <td className="p-4 font-extrabold text-slate-800">₹{p.amount}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-650">
                      {p.method}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 truncate max-w-[150px]">{p.transactionId || 'N/A (Cash)'}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      p.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                      p.status === 'COD' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {p.status}
                    </span>
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
