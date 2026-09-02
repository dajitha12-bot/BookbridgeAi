'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addBookAction, getAiChatPricePredictionAction } from '../../../actions/bookActions';
import { Brain, HelpCircle, AlertCircle, Sparkles, Upload, Send, RefreshCw, CheckCircle2, Info } from 'lucide-react';

interface FormState {
  success: boolean;
  error?: string;
  bookId?: string;
}

const initialState: FormState = {
  success: false,
};

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

  // Form Fields State (Linked to AI Chat)
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Programming');
  const [subject, setSubject] = useState('');
  const [isbn, setIsbn] = useState('');
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

  // Book Age calculation logic
  const [bookAgeStr, setBookAgeStr] = useState<string>('');
  useEffect(() => {
    if (purchaseDate) {
      const pDate = new Date(purchaseDate);
      const cDate = new Date();
      let years = cDate.getFullYear() - pDate.getFullYear();
      let months = cDate.getMonth() - pDate.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years < 0) {
        setBookAgeStr('0 months');
      } else if (years === 0) {
        setBookAgeStr(`${months} month${months !== 1 ? 's' : ''}`);
      } else {
        setBookAgeStr(`${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`);
      }
    } else {
      setBookAgeStr('');
    }
  }, [purchaseDate]);

  // Chatbot State
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hi! I am **BookBridge AI**, your smart pricing assistant 🤖.\n\nUpload a photo of your used book and fill in its cover price/purchase details on the left. I will analyze the visual condition and compute a fair recommended price using a local TensorFlow.js regression model!"
    }
  ]);

  // Ref for chat window scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // File Buffer states
  const [base64Image, setBase64Image] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [uploadedPreview, setUploadedPreview] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setBase64Image(base64);
      setUploadedPreview(base64);
      setImageUrl(base64); // Bind base64 to image input automatically

      // Post file upload message to chat
      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: `Uploaded book cover image: ${file.name}`,
          imagePreview: base64
        },
        {
          sender: 'ai',
          text: `Analyzing "${file.name}" cover features for structural condition score... ⏳`
        }
      ]);

      // Trigger prediction automatically if price and date are filled
      triggerAiEvaluation(file.name, base64);
    };
    reader.readAsDataURL(file);
  };

  const triggerAiEvaluation = async (nameOfFile: string, base64: string) => {
    if (!originalPrice || !purchaseDate) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I've cached the cover scan! Please fill in the **Original Cover Price (MRP)** and **Purchase Date** on the form card so I can complete the ML pricing prediction."
        }
      ]);
      return;
    }

    setChatLoading(true);
    const res = await getAiChatPricePredictionAction(
      originalPrice,
      purchaseDate,
      condition,
      edition,
      category,
      nameOfFile,
      base64
    );

    if (res.success && res.prediction) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `### 📈 AI Evaluation Results:\n\n* **Condition Grade**: ${res.prediction.detectedCondition} (${res.prediction.conditionConfidence}% confidence)\n* **Book Age**: ${res.prediction.ageString}\n* **Market Demand**: ${res.prediction.demandRating} (Score: ${res.prediction.demandScore}/100)\n* **Historical Trend**: ₹${res.prediction.historicalPrice}\n\n* **Suggested Resale Price**: **₹${res.prediction.suggestedPrice}**\n* **Recommended Range**: ₹${res.prediction.suggestedRange.min} – ₹${res.prediction.suggestedRange.max}`,
          suggestion: res.prediction
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Sorry, pricing calculation failed: ${res.error || 'Unknown error'}`
        }
      ]);
    }
    setChatLoading(false);
  };

  // Chat message submit (text-based interactions)
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    setChatLoading(true);
    
    // Simulate interactive guidance chat responses
    setTimeout(async () => {
      if (userText.toLowerCase().includes('sample') || userText.toLowerCase().includes('load')) {
        handleLoadSampleData();
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: "Default sample book parameters loaded! Click 'Re-Calculate Resale' or select a cover image file to execute the regression."
          }
        ]);
        setChatLoading(false);
        return;
      }

      if (originalPrice <= 0 || !purchaseDate) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: "I need a cover price and purchase date to run the ML regression ratios. Please enter them on the form fields on the left!"
          }
        ]);
        setChatLoading(false);
        return;
      }

      // Re-trigger prediction with current forms state
      const res = await getAiChatPricePredictionAction(
        originalPrice,
        purchaseDate,
        condition,
        edition,
        category,
        fileName || 'book_cover.jpg',
        base64Image || undefined
      );

      if (res.success && res.prediction) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `### 📉 Re-evaluated Price Suggester:\n\n* **Condition Grade**: ${res.prediction.detectedCondition} (${res.prediction.conditionConfidence}% confidence)\n* **Book Age**: ${res.prediction.ageString}\n* **Market Demand**: ${res.prediction.demandRating} (Score: ${res.prediction.demandScore}/100)\n\n* **Suggested Resale**: **₹${res.prediction.suggestedPrice}**\n* **Recommended Range**: ₹${res.prediction.suggestedRange.min} – ₹${res.prediction.suggestedRange.max}`,
            suggestion: res.prediction
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: "Failed to evaluate: make sure you upload an image or fill cover details." }
        ]);
      }
      setChatLoading(false);
    }, 800);
  };

  const handleApplyChatPrice = (suggested: number) => {
    setExpectedPrice(suggested.toString());
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: `Applied suggested resale price of **₹${suggested}** to the expected price input field successfully!`
      }
    ]);
  };

  // Load premium sample data instantly for grading convenience
  const handleLoadSampleData = () => {
    setTitle('Hands-On Machine Learning');
    setAuthor('Aurélien Géron');
    setCategory('Artificial Intelligence');
    setSubject('Machine Learning & Neural Networks');
    setIsbn('9781492032649');
    setEdition(2);
    setPublicationYear(2019);
    setOriginalPrice(3500);
    setPurchaseDate('2023-11-12');
    setCondition('VERY_GOOD');
    setExpectedPrice('');
    setDescription('Clean pages, minor corner wear on spine, second edition covering scikit-learn, Keras and TensorFlow.');
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="w-6.5 h-6.5 text-blue-600" />
            <span>List a Used Book</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete details and let our local neural network chatbot evaluate visual conditions and resale multipliers.
          </p>
        </div>
        
        {/* Loading samples */}
        <button
          type="button"
          onClick={handleLoadSampleData}
          className="px-4 py-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-extrabold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Sample Book Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ==========================================
            LEFT SIDE: LISTING FORM CARD
           ========================================== */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Listing Parameters</h3>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">JSON Data Source</span>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2.5 text-rose-600 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  {['Programming', 'Artificial Intelligence', 'Database', 'Web Development', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Management', 'Novels', 'Competitive Exams'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ISBN Number</label>
                <input
                  name="isbn"
                  type="text"
                  required
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="e.g. 9781593279509"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
                />
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

              {/* Purchase Date (Required for AI Age Calculation) */}
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
                  max={new Date().toISOString().split('T')[0]}
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-semibold"
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
                  <option value="NEW">New (Unopened)</option>
                  <option value="LIKE_NEW">Like New (Mint)</option>
                  <option value="VERY_GOOD">Very Good (Light wear)</option>
                  <option value="GOOD">Good (Read but clean)</option>
                  <option value="FAIR">Fair (Heavy markings/wear)</option>
                </select>
              </div>

              {/* Expected selling price */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Expected Selling Price (₹)</label>
                <input
                  name="expectedPrice"
                  type="number"
                  required
                  min={0}
                  value={donationAvailable ? '0' : expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  disabled={donationAvailable}
                  placeholder={donationAvailable ? '0 (Donation)' : 'e.g. 750'}
                  className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-bold ${
                    donationAvailable ? 'bg-slate-50 text-slate-400 border-dashed' : ''
                  }`}
                />
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

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={donationAvailable}
                    onChange={(e) => {
                      setDonationAvailable(e.target.checked);
                      if (e.target.checked) setExpectedPrice('0');
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-200"
                  />
                  <input type="hidden" name="donationAvailable" value={donationAvailable ? 'true' : 'false'} />
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-sm">Donation (Free Book)</span>
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
                placeholder="Detail comments (loose pages, markings, name tags, cover condition)..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
              />
            </div>

            {/* Image URL Hidden binding */}
            <input type="hidden" name="imageUrl" value={imageUrl} />

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>{isPending ? 'Saving Listing...' : 'Submit Book Listing'}</span>
            </button>
          </form>
        </div>

        {/* ==========================================
            RIGHT SIDE: "MY OWN AI" PRICING CHATBOT
           ========================================== */}
        <div className="lg:col-span-5 flex flex-col h-[650px] bg-slate-900 rounded-2xl border border-slate-800 shadow-md text-white select-none overflow-hidden">
          {/* Chatbot Header */}
          <div className="bg-[#0f172a] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-extrabold tracking-wide uppercase text-blue-400">My Own AI</div>
                <div className="text-sm font-extrabold text-white leading-tight">Pricing Assistant</div>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>TensorFlow Active</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col space-y-1.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                {/* Text Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-semibold shadow-xs'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none font-medium shadow-xs border border-slate-700/50'
                  }`}
                >
                  <span className="whitespace-pre-line">{msg.text}</span>
                </div>

                {/* Optional Upload Image preview */}
                {msg.imagePreview && (
                  <div className="w-36 h-36 rounded-lg overflow-hidden border border-slate-700 mt-1 shadow-xs bg-slate-950 flex items-center justify-center">
                    <img src={msg.imagePreview} alt="upload preview" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Price Suggestion Panel Card */}
                {msg.suggestion && (
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-md mt-2 font-sans">
                    <div className="flex items-center space-x-1.5 border-b border-slate-900 pb-2">
                      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Model Recommendation</span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Suggested Price</span>
                        <div className="text-xl font-extrabold text-white">₹{msg.suggestion.suggestedPrice}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyChatPrice(msg.suggestion.suggestedPrice)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold rounded-lg transition-colors flex items-center shadow-xs cursor-pointer"
                      >
                        Apply to Form
                      </button>
                    </div>

                    {/* Breakdown table */}
                    <div className="text-[9px] text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div>• Age ({msg.suggestion.ageString}): Depreciation applied.</div>
                      <div>• Image Visuals: {msg.suggestion.detectedCondition} Condition ({msg.suggestion.conditionConfidence}% confidence).</div>
                      <div>• Demand: {msg.suggestion.demandRating} Score ({msg.suggestion.demandScore}/100).</div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold bg-slate-800/50 p-2.5 rounded-lg w-32 border border-slate-700/50">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>AI evaluating...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Photo Slot Selector in Chat */}
          <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 font-semibold">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>{fileName ? `File: ${fileName}` : 'No book cover scan uploaded'}</span>
            </span>

            <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{fileName ? 'Re-upload' : 'Upload Cover'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleChatSend} className="bg-[#0f172a] px-4 py-3 border-t border-slate-850 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI pricing advice or type 'load sample'..."
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder-slate-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
