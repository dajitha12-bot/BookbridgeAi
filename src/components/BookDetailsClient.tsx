'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  MapPin,
  Truck,
  RefreshCw,
  Heart,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Star,
  PlusCircle,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  X,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { createOrderAction, initiateOrderPaymentAction } from '../actions/orderActions';
import { requestExchangeAction } from '../actions/exchangeActions';

interface BookDetailsClientProps {
  book: any;
  userId: string | null;
  userBooks: any[];
  distanceKm: number | null;
}

export default function BookDetailsClient({
  book,
  userId,
  userBooks,
  distanceKm,
}: BookDetailsClientProps) {
  const router = useRouter();
  const { wishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();

  // Normalize Images List
  const rawImages = book.images && book.images.length > 0 ? book.images : [];
  const imagesList =
    rawImages.length > 0
      ? rawImages
      : book.imageUrl
      ? [{ id: 'img-1', imageUrl: book.imageUrl, imageType: 'Cover Page', isPrimary: true }]
      : [];

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Checkout flow state
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [buyerEmail, setBuyerEmail] = useState('dajitha12@gmail.com');
  const [address, setAddress] = useState(book.owner.profile?.address || '');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [initiatedOrder, setInitiatedOrder] = useState<{
    orderId: string;
    paymentUrl: string;
    totalAmount: number;
    email: string;
  } | null>(null);

  // Exchange flow state
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedOfferBookId, setSelectedOfferBookId] = useState('');
  const [isSubmittingExchange, setIsSubmittingExchange] = useState(false);

  const isWish = wishlist.some((item) => item.bookId === book.id);

  const handleWishlistToggle = async () => {
    if (!userId) {
      alert('Please log in to wishlist books.');
      router.push('/login');
      return;
    }
    if (isWish) {
      await removeFromWishlist(book.id);
    } else {
      await addToWishlist(book.id);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please log in to buy books.');
      router.push('/login');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const res = await initiateOrderPaymentAction(book.id, deliveryMethod, paymentMethod, buyerEmail);

      if (res.success) {
        if (res.isOnlinePayment && res.paymentUrl) {
          setInitiatedOrder({
            orderId: res.orderId!,
            paymentUrl: res.paymentUrl,
            totalAmount: res.totalAmount!,
            email: buyerEmail || 'your email',
          });
        } else {
          alert('Order placed successfully! Redirecting to orders dashboard.');
          router.push('/dashboard/orders');
          setShowCheckout(false);
        }
      } else {
        alert(res.error || 'Failed to place order.');
      }
    } catch (e) {
      alert('An error occurred during checkout.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleProposeExchange = async () => {
    if (!userId) {
      alert('Please log in to exchange books.');
      router.push('/login');
      return;
    }

    if (!selectedOfferBookId) {
      alert('Please select one of your books to offer in exchange.');
      return;
    }

    setIsSubmittingExchange(true);
    try {
      const res = await requestExchangeAction(selectedOfferBookId, book.id);
      if (res.success) {
        alert('Exchange request sent successfully! Redirecting to exchange dashboard.');
        router.push('/dashboard/exchange');
      } else {
        alert(res.error || 'Failed to submit exchange request.');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setIsSubmittingExchange(false);
      setShowExchangeModal(false);
    }
  };

  // Lightbox Navigation
  const handlePrevImage = () => {
    setActiveImgIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImgIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const currentActiveImage = imagesList[activeImgIndex] || imagesList[0];

  // Discount Calculation
  const discount = book.originalPrice - book.expectedPrice;
  const discountPercent = book.originalPrice > 0 ? Math.round((discount / book.originalPrice) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800 animate-fade-in font-sans">
      {/* Back button */}
      <Link href="/browse" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-sky-500 mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span>Back to Browse</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ==========================================
            LEFT SIDE: Book cover gallery & Actions
           ========================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Cover & Thumbnails Gallery */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 relative">
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 p-2 rounded-full border transition-all z-10 ${
                isWish ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWish ? 'fill-current' : ''}`} />
            </button>

            {/* Large Primary Image Display */}
            <div
              onClick={() => setShowLightbox(true)}
              className="w-full aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center relative group cursor-pointer border border-slate-100"
            >
              {currentActiveImage ? (
                <img src={currentActiveImage.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <BookOpen className="w-24 h-24 text-sky-100" />
              )}
              <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                  <ZoomIn className="w-3.5 h-3.5" /> Click to Zoom
                </span>
              </div>
            </div>

            {/* Thumbnails Row ([Cover] [Spine] [Pages] [Back]) */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
                {imagesList.map((img: any, idx: number) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImgIndex === idx ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt={img.imageType || `Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[8px] font-bold py-0.5 text-center truncate">
                      {img.imageType || `Photo ${idx + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Checkout Actions */}
          {book.status === 'AVAILABLE' && book.ownerId !== userId ? (
            <div className="space-y-3">
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
              >
                Buy Now (₹{book.expectedPrice})
              </button>

              {book.exchangeAvailable && (
                <button
                  onClick={() => setShowExchangeModal(true)}
                  className="w-full py-3 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold rounded-xl text-sm transition-colors"
                >
                  Propose Book Exchange
                </button>
              )}

              <Link
                href={`/books/${book.id}/rent`}
                className="w-full py-3 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 font-bold rounded-xl text-sm transition-colors block text-center shadow-xs cursor-pointer"
              >
                Rent this Book (from ₹10/day)
              </Link>

              {/* Seller Communication Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href={`/dashboard/chat?bookId=${book.id}&sellerId=${book.ownerId}`}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Chat Seller</span>
                </Link>
                {book.owner.phone ? (
                  <a
                    href={`tel:${book.owner.phone}`}
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call ({book.owner.phone})</span>
                  </a>
                ) : (
                  <div className="py-2.5 px-3 bg-slate-100 text-slate-400 font-medium rounded-xl text-xs text-center">
                    Phone Hidden
                  </div>
                )}
              </div>
            </div>
          ) : book.ownerId === userId ? (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center text-xs font-semibold text-blue-600">
              You listed this book. View metrics in your dashboard.
            </div>
          ) : (
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-center text-xs font-semibold text-slate-500">
              This book is no longer available (Status: {book.status}).
            </div>
          )}
        </div>

        {/* ==========================================
            RIGHT SIDE: Book specs, Proximity & Photos
           ========================================== */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {book.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{book.title}</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">by {book.author}</p>
            </div>

            <div className="flex flex-wrap items-baseline gap-4 py-2 border-y border-slate-100">
              <span className="text-2xl font-extrabold text-slate-800">₹{book.expectedPrice}</span>
              {book.originalPrice > 0 && (
                <>
                  <span className="text-xs text-slate-400 line-through">MRP: ₹{book.originalPrice}</span>
                  {discount > 0 && (
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save ₹{discount} ({discountPercent}% off)
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Book metadata table */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Edition</span>
                <span className="font-semibold text-slate-700">{book.edition} Edition</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Publication Year</span>
                <span className="font-semibold text-slate-700">{book.publicationYear}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Subject / Topic</span>
                <span className="font-semibold text-slate-700">{book.subject}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">ISBN</span>
                <span className="font-semibold text-slate-700">{book.isbn}</span>
              </div>
            </div>

            {/* Condition description */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Condition Details</span>
              <div className="text-xs font-semibold text-slate-800">{book.condition.replace('_', ' ')}</div>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">{book.description}</p>
            </div>
          </div>

          {/* ================================================== */}
          {/* BOOK PHOTOS SECTION (MATCHES USER UI REFERENCE SCREENSHOT) */}
          {/* ================================================== */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-sky-500" />
                BOOK PHOTOS
              </h3>
              <span className="text-[10px] font-bold text-slate-400">
                {imagesList.length} Uploaded Photo{imagesList.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {imagesList.map((img: any, idx: number) => (
                <div
                  key={img.id || idx}
                  onClick={() => {
                    setActiveImgIndex(idx);
                    setShowLightbox(true);
                  }}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 cursor-pointer hover:border-sky-400 transition-all space-y-1.5 text-center group"
                >
                  <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-100">
                    <img src={img.imageUrl} alt={img.imageType || `Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 block truncate">
                    {img.imageType || `Book Photo ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Proximity & Seller Matching details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Seller & Distance Insights</h3>
            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="font-bold text-slate-700 block">Seller: {book.owner.name}</span>
                  <div className="flex items-center text-[10px] text-amber-500 font-semibold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                    <span>4.8 Rating (Verified user)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Location</span>
                  <span className="font-semibold text-slate-700">
                    {book.area}, {book.city}
                  </span>
                </div>
              </div>

              {distanceKm !== null && (
                <div className="flex items-center space-x-2 bg-sky-50 border border-sky-100/50 p-3 rounded-lg text-sky-700 font-medium">
                  <MapPin className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>Located exactly {distanceKm} km from your registered coordinates.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                <div className={`p-2.5 rounded-lg border text-center ${book.deliveryAvailable ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  {book.deliveryAvailable ? '✓ Home Delivery Available' : '✗ Home Delivery Unavailable'}
                </div>
                <div className={`p-2.5 rounded-lg border text-center ${book.exchangeAvailable ? 'bg-amber-50/50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  {book.exchangeAvailable ? '✓ Swap Exchange Available' : '✗ Swap Exchange Unavailable'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          LIGHTBOX MODAL IMAGE VIEWER
         ========================================== */}
      {showLightbox && currentActiveImage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="relative max-w-4xl w-full flex flex-col items-center justify-center space-y-4">
            {/* Header Controls */}
            <div className="w-full flex items-center justify-between text-white border-b border-slate-800 pb-3">
              <span className="text-xs font-bold tracking-wide">
                {currentActiveImage.imageType || 'Book Photo'} ({activeImgIndex + 1} of {imagesList.length})
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setZoomLevel((z) => (z > 1.0 ? z - 0.25 : 1.0))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <ZoomOut className="w-4 h-4" /> Zoom -
                </button>
                <button
                  onClick={() => setZoomLevel((z) => (z < 2.5 ? z + 0.25 : 2.5))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <ZoomIn className="w-4 h-4" /> Zoom +
                </button>
                <button
                  onClick={() => {
                    setShowLightbox(false);
                    setZoomLevel(1.0);
                  }}
                  className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors text-xs font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Container */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-auto p-4">
              <img
                src={currentActiveImage.imageUrl}
                alt={book.title}
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
              />

              {/* Prev / Next Buttons */}
              {imagesList.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CHECKOUT MODAL SHEET
         ========================================== */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                {initiatedOrder ? 'Payment Request Email Sent' : `Checkout: ${book.title}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCheckout(false);
                  setInitiatedOrder(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {initiatedOrder ? (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-center space-y-2">
                  <div className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Payment Link Dispatched!</h4>
                  <p className="text-slate-600 text-xs">
                    Payment request email with prominent <strong className="text-sky-600">[ PAY ₹{initiatedOrder.totalAmount} ]</strong> button has been sent to:
                  </p>
                  <code className="bg-white px-2.5 py-1 rounded border border-sky-200 font-mono text-sky-700 font-bold text-xs block truncate">
                    {initiatedOrder.email}
                  </code>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1 text-slate-700">
                  <div className="flex justify-between font-medium">
                    <span>Order ID:</span>
                    <span className="font-bold font-mono">{initiatedOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span className="font-extrabold text-emerald-600">₹{initiatedOrder.totalAmount}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <a
                    href={initiatedOrder.paymentUrl}
                    className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    <span>PAY ₹{initiatedOrder.totalAmount} (Open Payment Portal)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setInitiatedOrder(null);
                      router.push('/dashboard/orders');
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    View Orders Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-5">
                <div className="space-y-1.5 text-xs">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-500" />
                    Buyer Email Address (for Payment Request)
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="Enter your real email address (e.g. buyer@gmail.com)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Delivery Option</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer text-center space-y-1 ${
                        deliveryMethod === 'DELIVERY' ? 'border-sky-500 bg-sky-50/50 text-sky-600' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === 'DELIVERY'}
                        onChange={() => setDeliveryMethod('DELIVERY')}
                        className="sr-only"
                      />
                      <Truck className="w-5 h-5" />
                      <span className="text-xs font-bold">Home Delivery (+₹40)</span>
                    </label>

                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer text-center space-y-1 ${
                        deliveryMethod === 'PICKUP' ? 'border-sky-500 bg-sky-50/50 text-sky-600' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === 'PICKUP'}
                        onChange={() => setDeliveryMethod('PICKUP')}
                        className="sr-only"
                      />
                      <MapPin className="w-5 h-5" />
                      <span className="text-xs font-bold">Offline Pickup (₹0)</span>
                    </label>
                  </div>
                </div>

                {deliveryMethod === 'DELIVERY' ? (
                  <div className="space-y-1.5 text-xs">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Confirm Destination Address</label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Verify your complete street address details..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
                    />
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-amber-800">Pickup Details</span>
                    <p className="text-slate-600 leading-relaxed">
                      Seller pickup coordinates: {book.area}, {book.city}. Meet offline to receive book and finalize payment.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Payment Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-xs font-bold ${
                        paymentMethod === 'ONLINE' ? 'border-sky-500 bg-sky-50/50 text-sky-600' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'ONLINE'}
                        onChange={() => setPaymentMethod('ONLINE')}
                        className="sr-only"
                      />
                      <span>Online UPI (Demo)</span>
                    </label>
                    <label
                      className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer text-xs font-bold ${
                        paymentMethod === 'COD' ? 'border-sky-500 bg-sky-50/50 text-sky-600' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="sr-only"
                      />
                      <span>Cash On Delivery</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-xs font-bold text-slate-800">
                  <div>
                    <span className="block text-[11px] text-slate-400 font-normal">Order Total</span>
                    <span className="text-base text-slate-900">₹{book.expectedPrice + (deliveryMethod === 'DELIVERY' ? 40 : 0)}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    {isSubmittingOrder
                      ? 'Generating Payment Email...'
                      : paymentMethod === 'ONLINE'
                      ? `Send Payment Email (₹${book.expectedPrice + (deliveryMethod === 'DELIVERY' ? 40 : 0)})`
                      : 'Place COD Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          EXCHANGE PROPOSAL MODAL
         ========================================== */}
      {showExchangeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Offer a book to swap</h3>
              <button type="button" onClick={() => setShowExchangeModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {userBooks.length === 0 ? (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-slate-500">You do not have any available books listed for exchange. Add a book list to offer it.</p>
                <Link href="/dashboard/add-book" className="inline-flex items-center px-4 py-2 bg-sky-500 text-white font-bold rounded-lg text-xs">
                  <PlusCircle className="w-4 h-4 mr-1" />
                  List a Book
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Select one of your listed books to propose in exchange for "{book.title}".</p>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userBooks.map((ub) => (
                    <label
                      key={ub.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:border-sky-300 transition-colors ${
                        selectedOfferBookId === ub.id ? 'border-sky-500 bg-sky-50/20' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="offerBook"
                        value={ub.id}
                        checked={selectedOfferBookId === ub.id}
                        onChange={() => setSelectedOfferBookId(ub.id)}
                        className="rounded-full text-sky-500 focus:ring-sky-500 border-slate-200"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-800">{ub.title}</div>
                        <div className="text-slate-400 font-medium">{ub.category}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3.5 flex justify-end gap-2">
                  <button
                    onClick={() => setShowExchangeModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmittingExchange || !selectedOfferBookId}
                    onClick={handleProposeExchange}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    {isSubmittingExchange ? 'Sending...' : 'Propose Exchange'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
