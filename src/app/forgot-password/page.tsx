'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate database lookup & reset password
    // In a real environment, this would send an email, but here we provide a demo simulation
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!email.includes('@')) {
        setError('Please enter a valid email address.');
      } else {
        setSubmitted(true);
      }
    } catch (e) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center font-extrabold text-white text-xl">B</div>
          <span className="font-extrabold text-slate-800 text-2xl tracking-tight">BookBridge AI</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900">Reset your password</h2>
        <p className="text-xs text-slate-500">
          Enter your email address and we will simulate a temporary password reset code.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-100 shadow-sm sm:rounded-xl sm:px-10 space-y-6">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Password Reset Simulated</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We have simulated a password reset link for <span className="font-bold text-slate-700">{email}</span>.
                For demo convenience, the account password has been reset to: <span className="font-bold text-sky-600">password123</span>.
              </p>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-sm transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2.5 text-rose-600 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold rounded-lg text-sm transition-colors shadow-xs"
              >
                {loading ? 'Processing...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center text-xs font-semibold text-sky-500 hover:text-sky-600">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
