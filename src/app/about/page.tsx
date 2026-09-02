import Link from 'next/link';

export default function AboutPage() {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-8 animate-fade-in">
        <div className="space-y-4">
          <span className="text-xs font-bold text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Our Mission
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950">About BookBridge AI</h1>
          <p className="text-slate-600 text-sm leading-relaxed sm:text-base">
            BookBridge AI was built with a simple goal: to make book sharing accessible, affordable, and eco-friendly. Instead of letting old engineering textbooks, competitive exam guides, and classic fiction novels gather dust on shelves, BookBridge AI gives books a second life.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-slate-800">Our Core Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-lg space-y-1">
              <div className="font-bold text-slate-800">Community Exchange</div>
              <p className="text-slate-500 leading-relaxed">Swap books directly or utilize our graph-based SwapChain loops to find multi-user trades.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg space-y-1">
              <div className="font-bold text-slate-800">Embedded Machine Learning</div>
              <p className="text-slate-500 leading-relaxed">Our multivariable regression model predicts fair prices dynamically without calling expensive cloud APIs.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg space-y-1">
              <div className="font-bold text-slate-800">Proximity Metrics</div>
              <p className="text-slate-500 leading-relaxed">Haversine formula calculates geographical distances to match you with nearby sellers instantly.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg space-y-1">
              <div className="font-bold text-slate-800">Reliable Logistics</div>
              <p className="text-slate-500 leading-relaxed">Choose home delivery handled by our staff assigned via workload rules, or meet up at designated offline locations.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Technology Stack</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            The platform is built as a complete professional web application using:
          </p>
          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-2">
            <li><span className="font-bold">Next.js & React:</span> App Router, Server Actions, Client State Hooks.</li>
            <li><span className="font-bold">JSON Database Layer:</span> Thread-safe, atomic file-based JSON storage for lightweight trade operations.</li>
            <li><span className="font-bold">Tailwind CSS:</span> Responsive utility styling in dark blue, royal blue, and white.</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs font-semibold border-t border-slate-800 mt-auto">
        © {new Date().getFullYear()} BookBridge AI. All rights reserved.
      </footer>
    </div>
  );
}
