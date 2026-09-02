'use client';

import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  ShoppingBag, 
  RefreshCw, 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { 
  getDeliveryStaffRecommendationsAction, 
  assignStaffAction 
} from '../../actions/orderActions';

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalBooks: number;
    totalOrders: number;
    totalExchanges: number;
    activeDeliveries: number;
    completedDeliveries: number;
    revenue: number;
  };
  recentOrders: any[];
  unassignedDeliveries: any[];
  refetch: () => Promise<void>;
}

export default function AdminDashboardView({
  stats,
  recentOrders,
  unassignedDeliveries,
  refetch
}: AdminDashboardProps) {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [assigningStaffId, setAssigningStaffId] = useState<string | null>(null);

  const handleOpenAssignModal = async (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setLoadingStaff(true);
    try {
      const res = await getDeliveryStaffRecommendationsAction(deliveryId);
      if (res.success && res.recommendations) {
        setRecommendations(res.recommendations);
      } else {
        alert(res.error || 'Failed to fetch recommendations.');
        setSelectedDeliveryId(null);
      }
    } catch (e) {
      alert('An error occurred.');
      setSelectedDeliveryId(null);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAssignStaff = async (staffId: string) => {
    if (!selectedDeliveryId) return;
    setAssigningStaffId(staffId);
    try {
      const res = await assignStaffAction(selectedDeliveryId, staffId);
      if (res.success) {
        alert('Delivery staff assigned successfully.');
        setSelectedDeliveryId(null);
        await refetch();
      } else {
        alert(res.error || 'Failed to assign staff.');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setAssigningStaffId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview, logistics control, and system reports.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-sky-600 bg-sky-50' },
          { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Exchanges', value: stats.totalExchanges, icon: RefreshCw, color: 'text-amber-600 bg-amber-50' },
          { label: 'Active Shipments', value: stats.activeDeliveries, icon: Truck, color: 'text-rose-600 bg-rose-50' },
          { label: 'Completed Deliveries', value: stats.completedDeliveries, icon: CheckCircle2, color: 'text-teal-600 bg-teal-50' },
          { label: 'Total Revenue', value: `₹${stats.revenue}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{stat.value}</div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SVG Sales Over Time */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Orders Count Over Time</h3>
          <div className="h-64 w-full flex items-end justify-between pt-6 border-b border-l border-slate-100 px-4 relative">
            <div className="absolute left-2 top-2 text-[10px] text-slate-400">Total orders</div>
            {/* Custom SVG Bar Chart */}
            {[
              { label: 'Jan', val: 20 },
              { label: 'Feb', val: 35 },
              { label: 'Mar', val: 55 },
              { label: 'Apr', val: 40 },
              { label: 'May', val: 75 },
              { label: 'Jun', val: 90 },
              { label: 'Jul', val: 65 },
              { label: 'Aug', val: 80 }
            ].map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center w-full group">
                <div 
                  className="bg-sky-400 hover:bg-sky-500 rounded-t-sm w-8 transition-all duration-300 relative group"
                  style={{ height: `${(bar.val / 100) * 180}px` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-1.5 rounded-sm shadow-xs transition-opacity duration-300 pointer-events-none">
                    {bar.val}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-medium">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SVG Popular Categories Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Books listed by Category</h3>
          <div className="space-y-3 pt-2">
            {[
              { category: 'Programming', count: 12, percent: '100%' },
              { category: 'Artificial Intelligence', count: 8, percent: '66%' },
              { category: 'Database', count: 6, percent: '50%' },
              { category: 'Web Development', count: 5, percent: '41%' },
              { category: 'Novels', count: 4, percent: '33%' }
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>{cat.category}</span>
                  <span className="font-semibold">{cat.count} books</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: cat.percent }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logistics & Delivery Staff Assignment */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-lg font-bold">Unassigned Deliveries (Requires staff selection)</h2>
        {unassignedDeliveries.length === 0 ? (
          <div className="text-slate-400 text-sm text-center py-6">All home deliveries have been successfully assigned.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 divide-y divide-slate-100">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Book</th>
                  <th className="pb-3">Pickup Address</th>
                  <th className="pb-3">Delivery Address</th>
                  <th className="pb-3">Workforce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unassignedDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="py-2.5">
                    <td className="py-3.5 font-semibold text-sky-600">#{delivery.order.id.slice(0, 8)}</td>
                    <td className="py-3.5 font-semibold text-slate-800">{delivery.order.book.title}</td>
                    <td className="py-3.5 text-xs truncate max-w-xs">{delivery.pickupAddress}</td>
                    <td className="py-3.5 text-xs truncate max-w-xs">{delivery.deliveryAddress}</td>
                    <td className="py-3.5">
                      <button
                        onClick={() => handleOpenAssignModal(delivery.id)}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Assign Staff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-lg font-bold">Recent Orders Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 divide-y divide-slate-100">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Book</th>
                <th className="pb-3">Buyer</th>
                <th className="pb-3">Seller</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Delivery</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td className="py-3.5 font-semibold text-slate-500">#{order.id.slice(0, 8)}</td>
                  <td className="py-3.5 font-medium text-slate-800">{order.book.title}</td>
                  <td className="py-3.5">{order.buyer.name}</td>
                  <td className="py-3.5">{order.seller.name}</td>
                  <td className="py-3.5">
                    <span className="text-xs font-semibold text-slate-600">{order.paymentMethod}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="text-xs font-semibold text-slate-600">{order.deliveryMethod}</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                      order.orderStatus === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Assignment Modal */}
      {selectedDeliveryId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Recommend Delivery Staff</h3>
              <button 
                onClick={() => setSelectedDeliveryId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {loadingStaff ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                Evaluating available staff scoring parameters...
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <p className="text-xs text-slate-500">
                  Scoring metrics: Availability (40%), Service Area coverage (30%), Workload index (20%), and Proximity to pickup (10%).
                </p>
                {recommendations.map((rec) => (
                  <div key={rec.staffId} className="bg-sky-50/30 border border-sky-100/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-sm">{rec.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'
                        }`}>
                          {rec.score}% Match Score
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 space-y-1">
                        {rec.reasons.map((reason: string, rIdx: number) => (
                          <div key={rIdx}>{reason}</div>
                        ))}
                      </div>
                    </div>
                    <button
                      disabled={assigningStaffId === rec.staffId}
                      onClick={() => handleAssignStaff(rec.staffId)}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors self-start sm:self-center shadow-xs"
                    >
                      {assigningStaffId === rec.staffId ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
