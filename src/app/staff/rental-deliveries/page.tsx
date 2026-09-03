import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllRentals } from '../../../lib/db/rentals';
import { getAllBooks } from '../../../lib/db/books';
import { Truck, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffRentalDeliveriesPage() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY_STAFF') redirect('/login');

  const rentals = await getAllRentals();
  const books = await getAllBooks();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Truck className="w-5.5 h-5.5 text-blue-600" />
            <span>Rental Book Deliveries</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage scheduled pickups and returns for temporary book rentals.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total Rental Deliveries: {rentals.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {rentals.map((r) => {
          const book = books.find((b) => b.id === r.bookId);

          return (
            <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Rental ID: {r.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-600 uppercase">
                  {r.status}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-sm">{book?.title || 'Unknown Textbook'}</h3>
                <p className="text-xs text-slate-400">Duration: {r.durationDays} Days (Fee: ₹{r.rentalFee})</p>
              </div>

              <div className="text-[10px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-bold">{new Date(r.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled Return:</span>
                  <span className="font-bold text-blue-600">{new Date(r.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
