'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfileAction } from '../actions/authActions';
import { User, Phone, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProfileFormProps {
  initialUser: any;
}

export default function ProfileForm({ initialUser }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [phone, setPhone] = useState(initialUser.phone || '');
  const [city, setCity] = useState(initialUser.profile?.city || 'Chennai');
  const [area, setArea] = useState(initialUser.profile?.area || '');
  const [address, setAddress] = useState(initialUser.profile?.address || '');
  const [pincode, setPincode] = useState(initialUser.profile?.pincode || '');
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('city', city);
    formData.append('area', area);
    formData.append('address', address);
    formData.append('pincode', pincode);

    try {
      const res = await updateProfileAction(formData);
      if (res.success) {
        setMessage({ success: true, text: 'Profile updated successfully!' });
        router.refresh();
      } else {
        setMessage({ success: false, text: res.error || 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ success: false, text: 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800 animate-fade-in font-sans">
      <div>
        <h1 className="text-xl font-bold">My Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Configure your personal contact information and delivery address coordinates.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm sm:p-8 space-y-6">
        {message && (
          <div className={`p-3 rounded-lg flex items-start space-x-2.5 text-xs font-semibold ${
            message.success ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-rose-50 border border-rose-100 text-rose-600'
          }`}>
            {message.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
                />
              </div>
            </div>

            {/* Email (Disabled) */}
            <div className="space-y-1.5 opacity-60">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address (Locked)</label>
              <input
                type="email"
                disabled
                value={initialUser.email}
                className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
              >
                {['Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli', 'Tirunelveli'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Area / Neighborhood</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
                />
              </div>
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pincode</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Street Address Details</label>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white animate-fade-in"
            />
          </div>

          {/* Current Location Feature */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">GPS Location Mapping</span>
                <p className="text-[11px] text-slate-500">Auto-detect delivery coordinates via browser location permission.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) {
                      alert('Geolocation is not supported by your browser.');
                      return;
                    }
                    setMessage({ success: true, text: 'Requesting location permission from browser...' });
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        setArea(prev => prev || 'Adyar');
                        setMessage({
                          success: true,
                          text: `📍 Location permission granted! Coordinates: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}. Addresses saved.`,
                        });
                      },
                      (err) => {
                        setMessage({
                          success: false,
                          text: 'Location permission was denied. Please enable location access in your browser/device settings or enter your address manually.',
                        });
                      },
                      { timeout: 10000 }
                    );
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>📍 Use Current Location</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
          >
            {submitting ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
