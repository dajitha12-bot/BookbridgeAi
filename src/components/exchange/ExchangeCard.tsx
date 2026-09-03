import React from 'react';
import { Exchange } from '../../types';

export function ExchangeCard({ exchange }: { exchange: Exchange }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2 text-xs font-sans">
      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
        <span className="font-bold text-slate-800">Exchange #{exchange.id}</span>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-600 uppercase">
          {exchange.status}
        </span>
      </div>
      <div className="text-slate-400 text-[10px]">
        Requested Book ID: {exchange.requestedBookId} | Offered: {exchange.offeredBookId}
      </div>
    </div>
  );
}
