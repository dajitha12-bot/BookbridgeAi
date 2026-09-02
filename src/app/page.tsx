import Link from 'next/link';
import { BookOpen, ShieldAlert, Truck, Sparkles, Heart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col justify-between select-none">
      {/* Header Bar */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-xl">B</div>
            <span className="font-extrabold text-white text-lg tracking-tight">BookBridge AI</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-blue-400 font-extrabold bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>Buy • Sell • Exchange • Deliver</span>
          </div>
        </div>
      </header>

      {/* Main Landing / Role Cards */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-10">
        <div className="text-center space-y-4 max-w-2xl">
          <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-[10px] uppercase font-bold tracking-widest rounded-full border border-blue-100">
            BookBridge AI
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-none">
            Smart Book Exchange & <span className="text-blue-600">Delivery Platform</span>
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed font-semibold max-w-lg mx-auto">
            "Buy. Sell. Exchange. Deliver."
          </p>
        </div>

        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">Choose Your Workspace role to enter</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Card 1: User */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-lg">User</h3>
              <p className="text-xs font-semibold text-blue-600">Buy or Sell Books</p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 max-w-[210px] min-h-[50px]">
                Search used textbooks, trade books in circular swaps, claim free charity donations, or purchase with home delivery.
              </p>
            </div>
            <div className="w-full pt-4 flex flex-col gap-2">
              <Link 
                href="/login?role=user" 
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Login</span>
              </Link>
              <Link 
                href="/register" 
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center"
              >
                <span>Register</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Delivery Staff */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-650 flex items-center justify-center">
              <Truck className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-lg">Delivery Staff</h3>
              <p className="text-xs font-semibold text-indigo-600">Manage Deliveries</p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 max-w-[210px] min-h-[50px]">
                Accept assigned book parcels, navigate using coordinate metrics, and update delivery milestones.
              </p>
            </div>
            <div className="w-full pt-4">
              <Link 
                href="/login?role=staff" 
                className="w-full inline-block py-2.5 bg-blue-600 hover:bg-blue-755 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                <span>Staff Login</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Admin */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-lg">Admin</h3>
              <p className="text-xs font-semibold text-slate-600">Manage Platform</p>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 max-w-[210px] min-h-[50px]">
                Audit active listings, oversee automated courier routing recommendations, and analyze pricing regression models.
              </p>
            </div>
            <div className="w-full pt-4">
              <Link 
                href="/login?role=admin" 
                className="w-full inline-block py-2.5 bg-blue-600 hover:bg-blue-755 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-white py-8 text-center text-xs font-semibold text-slate-400 flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-1.5 text-blue-400">
          <BookOpen className="w-4 h-4" />
          <span className="font-extrabold">BookBridge AI</span>
        </div>
        <p className="text-slate-500">© {new Date().getFullYear()} BookBridge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
