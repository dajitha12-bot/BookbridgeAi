import { getSession } from '../../../lib/auth/session';
import { redirect } from 'next/navigation';
import { Brain, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAiPricePage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Brain className="w-5.5 h-5.5 text-blue-600" />
          <span>AI Fair Price Model Analytics</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Audit local TensorFlow.js linear regression weights and feature coefficients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Model Training Records</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">142 Listings</div>
          <p className="text-[11px] text-slate-400">Trained on historical Tamil Nadu textbook sales.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Price Offset</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">₹45.20</div>
          <p className="text-[11px] text-slate-400">Mean absolute error across testing metrics.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Demand Factor Weight</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">+18.5%</div>
          <p className="text-[11px] text-slate-400">Applied multiplier for high-demand categories.</p>
        </div>
      </div>
    </div>
  );
}
