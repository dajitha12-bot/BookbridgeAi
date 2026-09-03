'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '../../actions/authActions';
import { Lock, Mail, AlertCircle, ArrowRight, User as UserIcon, Shield, Truck } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRole = searchParams.get('role') || 'user';
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(null, formData);

      if (res.success) {
        const targetUrl = res.redirectUrl || (targetRole === 'admin' ? '/admin' : targetRole === 'staff' ? '/staff' : '/dashboard');
        // Perform hard browser location redirect so Vercel includes the HTTP session cookie
        window.location.href = targetUrl;
      } else {
        setError(res.error || 'Login failed. Please try again.');
        setIsPending(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
      setIsPending(false);
    }
  };

  const getRoleHeader = () => {
    if (targetRole === 'admin') return { title: 'Admin Workspace', icon: Shield, color: 'text-blue-500 bg-blue-50' };
    if (targetRole === 'staff') return { title: 'Delivery Partner Portal', icon: Truck, color: 'text-emerald-600 bg-emerald-50' };
    return { title: 'User Account', icon: UserIcon, color: 'text-blue-500 bg-blue-50' };
  };

  const config = getRoleHeader();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800 font-sans select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-xl">B</div>
          <span className="font-extrabold text-slate-800 text-2xl tracking-tight">BookBridge AI</span>
        </Link>
        
        <div className="flex items-center justify-center space-x-1.5 py-1">
          <div className={`p-1.5 rounded-lg ${config.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{config.title}</span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900">Sign in to your account</h2>
        {targetRole === 'user' && (
          <p className="text-xs text-slate-500">
            Or{' '}
            <Link href="/register" className="font-semibold text-blue-500 hover:text-blue-600">
              create a new account for free
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-100 shadow-md sm:rounded-xl sm:px-10 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2.5 text-rose-600 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Hidden role identifier */}
            <input type="hidden" name="role" value={targetRole.toUpperCase()} />

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={targetRole === 'admin' ? 'admin@bookbridge.com' : targetRole === 'staff' ? 'dhinesh@delivery.com' : 'ajitha@gmail.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-blue-500 hover:text-blue-600">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-sm transition-colors shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>{isPending ? 'Signing in...' : 'Sign In'}</span>
              {!isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Accounts Banner */}
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg space-y-2.5">
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Demo Accounts (Password: password123)</h4>
            <div className="text-[11px] text-slate-600 space-y-1 font-medium">
              {targetRole === 'admin' && (
                <div><span className="font-bold">Admin:</span> admin@bookbridge.com</div>
              )}
              {targetRole === 'staff' && (
                <>
                  <div><span className="font-bold">Staff 1 (Chennai):</span> dhinesh@delivery.com</div>
                  <div><span className="font-bold">Staff 2 (Madurai):</span> karthik@delivery.com</div>
                </>
              )}
              {targetRole === 'user' && (
                <>
                  <div><span className="font-bold">User 1 (Chennai):</span> ajitha@gmail.com</div>
                  <div><span className="font-bold">User 2 (Chennai):</span> rahul@gmail.com</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 text-xs">Loading login portal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
