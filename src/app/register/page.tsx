'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { registerAction } from '../../actions/authActions';
import { Lock, Mail, User, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await registerAction(null, formData);

      if (res.success) {
        const targetUrl = res.redirectUrl || '/dashboard';
        window.location.href = targetUrl;
      } else {
        setError(res.error || 'Registration failed.');
        setIsPending(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-xl">B</div>
          <span className="font-extrabold text-slate-800 text-2xl tracking-tight">BookBridge AI</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900">Create your account</h2>
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-600">
            Sign in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 border border-slate-100 shadow-sm sm:rounded-xl sm:px-10 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2.5 text-rose-600 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  />
                </div>
              </div>

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
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label htmlFor="city" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                >
                  {['Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli', 'Tirunelveli'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div className="space-y-1.5">
                <label htmlFor="area" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Area / Neighborhood
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="area"
                    name="area"
                    type="text"
                    required
                    placeholder="e.g. Anna Nagar"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div className="space-y-1.5">
                <label htmlFor="pincode" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Pincode
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  required
                  placeholder="600040"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label htmlFor="role" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Register as
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                >
                  <option value="USER">Reader / Seller / Buyer</option>
                  <option value="DELIVERY_STAFF">Delivery Staff Partner</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Street Address Details
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={2}
                placeholder="Door No, Street Name, Landmark..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 bg-white"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-sm transition-colors shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>{isPending ? 'Creating Account...' : 'Register Account'}</span>
              {!isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
