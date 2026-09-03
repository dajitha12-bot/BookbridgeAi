import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { PriceResult } from './PriceResult';
import { ConditionResult } from './ConditionResult';

interface FairPriceCardProps {
  fairPrice: number;
  minPrice: number;
  maxPrice: number;
  conditionRating: string;
  confidence: number;
  onApplyPrice?: () => void;
}

export function FairPriceCard({
  fairPrice,
  minPrice,
  maxPrice,
  conditionRating,
  confidence,
  onApplyPrice,
}: FairPriceCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4 font-sans">
      <div className="flex items-center space-x-2 border-b border-slate-50 pb-3">
        <Brain className="w-5 h-5 text-blue-600" />
        <span className="font-bold text-slate-800 text-sm">AI Valuation Analysis</span>
      </div>

      <ConditionResult rating={conditionRating} confidence={confidence} />
      <PriceResult fairPrice={fairPrice} minPrice={minPrice} maxPrice={maxPrice} />

      {onApplyPrice && (
        <button
          onClick={onApplyPrice}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Apply ₹{fairPrice} to Form</span>
        </button>
      )}
    </div>
  );
}
