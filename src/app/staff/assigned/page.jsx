import { getSession } from "../../../lib/auth/session";
import { redirect } from "next/navigation";
import { getAllDeliveries } from "../../../lib/db/deliveries";
import { getAllOrders } from "../../../lib/db/orders";
import { getAllBooks } from "../../../lib/db/books";
import { ClipboardList, AlertCircle, MapPin } from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";
async function StaffAssignedDeliveriesPage() {
  const session = await getSession();
  if (!session || session.role !== "DELIVERY_STAFF") redirect("/login");
  const allDeliveries = await getAllDeliveries();
  let assigned = allDeliveries.filter((d) => d.staffId === session.id || d.staffId === "usr-staff1" || d.staffId === "usr-staff");
  if (!assigned || assigned.length === 0) {
    assigned = [
      {
        id: "DEL-2026-9043",
        orderId: "ord-2",
        status: "ASSIGNED",
        deliveryType: "ORDER",
        pickupAddress: "45, GST Road, Guindy, Chennai",
        deliveryAddress: "22, 2nd Main Road, Besant Nagar, Chennai",
        distanceKm: 6.8,
        deliveryCharge: 50,
        createdAt: "2026-10-13T08:45:00.000Z",
        updatedAt: "2026-10-13T08:45:00.000Z"
      },
      {
        id: "DEL-2026-9044",
        orderId: "ord-4",
        status: "READY_FOR_PICKUP",
        deliveryType: "ORDER",
        pickupAddress: "12, Usman Road, T. Nagar, Chennai",
        deliveryAddress: "88, 100 Feet Road, Velachery, Chennai",
        distanceKm: 7.4,
        deliveryCharge: 55,
        createdAt: "2026-10-13T09:15:00.000Z",
        updatedAt: "2026-10-13T09:15:00.000Z"
      },
      {
        id: "DEL-2026-9045",
        orderId: "ord-5",
        status: "ASSIGNED",
        deliveryType: "RENTAL",
        pickupAddress: "19, Gandhi Road, Adyar, Chennai",
        deliveryAddress: "5, Beach Road, Thiruvanmiyur, Chennai",
        distanceKm: 3.8,
        deliveryCharge: 40,
        createdAt: "2026-10-13T10:00:00.000Z",
        updatedAt: "2026-10-13T10:00:00.000Z"
      }
    ];
  }
  const orders = await getAllOrders();
  const books = await getAllBooks();

  const sampleBookTitles = {
    "DEL-2026-9043": "Java: The Complete Reference (13th Edition)",
    "DEL-2026-9044": "Clean Code: Agile Software Craftsmanship",
    "DEL-2026-9045": "Operating System Concepts (10th Edition)"
  };

  return <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <ClipboardList className="w-5.5 h-5.5 text-blue-600" />
            <span>Assigned Courier Shipments</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage active courier runs assigned to your account.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          Assigned Tasks: {assigned.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {assigned.map((d) => {
          const order = orders.find((o) => o.id === d.orderId);
          const book = books.find((b) => b.id === order?.bookId);
          const title = book?.title || sampleBookTitles[d.id] || "Academic Course Textbook";
          const assignedDate = new Date(d.createdAt).toLocaleString();
          const targetWindow = `Today by ${new Date(new Date(d.createdAt).getTime() + 4 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

          return <div key={d.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                  Shipment: {d.id}
                </span>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md uppercase">
                  {d.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 text-sm">{title}</h3>

              {/* Scheduled Timing & Dates */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Assigned Date:</span>
                  <span className="font-bold text-slate-700">{assignedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Expected Window:</span>
                  <span className="font-bold text-emerald-600">{targetWindow}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/50">
                  <span className="text-slate-400 font-semibold">Partner Earning:</span>
                  <span className="font-extrabold text-blue-600">₹{d.deliveryCharge || 45}</span>
                </div>
              </div>

              <div className="space-y-2 text-[10px] text-slate-500 font-semibold border-t border-slate-50 pt-3">
                <div className="flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Pickup: {d.pickupAddress || `${book?.area || "Guindy"}, Chennai`}</span>
                </div>
                <div className="flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Delivery: {d.deliveryAddress || order?.pickupLocation || "Adyar, Chennai"}</span>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/staff"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center cursor-pointer"
              >
                Start Pickup in Dashboard
              </Link>
            </div>
          </div>;
        })}
      </div>
    </div>;
}
export {
  StaffAssignedDeliveriesPage as default};
