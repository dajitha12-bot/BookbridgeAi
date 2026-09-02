import { getSession } from '../../../lib/auth/session';
import { getAllBooks } from '../../../lib/db/books';
import { predictFairPrice, mapConditionToScore, trainModel } from '../../../lib/ai/fairPrice';
import { redirect } from 'next/navigation';
import { Brain, TrendingUp, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AiAnalyticsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?role=admin');
  }

  // Train model dynamically to fetch weights & metadata
  const meta = trainModel();

  // Load books catalog from JSON database
  const books = await getAllBooks();

  let totalPredictions = books.length;
  let matches = 0;
  let totalOrigPrice = 0;
  let totalExpPrice = 0;

  for (const b of books) {
    totalOrigPrice += b.originalPrice;
    totalExpPrice += b.expectedPrice;

    // Compare actual price against AI dynamically
    const age = new Date().getFullYear() - b.publicationYear;
    const score = mapConditionToScore(b.condition);
    const suggested = predictFairPrice(
      b.originalPrice,
      Math.max(0, age),
      score,
      b.edition,
      b.category
    ).suggestedPrice;

    // Tolerance of 5%
    if (Math.abs(b.expectedPrice - suggested) / suggested <= 0.05) {
      matches++;
    }
  }

  const avgOriginal = totalPredictions > 0 ? Math.round(totalOrigPrice / totalPredictions) : 0;
  const avgExpected = totalPredictions > 0 ? Math.round(totalExpPrice / totalPredictions) : 0;
  const avgDiscount = avgOriginal - avgExpected;
  const avgDiscountPercent = avgOriginal > 0 ? Math.round((avgDiscount / avgOriginal) * 100) : 0;
  const usageRate = totalPredictions > 0 ? Math.round((matches / totalPredictions) * 100) : 0;

  return (
    <div className="space-y-8 text-slate-800 animate-fade-in font-sans">
      <div>
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <Brain className="w-6 h-6 text-sky-500" />
          <span>AI Price Prediction Analytics (Admin)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor model accuracy, training metadata, and seller pricing recommendation usage.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Predictions Ran', value: totalPredictions, subtitle: 'Matching database listings', icon: Sparkles },
          { label: 'AI Suggestion Usage', value: `${usageRate}%`, subtitle: 'Sellers accepting suggestions', icon: TrendingUp },
          { label: 'Average Original MRP', value: `₹${avgOriginal}`, subtitle: 'Baseline cover price', icon: Brain },
          { label: 'Avg Suggested Resale', value: `₹${avgExpected}`, subtitle: `Saves buyers ~${avgDiscountPercent}%`, icon: Sparkles },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
              <div className="p-3 bg-sky-50 text-sky-500 rounded-lg">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-700">{stat.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{stat.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Metadata & Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Model Training Diagnostics</h2>
          <div className="divide-y divide-slate-100 text-xs font-semibold">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Trained Dataset Size</span>
              <span className="text-slate-700">{meta.samplesCount} samples</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Training Iterations</span>
              <span className="text-slate-700">{meta.epochs} epochs</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Optimization Stepsize (Alpha)</span>
              <span className="text-slate-700">{meta.learningRate}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Model Error (RMSE)</span>
              <span className="text-sky-600">₹{meta.mse}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Trained Regression Weights</h2>
          <div className="space-y-3 pt-2 text-xs">
            {[
              { factor: 'Bias (Constant offset)', val: meta.weights[0] },
              { factor: 'Original Price weight', val: meta.weights[1] },
              { factor: 'Book Age (Depreciation)', val: meta.weights[2] },
              { factor: 'Physical Condition bonus', val: meta.weights[3] },
              { factor: 'Edition weight', val: meta.weights[4] },
              { factor: 'Category modifier', val: meta.weights[5] },
            ].map((weight, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                <span className="font-semibold text-slate-600">{weight.factor}</span>
                <span className={`font-mono font-bold ${weight.val < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {weight.val >= 0 ? '+' : ''}{weight.val.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Condition vs Suggested Price Ratio Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2">
          {[
            { label: 'New (5/5)', ratio: '80% - 90%', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { label: 'Like New (4.5/5)', ratio: '70% - 80%', color: 'bg-teal-50 text-teal-600 border-teal-100' },
            { label: 'Very Good (4/5)', ratio: '60% - 70%', color: 'bg-sky-50 text-sky-600 border-sky-100' },
            { label: 'Good (3/5)', ratio: '45% - 60%', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
            { label: 'Fair (2/5)', ratio: '20% - 40%', color: 'bg-amber-50 text-amber-600 border-amber-100' }
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border text-center space-y-2 ${item.color}`}>
              <div className="text-xs font-bold">{item.label}</div>
              <div className="text-sm font-extrabold">{item.ratio}</div>
              <span className="text-[9px] text-slate-400 block">Of Original Price</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
