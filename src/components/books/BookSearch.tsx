'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface BookSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export function BookSearch({ value, onChange }: BookSearchProps) {
  return (
    <div className="relative font-sans">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search title, author, category, or ISBN..."
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
      />
    </div>
  );
}
