import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getProfileByUserId } from '../../../lib/db/users';
import { Settings as SettingsIcon, Shield, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function UserSettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const profile = await getProfileByUserId(session.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <SettingsIcon className="w-5.5 h-5.5 text-blue-600" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure account information, shipping preferences, and security parameters.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-slate-50 pb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">Account details</span>
        </div>

        <div className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block pb-1">Full Name</span>
              <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-850 font-bold">
                {session.name}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block pb-1">Role Group</span>
              <div className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg text-blue-600 font-extrabold uppercase">
                {session.role}
              </div>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block pb-1">Login Email</span>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-850 font-bold">
              {session.email}
            </div>
          </div>

          {profile && (
            <div className="space-y-4 border-t border-slate-50 pt-4">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Base Shipping Coordinates</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 block pb-1">City</span>
                  <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-850 font-bold">
                    {profile.city}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block pb-1">Area</span>
                  <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-850 font-bold">
                    {profile.area}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block pb-1">Pincode</span>
                  <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-850 font-bold">
                    {profile.pincode}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block pb-1">Full Shipping Address</span>
                <div className="bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-850 font-bold leading-relaxed">
                  {profile.address}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
