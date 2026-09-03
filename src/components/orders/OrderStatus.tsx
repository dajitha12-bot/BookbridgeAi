import React from 'react';
import { OrderStatus as StatusType } from '../../types';

export function OrderStatus({ status }: { status: StatusType }) {
  const styles: Record<string, string> = {
    DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    IN_TRANSIT: 'bg-blue-50 text-blue-600 border-blue-100',
    CANCELLED: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${styles[status] || 'bg-slate-50 text-slate-600'}`}>
      {status}
    </span>
  );
}
