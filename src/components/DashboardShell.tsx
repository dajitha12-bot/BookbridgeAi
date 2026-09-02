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
  GitBranch,
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
  TrendingUp,
  ClipboardList,
  Settings as SettingsIcon,
  Gift
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function DashboardShell({
  sessionUser,
  children
}: {
  sessionUser: { id: string; name: string; email: string; role: string; avatarUrl?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on path change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const role = sessionUser.role.toUpperCase();

  // Navigation Links according to Role & Split Layout requirements
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
      { label: 'SwapChain', href: '/dashboard/swapchain', icon: GitBranch },
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
      { label: 'SwapChain', href: '/admin/swapchain', icon: GitBranch },
      { label: 'Delivery Staff', href: '/admin/staff', icon: Truck },
      { label: 'Deliveries', href: '/admin/deliveries', icon: ClipboardList },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
      { label: 'AI Price Analytics', href: '/admin/ai-analytics', icon: TrendingUp },
      { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
    ];
  } else if (role === 'DELIVERY_STAFF') {
    navigation = [
      { label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
      { label: 'Assigned Deliveries', href: '/staff/assigned', icon: ClipboardList },
      { label: 'Active Delivery', href: '/staff/active', icon: Truck },
      { label: 'Delivery History', href: '/staff/history', icon: ClipboardList },
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
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 bg-[#0f172a] border-r border-slate-800 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 h-16">
          {(!collapsed) ? (
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">B</div>
              <span className="font-bold text-white text-base tracking-tight">BookBridge AI</span>
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg mx-auto">B</div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-450 hover:bg-slate-800 hover:text-white"
          >
            {collapsed ? <ChevronRight className="w-4 h-4 text-slate-450" /> : <ChevronLeft className="w-4 h-4 text-slate-455" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {renderNavItems()}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-slate-450 hover:bg-slate-850 hover:text-red-400 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3 text-sm">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Side Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0f172a] border-r border-slate-800 transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">B</div>
            <span className="font-bold text-white text-base">BookBridge AI</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {renderNavItems()}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-slate-450 hover:bg-slate-850 hover:text-red-400 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="ml-3 text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Container */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 h-16 z-30">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-sky-50 md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Context/Title */}
          <div className="hidden md:flex items-center text-sm text-slate-500 font-medium">
            BookBridge Platform &gt; {role} Panel
          </div>

          {/* User Profile Card in Header */}
          <div className="flex items-center space-x-4">
            {/* Quick Notify Icon */}
            <Link 
              href={role === 'ADMIN' ? '/admin/notifications' : role === 'DELIVERY_STAFF' ? '/staff/notifications' : '/dashboard/notifications'} 
              className="relative p-2 rounded-full text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </Link>

            {/* Profile Avatar & Info */}
            <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-800 leading-tight">{sessionUser.name}</div>
                <div className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  {role}
                </div>
              </div>
              <Link href={role === 'ADMIN' ? '/admin/settings' : role === 'DELIVERY_STAFF' ? '/staff/profile' : '/dashboard/profile'}>
                {sessionUser.avatarUrl ? (
                  <img
                    src={sessionUser.avatarUrl}
                    alt={sessionUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-sky-100 hover:border-sky-500 transition-colors"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold hover:bg-sky-200 transition-colors animate-fade-in">
                    {sessionUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
