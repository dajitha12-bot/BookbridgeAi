import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getNotificationsByUser } from '../../../lib/db/notifications';
import { Bell, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StaffNotificationsPage() {
  const session = await getSession();
  if (!session || session.role !== 'DELIVERY_STAFF') redirect('/login');

  const notifications = await getNotificationsByUser(session.id);

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Bell className="w-5.5 h-5.5 text-blue-600" />
            <span>Delivery Staff Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for assigned deliveries, route updates, and customer pickup confirmations.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          Total Alerts: {notifications.length}
        </span>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200">
            No notifications available.
          </div>
        ) : (
          notifications.map((n: any) => (
            <div key={n.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-start space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                <p className="text-xs text-slate-600">{n.message}</p>
                <p className="text-[10px] text-slate-400 font-medium pt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
