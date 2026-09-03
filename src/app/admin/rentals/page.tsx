import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllRentals } from '../../../lib/db/rentals';
import { getAllBooks } from '../../../lib/db/books';
import { ClipboardList } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminRentalsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const rentals = await getAllRentals();
  const books = await getAllBooks();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <ClipboardList className="w-5.5 h-5.5 text-blue-600" />
            <span>Platform Rental Agreements</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit active textbook borrowing contracts, return terms, and security deposits.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total Rentals: {rentals.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50">
                <th className="p-4">Rental ID</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Borrower ID</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Rental Fee</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {rentals.map((r) => {
                const book = books.find((b) => b.id === r.bookId);
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{r.id}</td>
                    <td className="p-4 truncate max-w-[180px] font-bold text-slate-800">{book?.title || 'Unknown Book'}</td>
                    <td className="p-4 text-slate-500">{r.renterId}</td>
                    <td className="p-4 font-extrabold text-slate-800">{r.durationDays} Days</td>
                    <td className="p-4 font-extrabold text-blue-600">₹{r.rentalFee}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        r.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        r.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {r.status}
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
