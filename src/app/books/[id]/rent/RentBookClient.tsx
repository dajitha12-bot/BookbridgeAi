'use client';

import React, { useState } from 'react';
import { Book } from '../../../../types';
import { createRentalAction } from '../../../../actions/rentalActions';
import { useRouter } from 'next/navigation';
import { Calendar, CreditCard, Shield, Info, ArrowLeft, Truck, Check, MapPin } from 'lucide-react';
import Link from 'next/link';

interface RentBookClientProps {
  book: Book;
}

export default function RentBookClient({ book }: RentBookClientProps) {
  const router = useRouter();
  
  const [duration, setDuration] = useState<number>(14);
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fee calculation math
  const baseFee = 50;
  const ratePerDay = 10;
  const securityDeposit = 100;
  const rentalFee = duration * ratePerDay;
  const totalAmount = baseFee + rentalFee + securityDeposit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    if (paymentMethod === 'ONLINE') {
      if (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
        setError('Please fill in valid credit card information.');
        setIsPending(false);
        return;
      }
    }

    const res = await createRentalAction(book.id, duration, paymentMethod, deliveryMethod);

    if (res.success) {
      alert(`Rental requested successfully! Total amount: ₹${totalAmount}.`);
      router.push('/dashboard/rentals');
      router.refresh();
    } else {
      setError(res.error || 'Failed to request rental.');
    }
    setIsPending(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-slate-800 font-sans">
      {/* Back button */}
      <div>
        <Link
          href={`/books/${book.id}`}
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Book Details</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        {/* Title Banner */}
        <div className="bg-[#0f172a] text-white p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Book Rental Center</span>
          </div>
          <h2 className="text-xl font-bold">Configure Rental Plan</h2>
          <p className="text-xs text-slate-400 mt-1">Specify rental duration, delivery option, and finalize deposit payment</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Book Summary Card */}
          <div className="flex items-start space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {book.imageUrl ? (
              <img src={book.imageUrl} alt={book.title} className="w-16 h-20 object-cover rounded-lg border border-slate-200" />
            ) : (
              <div className="w-16 h-20 bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-400">B</div>
            )}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                {book.category}
              </span>
              <h3 className="font-extrabold text-slate-800 text-sm">{book.title}</h3>
              <p className="text-xs text-slate-500">by {book.author}</p>
              <div className="text-[10px] text-slate-400 pt-0.5">Condition: <span className="font-bold uppercase">{book.condition.replace('_', ' ')}</span></div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2.5 text-rose-600 text-xs font-semibold animate-shake">
              <Info className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Duration Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Rental Duration (Days)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDuration(days)}
                    className={`py-3 px-4 border rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center space-y-1 ${
                      duration === days
                        ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <span className="text-base">{days} Days</span>
                    <span className="text-[9px] text-slate-400 font-medium">₹{days * ratePerDay} (₹10/day)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Handover Method Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Handover Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('DELIVERY')}
                  className={`p-4 border rounded-xl font-bold text-xs text-left transition-all space-y-1 ${
                    deliveryMethod === 'DELIVERY'
                      ? 'border-blue-600 bg-blue-50/40 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Home Delivery (Assign Staff)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Assigned delivery staff picks up book parcel from owner and delivers to your address.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('PICKUP')}
                  className={`p-4 border rounded-xl font-bold text-xs text-left transition-all space-y-1 ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-blue-600 bg-blue-50/40 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Self / Offline Pickup</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Meet book owner directly at designated area in {book.city} for instant offline pickup.
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Fee breakdown */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3 font-sans">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Base Service Fee</span>
                <span>₹{baseFee}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Rental Duration Fee ({duration} days)</span>
                <span>₹{rentalFee}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium pb-2 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <span>Refundable Security Deposit</span>
                  <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Returned</span>
                </span>
                <span>₹{securityDeposit}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-800">
                <span>Total Calculated Payment</span>
                <span className="text-blue-600 text-base">₹{totalAmount}</span>
              </div>
            </div>

            {/* 4. Payment method selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Payment Method</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    className="text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-200"
                  />
                  <span>Online Demo Payment</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-200"
                  />
                  <span>Pay on Delivery / Pickup (COD)</span>
                </label>
              </div>
            </div>

            {/* 5. Online payment demo fields */}
            {paymentMethod === 'ONLINE' && (
              <div className="border border-slate-100 p-5 rounded-xl space-y-4 bg-slate-50/50 animate-fade-in">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold border-b border-slate-100 pb-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Demo Credit Card Input (Any number is accepted)</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Card Number</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="4111 2222 3333 4444"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">CVV</label>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white font-extrabold rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-white" />
              <span>{isPending ? 'Processing Agreement...' : `Confirm Rental Agreement (Pay ₹${totalAmount})`}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
