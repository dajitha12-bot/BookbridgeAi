import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getNotificationsByUserId } from '../../../lib/db/notifications';
import { Bell, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffNotificationsPage() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY_STAFF') redirect('/login');

  const notifications = await getNotificationsByUserId(session.id);

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Bell className="w-5.5 h-5.5 text-blue-600" />
          <span>My Notifications</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Stay updated on new courier assignments and platform alerts.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-150 py-16 text-center text-slate-500 space-y-2 shadow-sm">
          <Bell className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No Notifications</h3>
          <p className="text-xs text-slate-400">You don't have any alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-xl mx-auto">
          {notifications.map((n) => (
            <div key={n.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-xs leading-tight">{n.title}</h4>
                <p className="text-[11px] text-slate-500 leading-normal">{n.message}</p>
                <div className="text-[9px] text-slate-400 font-semibold">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
