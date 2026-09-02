'use client';

import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, Trash, Check, Clock, CheckCircle } from 'lucide-react';

export default function NotificationsClient() {
  const { notifications, unreadCount, loading, markAsRead, clearAll } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with your sales, exchange requests, and delivery milestones.
          </p>
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-semibold border border-slate-250 transition-colors flex items-center gap-1.5"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

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
    </div>
  );
}
