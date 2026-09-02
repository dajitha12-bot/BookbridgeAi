'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOrders } from '../../hooks/useOrders';
import { 
  DollarSign, 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  ShoppingBag,
  AlertCircle
} from 'lucide-react';

interface SalesClientProps {
  initialSales: any[];
}

export default function SalesClient({ initialSales }: SalesClientProps) {
  const router = useRouter();
  const { confirmPickup } = useOrders();
  const [sales, setSales] = useState(initialSales);

  const handleConfirmPickupHandover = async (orderId: string) => {
    if (!confirm('Are you sure you have handed over the book to the buyer face-to-face?')) return;
    const res = await confirmPickup(orderId);
    if (res.success) {
      alert('Handover confirmed! Sale is complete.');
      setSales(prev => prev.map(s => s.id === orderId ? { ...s, orderStatus: 'DELIVERED', paymentStatus: 'PAID' } : s));
    } else {
      alert(res.error || 'Failed to confirm handover.');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans">
      <div>
        <h1 className="text-xl font-bold">My Sales & Transactions</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor purchases made by others on your listings and coordinate shipping.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
        {sales.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm space-y-3">
            <DollarSign className="w-12 h-12 mx-auto text-slate-300 bg-sky-50 rounded-full p-2.5" />
            <h3 className="font-bold text-slate-700">No Sales Logged</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Your books haven't been purchased by anyone yet. Keep listing new books to find buyers!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 divide-y divide-slate-100">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Book Title</th>
                  <th className="pb-3">Buyer Name</th>
                  <th className="pb-3">Earnings</th>
                  <th className="pb-3">Handover</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="py-2.5">
                    <td className="py-3.5 font-semibold text-slate-500">#{sale.id.slice(0, 8)}</td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800">{sale.book.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Date: {new Date(sale.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 text-xs">
                      <div className="font-semibold text-slate-700">{sale.buyer.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Phone: {sale.buyer.phone || 'N/A'}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800">₹{sale.amount}</div>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-sm">
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        sale.deliveryMethod === 'DELIVERY' ? 'text-indigo-500' : 'text-amber-600'
                      }`}>
                        {sale.deliveryMethod === 'DELIVERY' ? <Truck className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                        {sale.deliveryMethod}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                        sale.orderStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                        'bg-sky-50 text-sky-600'
                      }`}>
                        {sale.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs">
                      {sale.deliveryMethod === 'PICKUP' && sale.orderStatus === 'READY_FOR_PICKUP' && (
                        <button
                          onClick={() => handleConfirmPickupHandover(sale.id)}
                          className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-[10px] font-bold transition-colors"
                        >
                          Confirm Handover
                        </button>
                      )}
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
