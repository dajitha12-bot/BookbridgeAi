import Link from 'next/link';
import { ShoppingBag, DollarSign, RefreshCw, Truck } from 'lucide-react';

export default function HowItWorksPage() {
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
        <div className="space-y-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950">How BookBridge Works</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            A step-by-step breakdown of how you can buy, sell, swap, and deliver books.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          {[
            {
              title: '1. Buy Used Books',
              icon: ShoppingBag,
              steps: [
                'Browse available books in your city using real-time search.',
                'Filter listings by price, condition, or delivery availability.',
                'Review coordinates-based distance to nearby sellers.',
                'Checkout securely with Cash on Delivery or Demo Online Payment.',
              ],
            },
            {
              title: '2. Sell Old Books',
              icon: DollarSign,
              steps: [
                'List your book with details: title, condition, and original price.',
                'Receive an instant AI fair-price suggestion from our regression model.',
                'Accept the suggestion or customize your expected resale price.',
                'Wait for buyers to purchase or propose exchanges.',
              ],
            },
            {
              title: '3. Exchange & SwapChain',
              icon: RefreshCw,
              steps: [
                'Offer a book from your list to swap with someone else\'s book.',
                'If direct match is not available, open the SwapChain panel.',
                'Our graph algorithm automatically finds trade cycles (e.g. U1 -> U2 -> U3 -> U1).',
                'Approve the proposed chain and wait for all participants to accept.',
              ],
            },
            {
              title: '4. Deliveries',
              icon: Truck,
              steps: [
                'Choose Home Delivery to have staff collect and drop off packages.',
                'Staff is recommended by weighted rules: proximity, active workload, availability.',
                'Or choose Offline Pickup: meet the seller at a safe public location.',
                'Track the shipment status in real-time on your delivery log.',
              ],
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-sky-50 text-sky-500 rounded-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">{item.title}</h2>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 pl-2">
                  {item.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start">
                      <span className="text-sky-500 font-bold mr-2">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs font-semibold border-t border-slate-800 mt-auto">
        © {new Date().getFullYear()} BookBridge AI. All rights reserved.
      </footer>
    </div>
  );
}
