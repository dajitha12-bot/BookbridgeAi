import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDeliveries } from '../../../lib/db/deliveries';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllBooks } from '../../../lib/db/books';
import { Truck, Info, AlertCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StaffActiveDeliveryPage() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY_STAFF') redirect('/login');

  const allDeliveries = await getAllDeliveries();
  // Active means in-transit status or reached seller status
  const active = allDeliveries.find(
    (d) => d.staffId === session.id && d.status !== 'DELIVERED' && d.status !== 'PENDING'
  );

  const orders = await getAllOrders();
  const books = await getAllBooks();
  
  const order = active ? orders.find((o) => o.id === active.orderId) : null;
  const book = order ? books.find((b) => b.id === order.bookId) : null;

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Truck className="w-5.5 h-5.5 text-blue-600 animate-pulse" />
          <span>Active Transit Route</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Navigate details of your current package delivery run.</p>
      </div>

      {!active ? (
        <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No Active Run</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You don't have a delivery running in transit right now. Accept assignments from the dashboard.
          </p>
          <Link
            href="/staff"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-6 max-w-xl mx-auto font-sans">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Shipment ID: {active.id}</span>
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase animate-pulse">
              {active.status}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Book Details</span>
            <h3 className="font-bold text-slate-800 text-base">{book?.title}</h3>
            <p className="text-xs text-slate-500">Author: {book?.author}</p>
          </div>

          <div className="space-y-4 border-t border-slate-50 pt-4 text-xs font-semibold">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Pickup Location</span>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{book?.area}, {book?.city}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-blue-400 uppercase block">Destination Location</span>
              <div className="flex items-center space-x-1 text-slate-800">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{order?.pickupLocation || 'Home destination address'}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/staff"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-770 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center cursor-pointer"
            >
              Update Status in Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
