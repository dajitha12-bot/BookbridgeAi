import React from 'react';
import Link from 'next/link';

export function Sidebar({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="w-64 bg-[#0f172a] text-white flex flex-col h-screen border-r border-slate-800">
      <div className="flex items-center space-x-2 px-5 py-4 border-b border-slate-800 h-16">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">B</div>
        <span className="font-bold text-white text-base tracking-tight">BookBridge AI</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">{children}</div>
    </aside>
  );
}
