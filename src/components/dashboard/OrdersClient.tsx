'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOrders } from '../../hooks/useOrders';
import { addReviewAction } from '../../actions/reviewActions';
import { 
  ShoppingBag, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Star, 
  Clock, 
  MessageSquare,
  AlertCircle,
  Eye,
  UserCheck,
  Building
} from 'lucide-react';

interface OrdersClientProps {
  userId: string;
  role: string;
  initialOrders: any[];
}

export default function OrdersClient({
  userId,
  role,
  initialOrders
}: OrdersClientProps) {
  const router = useRouter();
  const { confirmPickup } = useOrders();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Review submission state
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleConfirmPickup = async (orderId: string) => {
    if (!confirm('Are you sure you have completed the pickup and received the book?')) return;
    const res = await confirmPickup(orderId);
    if (res.success) {
      alert('Pickup confirmed successfully! Transaction finalized.');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'DELIVERED', paymentStatus: 'PAID' } : o));
    } else {
      alert(res.error || 'Failed to confirm pickup.');
    }
  };

  const handleOpenReviewModal = (order: any) => {
    setReviewOrderId(order.id);
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrderId) return;
    
    const order = orders.find(o => o.id === reviewOrderId);
    if (!order) return;

    setIsSubmittingReview(true);
    try {
      const res = await addReviewAction(
        order.sellerId,
        order.bookId,
        order.id,
        rating,
        comment,
        'SELLER'
      );

      if (res.success) {
        alert('Thank you! Review submitted successfully.');
        setReviewOrderId(null);
        setOrders(prev => prev.map(o => o.id === reviewOrderId ? { ...o, hasReviewed: true } : o));
      } else {
        alert(res.error || 'Failed to submit review.');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-12">
      <div>
        <h1 className="text-xl font-bold">
          {role === 'ADMIN' ? 'All Platform Orders' : 'My Orders & Purchases'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {role === 'ADMIN' ? 'Manage and monitor all platform purchases and transactions.' : 'Track shipment progress, delivery charges, assigned courier staff, and offline pickup locations.'}
        </p>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-700">No Orders Placed</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              You haven't purchased any books yet. Browse the market to find interesting items!
            </p>
            <Link href="/browse" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-100">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Book Title</th>
                  <th className="pb-3">Book Price</th>
                  <th className="pb-3">Delivery Fee</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Details & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((order) => {
                  const deliveryFee = order.deliveryMethod === 'PICKUP' ? 0 : (order.deliveryCharge || 50);
                  const total = order.amount + deliveryFee;
                  const staff = order.deliveries?.[0]?.staff;

                  return (
                    <tr key={order.id} className="py-2.5 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">#{order.id.slice(0, 8)}</td>
                      <td className="py-3.5">
                        <div className="font-bold text-slate-800">{order.book?.title || 'Book Parcel'}</div>
                        <div className="text-[10px] text-slate-400">Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-700">₹{order.amount}</td>
                      <td className="py-3.5 text-slate-600 font-semibold">
                        {order.deliveryMethod === 'PICKUP' ? '₹0 (Pickup)' : `₹${deliveryFee}`}
                      </td>
                      <td className="py-3.5 font-extrabold text-blue-600">₹{total}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded ${
                          order.deliveryMethod === 'DELIVERY' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {order.deliveryMethod === 'DELIVERY' ? <Truck className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {order.deliveryMethod}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          order.orderStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-md text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Order</span>
                        </button>
                        {order.deliveryMethod === 'PICKUP' && order.orderStatus === 'READY_FOR_PICKUP' && order.buyerId === userId && (
                          <button
                            onClick={() => handleConfirmPickup(order.id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                          >
                            Confirm Pickup
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expanded Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Order Details #{selectedOrder.id}</h3>
                <p className="text-[10px] text-slate-400">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Book Price ({selectedOrder.book?.title}):</span>
                <span className="font-bold text-slate-800">₹{selectedOrder.amount}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Delivery Charge (Set by Admin):</span>
                <span className="font-bold text-slate-800">
                  {selectedOrder.deliveryMethod === 'PICKUP' ? '₹0 (Offline Pickup)' : `₹${selectedOrder.deliveryCharge || 50}`}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{selectedOrder.amount + (selectedOrder.deliveryMethod === 'PICKUP' ? 0 : (selectedOrder.deliveryCharge || 50))}</span>
              </div>
            </div>

            {/* Delivery Method Specifics */}
            {selectedOrder.deliveryMethod === 'DELIVERY' ? (
              <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center space-x-2 font-bold text-blue-700">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Assigned Delivery Staff Partner</span>
                </div>
                {selectedOrder.deliveries?.[0]?.staff ? (
                  <div className="space-y-1 text-slate-700 font-medium pl-6">
                    <p><strong>Staff Name:</strong> {selectedOrder.deliveries[0].staff.name}</p>
                    <p><strong>Staff ID:</strong> {selectedOrder.deliveries[0].staff.id || 'DS003'}</p>
                    <p><strong>Contact:</strong> {selectedOrder.deliveries[0].staff.phone || '9876543210'}</p>
                    <p><strong>Current Status:</strong> <span className="font-bold text-emerald-600">{selectedOrder.orderStatus}</span></p>
                  </div>
                ) : (
                  <p className="text-slate-500 pl-6">Waiting for Admin to assign nearby courier partner...</p>
                )}
              </div>
            ) : (
              <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-xl space-y-3 text-xs">
                <div className="flex items-center space-x-2 font-bold text-amber-800">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>Offline Pickup Locations</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <p className="font-bold text-amber-900 mb-1">Owner / Seller Location:</p>
                    <p className="font-semibold text-slate-800">{selectedOrder.seller?.name || 'Ajitha Priya'}</p>
                    <p className="text-slate-500">Adyar, Chennai</p>
                    <p className="text-slate-500">Pincode: 600020</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <p className="font-bold text-amber-900 mb-1">Buyer Location:</p>
                    <p className="font-semibold text-slate-800">{selectedOrder.buyer?.name || 'Rahul Subramanian'}</p>
                    <p className="text-slate-500">Anna Nagar, Chennai</p>
                    <p className="text-slate-500">Pincode: 600040</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
