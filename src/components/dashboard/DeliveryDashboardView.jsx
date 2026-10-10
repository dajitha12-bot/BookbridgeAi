"use client";
import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Truck,
  CheckCircle,
  Clock,
  Navigation,
  UserPlus,
  RotateCcw
} from "lucide-react";
import { updateDeliveryStatusAction } from "../../actions/orderActions";
function DeliveryDashboardView({
  staff,
  deliveries,
  refetch
}) {
  const [updatingId, setUpdatingId] = useState(null);
  const [rentalReturnStatus, setRentalReturnStatus] = useState("ASSIGNED");
  const activeDelivery = deliveries.find((d) => d.status !== "DELIVERED" && d.status !== "CANCELLED");
  const pendingAssignment = deliveries.filter((d) => d.status === "ASSIGNED");
  const completedDeliveries = deliveries.filter((d) => d.status === "DELIVERED");
  const handleStatusUpdate = async (deliveryId, nextStatus) => {
    try {
      setUpdatingId(deliveryId);
      const res = await updateDeliveryStatusAction(deliveryId, nextStatus);
      if (res.success) {
        alert(`Status updated successfully to: ${nextStatus}`);
        await refetch();
      } else {
        alert(res.error || "Failed to update delivery status.");
      }
    } catch (e) {
      alert("An error occurred.");
    } finally {
      setUpdatingId(null);
    }
  };
  const handleRentalReturnStep = (nextStep) => {
    setRentalReturnStatus(nextStep);
    alert(`Rental Return Task status updated to: ${nextStep.replace(/_/g, " ")}`);
  };
  return <div className="space-y-8 animate-fade-in text-slate-800 font-sans pb-16">
      {
    /* Welcome & Staff Stats Header */
  }
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <span>Delivery Staff Partner Operations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800 font-bold">{staff?.name || "Dhinesh Kumar"}</strong> (Service Area: {staff?.serviceArea || "Adyar, Guindy, Mylapore, Chennai"}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${staff?.availability ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
            {staff?.availability ? "\u25CF Available for Assignments" : "\u25CB Offline"}
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Workload: {(staff?.activeDeliveries || 1) + 1} Active Runs
          </span>
          <Link
    href="/register?role=staff"
    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center space-x-1 shadow-xs"
  >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Register Staff Partner</span>
          </Link>
        </div>
      </div>

      {
    /* Stats Overview */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{pendingAssignment.length + 1}</div>
            <div className="text-xs text-slate-500 font-bold">New Assignments</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{activeDelivery ? 1 : 1}</div>
            <div className="text-xs text-slate-500 font-bold">Outbound Deliveries</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">1</div>
            <div className="text-xs text-slate-500 font-bold">Rental Return Pickups</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center space-x-4 shadow-xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{completedDeliveries.length + 2}</div>
            <div className="text-xs text-slate-500 font-bold">Completed Runs</div>
          </div>
        </div>
      </div>

      {
    /* SECTION 1: Active Outbound Delivery Run */
  }
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block">
              1. Active Outbound Book Delivery
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              Order #{activeDelivery?.order?.id ? activeDelivery.order.id.slice(0, 8) : "ord-101"}
            </h2>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full uppercase">
            {activeDelivery?.status || "IN_TRANSIT"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Book Title</span>
            <span className="text-sm font-extrabold text-slate-800">
              {activeDelivery?.order?.book?.title || "Python Crash Course (2nd Edition)"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Payment Method</span>
            <span className="text-sm font-extrabold text-slate-800">Demo UPI Paid (₹890 Total)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {
    /* Seller Pickup Address */
  }
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Seller Pickup Address</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-100 text-xs">
              <div className="font-bold text-slate-900">{activeDelivery?.order?.seller?.name || "Ajitha (Seller)"}</div>
              <div className="text-slate-600 line-clamp-2">{activeDelivery?.pickupAddress || "10, Kasturiba Nagar, Adyar, Chennai - 600020"}</div>
              <div className="flex items-center text-slate-500 font-mono">
                <Phone className="w-3.5 h-3.5 text-blue-500 mr-1" />
                <span>9123456780</span>
              </div>
            </div>
          </div>

          {
    /* Buyer Delivery Address */
  }
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <Navigation className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Buyer Delivery Destination</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-100 text-xs">
              <div className="font-bold text-slate-900">{activeDelivery?.order?.buyer?.name || "Standard User (Buyer)"}</div>
              <div className="text-slate-600 line-clamp-2">{activeDelivery?.deliveryAddress || "14, Luz Church Road, Mylapore, Chennai - 600004"}</div>
              <div className="flex items-center text-slate-500 font-mono">
                <Phone className="w-3.5 h-3.5 text-blue-500 mr-1" />
                <span>9123456781</span>
              </div>
            </div>
          </div>
        </div>

        {
    /* Workflow Action Buttons */
  }
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">Update Outbound Delivery Progress</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Staff Earnings: +₹20.00 / Leg
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
    onClick={() => handleStatusUpdate(activeDelivery?.id || "del-1", "REACHED_SELLER")}
    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
  >
              ✓ Reached Seller
            </button>
            <button
    onClick={() => handleStatusUpdate(activeDelivery?.id || "del-1", "PICKED_UP")}
    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
  >
              📦 Book Picked Up
            </button>
            <button
    onClick={() => handleStatusUpdate(activeDelivery?.id || "del-1", "BOOK_RECEIVED")}
    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
  >
              📬 Book Received
            </button>
            <button
    onClick={() => handleStatusUpdate(activeDelivery?.id || "del-1", "IN_TRANSIT")}
    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
  >
              🚚 In Transit
            </button>
            <button
    onClick={() => handleStatusUpdate(activeDelivery?.id || "del-1", "OUT_FOR_DELIVERY")}
    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
  >
              🚴 Out for Delivery
            </button>
            <button
    onClick={() => handleStatusUpdate(activeDelivery?.id || "del-1", "DELIVERED")}
    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
  >
              ✅ Confirm Delivered
            </button>
          </div>
        </div>
      </div>

      {
    /* SECTION 2: Rental Return Book Pickup Task (Same Delivery Staff Assigned) */
  }
      <div className="bg-white p-6 rounded-2xl border-2 border-indigo-200/90 shadow-md space-y-5">
        <div className="flex justify-between items-start border-b border-indigo-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                2. Rental Book Return Pickup Task (Same Staff Partner)
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                Rental Period Ended
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-1 flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
              <span>Rental Return Task #rent-ret-101 (Eloquent JavaScript)</span>
            </h2>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-full uppercase">
            {rentalReturnStatus.replace(/_/g, " ")}
          </span>
        </div>

        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-700 font-bold">
            <span>Book Title: <strong>Eloquent JavaScript (14-Day Rental Contract)</strong></span>
            <span className="text-indigo-700 font-extrabold">Return Due Date: Oct 16, 2026</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Notice: After the 14-day rental period completes, the <strong className="text-indigo-900 font-extrabold">SAME delivery staff partner ({staff?.name || "Dhinesh Kumar"})</strong> who delivered the book is automatically assigned to collect the book from the renter's address and return it safely to the owner!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {
    /* Pickup from Renter */
  }
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Collection Address (Renter Location)</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-100 text-xs">
              <div className="font-bold text-slate-900">Ajitha (Renter)</div>
              <div className="text-slate-600 line-clamp-2">10, Kasturiba Nagar, Adyar, Chennai - 600020</div>
              <div className="flex items-center text-slate-500 font-mono">
                <Phone className="w-3.5 h-3.5 text-blue-500 mr-1" />
                <span>9123456780</span>
              </div>
            </div>
          </div>

          {
    /* Return Dropoff to Owner */
  }
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <Navigation className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Return Dropoff Address (Book Owner)</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-100 text-xs">
              <div className="font-bold text-slate-900">Standard User (Book Owner)</div>
              <div className="text-slate-600 line-clamp-2">14, Luz Church Road, Mylapore, Chennai - 600004</div>
              <div className="flex items-center text-slate-500 font-mono">
                <Phone className="w-3.5 h-3.5 text-blue-500 mr-1" />
                <span>9123456781</span>
              </div>
            </div>
          </div>
        </div>

        {
    /* Action Buttons for Rental Return */
  }
        <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 space-y-3">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">Update Rental Return Pickup Status</span>
          <div className="flex flex-wrap gap-2">
            <button
    onClick={() => handleRentalReturnStep("ACCEPTED")}
    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${rentalReturnStatus === "ACCEPTED" ? "bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
  >
              ✓ Accept Return Task
            </button>
            <button
    onClick={() => handleRentalReturnStep("PICKED_UP_FROM_RENTER")}
    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${rentalReturnStatus === "PICKED_UP_FROM_RENTER" ? "bg-indigo-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
  >
              📦 Picked Up from Renter
            </button>
            <button
    onClick={() => handleRentalReturnStep("RETURNED_TO_OWNER")}
    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${rentalReturnStatus === "RETURNED_TO_OWNER" ? "bg-emerald-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
  >
              ✅ Returned to Owner (Complete Task)
            </button>
          </div>
        </div>
      </div>

      {
    /* SECTION 3: Delivery History Log */
  }
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">Completed Delivery & Payout History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
                <th className="p-3">Ref ID</th>
                <th className="p-3">Run Type</th>
                <th className="p-3">Book Title</th>
                <th className="p-3">Route / Destination</th>
                <th className="p-3">Staff Payout</th>
                <th className="p-3 text-right">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-3 font-bold text-blue-600 font-mono">#del-8812</td>
                <td className="p-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold text-[10px]">OUTBOUND</span></td>
                <td className="p-3 font-bold text-slate-800">Clean Code: Handbook of Agile</td>
                <td className="p-3">Velachery &rarr; Adyar, Chennai</td>
                <td className="p-3 font-extrabold text-emerald-600">+₹20.00</td>
                <td className="p-3 text-right text-slate-400">Oct 01, 2026</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-3 font-bold text-blue-600 font-mono">#rent-ret-090</td>
                <td className="p-3"><span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px]">RENTAL_RETURN</span></td>
                <td className="p-3 font-bold text-slate-800">Artificial Intelligence: Modern Approach</td>
                <td className="p-3">Mylapore &rarr; Guindy, Chennai</td>
                <td className="p-3 font-extrabold text-emerald-600">+₹20.00</td>
                <td className="p-3 text-right text-slate-400">Sep 28, 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}
export {
  DeliveryDashboardView as default
};
