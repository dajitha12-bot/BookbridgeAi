import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { Settings as SettingsIcon, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY_STAFF') redirect('/login');

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <SettingsIcon className="w-5.5 h-5.5 text-blue-600" />
          <span>Staff Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure courier availability toggles and system credentials.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-slate-50 pb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Security Credentials</span>
        </div>

        <div className="space-y-4 text-xs font-semibold">
          <div>
            <span className="text-slate-400 block pb-1">Email Account</span>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-850 font-bold">
              {session.email}
            </div>
          </div>
          
          <div className="bg-blue-50/30 p-3 rounded-lg border border-blue-50/50 text-[10px] text-slate-455 font-medium leading-relaxed">
            Courier availability status is synced in real-time based on your location coordinates. Use your dashboard toggles to pause incoming deliveries.
          </div>
        </div>
      </div>
    </div>
  );
}
