import { getSession } from "../../../lib/auth/session";
import { redirect } from "next/navigation";
import { Settings as SettingsIcon, Shield, Clock, Calendar, Bell, DollarSign, Navigation, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

async function StaffSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "DELIVERY_STAFF") redirect("/login");

  const lastSettingsUpdated = "October 13, 2026, 08:00 AM";
  const nextPayoutDate = "October 15, 2026";
  const lastPayoutDate = "September 30, 2026";
  const lastGpsPing = "October 13, 2026, 10:15 AM";

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <SettingsIcon className="w-5.5 h-5.5 text-blue-600" />
            <span>Courier Operational Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure duty shifts, payout cycles, dispatch radius, and system credentials.</p>
        </div>
        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
          Last Configured: {lastSettingsUpdated}
        </span>
      </div>

      {/* Shift and Availability Timings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
          <Clock className="w-4.5 h-4.5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Shift Timings & Duty Schedule</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Standard Shift</span>
            <span className="text-sm font-extrabold text-slate-800">08:00 AM – 06:00 PM</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Working Days</span>
            <span className="text-sm font-extrabold text-slate-800">Monday – Saturday</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <span className="text-emerald-700 block text-[10px] uppercase font-bold mb-1">Duty Status</span>
            <span className="text-sm font-extrabold text-emerald-600">● On-Duty (Active)</span>
          </div>
        </div>
      </div>

      {/* Dispatch Radius & GPS Tracking */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
          <Navigation className="w-4.5 h-4.5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Dispatch Radius & Live Telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div>
            <span className="text-slate-400 block pb-1 text-[11px]">Maximum Delivery Radius</span>
            <div className="bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800 font-bold flex justify-between items-center">
              <span>15 Kilometers</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-extrabold">Within City Limits</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block pb-1 text-[11px]">GPS Telemetry Sync</span>
            <div className="bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800 font-bold flex justify-between items-center">
              <span>Real-Time (30s Ping)</span>
              <span className="text-[10px] text-emerald-600 font-normal">Pinged: {lastGpsPing}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-100/60 text-[11px] text-slate-600 flex items-center justify-between">
          <span>Auto-Accept Nearby Campus Orders (Within 5 km):</span>
          <span className="bg-blue-600 text-white font-extrabold px-2.5 py-1 rounded-md text-[10px]">ENABLED</span>
        </div>
      </div>

      {/* Payout & Settlement Schedule */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
          <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
          <span className="text-sm font-bold text-slate-800">Bank Settlement & Payout Dates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Settlement Bank</span>
            <span className="font-extrabold text-slate-800 block">HDFC Bank ****4892</span>
            <span className="text-[10px] text-slate-400 font-mono">IFSC: HDFC0000240</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <span className="text-emerald-700 block text-[10px] font-bold uppercase mb-1 flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Next Payout Date</span>
            </span>
            <span className="font-extrabold text-emerald-700 block text-sm">{nextPayoutDate}</span>
            <span className="text-[10px] text-emerald-600">Bi-Weekly Settlement Cycle</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">Previous Settlement</span>
            <span className="font-extrabold text-slate-700 block text-sm">{lastPayoutDate}</span>
            <span className="text-[10px] text-slate-500">₹4,250 Cleared into A/C</span>
          </div>
        </div>
      </div>

      {/* Security & Support Dispatch */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
          <Shield className="w-4.5 h-4.5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Security Credentials & Support</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div>
            <span className="text-slate-400 block pb-1 text-[11px]">Primary Login Account</span>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-bold">
              {session.email}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block pb-1 text-[11px]">24x7 Staff Emergency Dispatch</span>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-bold flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>1800-419-BOOK (Ext. 4)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { StaffSettingsPage as default };
