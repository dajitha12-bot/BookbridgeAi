import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDeliveries } from '../../../lib/db/deliveries';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllBooks } from '../../../lib/db/books';
import { ClipboardList, AlertCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StaffAssignedDeliveriesPage() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY_STAFF') redirect('/login');

  const allDeliveries = await getAllDeliveries();
  const assigned = allDeliveries.filter((d) => d.staffId === session.id);

  const orders = await getAllOrders();
  const books = await getAllBooks();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <ClipboardList className="w-5.5 h-5.5 text-blue-600" />
          <span>Assigned courier Shipments</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage active courier runs assigned to your account.</p>
      </div>

      {assigned.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-2">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No Assigned Cargo</h3>
          <p className="text-xs text-slate-400">There are no pending deliveries scheduled for you at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {assigned.map((d) => {
            const order = orders.find((o) => o.id === d.orderId);
            const book = books.find((b) => b.id === order?.bookId);
            
            return (
              <div key={d.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      ID: {d.id}
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">
                      {d.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm">{book?.title || 'Unknown book'}</h3>

                  <div className="space-y-2 text-[10px] text-slate-500 font-semibold border-t border-slate-50 pt-3">
                    <div className="flex items-start space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>Pickup: {book?.area}, {book?.city}</span>
                    </div>
                    <div className="flex items-start space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Delivery: {order?.pickupLocation || 'Home destination address'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <Link
                    href="/staff"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    Manage Delivery
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
