import React from 'react';

interface PriceResultProps {
  fairPrice: number;
  minPrice: number;
  maxPrice: number;
}

export function PriceResult({ fairPrice, minPrice, maxPrice }: PriceResultProps) {
  return (
    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-2 text-center">
      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Suggested Fair Price</span>
      <div className="text-3xl font-extrabold text-blue-600">₹{fairPrice}</div>
      <div className="text-[11px] text-slate-500 font-semibold">
        Recommended Range: ₹{minPrice} - ₹{maxPrice}
      </div>
    </div>
  );
}
