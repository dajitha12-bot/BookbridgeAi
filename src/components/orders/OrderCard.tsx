import React from 'react';
import { Order } from '../../types';

export function OrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2 text-xs font-sans">
      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
        <span className="font-bold text-slate-800">Order #{order.id}</span>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-600 uppercase">
          {order.orderStatus}
        </span>
      </div>
      <div className="flex justify-between font-semibold text-slate-700">
        <span>Amount</span>
        <span>₹{order.amount}</span>
      </div>
    </div>
  );
}
