import React from 'react';

interface ConditionResultProps {
  rating: string;
  confidence: number;
}

export function ConditionResult({ rating, confidence }: ConditionResultProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center text-xs">
      <div>
        <span className="text-slate-400 block text-[10px]">Estimated Visual Condition</span>
        <span className="font-extrabold text-slate-800 uppercase">{rating}</span>
      </div>
      <div className="text-right">
        <span className="text-slate-400 block text-[10px]">AI Confidence</span>
        <span className="font-bold text-blue-600">{confidence}%</span>
      </div>
    </div>
  );
}
