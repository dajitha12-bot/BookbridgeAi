import React, { TableHTMLAttributes } from 'react';

export function Table({ children, className = '', ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-100 shadow-sm">
      <table className={`w-full text-left text-xs text-slate-600 divide-y divide-slate-100 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}
