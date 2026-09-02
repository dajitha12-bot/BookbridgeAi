import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDeliveries, getAllDeliveryStaff } from '../../../lib/db/deliveries';
import { ClipboardList, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDeliveriesPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const deliveries = await getAllDeliveries();
  const staff = await getAllDeliveryStaff();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <ClipboardList className="w-5.5 h-5.5 text-blue-600" />
            <span>Platform Courier Shipments</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit active book courier schedules, delivery agent logs, and status updates.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total Shipments: {deliveries.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50">
                <th className="p-4">Delivery ID</th>
                <th className="p-4">Associated Order ID</th>
                <th className="p-4">Assigned courier</th>
                <th className="p-4">Last update</th>
                <th className="p-4 text-right">Shipment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {deliveries.map((d) => {
                const assignedStaff = staff.find((s) => s.userId === d.staffId);
                
                return (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{d.id}</td>
                    <td className="p-4 text-slate-550">{d.orderId}</td>
                    <td className="p-4 font-semibold">
                      {assignedStaff ? (
                        <span className="text-slate-850 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {assignedStaff.name}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">UNASSIGNED (Pending)</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-[10px]">{new Date(d.updatedAt).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                        d.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                        d.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
