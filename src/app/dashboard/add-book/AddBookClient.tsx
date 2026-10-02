'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addBookAction, getAiChatPricePredictionAction, lookupIsbnAction, analyzeFairPriceAction } from '../../../actions/bookActions';
import {
  Brain,
  AlertCircle,
  Sparkles,
  Upload,
  Send,
  RefreshCw,
  CheckCircle2,
  Info,
  Search,
  BookOpen,
  BarChart2,
  TrendingUp,
  Check,
} from 'lucide-react';

interface FormState {
  success: boolean;
  error?: string;
  bookId?: string;
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  imagePreview?: string;
  suggestion?: any;
}

export default function AddBookClient() {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await addBookAction(null, formData);
    if (res.success) {
      alert('Book listed successfully!');
      router.push('/dashboard/my-books');
      router.refresh();
    } else {
      setError(res.error || 'Failed to list book.');
    }
    setIsPending(false);
  };

  // Form Fields State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Programming');
  const [subject, setSubject] = useState('');
  const [isbn, setIsbn] = useState('');
  const [isLookingUpIsbn, setIsLookingUpIsbn] = useState(false);
  const [isbnSource, setIsbnSource] = useState<string | null>(null);
  const [edition, setEdition] = useState<number>(1);
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState<string>('');
  const [condition, setCondition] = useState<string>('GOOD');
  const [expectedPrice, setExpectedPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [exchangeAvailable, setExchangeAvailable] = useState(true);
  const [donationAvailable, setDonationAvailable] = useState(false);

  // Smart Book Fair Price Assistant State
  const [isAnalyzingPrice, setIsAnalyzingPrice] = useState(false);
  const [priceAnalysisResult, setPriceAnalysisResult] = useState<any | null>(null);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your BookBridge AI Assistant 🤖. Describe your book or upload a photo, and I will autofill the book details and predict a fair market price!',
    },
  ]);
  const [userInputText, setUserInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiProcessing]);

  // Calculate book age dynamically from Purchase Date (formatted with years/months and total days)
  const calculateBookAge = (dateStr: string) => {
    if (!dateStr) return null;
    const purchase = new Date(dateStr);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - purchase.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const diffMonths = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth());
    if (diffMonths <= 0) return `Less than a month (${days} days)`;
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    const yrsText = years === 1 ? '1 year' : `${years} years`;
    const mosText = months === 1 ? '1 month' : `${months} months`;

    if (years === 0) return `${mosText} (${days} days)`;
    if (months === 0) return `${yrsText} (${days} days)`;
    return `${yrsText} ${mosText} (${days} days)`;
  };

  const bookAgeStr = calculateBookAge(purchaseDate);

  // Trigger Smart Book Fair Price Assistant Analysis
  const handleAnalyzePrice = async () => {
    setIsAnalyzingPrice(true);
    try {
      const res = await analyzeFairPriceAction({
        title: title || 'Untitled Book',
        category: category || 'Programming',
        isbn: isbn || '',
        originalPrice: originalPrice || 0,
        purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
        condition: condition || 'GOOD',
        edition: edition || 1,
        imageUrl: imageUrl || imagePreview || null,
      });

      if (res.success && res.prediction) {
        setPriceAnalysisResult(res.prediction);
        if (res.prediction.suggestedPrice && !expectedPrice) {
          setExpectedPrice(res.prediction.suggestedPrice.toString());
        }
      } else {
        alert(res.error || 'Failed to analyze fair price');
      }
    } catch (err) {
      alert('An error occurred during price analysis');
    } finally {
      setIsAnalyzingPrice(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger AI Valuation Chat Analysis
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInputText.trim() && !imagePreview) return;

    const currentText = userInputText;
    const currentImg = imagePreview;

    setUserInputText('');
    setImagePreview(null);

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: currentText, imagePreview: currentImg || undefined },
    ]);

    setIsAiProcessing(true);

    try {
      const res = await getAiChatPricePredictionAction(
        currentText,
        currentImg || undefined,
        { title, author, category, originalPrice, purchaseDate, condition, edition }
      );

      if (res.success && res.suggestion) {
        const sugg = res.suggestion;

        if (sugg.title && !title) setTitle(sugg.title);
        if (sugg.author && !author) setAuthor(sugg.author);
        if (sugg.category) setCategory(sugg.category);
        if (sugg.subject && !subject) setSubject(sugg.subject);
        if (sugg.isbn && !isbn) setIsbn(sugg.isbn);
        if (sugg.edition) setEdition(sugg.edition);
        if (sugg.publicationYear) setPublicationYear(sugg.publicationYear);
        if (sugg.originalPrice && originalPrice === 0) setOriginalPrice(sugg.originalPrice);
        if (sugg.condition) setCondition(sugg.condition);
        if (sugg.suggestedPrice) setExpectedPrice(sugg.suggestedPrice.toString());
        if (sugg.description && !description) setDescription(sugg.description);

        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Analyzed! Suggested fair resale price: ₹${sugg.suggestedPrice}. ${sugg.explanation}`,
            suggestion: sugg,
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'ai', text: res.error || 'Failed to analyze book details. Please fill the fields manually.' },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'An error occurred during AI valuation. Please enter fields manually.' },
      ]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 font-sans pb-16">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold">List a Book for Sale or Exchange</h1>
        <p className="text-xs text-slate-500 mt-1">
          Post your textbook details below. Use our Smart Book Fair Price Assistant to analyze dynamic age, market demand & fair resale pricing!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2 text-rose-600 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Hidden Input Image URL */}
            <input type="hidden" name="imageUrl" value={imageUrl} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Book Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Eloquent JavaScript"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
                />
              </div>

              {/* Author */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Author Name</label>
                <input
                  name="author"
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Marijn Haverbeke"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                <select
                  name="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-semibold"
                >
                  {[
                    'Programming',
                    'Artificial Intelligence',
                    'Database',
                    'Web Development',
                    'Operating Systems',
                    'Computer Networks',
                    'Mathematics',
                    'Management',
                    'Novels',
                    'Competitive Exams',
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Subject / Core Focus</label>
                <input
                  name="subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. JavaScript Frameworks"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
                />
              </div>

              {/* ISBN */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ISBN Number (Real-Time Lookup)</label>
                  {isbnSource && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>Source: {isbnSource}</span>
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    name="isbn"
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="e.g. 9781593279509 or 9780132350884"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
                  />
                  <button
                    type="button"
                    disabled={isLookingUpIsbn || !isbn.trim()}
                    onClick={async () => {
                      setIsLookingUpIsbn(true);
                      try {
                        const res = await lookupIsbnAction(isbn);
                        if (res.success && res.metadata) {
                          if (res.metadata.title) setTitle(res.metadata.title);
                          if (res.metadata.author) setAuthor(res.metadata.author);
                          if (res.metadata.publishYear) setPublicationYear(res.metadata.publishYear);
                          if (res.metadata.category) setCategory(res.metadata.category);
                          setIsbnSource(res.metadata.source);
                        } else {
                          alert(res.error || 'No metadata found. Enter details manually.');
                          setIsbnSource('BookBridge SQLite Market Data');
                        }
                      } catch (e) {
                        setIsbnSource('BookBridge SQLite Market Data');
                      } finally {
                        setIsLookingUpIsbn(false);
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {isLookingUpIsbn ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    ) : (
                      <Search className="w-3.5 h-3.5 text-blue-400" />
                    )}
                    <span>{isLookingUpIsbn ? 'Querying API...' : 'Lookup ISBN'}</span>
                  </button>
                </div>
              </div>

              {/* Edition */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Edition Number</label>
                <input
                  name="edition"
                  type="number"
                  required
                  min={1}
                  value={edition}
                  onChange={(e) => setEdition(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
                />
              </div>

              {/* Publication Year */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Publication Year</label>
                <input
                  name="publicationYear"
                  type="number"
                  required
                  min={1950}
                  max={new Date().getFullYear()}
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
                />
              </div>

              {/* Original Price */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Original Price (MRP in ₹)</label>
                <input
                  name="originalPrice"
                  type="number"
                  required
                  min={0}
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-semibold"
                />
              </div>

              {/* Purchase Date */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Purchase Date</label>
                  {bookAgeStr && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                      Age: {bookAgeStr}
                    </span>
                  )}
                </div>
                <input
                  name="purchaseDate"
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
                />
              </div>

              {/* Condition */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Book Condition</label>
                <select
                  name="condition"
                  required
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-semibold"
                >
                  <option value="LIKE_NEW">Like New (Mint / Unused)</option>
                  <option value="VERY_GOOD">Very Good (Minimal wear)</option>
                  <option value="GOOD">Good (Read but clean)</option>
                  <option value="FAIR">Fair (Highlighted / Marked)</option>
                </select>
              </div>

              {/* Expected selling price */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Expected Selling Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={donationAvailable ? '0' : expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  disabled={donationAvailable}
                  placeholder={donationAvailable ? '0 (Donation)' : 'e.g. 750'}
                  className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-bold ${
                    donationAvailable ? 'bg-slate-50 text-slate-400 border-dashed' : ''
                  }`}
                />
                {/* Guaranteed Hidden Input so disabled status never blocks expectedPrice in FormData */}
                <input type="hidden" name="expectedPrice" value={donationAvailable ? '0' : expectedPrice || '0'} />
              </div>

              {/* ================================================== */}
              {/* SMART BOOK FAIR PRICE ASSISTANT SECTION */}
              {/* ================================================== */}
              <div className="sm:col-span-2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-blue-900/40 space-y-4 my-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800/50 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-blue-600/30 rounded-xl text-blue-300 border border-blue-500/30">
                      <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white tracking-wide">
                        Smart Book Fair Price Assistant
                      </h3>
                      <p className="text-[11px] text-blue-200/80">Local AI price valuation model based on MRP, dynamic age & SQLite market demand</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAnalyzingPrice}
                    onClick={handleAnalyzePrice}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer border border-blue-400/30"
                  >
                    {isAnalyzingPrice ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-200" />
                        <span>Analyzing Book...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-3.5 h-3.5 text-blue-300" />
                        <span>Analyze Book</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Analysis Results Card */}
                {priceAnalysisResult ? (
                  <div className="space-y-4 pt-1 animate-fade-in text-xs">
                    {/* 3 Grid Layout for Analysis Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* 1. Book Analysis */}
                      <div className="bg-slate-900/70 border border-blue-800/40 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center space-x-1.5 text-blue-400 font-bold border-b border-slate-800 pb-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>Book Analysis</span>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-slate-300">
                          <div>
                            <span className="text-slate-400 font-medium">Title:</span>{' '}
                            <strong className="text-white">{priceAnalysisResult.bookAnalysis.title}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">ISBN:</span>{' '}
                            <span className="font-mono text-slate-200">{priceAnalysisResult.bookAnalysis.isbn}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Original Price:</span>{' '}
                            <span className="font-bold text-emerald-400">₹{priceAnalysisResult.bookAnalysis.originalPrice}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Purchase Date:</span>{' '}
                            <span>{priceAnalysisResult.bookAnalysis.purchaseDate || 'Not provided'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Book Age:</span>{' '}
                            <span className="text-blue-300 font-bold bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/50">
                              {priceAnalysisResult.bookAnalysis.ageFormatted}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Condition:</span>{' '}
                            <span className="text-amber-300 font-semibold">{priceAnalysisResult.bookAnalysis.condition.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Edition:</span>{' '}
                            <span>Edition {priceAnalysisResult.bookAnalysis.edition}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Market Information */}
                      <div className="bg-slate-900/70 border border-blue-800/40 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center space-x-1.5 text-blue-400 font-bold border-b border-slate-800 pb-1.5">
                          <BarChart2 className="w-4 h-4" />
                          <span>Market Information</span>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-slate-300">
                          <div>
                            <span className="text-slate-400 font-medium">Reference Price:</span>{' '}
                            <span className="font-bold text-white">₹{priceAnalysisResult.marketInfo.referencePrice}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Demand Score:</span>{' '}
                            <span className="font-bold text-cyan-300">{priceAnalysisResult.marketInfo.demandScore}/100</span>
                            <span className="ml-1.5 px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded font-bold text-[10px]">
                              {priceAnalysisResult.marketInfo.demandLevel} Demand
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-1 font-medium border-t border-slate-800/60">
                            Activity Breakdown (SQLite):
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 bg-slate-950/40 p-1.5 rounded border border-slate-800/50">
                            <div>Searches: {priceAnalysisResult.marketInfo.activityBreakdown.searchCount}</div>
                            <div>Views: {priceAnalysisResult.marketInfo.activityBreakdown.viewCount}</div>
                            <div>Wishlists: {priceAnalysisResult.marketInfo.activityBreakdown.wishlistCount}</div>
                            <div>Requests: {priceAnalysisResult.marketInfo.activityBreakdown.requestCount}</div>
                          </div>
                          {priceAnalysisResult.marketInfo.isSparseData && (
                            <div className="text-[10px] text-amber-400 font-bold bg-amber-950/40 px-2 py-1 rounded border border-amber-800/40 mt-1">
                              ⚠️ Limited marketplace data
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Fair Price Suggestion */}
                      <div className="bg-slate-900/70 border border-blue-800/40 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center space-x-1.5 text-blue-400 font-bold border-b border-slate-800 pb-1.5">
                          <TrendingUp className="w-4 h-4" />
                          <span>Fair Price Suggestion</span>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-slate-300">
                          <div>
                            <span className="text-slate-400 font-medium">Rec. Selling Price:</span>{' '}
                            <span className="text-base font-extrabold text-emerald-400">₹{priceAnalysisResult.suggestedPrice}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Rec. 5-Day Rental:</span>{' '}
                            <span className="font-bold text-sky-300">₹{priceAnalysisResult.suggestedRentalPrice5Days}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Suggested Range:</span>{' '}
                            <span className="font-semibold text-slate-200">
                              ₹{priceAnalysisResult.minPrice} – ₹{priceAnalysisResult.maxPrice}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Confidence:</span>{' '}
                            {priceAnalysisResult.isSparseData ? (
                              <span className="text-amber-400 font-semibold">{priceAnalysisResult.confidenceText}</span>
                            ) : (
                              <span className="text-emerald-400 font-bold">{priceAnalysisResult.confidenceText}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explanation Banner */}
                    <div className="bg-blue-950/50 border border-blue-800/40 rounded-xl p-3 text-[11px] text-blue-200 flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-white">AI Valuation Rationale: </span>
                        <span>{priceAnalysisResult.explanation}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-900/40">
                      <button
                        type="button"
                        onClick={() => setExpectedPrice(priceAnalysisResult.suggestedPrice.toString())}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use Selling Price (₹{priceAnalysisResult.suggestedPrice})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpectedPrice(priceAnalysisResult.suggestedRentalPrice5Days.toString())}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use Rental Price (₹{priceAnalysisResult.suggestedRentalPrice5Days})</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-950/30 border border-blue-900/30 rounded-xl p-4 text-center text-xs text-blue-200/70">
                    Click <strong className="text-blue-300">"Analyze Book"</strong> above to calculate recommended selling price, 5-day rental price, book age, and live marketplace demand.
                  </div>
                )}
              </div>
            </div>

            {/* Handover logistics */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Handover Methods</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryAvailable}
                    onChange={(e) => setDeliveryAvailable(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-200"
                  />
                  <input type="hidden" name="deliveryAvailable" value={deliveryAvailable ? 'true' : 'false'} />
                  <span>Home Delivery</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exchangeAvailable}
                    onChange={(e) => setExchangeAvailable(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-200"
                  />
                  <input type="hidden" name="exchangeAvailable" value={exchangeAvailable ? 'true' : 'false'} />
                  <span>Available for Exchange</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                  <input
                    type="checkbox"
                    checked={donationAvailable}
                    onChange={(e) => setDonationAvailable(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-blue-200"
                  />
                  <input type="hidden" name="donationAvailable" value={donationAvailable ? 'true' : 'false'} />
                  <span className="text-blue-700 font-bold">Donation (Free Book)</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Book Description</label>
              <textarea
                name="description"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention page conditions, highlights, or included access codes..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-sm transition-colors shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isPending ? 'Publishing Listing...' : 'Publish Book Listing'}</span>
            </button>
          </form>
        </div>

        {/* AI Valuation Assistant Chat Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[680px]">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Brain className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">AI Valuation & Autofill</h3>
                <p className="text-[10px] text-slate-400">Powered by BookBridge ML Pricing Model</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3 h-[490px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-none'
                    }`}
                  >
                    {msg.imagePreview && (
                      <img src={msg.imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mb-2 border border-slate-200" />
                    )}
                    <p className="leading-relaxed font-medium">{msg.text}</p>
                    {msg.suggestion && (
                      <div className="bg-white p-2.5 rounded-xl border border-blue-100 text-slate-800 space-y-1 font-semibold text-[11px]">
                        <div className="text-blue-600 font-extrabold flex items-center justify-between">
                          <span>Auto-Filled Values:</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>Category: {msg.suggestion.category}</div>
                        <div>Suggested Price: ₹{msg.suggestion.suggestedPrice}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isAiProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl rounded-bl-none p-3 text-xs flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Analyzing book details and calculating fair price...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* AI Chat Input Form */}
          <form onSubmit={handleSendAiMessage} className="pt-3 border-t border-slate-100 space-y-2">
            {imagePreview && (
              <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-lg text-xs text-blue-700 font-semibold">
                <img src={imagePreview} alt="Attachment" className="w-8 h-8 object-cover rounded" />
                <span className="truncate flex-1">Image attached</span>
                <button type="button" onClick={() => setImagePreview(null)} className="text-rose-500 font-bold">
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <label className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-colors" title="Upload cover image">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <input
                type="text"
                value={userInputText}
                onChange={(e) => setUserInputText(e.target.value)}
                placeholder="Ask AI: e.g. 'Java 8th edition bought in 2024'..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
              />
              <button
                type="submit"
                disabled={isAiProcessing || (!userInputText.trim() && !imagePreview)}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
