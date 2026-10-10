"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Receipt,
  CreditCard,
  Clock,
  Sparkles
} from "lucide-react";
import { confirmOrderPaymentAction } from "../../../../actions/orderActions";
function PaymentConfirmClient({ initialData }) {
  const router = useRouter();
  const { order, book, seller, sellerUpiId, buyer, payment, deliveryCharge, totalAmount } = initialData;
  const [buyerUpiId, setBuyerUpiId] = useState(
    buyer.email ? `${buyer.email.split("@")[0]}@upi` : "dajitha12@upi"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(
    payment?.status === "PAID" ? {
      success: true,
      transactionId: payment.transactionId || "DEMO-UPI-PAID",
      paymentId: payment.id
    } : null
  );
  React.useEffect(() => {
    if (payment?.status !== "PAID" && !paymentResult?.success && !isProcessing) {
      setIsProcessing(true);
      const defaultUpi = buyer.email ? `${buyer.email.split("@")[0]}@upi` : "dajitha12@upi";
      confirmOrderPaymentAction(order.id, defaultUpi).then((res) => {
        if (res.success) {
          setPaymentResult({
            success: true,
            transactionId: res.transactionId,
            paymentId: res.paymentId
          });
        } else {
          setPaymentResult({
            success: false,
            error: res.error || "Failed to auto-process payment."
          });
        }
      }).catch((err) => {
        console.error("Auto payment error:", err);
        setPaymentResult({
          success: false,
          error: err.message || "Auto payment process error."
        });
      }).finally(() => {
        setIsProcessing(false);
      });
    }
  }, []);
  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await confirmOrderPaymentAction(order.id, buyerUpiId);
      if (res.success) {
        setPaymentResult({
          success: true,
          transactionId: res.transactionId,
          paymentId: res.paymentId
        });
      } else {
        setPaymentResult({
          success: false,
          error: res.error || "Failed to process payment."
        });
      }
    } catch (err) {
      setPaymentResult({
        success: false,
        error: err.message || "An unexpected error occurred during payment."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {
    /* Header Branding */
  }
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-sky-500/20">
              B
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-white tracking-tight">BookBridge AI</h1>
              <p className="text-xs text-sky-400 font-semibold">Secure Demo Payment Portal</p>
            </div>
          </div>
          <span className="text-xs bg-sky-500/10 text-sky-300 border border-sky-500/20 px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            256-Bit SSL Demo Gateway
          </span>
        </div>

        {
    /* Payment Success View */
  }
        {paymentResult?.success ? <div className="bg-slate-800/90 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white">Payment Successful!</h2>
              <p className="text-xs text-emerald-400 font-semibold">
                Your transaction has been processed and stored in SQLite database.
              </p>
            </div>

            {
    /* Transaction summary card */
  }
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Transaction Reference:</span>
                <code className="font-mono text-emerald-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-emerald-500/20">
                  {paymentResult.transactionId}
                </code>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-bold text-white font-mono">{order.id}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Book Title:</span>
                <span className="font-bold text-slate-200">{book.title}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Seller & UPI:</span>
                <span className="font-bold text-slate-200">{seller.name} ({sellerUpiId})</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-extrabold text-emerald-400 text-sm">₹{totalAmount}</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Order Status:</span>
                <span className="bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                  Waiting for Admin Confirmation
                </span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-amber-500/20 p-3.5 rounded-xl text-[11px] text-amber-200/90 leading-relaxed flex items-start space-x-2">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block">Notice: Delivery Staff Assignment</span>
                Your order is currently awaiting Admin confirmation. Delivery staff will be assigned manually by the administrator.
              </div>
            </div>

            {
    /* Action buttons */
  }
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {paymentResult.paymentId && <a
    href={`/api/payments/receipt/${paymentResult.paymentId}`}
    target="_blank"
    rel="noopener noreferrer"
    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/20"
  >
                  <Receipt className="w-4 h-4" />
                  <span>Download / View PDF Receipt</span>
                </a>}
              <Link
    href="/dashboard/orders"
    className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
  >
                <span>View Order Status</span>
              </Link>
            </div>
          </div> : (
    /* Payment Form View */
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
            
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">Payment Checkout</h2>
                <p className="text-xs text-slate-400">Order #{order.id}</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Demo UPI Payment
              </span>
            </div>

            {paymentResult?.error && <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-rose-300 text-xs font-semibold">
                {paymentResult.error}
              </div>}

            {
      /* Order Item breakdown */
    }
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
                Order Summary
              </h3>

              <div className="flex justify-between text-slate-300">
                <span>Book Title:</span>
                <span className="font-bold text-white">{book.title}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Seller Name:</span>
                <span className="font-bold text-white">{seller.name}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Seller UPI ID:</span>
                <code className="font-mono text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                  {sellerUpiId}
                </code>
              </div>

              <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
                <span>Book Price:</span>
                <span>₹{book.expectedPrice || order.amount}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Delivery Charge:</span>
                <span>₹{deliveryCharge}</span>
              </div>

              <div className="flex justify-between text-sm font-black border-t border-slate-800 pt-2.5 text-white">
                <span className="text-sky-400">Total Payable:</span>
                <span className="text-emerald-400 text-base">₹{totalAmount}</span>
              </div>
            </div>

            {
      /* UPI Payment Input Form */
    }
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Buyer Demo UPI ID
                </label>
                <div className="relative">
                  <input
      type="text"
      required
      value={buyerUpiId}
      onChange={(e) => setBuyerUpiId(e.target.value)}
      placeholder="yourname@upi"
      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
    />
                  <CreditCard className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulated payment mode. Enter any test UPI ID to confirm transaction.
                </p>
              </div>

              <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl text-[11px] text-sky-200 leading-relaxed">
                <span className="font-bold text-sky-300 block mb-0.5">Demo Mode Active</span>
                No real bank or payment gateway charges will occur. The payment status will immediately update to <strong className="text-emerald-300">PAID</strong> in SQLite.
              </div>

              <button
      type="submit"
      disabled={isProcessing}
      className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 cursor-pointer"
    >
                {isProcessing ? <span>Processing Demo Payment...</span> : <>
                    <Sparkles className="w-4 h-4" />
                    <span>PAY ₹{totalAmount} (Demo UPI)</span>
                  </>}
              </button>
            </form>
          </div>
  )}

        <div className="text-center">
          <Link href="/browse" className="text-xs text-slate-500 hover:text-slate-400 inline-flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
        </div>
      </div>
    </div>;
}
export {
  PaymentConfirmClient as default
};
