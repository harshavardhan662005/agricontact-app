import React from 'react';
import Link from 'next/link';
import { 
  Leaf, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Search, 
  MapPin, 
  PhoneCall, 
  ChevronRight,
  Store,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. GLASSMORPHIC NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 rounded-2xl shadow-md shadow-emerald-500/20 text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Agri<span className="text-emerald-600">Connect</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest font-bold text-slate-400 -mt-1">
                Direct Farm Network
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 font-medium text-sm text-slate-600">
            <Link href="#marketplace" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
            <Link href="#features" className="hover:text-emerald-600 transition-colors">Features</Link>
            <Link href="#prices" className="hover:text-emerald-600 transition-colors">Live Mandi Prices</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link 
              href="/login" 
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-xl shadow-lg shadow-emerald-600/25 flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Empowering 10,000+ Local Farmers Across India</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
                Connecting Farmers Directly to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Fair Markets</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8">
                Eliminate middlemen, check real-time market prices, and buy or sell produce effortlessly with transparent field-to-buyer networking.
              </p>

              {/* SEARCH BAR WIDGET */}
              <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mb-10">
                <div className="flex-1 flex items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search crop, seed, or fertilizer..." 
                    className="bg-transparent w-full text-sm focus:outline-none text-slate-800 placeholder-slate-400"
                  />
                </div>
                <div className="flex items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 sm:w-48">
                  <MapPin className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Location" 
                    className="bg-transparent w-full text-sm focus:outline-none text-slate-800 placeholder-slate-400"
                  />
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 shrink-0 flex items-center justify-center space-x-2">
                  <span>Explore</span>
                </button>
              </div>

              {/* STATS BANNER */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-200/60">
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Verified Buyers</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600">₹0</p>
                  <p className="text-xs text-slate-500 font-medium">Middleman Fees</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">24/7</p>
                  <p className="text-xs text-slate-500 font-medium">Mandi Price Updates</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-black text-amber-600">15+ States</p>
                  <p className="text-xs text-slate-500 font-medium">Active Coverage</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CORE FEATURES GRID */}
        <section id="features" className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Everything You Need to Scale Agriculture
              </h2>
              <p className="text-slate-600">
                Designed specifically for outdoor field accessibility, clarity, and ease of use.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-slate-50 rounded-2xl p-8 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Direct Marketplace</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  List crops directly with high-contrast photo uploads, pricing, and produce details without broker interference.
                </p>
                <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  <span>Browse Listings</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group bg-slate-50 rounded-2xl p-8 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Live Mandi Trends</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Track price changes daily across major regional mandis so you sell your crop at peak market valuation.
                </p>
                <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  <span>Check Prices</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group bg-slate-50 rounded-2xl p-8 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">One-Tap Connect</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Direct call and instant WhatsApp connectivity for quick deal negotiations directly between farmers and buyers.
                </p>
                <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  <span>Connect Now</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CALL TO ACTION SECTION */}
        <section className="py-16 bg-gradient-to-br from-slate-900 to-emerald-950 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight">
              Ready to Upgrade Your Agricultural Business?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-base sm:text-lg">
              Join thousands of farmers getting fair produce prices directly on AgriConnect.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                Register as a Farmer / Buyer
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-sm">
        <p>© {new Date().getFullYear()} AgriConnect. Empowering Sustainable Agriculture.</p>
      </footer>
    </div>
  );
}