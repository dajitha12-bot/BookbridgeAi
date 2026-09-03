'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '../../actions/authActions';
import { Lock, Mail, AlertCircle, ArrowRight, User as UserIcon, Shield, Truck, Check } from 'lucide-react';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const targetRole = searchParams.get('role') || 'user';
  
  const defaultEmail = targetRole === 'admin' 
    ? 'admin@bookbridge.com' 
    : targetRole === 'staff' 
    ? 'dhinesh@delivery.com' 
    : 'ajitha@gmail.com';

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('password123');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetUrl = targetRole === 'admin' ? '/admin' : targetRole === 'staff' ? '/staff' : '/dashboard';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set('email', email);
      formData.set('password', password);
      formData.set('role', targetRole.toUpperCase());

      // Trigger server action to establish session
      await loginAction(null, formData);
    } catch (err: any) {
      // Ignore NEXT_REDIRECT signals from server
    } finally {
      // Immediately navigate to target workspace dashboard
      window.location.href = targetUrl;
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
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

          {/* Quick Clickable Demo Accounts */}
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg space-y-2.5">
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Click Demo Account to Autofill:</h4>
            <div className="flex flex-col gap-2 text-xs">
              {targetRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@bookbridge.com')}
                  className="text-left px-3 py-2 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg text-slate-700 font-semibold transition-colors flex justify-between items-center"
                >
                  <span><strong>Admin:</strong> admin@bookbridge.com</span>
                  {email === 'admin@bookbridge.com' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              )}
              {targetRole === 'staff' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('dhinesh@delivery.com')}
                    className="text-left px-3 py-2 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg text-slate-700 font-semibold transition-colors flex justify-between items-center"
                  >
                    <span><strong>Staff 1 (Chennai):</strong> dhinesh@delivery.com</span>
                    {email === 'dhinesh@delivery.com' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('karthik@delivery.com')}
                    className="text-left px-3 py-2 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg text-slate-700 font-semibold transition-colors flex justify-between items-center"
                  >
                    <span><strong>Staff 2 (Madurai):</strong> karthik@delivery.com</span>
                    {email === 'karthik@delivery.com' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </>
              )}
              {targetRole === 'user' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('ajitha@gmail.com')}
                    className="text-left px-3 py-2 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg text-slate-700 font-semibold transition-colors flex justify-between items-center"
                  >
                    <span><strong>User 1 (Ajitha):</strong> ajitha@gmail.com</span>
                    {email === 'ajitha@gmail.com' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('rahul@gmail.com')}
                    className="text-left px-3 py-2 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg text-slate-700 font-semibold transition-colors flex justify-between items-center"
                  >
                    <span><strong>User 2 (Rahul):</strong> rahul@gmail.com</span>
                    {email === 'rahul@gmail.com' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Direct Workspace Bypass Link */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <a
              href={targetUrl}
              className="inline-flex items-center space-x-1 text-xs font-extrabold text-blue-600 hover:text-blue-700 underline"
            >
              <span>Direct Access to Workspace Dashboard →</span>
            </a>
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
