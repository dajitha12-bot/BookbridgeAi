'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, Trash, Check, Clock, MessageSquare, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsClient() {
  const { notifications, unreadCount, loading, markAsRead, clearAll } = useNotifications();
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'MESSAGES'>('SYSTEM');
  const [chatConvs, setChatConvs] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  useEffect(() => {
    async function loadChats() {
      setLoadingChats(true);
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const data = await res.json();
          setChatConvs(data.conversations || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingChats(false);
      }
    }
    loadChats();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Notifications & Chat Inbox</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with your system alerts, sales, exchange requests, and direct buyer/seller chat messages.
          </p>
        </div>
        
        {notifications.length > 0 && activeTab === 'SYSTEM' && (
          <button
            onClick={clearAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-semibold border border-slate-250 transition-colors flex items-center gap-1.5"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'SYSTEM'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>System Alerts ({notifications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('MESSAGES')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'MESSAGES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Buyer & Seller Messages ({chatConvs.length})</span>
        </button>
      </div>

      {activeTab === 'SYSTEM' ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
          {loading ? (
            <div className="text-center py-6 text-slate-500 text-sm animate-pulse">
              Loading notification logs...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm space-y-3">
              <Bell className="w-12 h-12 mx-auto text-slate-200" />
              <h3 className="font-bold text-slate-700">Inbox is empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Any system status changes, order logs, or cycle matches will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 ${
                    !notif.isRead ? 'bg-sky-50/20 px-3 rounded-lg -mx-3 border-l-4 border-l-sky-500 my-1 first:mt-0' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                      !notif.isRead ? 'bg-sky-100 text-sky-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <Bell className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'}`}>
                        {notif.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">{notif.message}</p>
                      
                      <div className="flex items-center text-[10px] text-slate-400 mt-2 font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-1 text-sky-500 hover:bg-sky-50 rounded-md transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
          {loadingChats ? (
            <div className="text-center py-6 text-slate-500 text-sm animate-pulse">
              Loading chat messages...
            </div>
          ) : chatConvs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm space-y-3">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-200" />
              <h3 className="font-bold text-slate-700">No Chat Conversations</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                When you initiate a chat with a book seller or buyer, conversation logs will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-3">
              {chatConvs.map((conv) => (
                <div key={conv.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{conv.bookTitle}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Seller: <strong>{conv.sellerName}</strong> • Buyer: <strong>{conv.buyerName}</strong>
                      </p>
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        Last updated: {new Date(conv.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/chat?conversationId=${conv.id}`}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Open Chat</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

