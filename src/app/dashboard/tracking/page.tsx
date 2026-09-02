import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDeliveries } from '../../../lib/db/deliveries';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllBooks } from '../../../lib/db/books';
import { Truck, Info, AlertCircle, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UserTrackingPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const allOrders = await getAllOrders();
  // Filter orders where user is buyer or seller
  const userOrders = allOrders.filter(
    (o) => o.buyerId === session.id || o.sellerId === session.id
  );

  const deliveries = await getAllDeliveries();
  // Find deliveries associated with those orders
  const tracking = deliveries.filter((d) =>
    userOrders.some((o) => o.id === d.orderId)
  );

  const books = await getAllBooks();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Truck className="w-5.5 h-5.5 text-blue-600" />
          <span>Logistic Shipment Tracking</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track transit progress of your book purchases, sales, or charity donations.</p>
      </div>

      {tracking.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-4 shadow-sm">
          <Truck className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No Shipments in Transit</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You don't have any active package shipments scheduled at this moment.
          </p>
          <Link
            href="/browse"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracking.map((d) => {
            const order = userOrders.find((o) => o.id === d.orderId);
            const book = books.find((b) => b.id === order?.bookId);
            const isBuyer = order?.buyerId === session.id;

            return (
              <div key={d.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Shipment ID: {d.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    d.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                    d.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600 animate-pulse'
                  }`}>
                    {d.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-405 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                    {isBuyer ? 'Purchased Borrow' : 'Sold Lender'}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-sm mt-1">{book?.title || 'Unknown Textbook'}</h3>
                </div>

                <div className="space-y-2 text-[10px] text-slate-500 font-semibold pt-1">
                  <div className="flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Pickup: {book?.area}, {book?.city}</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Delivery destination: {order?.pickupLocation || 'Home address details'}</span>
                  </div>
                </div>

                {d.status === 'DELIVERED' && (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg flex items-center space-x-2 text-[10px] text-emerald-700 font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Courier successfully completed package handover.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
