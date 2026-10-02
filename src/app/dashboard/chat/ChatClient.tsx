'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, BookOpen, RefreshCw, Phone, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ChatClient({ currentUserId }: { currentUserId: string }) {
  const searchParams = useSearchParams();
  const bookIdParam = searchParams.get('bookId');
  const sellerIdParam = searchParams.get('sellerId');
  const conversationIdParam = searchParams.get('conversationId');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      let targetConv: any = null;
      let targetMsgs: any[] = [];

      if (conversationIdParam) {
        const resMsg = await fetch(`/api/chat?conversationId=${conversationIdParam}`);
        if (resMsg.ok) {
          const dataMsg = await resMsg.json();
          targetMsgs = dataMsg.messages || [];
        }
      } else if (bookIdParam && sellerIdParam) {
        const res = await fetch(`/api/chat?bookId=${bookIdParam}&sellerId=${sellerIdParam}`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversation) {
            targetConv = data.conversation;
            targetMsgs = data.messages || [];
          }
        }
      }

      const resAll = await fetch('/api/chat');
      if (resAll.ok) {
        const dataAll = await resAll.json();
        const convList = dataAll.conversations || [];
        setConversations(convList);

        if (targetConv) {
          setActiveConv(targetConv);
          setMessages(targetMsgs);
        } else if (conversationIdParam) {
          const matched = convList.find((c: any) => c.id === conversationIdParam);
          if (matched) {
            setActiveConv(matched);
            setMessages(targetMsgs);
          } else if (convList.length > 0) {
            setActiveConv(convList[0]);
            fetchMessages(convList[0].id);
          }
        } else if (convList.length > 0) {
          setActiveConv(convList[0]);
          fetchMessages(convList[0].id);
        }
      }
    } catch (e) {
      console.error('Fetch conversations error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat?conversationId=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Fetch messages error:', e);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (activeConv) fetchMessages(activeConv.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [bookIdParam, sellerIdParam, conversationIdParam, activeConv?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || sending) return;

    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConv.id, message: msgText }),
      });
      if (res.ok) {
        fetchMessages(activeConv.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const otherPersonName = activeConv
    ? activeConv.buyerId === currentUserId
      ? activeConv.sellerName || 'Seller'
      : activeConv.buyerName || 'Buyer'
    : 'User';

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5.5 h-5.5 text-blue-600" />
            <span>Buyer & Seller Direct Chat</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time, persistent messaging between book buyers and sellers.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 min-h-[500px] overflow-hidden">
        {/* Conversations List Sidebar */}
        <div className="border-r border-slate-100 p-4 space-y-3 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Conversations</h3>
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading messages...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No chat conversations started yet. Click "Chat with Seller" on any book page to start a conversation.
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((c) => {
                const partner = c.buyerId === currentUserId ? c.sellerName : c.buyerName;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveConv(c);
                      fetchMessages(c.id);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      activeConv?.id === c.id
                        ? 'bg-white border-blue-500 shadow-xs'
                        : 'border-slate-100 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{c.bookTitle}</span>
                    </div>
                    <div className="text-slate-500 mt-1 flex justify-between">
                      <span>With: {partner || 'User'}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Chat Window */}
        <div className="md:col-span-2 flex flex-col justify-between p-4">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>{activeConv.bookTitle}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chat with <strong className="text-slate-700">{otherPersonName}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:9876543210"
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Seller</span>
                  </a>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>SQLite Persistent</span>
                  </span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[350px]">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No messages in this chat yet. Send a message to get started!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === currentUserId;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-slate-900 text-white rounded-br-none'
                              : 'bg-slate-100 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <div className="font-bold text-[10px] opacity-75">{m.senderName}</div>
                          <p className="leading-relaxed">{m.message}</p>
                          <div className="text-[9px] text-right opacity-60">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-100 pt-3 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Type your message to ${otherPersonName}...`}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-2 py-16">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <span>Select a conversation from the sidebar or click "Chat" on a book listing.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

