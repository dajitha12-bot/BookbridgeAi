'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white text-lg">B</div>
          <span className="font-bold text-slate-800 text-lg">BookBridge AI</span>
        </Link>
        <Link href="/login" className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-sm transition-colors">
          Log In
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-fade-in">
        <div className="space-y-6">
          <span className="text-xs font-bold text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950">Contact Us</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Have questions about exchange cycles, AI price predictions, or service area coverage? Fill out the contact form, and our support team will simulate a response.
          </p>

          <div className="space-y-4 pt-4 text-sm text-slate-600">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-sky-500" />
              <span>support@bookbridge.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-sky-500" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <MapPin className="w-5 h-5 text-sky-500" />
              <span>Chennai Headquarters, Tamil Nadu, India</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Message Received</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thank you for contacting us. We have received your query and will get back to you shortly.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-lg text-xs transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. SwapChain Inquiry"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what you need help with..."
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
              >
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
                {!loading && <Send className="w-4.5 h-4.5" />}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs font-semibold border-t border-slate-800 mt-auto">
        © {new Date().getFullYear()} BookBridge AI. All rights reserved.
      </footer>
    </div>
  );
}
