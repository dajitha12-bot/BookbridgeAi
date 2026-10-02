import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Settings as SettingsIcon, Shield, Zap, ArrowRight, Database, Globe, CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <SettingsIcon className="w-5.5 h-5.5 text-blue-600" />
          <span>System Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure security credentials, notifications, and platform parameters.</p>
      </div>

      {/* Integrations Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 rounded-2xl text-white shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-bold tracking-wide">API Connections & Integrations</span>
          </div>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full font-semibold">
            Live Status
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Monitor physical SQLite database connectivity, Open Library REST API, Razorpay payment gateway credentials, webhook routes, and AI Price Intelligence status.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-300 font-medium">
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite DB</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Library</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
            <span>Razorpay Gateway</span>
          </div>
        </div>
        <div className="pt-2 flex flex-wrap gap-2">
          <Link
            href="/admin/settings/integrations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            <span>Open Integrations Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin/db-viewer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Open SQLite Table Explorer</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-slate-50 pb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Admin Account Info</span>
        </div>

        <div className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block pb-1">Name</span>
              <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-850 font-bold">
                {session.name}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block pb-1">Role Level</span>
              <div className="bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg text-rose-600 font-extrabold uppercase">
                {session.role}
              </div>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block pb-1">Email Address</span>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-850 font-bold">
              {session.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
