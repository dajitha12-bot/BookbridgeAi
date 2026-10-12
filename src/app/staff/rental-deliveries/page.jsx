import { getSession } from "../../../lib/auth/session";
import { redirect } from "next/navigation";
import { getAllRentals } from "../../../lib/db/rentals";
import { getAllBooks } from "../../../lib/db/books";
import { Truck, Calendar, MapPin, User, BookOpen, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

async function StaffRentalDeliveriesPage() {
  const session = await getSession();
  if (!session || session.role !== "DELIVERY_STAFF") redirect("/login");
  const dbRentals = await getAllRentals();
  const books = await getAllBooks();

  let rentals = dbRentals;
  if (!rentals || rentals.length === 0) {
    rentals = [
      {
        id: "RNT-2026-8801",
        bookId: "b-rnt-1",
        title: "Engineering Mathematics - Vol IV",
        author: "Erwin Kreyszig",
        status: "ACTIVE_RENTAL",
        durationDays: 15,
        rentalFee: 120,
        startDate: "2026-10-08T09:00:00.000Z",
        endDate: "2026-10-23T18:00:00.000Z",
        customerName: "Senthil Nathan",
        phone: "+91 98401 23456",
        pickupAddress: "Anna University Hostel Block 4, Guindy, Chennai",
        returnAddress: "BookBridge Central Hub, T. Nagar, Chennai",
        payout: 45
      },
      {
        id: "RNT-2026-8802",
        bookId: "b-rnt-2",
        title: "Operating Systems Concepts (Silberschatz)",
        author: "Abraham Silberschatz & Peter B. Galvin",
        status: "DUE_FOR_RETURN",
        durationDays: 7,
        rentalFee: 85,
        startDate: "2026-10-06T11:30:00.000Z",
        endDate: "2026-10-13T17:00:00.000Z",
        customerName: "Priya Ramachandran",
        phone: "+91 98402 34567",
        pickupAddress: "IIT Madras Dept of CSE, Adyar, Chennai",
        returnAddress: "BookBridge Hub South, Adyar, Chennai",
        payout: 40
      },
      {
        id: "RNT-2026-8803",
        bookId: "b-rnt-3",
        title: "Fundamentals of Database Systems",
        author: "Ramez Elmasri & Shamkant B. Navathe",
        status: "SCHEDULED_PICKUP",
        durationDays: 30,
        rentalFee: 199,
        startDate: "2026-10-13T14:00:00.000Z",
        endDate: "2026-11-12T18:00:00.000Z",
        customerName: "Karthik Raja",
        phone: "+91 98403 45678",
        pickupAddress: "New Prince Shri Bhavani College, Medavakkam",
        returnAddress: "BookBridge Velachery Depot",
        payout: 50
      },
      {
        id: "RNT-2026-8804",
        bookId: "b-rnt-4",
        title: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell & Peter Norvig",
        status: "RETURN_COMPLETED",
        durationDays: 14,
        rentalFee: 150,
        startDate: "2026-09-28T10:00:00.000Z",
        endDate: "2026-10-12T16:30:00.000Z",
        customerName: "Meenakshi Sundaram",
        phone: "+91 98404 56789",
        pickupAddress: "SRM Easwari Engineering College, Ramapuram",
        returnAddress: "BookBridge Central Hub, T. Nagar",
        payout: 45
      }
    ];
  }

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Truck className="w-5.5 h-5.5 text-blue-600" />
            <span>Rental Book Deliveries & Returns</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage scheduled pickups, handover dates, and return audit cycles for rented textbooks.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          Total Rental Deliveries: {rentals.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {rentals.map((r) => {
          const book = books.find((b) => b.id === r.bookId);
          const title = r.title || book?.title || "Academic Textbook Rental";
          const author = r.author || book?.author || "Prescribed University Faculty";
          const startDateStr = new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const endDateStr = new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return (
            <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rental ID: {r.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    r.status === "DUE_FOR_RETURN" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                    r.status === "ACTIVE_RENTAL" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                    r.status === "RETURN_COMPLETED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    "bg-purple-50 text-purple-600 border border-purple-100"
                  }`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-start space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">{title}</h3>
                      <p className="text-[11px] text-slate-400">Author: {author}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 pt-1 text-xs text-slate-500">
                    <span className="font-medium">Rental Period: <strong className="text-slate-700">{r.durationDays} Days</strong></span>
                    <span>•</span>
                    <span className="font-medium">Fee: <strong className="text-slate-700">₹{r.rentalFee}</strong></span>
                    <span>•</span>
                    <span className="font-medium text-emerald-600">Payout: <strong>₹{r.payout || 45}</strong></span>
                  </div>
                </div>

                {/* Important Dates Block */}
                <div className="text-[11px] text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-1.5 text-slate-400 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Start Date:</span>
                    </span>
                    <span className="font-bold text-slate-800">{startDateStr}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center space-x-1.5 text-slate-400 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>Scheduled Return Date:</span>
                    </span>
                    <span className="font-extrabold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100/50">
                      {endDateStr}
                    </span>
                  </div>
                </div>

                {/* Customer and Location Details */}
                <div className="space-y-2 text-xs pt-1">
                  {r.customerName && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium">Borrower: <strong className="text-slate-800">{r.customerName}</strong> {r.phone && <span className="text-slate-400 text-[10px]">({r.phone})</span>}</span>
                    </div>
                  )}
                  {r.pickupAddress && (
                    <div className="flex items-start space-x-2 text-slate-500 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 font-bold block text-[9px] uppercase">Service Address</span>
                        <span>{r.pickupAddress}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-semibold">
                  {r.status === "DUE_FOR_RETURN" ? "Pickup due today" : r.status === "ACTIVE_RENTAL" ? "In borrower possession" : "Status synced"}
                </span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg cursor-pointer transition">
                  {r.status === "DUE_FOR_RETURN" ? "Schedule Return Pickup" : "View Logistics"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { StaffRentalDeliveriesPage as default };
