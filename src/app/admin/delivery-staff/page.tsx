import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllDeliveryStaff } from '../../../lib/db/deliveries';
import { Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDeliveryStaffPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const staff = await getAllDeliveryStaff();

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Truck className="w-5.5 h-5.5 text-blue-600" />
            <span>Courier Delivery Staff</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit active shipment agents, service coverage areas, and workloads.</p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
          Total Staff: {staff.length}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-150">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50">
                <th className="p-4">Staff Agent</th>
                <th className="p-4">City</th>
                <th className="p-4">Neighborhood (Area)</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4 text-center">Active Cargo Load</th>
                <th className="p-4 text-right">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {staff.map((s) => (
                <tr key={s.userId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{s.name}</td>
                  <td className="p-4">{s.city}</td>
                  <td className="p-4 truncate max-w-[120px]">{s.area}</td>
                  <td className="p-4">{s.phone}</td>
                  <td className="p-4 text-center text-slate-800 font-extrabold">{s.activeDeliveries} parcels</td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                      s.availability ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {s.availability ? 'AVAILABLE' : 'OFFLINE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
