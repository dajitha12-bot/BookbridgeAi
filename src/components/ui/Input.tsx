import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{label}</label>}
      <input
        className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}
    </div>
  );
}
