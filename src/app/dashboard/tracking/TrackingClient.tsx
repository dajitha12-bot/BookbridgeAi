'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  User, 
  Receipt, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Package,
  Phone,
  ArrowRight,
  Zap,
  ChevronDown,
  ChevronUp,
  Store,
  Calendar,
  Sparkles
} from 'lucide-react';
import { advanceScheduledDeliveryStageAction } from '../../../actions/deliveryActions';

export interface TrackingItemProps {
  order: any;
  book: any;
  delivery: any;
  payment: any;
  isBuyer: boolean;
  otherUser: any;
  staffUser: any;
  deliveryFee: number;
  totalAmount: number;
  trackingEvents: any[];
}

export default function TrackingClient({ initialTrackingItems }: { initialTrackingItems: TrackingItemProps[] }) {
  const [items, setItems] = useState<TrackingItemProps[]>(initialTrackingItems);
  const [advancingOrderId, setAdvancingOrderId] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleEvents = (orderId: string) => {
    setExpandedEvents((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleAdvanceStage = async (orderId: string) => {
    setAdvancingOrderId(orderId);
    setToastMessage(null);
    try {
      const res = await advanceScheduledDeliveryStageAction(orderId);
      if (res.success) {
        setToastMessage(`⚡ Demo Simulation: ${res.stageName || res.message || 'Stage updated successfully!'}`);
        // Reload page data dynamically
        window.location.reload();
      } else {
        setToastMessage(`❌ Error: ${res.error || 'Could not advance stage.'}`);
      }
    } catch (err: any) {
      setToastMessage(`❌ Error: ${err.message || 'Failed to simulate progression.'}`);
    } finally {
      setAdvancingOrderId(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Timeline Stage Definitions
  const ALL_STAGES = [
    { key: 'PLACED', title: 'Order Placed', label: 'Ordered', icon: Package },
    { key: 'WAITING_ADMIN', title: 'Waiting Admin Confirmation', label: 'Admin Review', icon: Clock },
    { key: 'CONFIRMED', title: 'Admin Confirmed', label: 'Confirmed', icon: ShieldCheck },
    { key: 'ASSIGNED', title: 'Staff Assigned', label: 'Staff Assigned', icon: User },
    { key: 'ACCEPTED', title: 'Accepted by Courier', label: 'Accepted', icon: CheckCircle2 },
    { key: 'PICKED_UP', title: 'Order Packed & Picked Up', label: 'Picked Up', icon: Package },
    { key: 'IN_TRANSIT', title: 'In Transit', label: 'In Transit', icon: Truck },
    { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', title: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  // Helper to map order + delivery status to current stage index (0 to 8)
  const getStageIndex = (orderStatus: string, deliveryStatus: string | null) => {
    if (orderStatus === 'DELIVERED' || deliveryStatus === 'DELIVERED') return 8;
    if (deliveryStatus === 'OUT_FOR_DELIVERY') return 7;
    if (deliveryStatus === 'IN_TRANSIT' || orderStatus === 'IN_TRANSIT') return 6;
    if (deliveryStatus === 'PICKED_UP') return 5;
    if (deliveryStatus === 'ACCEPTED') return 4;
    if (deliveryStatus === 'ASSIGNED' || orderStatus === 'CONFIRMED') return 3;
    if (orderStatus === 'PENDING' && deliveryStatus) return 1; // Waiting for Admin Confirmation
    return 0; // Order Placed
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-sky-500 flex items-center space-x-3 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <span>Order & Visual Delivery Tracking Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time visual tracking powered by SQLite, automated notification dispatches & 6-day demo simulation.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 font-bold">
          <Package className="w-4 h-4 text-blue-600" />
          <span>Active Tracking: {items.length} Orders</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 space-y-4 shadow-xs">
          <Truck className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-base">No Orders Being Tracked</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You don't have any active package shipments scheduled at this moment.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {items.map(({ order, book, delivery, payment, isBuyer, otherUser, staffUser, deliveryFee, totalAmount, trackingEvents }) => {
            const isPaid = order.paymentStatus === 'PAID' || payment?.status === 'PAID';
            const isCod = order.paymentStatus === 'COD' || payment?.method === 'COD';
            const deliveryStatus = delivery?.status || null;
            const activeStageIndex = getStageIndex(order.orderStatus, deliveryStatus);
            const currentStageObj = ALL_STAGES[activeStageIndex];
            const isDelivered = activeStageIndex === 8;

            // Estimated Delivery Date (Order date + 5 days)
            const orderDateObj = new Date(order.createdAt);
            const estDeliveryDateObj = new Date(orderDateObj.getTime() + 5 * 24 * 60 * 60 * 1000);
            const estDeliveryFormatted = estDeliveryDateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            });
            const orderDateFormatted = orderDateObj.toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
            });

            // Calculate progress line percentage
            const progressPercent = Math.min(100, Math.round((activeStageIndex / (ALL_STAGES.length - 1)) * 100));

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6 hover:border-blue-300 transition-all relative overflow-hidden"
              >
                {/* Top Banner Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-extrabold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                      Order #{order.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isBuyer ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {isBuyer ? 'Role: Buyer' : 'Role: Seller'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Demo Stage Advance Button */}
                    {!isDelivered && (
                      <button
                        onClick={() => handleAdvanceStage(order.id)}
                        disabled={advancingOrderId === order.id}
                        className="py-1.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>{advancingOrderId === order.id ? 'Advancing Stage...' : '⚡ Advance 1 Day (Demo Simulation)'}</span>
                      </button>
                    )}

                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isDelivered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isPaid
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {isDelivered
                        ? '✓ Delivered'
                        : isPaid
                        ? 'Prepaid (Waiting Admin Confirmation)'
                        : 'Payment Pending / COD'}
                    </span>
                  </div>
                </div>

                {/* Reference Image Styled Order Header Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-20 bg-white rounded-xl overflow-hidden shadow-xs border border-slate-200 flex-shrink-0 flex items-center justify-center">
                      {book?.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md">
                          {book?.category || 'Book'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Free Easy Returns Available</span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base line-clamp-1">{book?.title || 'Book Title'}</h3>
                      <p className="text-xs text-slate-500 font-medium">by {book?.author || 'Author'} • {isPaid ? 'Prepaid Order' : 'Cash On Delivery'}</p>
                      <p className="text-xs font-extrabold text-slate-800">₹{totalAmount} Total (Book ₹{order.amount} + Delivery ₹{deliveryFee})</p>
                    </div>
                  </div>

                  <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto flex flex-col md:items-end justify-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Stage Status</span>
                    <h4 className="text-base font-extrabold text-blue-700 flex items-center md:justify-end gap-1.5 mt-0.5">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>{currentStageObj.title}</span>
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center md:justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Estimated Delivery by <strong className="text-slate-800 font-bold">{estDeliveryFormatted}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Horizontal Progress Bar & Timeline with Floating Tooltip */}
                <div className="space-y-6 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Shipment Progress Timeline</span>
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      Step {activeStageIndex + 1} of {ALL_STAGES.length}
                    </span>
                  </div>

                  {/* Relative Container for Floating Tooltip & Line */}
                  <div className="relative pt-10 pb-4 px-2">
                    
                    {/* Dark Floating Tooltip Pill pointing down over Active Stage Node */}
                    <div
                      className="absolute -top-1 transition-all duration-500 ease-in-out transform -translate-x-1/2 z-20"
                      style={{ left: `${progressPercent}%` }}
                    >
                      <div className="bg-slate-900 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-1.5 whitespace-nowrap">
                        <Package className="w-3.5 h-3.5 text-blue-400" />
                        <span>{currentStageObj.title}</span>
                      </div>
                      {/* Triangle Pointer */}
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900 mx-auto" />
                    </div>

                    {/* Progress Bar Track */}
                    <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 ease-in-out"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Stage Nodes overlay */}
                    <div className="relative -mt-4 flex justify-between items-center z-10">
                      {ALL_STAGES.map((stage, idx) => {
                        const isCompleted = idx < activeStageIndex;
                        const isActive = idx === activeStageIndex;
                        const isFuture = idx > activeStageIndex;
                        const StageIcon = stage.icon;

                        return (
                          <div key={stage.key} className="flex flex-col items-center group relative">
                            {/* Node Dot / Icon */}
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border-2 ${
                                isCompleted
                                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                                  : isActive
                                  ? 'bg-blue-600 border-white ring-4 ring-blue-200 text-white shadow-md scale-110'
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              ) : isActive ? (
                                <Truck className="w-3.5 h-3.5 text-white animate-pulse" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                              )}
                            </div>

                            {/* Label underneath */}
                            <div className="mt-2 text-center hidden sm:block">
                              <span className={`text-[10px] font-bold block transition-colors ${
                                isActive
                                  ? 'text-blue-700 font-extrabold scale-105'
                                  : isCompleted
                                  ? 'text-slate-700'
                                  : 'text-slate-400'
                              }`}>
                                {stage.label}
                              </span>
                              <span className="text-[9px] text-slate-400 block font-mono">
                                {idx === 0 ? orderDateFormatted : idx === 8 ? estDeliveryFormatted : `Day ${idx + 1}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Grid Section: Address, Staff & Payment details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                  {/* Delivery Address Card */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-xs">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>Delivery Address (Buyer)</span>
                    </div>
                    <div className="text-xs text-slate-700 space-y-0.5 pl-6">
                      <p className="font-bold text-slate-900">{isBuyer ? 'You (Buyer)' : (otherUser?.name || 'Buyer')}</p>
                      <p className="text-slate-600 line-clamp-2">{order.deliveryAddress || 'Registered Buyer Delivery Address, Chennai'}</p>
                      <p className="text-slate-400 text-[11px] font-mono">Contact: {isBuyer ? 'Self' : (otherUser?.phone || 'Provided at checkout')}</p>
                    </div>
                  </div>

                  {/* Pickup / Seller Location Card */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-slate-700 font-extrabold text-xs">
                      <Store className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <span>Pickup Location (Seller)</span>
                    </div>
                    <div className="text-xs text-slate-700 space-y-0.5 pl-6">
                      <p className="font-bold text-slate-900">{isBuyer ? (otherUser?.name || 'Seller') : 'You (Seller)'}</p>
                      <p className="text-slate-600 line-clamp-2">{order.pickupLocation || 'Seller Address / Area, Chennai'}</p>
                      <p className="text-slate-400 text-[11px] font-mono">City: {book?.city || 'Chennai'} ({book?.area || 'Adyar'})</p>
                    </div>
                  </div>

                  {/* Delivery Staff Details Card */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-bold text-xs text-slate-300">Delivery Staff Details</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          staffUser ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {staffUser ? 'Staff Assigned' : 'Awaiting Assignment'}
                        </span>
                      </div>

                      {staffUser ? (
                        <div className="space-y-1.5 pt-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Assigned Staff:</span>
                            <span className="font-bold text-white">{staffUser.name}</span>
                          </div>
                          {staffUser.phone && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Contact Number:</span>
                              <a href={`tel:${staffUser.phone}`} className="text-blue-400 font-bold flex items-center gap-1 hover:underline">
                                <Phone className="w-3 h-3" />
                                {staffUser.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-200/80 leading-relaxed pt-2">
                          Order awaiting administrator approval. Delivery partner will be assigned from active SQLite staff list.
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-2">
                      {payment?.id && isPaid && (
                        <a
                          href={`/api/payments/receipt/${payment.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>PDF Receipt</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggleable Tracking Event Timeline Log */}
                {trackingEvents && trackingEvents.length > 0 && (
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      onClick={() => toggleEvents(order.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 focus:outline-none cursor-pointer"
                    >
                      <span>{expandedEvents[order.id] ? 'Hide Full Tracking History' : `View Tracking Log (${trackingEvents.length} Events)`}</span>
                      {expandedEvents[order.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expandedEvents[order.id] && (
                      <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3 font-sans">
                        <h5 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                          SQLite Event Timeline Log
                        </h5>
                        <div className="space-y-3 relative pl-4 border-l-2 border-slate-200">
                          {trackingEvents.map((evt: any) => (
                            <div key={evt.id} className="relative text-xs space-y-0.5">
                              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-slate-800">{evt.stageName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(evt.eventTime).toLocaleString('en-US', {
                                    month: 'short',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px]">{evt.description}</p>
                              {evt.locationName && (
                                <span className="text-[10px] text-slate-400 font-semibold">Location: {evt.locationName}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
