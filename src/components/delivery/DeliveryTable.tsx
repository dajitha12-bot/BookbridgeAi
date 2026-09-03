import React from 'react';
import { Delivery } from '../../types';

export function DeliveryTable({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-100 shadow-sm font-sans">
      <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
        <thead>
          <tr className="font-bold text-slate-400 bg-slate-50/50">
            <th className="p-4">Delivery ID</th>
            <th className="p-4">Order ID</th>
            <th className="p-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {deliveries.map((d) => (
            <tr key={d.id} className="hover:bg-slate-50/50">
              <td className="p-4 font-bold text-slate-800">{d.id}</td>
              <td className="p-4">{d.orderId}</td>
              <td className="p-4 text-right uppercase font-bold text-blue-600">{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
