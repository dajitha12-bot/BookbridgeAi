'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { processChatbotMessageAction, ChatbotResponse } from '../actions/chatbotActions';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RefreshCw,
  BookOpen,
  ShoppingBag,
  Truck,
  TrendingUp,
  MapPin,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Bot,
  User,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  books?: any[];
  orders?: any[];
  suggestion?: any;
  quickButtons?: Array<{ label: string; actionText: string }>;
  timestamp: string;
}

export default function BookBridgeAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Hello! I'm your BookBridge Assistant 🤖. I can help you find books, calculate fair resale prices, check marketplace demand, track orders, rent books, and find nearby exchanges!",
      quickButtons: [
        { label: '🔍 Find Books', actionText: 'Find Python books under ₹400' },
        { label: '🏷️ Fair Price', actionText: 'How much should I sell my DBMS book for?' },
        { label: '📊 Demand Check', actionText: 'Is Programming category in high demand?' },
        { label: '📦 Track Order', actionText: 'Where is my order?' },
        { label: '📍 Nearby Books', actionText: 'Find books near me' },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isProcessing]);

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt) return;

    if (!textToSend) setInputMessage('');

    const userMsg: ChatMessage = {
      id: `msg_usr_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // Extract Context from URL if on book details page
      let bookId: string | undefined = undefined;
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const match = path.match(/\/books\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          bookId = match[1];
        }
      }

      const res: ChatbotResponse = await processChatbotMessageAction(prompt, { bookId });

      const assistantMsg: ChatMessage = {
        id: `msg_ast_${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        books: res.books,
        orders: res.orders,
        suggestion: res.suggestion,
        quickButtons: res.quickButtons,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: 'An error occurred while connecting to BookBridge Assistant. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 hover:from-blue-600 hover:to-indigo-800 text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2.5 border border-blue-400/40 cursor-pointer"
        aria-label="BookBridge Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-sky-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-blue-900"></span>
        </div>
        <span className="font-extrabold text-xs tracking-wide hidden sm:inline-block pr-1">BookBridge Assistant</span>
      </button>

      {/* Side Slide-Over Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-900/60 flex flex-col justify-between overflow-hidden animate-fade-in font-sans">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-4 border-b border-blue-800/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-400/30 text-sky-300">
                <Sparkles className="w-5 h-5 text-sky-400 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-1.5">
                  BookBridge Assistant
                </h3>
                <p className="text-[10px] text-blue-200/80">Your smart assistant for buying, selling & renting</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: `msg_reset_${Date.now()}`,
                      sender: 'assistant',
                      text: "New conversation started! How can I assist you with BookBridge today?",
                      quickButtons: [
                        { label: '🔍 Find Books', actionText: 'Find Python books under ₹400' },
                        { label: '🏷️ Fair Price', actionText: 'How much should I sell my DBMS book for?' },
                        { label: '📦 Track Order', actionText: 'Where is my order?' },
                      ],
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors text-[10px] font-bold"
                title="Start new conversation"
              >
                New Chat
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800 bg-slate-950/80">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900 border border-blue-900/50 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] opacity-70 border-b border-white/10 pb-1">
                    <span className="font-bold">{msg.sender === 'user' ? 'You' : 'BookBridge Assistant'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="leading-relaxed font-medium whitespace-pre-line">{msg.text}</p>

                  {/* Render Compact Book Cards */}
                  {msg.books && msg.books.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      {msg.books.map((b) => (
                        <div
                          key={b.id}
                          className="bg-slate-950/80 border border-blue-900/40 p-2.5 rounded-xl flex items-center justify-between gap-3 hover:border-blue-700 transition-colors"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-10 h-12 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                              {b.imageUrl ? (
                                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="w-5 h-5 text-slate-500 m-auto" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-[11px] truncate">{b.title}</h4>
                              <p className="text-[10px] text-slate-400 truncate">by {b.author}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                <span className="font-extrabold text-emerald-400">₹{b.expectedPrice}</span>
                                {b.distanceKm !== undefined && (
                                  <span className="text-sky-300 font-semibold">{b.distanceKm.toFixed(1)} km away</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/books/${b.id}`}
                            onClick={() => setIsOpen(false)}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] transition-colors flex-shrink-0 flex items-center gap-1"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Order Cards */}
                  {msg.orders && msg.orders.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      {msg.orders.map((ord) => (
                        <div key={ord.id} className="bg-slate-950/80 border border-blue-900/40 p-3 rounded-xl space-y-1.5 text-[11px]">
                          <div className="flex justify-between font-bold">
                            <span className="text-sky-400">{ord.id}</span>
                            <span className="text-emerald-400">₹{ord.amount}</span>
                          </div>
                          <div className="text-slate-300 font-medium">{ord.bookTitle}</div>
                          <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                            <span>Status: <strong className="text-white">{ord.orderStatus}</strong></span>
                            <span>Staff: <strong className="text-sky-300">{ord.staffName}</strong></span>
                          </div>
                          <Link
                            href="/dashboard/tracking"
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] text-center block transition-colors"
                          >
                            Track Live Order
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Quick Follow-Up Buttons */}
                  {msg.quickButtons && msg.quickButtons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                      {msg.quickButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(btn.actionText)}
                          className="px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800/40 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-blue-900/50 text-slate-400 rounded-2xl rounded-bl-none p-3 text-xs flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>Searching SQLite records & matching intent...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Buttons Header */}
          <div className="bg-slate-900 px-3 py-2 border-t border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 text-[10px] font-bold text-slate-300">
            <button
              onClick={() => handleSendMessage('Find Python books under ₹400')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
            >
              Search
            </button>
            <button
              onClick={() => handleSendMessage('How much should I sell my DBMS book for?')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
            >
              Fair Price
            </button>
            <button
              onClick={() => handleSendMessage('Where is my order?')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
            >
              Order Status
            </button>
            <button
              onClick={() => handleSendMessage('Find books near me')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap"
            >
              Nearby
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Assistant: e.g. 'DBMS books under 300'..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={isProcessing || !inputMessage.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
