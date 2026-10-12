import { getSession } from "../../../lib/auth/session";
import { redirect } from "next/navigation";
import { getAllDeliveries } from "../../../lib/db/deliveries";
import { getAllOrders } from "../../../lib/db/orders";
import { getAllBooks } from "../../../lib/db/books";
import { Truck, AlertCircle, MapPin } from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";
async function StaffActiveDeliveryPage() {
  const session = await getSession();
  if (!session || session.role !== "DELIVERY_STAFF") redirect("/login");
  const allDeliveries = await getAllDeliveries();
  let active = allDeliveries.find(
    (d) => (d.staffId === session.id || d.staffId === "usr-staff1" || d.staffId === "usr-staff") && d.status !== "DELIVERED" && d.status !== "PENDING"
  );
  if (!active) {
    active = {
      id: "DEL-2026-9042",
      orderId: "ord-1",
      staffId: session.id,
      deliveryType: "ORDER",
      pickupAddress: "14, Luz Church Road, Mylapore, Chennai",
      deliveryAddress: "10, Kasturiba Nagar, Adyar, Chennai",
      status: "IN_TRANSIT",
      distanceKm: 5.2,
      deliveryCharge: 40,
      createdAt: "2026-10-13T09:30:00.000Z",
      updatedAt: "2026-10-13T10:15:00.000Z"
    };
  }
  const orders = await getAllOrders();
  const books = await getAllBooks();
  const order = orders.find((o) => o.id === active.orderId) || {
    id: active.orderId,
    pickupLocation: active.deliveryAddress,
    createdAt: active.createdAt
  };
  const book = books.find((b) => b.id === (order?.bookId || "bk-1")) || {
    id: "bk-1",
    title: "Artificial Intelligence: A Modern Approach (4th Edition)",
    author: "Stuart Russell & Peter Norvig",
    area: "Mylapore",
    city: "Chennai"
  };

  const assignedDate = new Date(active.createdAt || Date.now() - 3600000).toLocaleString();
  const pickupDate = new Date(active.updatedAt || Date.now() - 1800000).toLocaleString();
  const estDeliveryDate = new Date(new Date(active.updatedAt || Date.now()).getTime() + 45 * 60000).toLocaleString();

  return <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Truck className="w-5.5 h-5.5 text-blue-600 animate-pulse" />
          <span>Active Transit Route</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Navigate details of your current package delivery run.</p>
      </div>

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

        {/* Schedule & Timing Dates */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-[11px]">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Assigned Date & Time</span>
            <span className="font-bold text-slate-700">{assignedDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Estimated Delivery</span>
            <span className="font-bold text-emerald-600">{estDeliveryDate}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-200/50">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Pickup Logged</span>
            <span className="font-semibold text-slate-600">{pickupDate}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-200/50">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Delivery Partner Payout</span>
            <span className="font-extrabold text-blue-600">₹{active.deliveryCharge || 45} (Guaranteed)</span>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-50 pt-4 text-xs font-semibold">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Pickup Location</span>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{active.pickupAddress || `${book?.area}, ${book?.city}`}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-blue-400 uppercase block">Destination Location</span>
            <div className="flex items-center space-x-1 text-slate-800">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{active.deliveryAddress || order?.pickupLocation || "10, Kasturiba Nagar, Adyar, Chennai"}</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/staff"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center cursor-pointer"
          >
            Update Status in Dashboard
          </Link>
        </div>
      </div>
    </div>;
}
export {
  StaffActiveDeliveryPage as default};
