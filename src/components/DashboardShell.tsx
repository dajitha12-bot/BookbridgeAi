'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Search,
  BookOpen,
  PlusCircle,
  MessageSquarePlus,
  RefreshCw,
  Heart,
  ShoppingBag,
  DollarSign,
  Bell,
  Star,
  User as UserIcon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Truck,
  Users as UsersIcon,
  CreditCard,
  BarChart3,
  Brain,
  Settings as SettingsIcon,
  Gift,
  ClipboardList,
  CheckCircle2,
  Package,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fallback demo user if AuthContext loading
  const sessionUser = user || {
    name: 'Demo User',
    role: 'USER',
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const role = sessionUser.role.toUpperCase();

  // Navigation Links according to Role
  let navigation: SidebarItem[] = [];

  if (role === 'USER') {
    navigation = [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Browse Books', href: '/browse', icon: Search },
      { label: 'My Books', href: '/dashboard/my-books', icon: BookOpen },
      { label: 'Add Book', href: '/dashboard/add-book', icon: PlusCircle },
      { label: 'Book Donations', href: '/dashboard/donations', icon: Gift },
      { label: 'Book Requests', href: '/dashboard/requests', icon: MessageSquarePlus },
      { label: 'Exchange', href: '/dashboard/exchange', icon: RefreshCw },
      { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
      { label: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
      { label: 'My Sales', href: '/dashboard/sales', icon: DollarSign },
      { label: 'My Rentals', href: '/dashboard/rentals', icon: ClipboardList },
      { label: 'Delivery Tracking', href: '/dashboard/tracking', icon: Truck },
      { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { label: 'Reviews', href: '/dashboard/reviews', icon: Star },
      { label: 'Profile', href: '/dashboard/profile', icon: UserIcon },
      { label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
    ];
  } else if (role === 'ADMIN') {
    navigation = [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Users', href: '/admin/users', icon: UsersIcon },
      { label: 'Books', href: '/admin/books', icon: BookOpen },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Exchanges', href: '/admin/exchanges', icon: RefreshCw },
      { label: 'Rentals', href: '/admin/rentals', icon: ClipboardList },
      { label: 'Delivery Staff', href: '/admin/delivery-staff', icon: Truck },
      { label: 'Deliveries', href: '/admin/deliveries', icon: Package },
      { label: 'Payments', href: '/admin/payments', icon: DollarSign },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
      { label: 'AI Price Analytics', href: '/admin/ai-price', icon: Brain },
      { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
    ];
  } else if (role === 'DELIVERY_STAFF') {
    navigation = [
      { label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
      { label: 'Assigned Deliveries', href: '/staff/assigned', icon: ClipboardList },
      { label: 'Active Delivery', href: '/staff/active', icon: Truck },
      { label: 'Delivery History', href: '/staff/history', icon: CheckCircle2 },
      { label: 'Rental Deliveries', href: '/staff/rental-deliveries', icon: Truck },
      { label: 'Notifications', href: '/staff/notifications', icon: Bell },
      { label: 'Profile', href: '/staff/profile', icon: UserIcon },
      { label: 'Settings', href: '/staff/settings', icon: SettingsIcon },
    ];
  }

  const renderNavItems = () => {
    return navigation.map((item) => {
      const Icon = item.icon;
      const isRoot = item.href === '/dashboard' || item.href === '/admin' || item.href === '/staff';
      const isActive = isRoot 
        ? pathname === item.href
        : pathname.startsWith(item.href);

      return (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center px-4 py-3 rounded-lg transition-colors group relative ${
            isActive
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
          {(!collapsed || mobileOpen) && (
            <span className="ml-3 truncate text-sm">{item.label}</span>
          )}
          {item.label === 'Notifications' && unreadCount > 0 && (
            <span
              className={`absolute right-3 top-3 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full border ${
                isActive ? 'bg-white text-blue-600 border-blue-600' : 'bg-red-500 text-white border-white'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Mobile Top Navigation */}
      <header className="md:hidden bg-slate-900 text-white h-16 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md hover:bg-slate-800 text-slate-300 focus:outline-none"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">B</div>
            <span className="font-bold tracking-tight text-white">BookBridge AI</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/dashboard/notifications" className="relative p-2 text-slate-300 hover:text-white">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-0 z-50 h-screen bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 ${
            mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
          } ${collapsed ? 'md:w-20' : 'md:w-64'}`}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
            {(!collapsed || mobileOpen) ? (
              <Link href="/" className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-base shadow-sm">B</div>
                <span className="font-extrabold text-white text-base tracking-tight">BookBridge AI</span>
              </Link>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-lg shadow-sm">B</div>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* User Profile Summary */}
          <div className="px-4 py-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center space-x-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {sessionUser.name.charAt(0).toUpperCase()}
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{sessionUser.name}</p>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block mt-0.5">
                  {role}
                </span>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {renderNavItems()}
          </nav>

          {/* Footer / Logout */}
          <div className="p-3 border-t border-slate-800 flex-shrink-0">
            <button
              onClick={logout}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors ${
                collapsed && !mobileOpen ? 'justify-center' : 'space-x-3'
              }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-red-400" />
              {(!collapsed || mobileOpen) && <span className="text-sm font-medium">Log Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
          {/* Top Desktop Bar */}
          <header className="hidden md:flex h-16 bg-white border-b border-slate-200/80 px-8 items-center justify-between sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                BookBridge Platform &gt; <span className="text-blue-600 font-extrabold">{role} Panel</span>
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/notifications"
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">{sessionUser.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{role}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  {sessionUser.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Main Viewport Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
