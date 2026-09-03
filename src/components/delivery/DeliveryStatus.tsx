import React from 'react';

export function DeliveryStatus({ status }: { status: string }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-100">
      {status}
    </span>
  );
}
