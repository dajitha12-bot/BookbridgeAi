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
  CheckCircle, 
  Star, 
  Clock, 
  MessageSquare,
  AlertCircle
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
      // Refresh local list
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
        // Mark as reviewed locally
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
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans">
      <div>
        <h1 className="text-xl font-bold">
          {role === 'ADMIN' ? 'All Platform Orders' : 'My Orders & Purchases'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {role === 'ADMIN' ? 'Manage and monitor all platform purchases and transactions.' : 'Track shipment progress, log pickups, and review sellers.'}
        </p>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-700">No Orders Placed</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              You haven't purchased any books yet. Browse the market to find interesting items!
            </p>
            <Link href="/browse" className="inline-block px-4 py-2 bg-sky-500 text-white rounded-lg text-xs font-bold shadow-xs">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 divide-y divide-slate-100">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Book Title</th>
                  <th className="pb-3">{role === 'ADMIN' ? 'Buyer / Seller' : 'Seller'}</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Handover</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="py-2.5">
                    <td className="py-3.5 font-semibold text-slate-500">#{order.id.slice(0, 8)}</td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800">{order.book.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 text-xs">
                      {role === 'ADMIN' ? (
                        <div>
                          <div>B: <span className="font-semibold">{order.buyer.name}</span></div>
                          <div className="mt-0.5">S: <span className="font-semibold">{order.seller.name}</span></div>
                        </div>
                      ) : (
                        <span>{order.seller.name}</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800">₹{order.amount}</div>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-sm">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        order.deliveryMethod === 'DELIVERY' ? 'text-indigo-500' : 'text-amber-600'
                      }`}>
                        {order.deliveryMethod === 'DELIVERY' ? <Truck className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                        {order.deliveryMethod}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                        order.orderStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                        'bg-sky-50 text-sky-600 animate-pulse'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs">
                      <div className="flex flex-col gap-1.5">
                        {/* Option to confirm pickup */}
                        {order.deliveryMethod === 'PICKUP' && order.orderStatus === 'READY_FOR_PICKUP' && order.buyerId === userId && (
                          <button
                            onClick={() => handleConfirmPickup(order.id)}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-[10px] font-bold transition-colors"
                          >
                            Confirm Pickup
                          </button>
                        )}
                        
                        {/* Option to write a review */}
                        {order.orderStatus === 'DELIVERED' && order.buyerId === userId && !order.hasReviewed && (
                          <button
                            onClick={() => handleOpenReviewModal(order)}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-md text-[10px] font-bold transition-colors flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Rate Seller
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewOrderId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleSubmitReview}
            className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Write a Seller Review</h3>
              <button 
                type="button" 
                onClick={() => setReviewOrderId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Rating selection (1 to 5) */}
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Rating Star Score</label>
              <div className="flex justify-center space-x-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded-md text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-7 h-7 ${star <= rating ? 'fill-current' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Your Review comments</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with the seller and the book condition..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
              />
            </div>

            <div className="border-t border-slate-100 pt-3.5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewOrderId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
