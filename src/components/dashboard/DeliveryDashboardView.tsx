'use client';

import React, { useState } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  CheckCircle,
  Clock,
  Navigation
} from 'lucide-react';
import { updateDeliveryStatusAction } from '../../actions/orderActions';

interface DeliveryDashboardProps {
  staff: any;
  deliveries: any[];
  refetch: () => Promise<void>;
}

export default function DeliveryDashboardView({
  staff,
  deliveries,
  refetch
}: DeliveryDashboardProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Group deliveries
  const activeDelivery = deliveries.find(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');
  const pendingAssignment = deliveries.filter(d => d.status === 'ASSIGNED');
  const completedDeliveries = deliveries.filter(d => d.status === 'DELIVERED');

  const handleStatusUpdate = async (deliveryId: string, nextStatus: string) => {
    try {
      setUpdatingId(deliveryId);
      const res = await updateDeliveryStatusAction(deliveryId, nextStatus);
      if (res.success) {
        alert(`Status updated successfully to: ${nextStatus}`);
        await refetch();
      } else {
        alert(res.error || 'Failed to update delivery status.');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Welcome & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Hello, {staff.name}. Here is your delivery load for today.</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${staff.availability ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {staff.availability ? '● Available for tasks' : '○ Offline'}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-600 border border-sky-100">
            Workload: {staff.activeDeliveries} active
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-500 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{pendingAssignment.length}</div>
            <div className="text-xs text-slate-500 font-medium">New Assignments</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{activeDelivery ? 1 : 0}</div>
            <div className="text-xs text-slate-500 font-medium">Active Deliveries</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-50 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{completedDeliveries.length}</div>
            <div className="text-xs text-slate-500 font-medium">Completed Deliveries</div>
          </div>
        </div>
      </div>

      {/* Active Delivery Flow */}
      {activeDelivery ? (
        <div className="bg-white p-6 rounded-xl border-l-4 border-l-sky-500 border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">ACTIVE DELIVERY</span>
              <h2 className="text-lg font-bold text-slate-800 mt-2">{activeDelivery.order.book.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Order ID: {activeDelivery.order.id}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block">Payment Method</span>
              <span className="text-sm font-bold text-slate-800">{activeDelivery.order.paymentMethod}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Seller Pickup Address</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="font-semibold text-slate-800 text-sm">{activeDelivery.order.seller.name}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{activeDelivery.pickupAddress}</div>
                <div className="flex items-center text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <span>{activeDelivery.order.seller.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-rose-500" />
                <span>Buyer Delivery Address</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="font-semibold text-slate-800 text-sm">{activeDelivery.order.buyer.name}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{activeDelivery.deliveryAddress}</div>
                <div className="flex items-center text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <span>{activeDelivery.order.buyer.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Actions */}
          <div className="bg-sky-50/50 p-5 rounded-lg border border-sky-100/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Current Status: {activeDelivery.status}</h3>
            
            <div className="flex flex-wrap gap-2">
              {activeDelivery.status === 'ASSIGNED' && (
                <button
                  disabled={updatingId !== null}
                  onClick={() => handleStatusUpdate(activeDelivery.id, 'REACHED_SELLER')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Reached Seller
                </button>
              )}
              {activeDelivery.status === 'REACHED_SELLER' && (
                <button
                  disabled={updatingId !== null}
                  onClick={() => handleStatusUpdate(activeDelivery.id, 'PICKED_UP')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Book Picked Up
                </button>
              )}
              {activeDelivery.status === 'PICKED_UP' && (
                <button
                  disabled={updatingId !== null}
                  onClick={() => handleStatusUpdate(activeDelivery.id, 'IN_TRANSIT')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  In Transit
                </button>
              )}
              {activeDelivery.status === 'IN_TRANSIT' && (
                <button
                  disabled={updatingId !== null}
                  onClick={() => handleStatusUpdate(activeDelivery.id, 'OUT_FOR_DELIVERY')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Out for Delivery
                </button>
              )}
              {activeDelivery.status === 'OUT_FOR_DELIVERY' && (
                <button
                  disabled={updatingId !== null}
                  onClick={() => handleStatusUpdate(activeDelivery.id, 'DELIVERED')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Confirm Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl text-center py-8 text-slate-500 text-sm">
          🎉 No active deliveries! You are all caught up for today.
        </div>
      )}

      {/* Delivery History */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-lg font-bold">Delivery History</h2>
        {completedDeliveries.length === 0 ? (
          <div className="text-slate-400 text-sm text-center py-6">No completed deliveries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 divide-y divide-slate-100">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Book</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Paid amount</th>
                  <th className="pb-3">Completed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedDeliveries.map((item) => (
                  <tr key={item.id} className="py-2.5">
                    <td className="py-3.5 font-semibold text-sky-600">#{item.order.id.slice(0, 8)}</td>
                    <td className="py-3.5 font-medium text-slate-800">{item.order.book.title}</td>
                    <td className="py-3.5">{item.order.buyer.name} ({item.order.buyer.profile?.city})</td>
                    <td className="py-3.5 font-semibold text-slate-800">₹{item.order.amount}</td>
                    <td className="py-3.5 text-xs text-slate-400">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
