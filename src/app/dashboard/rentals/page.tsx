import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getMyRentalsAction } from '../../../actions/rentalActions';
import { getAllBooks } from '../../../lib/db/books';
import { Calendar, AlertCircle, Info, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardRentalsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const res = await getMyRentalsAction();
  const rentals = res.rentals || [];

  const books = await getAllBooks();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Calendar className="w-5.5 h-5.5 text-blue-600" />
          <span>My Rental Contracts</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track books you rented from other readers or let out to the community.</p>
      </div>

      {rentals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-4 shadow-sm">
          <BookOpen className="w-12 h-12 mx-auto text-slate-350" />
          <h3 className="font-bold text-slate-700 text-sm">No Active Rentals</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You don't have any current book rentals. Browse available listings to request one today.
          </p>
          <Link
            href="/browse"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
              <thead>
                <tr className="font-bold text-slate-400 bg-slate-50/50">
                  <th className="p-4">Book Title</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Calculated Fee</th>
                  <th className="p-4">Rental Term</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rentals.map((rent) => {
                  const book = books.find((b) => b.id === rent.bookId);
                  const isRenter = rent.renterId === session.id;
                  
                  return (
                    <tr key={rent.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">
                            {book?.title || 'Unknown Textbook'}
                          </div>
                          <div className="text-[10px] text-slate-400">by {book?.author || 'Unknown Author'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          isRenter ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-650'
                        }`}>
                          {isRenter ? 'Borrower' : 'Lender'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-800 font-bold">{rent.durationDays} Days</td>
                      <td className="p-4 text-slate-800 font-extrabold">₹{rent.rentalFee}</td>
                      <td className="p-4 text-[10px] text-slate-550 space-y-0.5">
                        <div>Start: {new Date(rent.startDate).toLocaleDateString()}</div>
                        <div>End: {new Date(rent.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          rent.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {rent.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide uppercase ${
                          rent.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 
                          rent.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {rent.status}
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
