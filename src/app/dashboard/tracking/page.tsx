import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDeliveries, getDeliveryByOrderId } from '../../../lib/db/deliveries';
import { getAllOrders } from '../../../lib/db/orders';
import { getAllBooks } from '../../../lib/db/books';
import { getUserById } from '../../../lib/db/users';
import { getPaymentByOrderId } from '../../../lib/db/payments';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  User, 
  Receipt, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Package,
  Phone,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UserTrackingPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const currentUserId = session.id;
  const allOrders = await getAllOrders();

  // Filter all orders where user is buyer OR seller
  const userOrders = allOrders.filter(
    (o) => o.buyerId === currentUserId || o.sellerId === currentUserId
  );
  userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const books = await getAllBooks();
  const deliveries = await getAllDeliveries();

  // Build rich order tracking objects
  const orderTrackingItems = await Promise.all(
    userOrders.map(async (order) => {
      const book = books.find((b) => b.id === order.bookId);
      const delivery = deliveries.find((d) => d.orderId === order.id);
      const payment = await getPaymentByOrderId(order.id);
      const isBuyer = order.buyerId === currentUserId;
      const otherUser = await getUserById(isBuyer ? order.sellerId : order.buyerId);
      let staffUser = null;

      if (delivery?.staffId) {
        staffUser = await getUserById(delivery.staffId);
      }

      const deliveryFee = order.deliveryMethod === 'DELIVERY' ? 40 : 0;
      const totalAmount = order.amount + deliveryFee;

      return {
        order,
        book,
        delivery,
        payment,
        isBuyer,
        otherUser,
        staffUser,
        deliveryFee,
        totalAmount,
      };
    })
  );

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Truck className="w-6 h-6 text-sky-600" />
            <span>Order & Delivery Tracking Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status tracking for all your active purchases, sales, and logistics handovers.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-sky-50 text-sky-700 px-3 py-1.5 rounded-xl border border-sky-100 font-bold">
          <Package className="w-4 h-4 text-sky-500" />
          <span>Active Orders: {orderTrackingItems.length}</span>
        </div>
      </div>

      {orderTrackingItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-4 shadow-xs">
          <Truck className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-base">No Orders Being Tracked</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You don't have any active orders or package shipments scheduled at this moment.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orderTrackingItems.map(({ order, book, delivery, payment, isBuyer, otherUser, staffUser, deliveryFee, totalAmount }) => {
            const isPaid = order.paymentStatus === 'PAID' || payment?.status === 'PAID';
            const isCod = order.paymentStatus === 'COD' || payment?.method === 'COD';
            const isDelivered = order.orderStatus === 'DELIVERED' || delivery?.status === 'DELIVERED';
            const isInTransit = order.orderStatus === 'IN_TRANSIT' || delivery?.status === 'IN_TRANSIT';
            const isReadyPickup = order.orderStatus === 'READY_FOR_PICKUP';

            // Determine tracking steps progress
            // Step 1: Order Placed & Payment
            const step1Done = true;
            // Step 2: Admin Confirmation
            const step2Done = isPaid || isCod;
            // Step 3: Staff Assigned
            const step3Done = Boolean(delivery?.staffId);
            // Step 4: Delivered
            const step4Done = isDelivered;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5 hover:border-sky-200 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 font-mono">Order #{order.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isBuyer ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {isBuyer ? 'Role: Buyer' : 'Role: Seller'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isDelivered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isPaid
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {isDelivered
                        ? '✓ Delivered'
                        : isPaid
                        ? 'Payment Paid (Waiting Admin Confirmation)'
                        : 'Payment Pending / COD'}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left: Book info */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="flex space-x-3 items-center">
                      <div className="w-14 h-18 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200">
                        {book?.imageUrl ? (
                          <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase">
                          {book?.category || 'Textbook'}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base mt-1 line-clamp-1">
                          {book?.title || 'Ordered Book'}
                        </h3>
                        <p className="text-xs text-slate-500">by {book?.author || 'Author'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          {isBuyer ? 'Seller Name' : 'Buyer Name'}
                        </span>
                        <span className="font-bold text-slate-800">{otherUser?.name || 'User'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Payment Mode</span>
                        <span className="font-bold text-slate-800">
                          {payment?.method === 'ONLINE' ? 'Demo UPI Payment' : 'Cash On Delivery'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Amount</span>
                        <span className="font-extrabold text-emerald-600">₹{totalAmount} (Book ₹{order.amount} + Delivery ₹{deliveryFee})</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Delivery Option</span>
                        <span className="font-bold text-slate-800">
                          {order.deliveryMethod === 'DELIVERY' ? 'Home Delivery' : 'Offline Pickup'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Delivery Staff & Action links */}
                  <div className="md:col-span-5 space-y-3 flex flex-col justify-between">
                    <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-bold text-slate-300">Delivery Staff Status</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          staffUser ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {staffUser ? 'Staff Assigned' : 'Awaiting Assignment'}
                        </span>
                      </div>

                      {staffUser ? (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Assigned Person:</span>
                            <span className="font-bold text-white">{staffUser.name}</span>
                          </div>
                          {staffUser.phone && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Contact:</span>
                              <a href={`tel:${staffUser.phone}`} className="text-sky-400 font-bold flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {staffUser.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-200/80 leading-relaxed pt-1">
                          No automatic staff assignment. Delivery personnel will be assigned by the administrator upon order verification.
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {payment?.id && isPaid && (
                        <a
                          href={`/api/payments/receipt/${payment.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>View PDF Receipt</span>
                        </a>
                      )}
                      {!isPaid && !isCod && (
                        <Link
                          href={`/payment/confirm/${order.id}`}
                          className="flex-1 py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay ₹{totalAmount}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tracking Progress Timeline Bar */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Shipment Progress Timeline
                  </span>

                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className={`p-2 rounded-xl border ${step1Done ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <span>1. Order Placed</span>
                    </div>

                    <div className={`p-2 rounded-xl border ${step2Done ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                      <span>2. Payment Confirmed</span>
                    </div>

                    <div className={`p-2 rounded-xl border ${step3Done ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      <User className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                      <span>3. Staff Assigned</span>
                    </div>

                    <div className={`p-2 rounded-xl border ${step4Done ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      <Truck className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                      <span>4. Package Handover</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
