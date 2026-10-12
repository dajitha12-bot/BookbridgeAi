import { getSession } from "../../../lib/auth/session";
import { redirect } from "next/navigation";
import { getProfileByUserId } from "../../../lib/db/users";
import { User, Shield, Calendar, MapPin, Truck, Award, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

async function StaffProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "DELIVERY_STAFF") redirect("/login");
  const profile = await getProfileByUserId(session.id);

  const joiningDate = "January 15, 2024";
  const verificationDate = "January 18, 2024";
  const lastActiveDate = "October 13, 2026, 09:30 AM";
  const licenseValidUntil = "August 24, 2032";

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <User className="w-5.5 h-5.5 text-blue-600" />
          <span>Courier Partner Profile</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage verified credentials, duty registration dates, and assigned delivery logistics zones.</p>
      </div>

      {/* Partner Overview Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-2xl border border-white/30">
            {session.name ? session.name[0].toUpperCase() : "D"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold">{session.name || "Delivery Partner"}</h2>
              <span className="bg-emerald-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>VERIFIED</span>
              </span>
            </div>
            <p className="text-blue-100 text-xs mt-0.5">Partner ID: <span className="font-mono font-bold text-white">STF-CHN-2024-082</span></p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
          <Award className="w-5 h-5 text-amber-300" />
          <div className="text-right">
            <span className="text-[10px] text-blue-200 block uppercase font-bold">Partner Rating</span>
            <span className="text-sm font-extrabold">4.9 ★ (142 Deliveries)</span>
          </div>
        </div>
      </div>

      {/* Registration & Activity Dates */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
          <Calendar className="w-4.5 h-4.5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Registration & Duty Timestamps</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Joining Date</span>
            <span className="font-extrabold text-slate-700">{joiningDate}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">KYC Verified Date</span>
            <span className="font-extrabold text-emerald-600">{verificationDate}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Last Shift Check-In</span>
            <span className="font-extrabold text-blue-600">{lastActiveDate}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">License Valid Until</span>
            <span className="font-extrabold text-slate-700">{licenseValidUntil}</span>
          </div>
        </div>
      </div>

      {/* Account Details & Vehicle Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
            <Shield className="w-4.5 h-4.5 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">Account Credentials</span>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div>
              <span className="text-slate-400 block pb-1 text-[11px]">Full Name</span>
              <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-bold">
                {session.name || "Ajitha Partner"}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block pb-1 text-[11px]">Email Address</span>
              <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-bold">
                {session.email}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block pb-1 text-[11px]">Role Classification</span>
              <div className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg text-blue-600 font-extrabold uppercase">
                {session.role}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
            <Truck className="w-4.5 h-4.5 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">Vehicle & Compliance</span>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div>
              <span className="text-slate-400 block pb-1 text-[11px]">Vehicle Type & Model</span>
              <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-bold">
                Hero Splendor Electric (2-Wheeler EV)
              </div>
            </div>
            <div>
              <span className="text-slate-400 block pb-1 text-[11px]">Vehicle Registration No.</span>
              <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-mono font-bold">
                TN-07-BW-4821
              </div>
            </div>
            <div>
              <span className="text-slate-400 block pb-1 text-[11px]">Driving License Number</span>
              <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-mono font-bold">
                DL-TN-07-2022-99881
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logistics Hub and Service Coverage */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
          <MapPin className="w-4.5 h-4.5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Designated Logistics Hub & Service Area</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block pb-1 text-[11px]">Base Distribution Hub</span>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-800">
              Guindy Central Hub #2, Chennai
            </div>
          </div>
          <div>
            <span className="text-slate-400 block pb-1 text-[11px]">Service Coverage Zones</span>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-800">
              Guindy, Adyar, Mylapore, Velachery
            </div>
          </div>
          <div>
            <span className="text-slate-400 block pb-1 text-[11px]">Base Pincode</span>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-800">
              600032
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { StaffProfilePage as default };
