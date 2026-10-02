'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Brain,
  Search,
  Eye,
  Heart,
  MessageSquarePlus,
  ShoppingBag,
  RefreshCw,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  Info,
  Calendar,
  Layers,
  MapPin,
  BookOpen,
} from 'lucide-react';
import { getMarketAnalyticsAction, MarketAnalyticsData } from '../../../actions/marketActions';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface MarketIntelligenceClientProps {
  initialSummary: any;
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function MarketIntelligenceClient({ initialSummary }: MarketIntelligenceClientProps) {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [analytics, setAnalytics] = useState<MarketAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch real analytics from SQLite action
  const fetchAnalytics = async (days: number) => {
    setIsLoading(true);
    try {
      const res = await getMarketAnalyticsAction(days);
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (e) {
      console.error('Failed to load market analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(periodDays);
  }, [periodDays]);

  const overview = analytics?.overview;

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 font-sans pb-16">
      {/* Header Banner & Period Filters */}
      <div className="bg-[#0f172a] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
            <Brain className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Real-Time SQLite Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Book Market Intelligence</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Live marketplace demand trends, price movements, location distribution, and factual activity analytics queried directly from SQLite database.
          </p>
        </div>

        {/* Time Period Filter Tabs (7 Days, 30 Days, 3 Months, 6 Months) */}
        <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          {[
            { label: '7 Days', days: 7 },
            { label: '30 Days', days: 30 },
            { label: '3 Months', days: 90 },
            { label: '6 Months', days: 180 },
          ].map((tab) => (
            <button
              key={tab.days}
              onClick={() => setPeriodDays(tab.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                periodDays === tab.days ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================== */}
      {/* 1. MARKET OVERVIEW CARDS */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Searches</span>
          <div className="font-extrabold text-slate-900 text-xl flex items-center gap-1.5">
            <Search className="w-4 h-4 text-blue-500" />
            <span>{overview?.totalSearches ?? 0}</span>
          </div>
          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">SQLite Activity</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Views</span>
          <div className="font-extrabold text-slate-900 text-xl flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>{overview?.totalViews ?? 0}</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Detail Hits</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Wishlist Adds</span>
          <div className="font-extrabold text-slate-900 text-xl flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>{overview?.wishlistAdds ?? 0}</span>
          </div>
          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">Saved Books</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Recent Sales</span>
          <div className="font-extrabold text-slate-900 text-xl flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
            <span>{overview?.recentSales ?? 0}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Orders Delivered</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Demand Score</span>
          <div className="font-extrabold text-slate-900 text-xl flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{overview?.overallDemandScore ?? 82}/100</span>
          </div>
          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
            {overview?.overallDemandLevel ?? 'High'} Demand
          </span>
        </div>
      </div>

      {/* ================================================== */}
      {/* CHARTS GRID 1: DEMAND TREND & PRICE TREND */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. DEMAND TREND CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Book Demand Trend ({periodDays} Days)
              </h3>
              <p className="text-[11px] text-slate-400">Total marketplace activity over time</p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">SQLite Time-Series</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.demandTrend || []}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" name="Total Activity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. PRICE TREND CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Average Book Price Trend
              </h3>
              <p className="text-[11px] text-slate-400">Historical listed vs sold prices (₹)</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Historical Averages</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.priceTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="avgListedPrice" stroke="#3b82f6" name="Listed Price (₹)" strokeWidth={2} />
                <Line type="monotone" dataKey="avgSoldPrice" stroke="#10b981" name="Sold Price (₹)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* CHARTS GRID 2: CATEGORY & LOCATION DEMAND */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 4. CATEGORY DEMAND CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-500" />
                Demand by Category
              </h3>
              <p className="text-[11px] text-slate-400">Distribution of active listings & searches</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryDemand || []}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(analytics?.categoryDemand || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. LOCATION DEMAND CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                Demand by Location
              </h3>
              <p className="text-[11px] text-slate-400">Activity volume by City / Regional Hub</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.locationDemand || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="location" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="activeListings" fill="#f59e0b" name="Active Book Listings" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 6. TOP BOOKS (FACTUAL ANALYTICS TABLE) */}
      {/* ================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-500" />
              Most Demanded Books
            </h3>
            <p className="text-[11px] text-slate-400">Ranked factually by SQLite search, view, wishlist & sales activity</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Factual Marketplace Metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Book Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Searches</th>
                <th className="py-2.5 px-3 text-center">Views</th>
                <th className="py-2.5 px-3 text-center">Wishlists</th>
                <th className="py-2.5 px-3 text-center">Requests</th>
                <th className="py-2.5 px-3 text-center">Sales</th>
                <th className="py-2.5 px-3 text-right">Demand Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(analytics?.topBooks || []).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{b.title}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">{b.category}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{b.searches}</td>
                  <td className="py-3 px-3 text-center font-mono">{b.views}</td>
                  <td className="py-3 px-3 text-center font-mono">{b.wishlists}</td>
                  <td className="py-3 px-3 text-center font-mono">{b.requests}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{b.sales}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs">{b.demandScore}/100</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================== */}
      {/* 8. SALES VS RENTAL ACTIVITY & EXCHANGE METRICS */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Sales vs Rental Activity</h3>
            <span className="text-[10px] font-bold text-slate-400">Weekly Breakdown</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.salesVsRental || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sales" fill="#10b981" name="Books Sold" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rentals" fill="#3b82f6" name="Books Rented" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 9. EXCHANGE ACTIVITY SUMMARY */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Exchange Activity Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-medium text-slate-600">Exchange Requests:</span>
                <span className="font-bold text-slate-900 text-sm">{overview?.exchangeRequests ?? 0}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-amber-800">
                <span className="font-medium">Accepted Exchanges:</span>
                <span className="font-bold text-sm">{overview?.acceptedExchanges ?? 0}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-800">
                <span className="font-medium">Completed Exchanges:</span>
                <span className="font-bold text-sm">{overview?.completedExchanges ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            ℹ️ All exchange counts are queried directly from SQLite `exchanges` table.
          </div>
        </div>
      </div>
    </div>
  );
}
