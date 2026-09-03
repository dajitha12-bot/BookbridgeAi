import React from 'react';
import { Delivery } from '../../types';

export function DeliveryCard({ delivery }: { delivery: Delivery }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2 text-xs font-sans">
      <div className="flex justify-between items-center">
        <span className="font-bold text-slate-800">Shipment #{delivery.id}</span>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-600 uppercase">
          {delivery.status}
        </span>
      </div>
      <div className="text-slate-400 text-[10px]">Order Ref: {delivery.orderId}</div>
    </div>
  );
}
