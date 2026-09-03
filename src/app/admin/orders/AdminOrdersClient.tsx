'use client';

import React, { useState } from 'react';
import { ShoppingBag, Truck, MapPin, CheckCircle2, UserCheck, DollarSign } from 'lucide-react';
import { assignStaffAction } from '../../../actions/orderActions';

interface AdminOrdersClientProps {
  initialOrders: any[];
  staffList: any[];
}

export default function AdminOrdersClient({ initialOrders, staffList }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newCharge, setNewCharge] = useState<number>(60);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  const handleConfirmOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'CONFIRMED' } : o))
    );
    alert(`Order #${orderId.slice(0, 8)} confirmed successfully!`);
    setSelectedOrder(null);
  };

  const handleUpdateCharge = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, deliveryCharge: newCharge } : o))
    );
    alert(`Delivery charge updated to ₹${newCharge} for order #${orderId.slice(0, 8)}`);
    setSelectedOrder(null);
  };

  const handleAssignStaff = async (orderId: string) => {
    if (!selectedStaffId) {
      alert('Please select a delivery staff partner to assign.');
      return;
    }
    try {
      const res = await assignStaffAction(orderId, selectedStaffId);
      if (res.success) {
        const staffObj = staffList.find((s) => s.userId === selectedStaffId);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  orderStatus: 'CONFIRMED',
                  assignedStaffName: staffObj?.name || 'Assigned Staff',
                }
              : o
          )
        );
        alert('Delivery staff partner assigned successfully!');
        setSelectedOrder(null);
      } else {
        alert(res.error || 'Failed to assign staff.');
      }
    } catch (e) {
      alert('An error occurred.');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <ShoppingBag className="w-5.5 h-5.5 text-blue-600" />
            <span>Platform Transaction Orders & Dispatch</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Calculate distance-based delivery charges, confirm order requests, and assign courier staff partners.
          </p>
        </div>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          Total Orders: {orders.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
            <thead>
              <tr className="font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Buyer / Seller</th>
                <th className="p-4">Book Price</th>
                <th className="p-4">Delivery Fee</th>
                <th className="p-4">Method</th>
                <th className="p-4">Assigned Staff</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">#{o.id.slice(0, 8)}</td>
                  <td className="p-4 font-bold text-slate-800 truncate max-w-[150px]">
                    {o.book?.title || 'Engineering Textbook'}
                  </td>
                  <td className="p-4 text-[11px]">
                    <div>B: <span className="font-bold">{o.buyerName}</span></div>
                    <div>S: <span className="font-bold">{o.sellerName}</span></div>
                  </td>
                  <td className="p-4 font-bold">₹{o.amount}</td>
                  <td className="p-4 font-extrabold text-blue-600">
                    {o.deliveryMethod === 'PICKUP' ? '₹0' : `₹${o.deliveryCharge}`}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.deliveryMethod === 'DELIVERY' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {o.deliveryMethod}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-semibold">{o.assignedStaffName}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      o.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      o.orderStatus === 'CONFIRMED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setNewCharge(o.deliveryCharge || 60);
                      }}
                      className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold hover:bg-blue-700 transition-colors"
                    >
                      Manage Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Order Action Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">Admin Dispatch Center #{selectedOrder.id.slice(0, 8)}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            {/* Distance & Delivery Charge Rule Calculator */}
            {selectedOrder.deliveryMethod === 'DELIVERY' && (
              <div className="bg-blue-50/50 p-4 rounded-xl space-y-2 border border-blue-100 text-xs">
                <h4 className="font-extrabold text-blue-700 uppercase tracking-wider text-[10px]">Location Distance Rule & Delivery Charge</h4>
                <p className="text-slate-600">
                  Seller: <strong>{selectedOrder.sellerArea}, {selectedOrder.sellerCity}</strong>
                  <br />
                  Buyer: <strong>{selectedOrder.buyerArea}, {selectedOrder.buyerCity}</strong>
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <label className="font-bold text-slate-700">Set Delivery Charge (₹):</label>
                  <input
                    type="number"
                    value={newCharge}
                    onChange={(e) => setNewCharge(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-bold bg-white text-slate-900"
                  />
                  <button
                    onClick={() => handleUpdateCharge(selectedOrder.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-[11px] font-bold hover:bg-blue-700"
                  >
                    Save Charge
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 pt-1">Distance Rules: 0-5km = ₹30 | 5-10km = ₹40 | 10-20km = ₹60 | 20-30km = ₹80</div>
              </div>
            )}

            {/* Assign Staff Selection */}
            {selectedOrder.deliveryMethod === 'DELIVERY' && (
              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-700 block">Assign Available Delivery Staff Partner:</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="">-- Select Delivery Staff --</option>
                  {staffList.map((s: any) => (
                    <option key={s.userId} value={s.userId}>
                      {s.name} ({s.city} - {s.serviceArea})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignStaff(selectedOrder.id)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors"
                >
                  Assign Selected Delivery Staff Partner
                </button>
              </div>
            )}

            {/* Confirm Order Button */}
            <div className="border-t border-slate-100 pt-3 flex justify-between gap-2">
              <button
                onClick={() => handleConfirmOrder(selectedOrder.id)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
              >
                Confirm Order Status
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
