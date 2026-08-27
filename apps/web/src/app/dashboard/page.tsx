'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { ImpactCard } from '../../components/ui/impact-card';
import { StatusBadge } from '../../components/ui/status-badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import {
  TrendingUp,
  Sprout,
  ShoppingBag,
  Gavel,
  FileCheck,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Package,
  Layers,
  MapPin,
  LogIn,
  BarChart3,
} from 'lucide-react';

export default function SmartDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  const [farmerData, setFarmerData] = useState<any>(null);
  const [buyerLots, setBuyerLots] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }

    if (user?.role === 'FARMER') {
      api.get<any>('/prices/dashboard?cropName=Tomato')
        .then((res) => setFarmerData(res))
        .catch(() => {})
        .finally(() => setLoadingContent(false));
    } else if (user?.role === 'BUYER') {
      api.get<any[]>('/lots?limit=4')
        .then((res) => setBuyerLots(res || []))
        .catch(() => {})
        .finally(() => setLoadingContent(false));
    } else if (user?.role === 'ADMIN') {
      api.get<any>('/analytics/summary')
        .then((res) => setAdminStats(res))
        .catch(() => {})
        .finally(() => setLoadingContent(false));
    } else {
      setLoadingContent(false);
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading || loadingContent) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto bg-slate-900/90 p-8 rounded-3xl border border-amber-500/30 shadow-xl text-center space-y-4 my-8">
        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">Please sign in to access your personalized command center.</p>
        <div className="pt-2">
          <Link
            href="/login"
            className="block w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black py-3 rounded-2xl text-xs transition shadow-md shadow-amber-500/20"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: FARMER DASHBOARD
  // ==========================================
  if (user.role === 'FARMER') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Farmer Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                {t.roleFarmer}
              </span>
              <span className="text-xs text-slate-400">{user.location || user.district || 'Maharashtra'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Ram Ram, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-xs text-slate-400">Real-time mandi prices, selling window advisory, and buyer offers</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/create-lot"
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/25 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              {t.btnPublishLot}
            </Link>
          </div>
        </div>

        {/* Top 3 KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hero Benchmark Rate */}
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm space-y-3 transition-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Tomato Benchmark Rate
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                Agmarknet Live
              </span>
            </div>

            <div>
              <div className="text-3xl font-black text-white tracking-tight">
                ₹{farmerData?.todayPrice?.modalPrice || 2233}{' '}
                <span className="text-sm font-semibold text-slate-400">/ Qtl</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Nashik APMC Main Yard</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">7-Day Moving Avg:</span>
              <span className="text-amber-300">₹{farmerData?.analytics?.sma7 || 2213}/Qtl</span>
            </div>
          </div>

          {/* Best Selling Window */}
          <div className="bg-gradient-to-br from-amber-950 to-amber-900 text-white p-5 rounded-3xl shadow-md border border-amber-500/30 space-y-3 transition-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-yellow-300">
                <Sparkles className="w-4 h-4" />
                <span>{t.sellingWindow}</span>
              </div>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                OPTIMAL
              </span>
            </div>

            <div>
              <div className="text-lg font-black text-white leading-tight">
                {farmerData?.sellingWindow?.recommendation || 'Sell within next 24-48 Hours'}
              </div>
              <p className="text-xs text-amber-200 mt-1 leading-snug">
                {farmerData?.sellingWindow?.reasoning || 'Price momentum peak detected before new market supply arrives.'}
              </p>
            </div>

            <div className="pt-2 border-t border-amber-800/80 flex items-center justify-between text-xs text-amber-300">
              <span>Momentum: <strong>BULLISH (+6.8%)</strong></span>
            </div>
          </div>

          {/* Nearby Market Arbitrage */}
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm space-y-3 transition-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Nearby Arbitrage
              </span>
              <span className="text-yellow-400 text-xs font-black">+₹96 Net Gain</span>
            </div>

            <div>
              <div className="text-lg font-black text-white">
                Lasalgaon APMC (₹2,380/Qtl)
              </div>
              <p className="text-xs text-slate-400 mt-0.5">24 km distance (₹12 transport deducted)</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <Link href="/prices" className="text-amber-400 font-extrabold hover:underline flex items-center gap-1">
                View Price Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Today's Impact Card */}
        <ImpactCard />

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/prices"
            className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm hover:border-amber-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <TrendingUp className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="font-extrabold text-white text-sm">7-Day Price Trends</h3>
            <p className="text-xs text-slate-400 mt-0.5">Interactive Agmarknet price charts and regional comparisons</p>
          </Link>

          <Link
            href="/create-lot"
            className="bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 p-5 rounded-3xl shadow-md transition flex flex-col justify-between"
          >
            <Sprout className="w-6 h-6 text-slate-950 mb-2" />
            <h3 className="font-black text-slate-950 text-sm">Publish Crop Lot</h3>
            <p className="text-xs text-slate-950/80 font-semibold mt-0.5">List produce directly to verified commercial buyers</p>
          </Link>

          <Link
            href="/my-lots"
            className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm hover:border-amber-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <Package className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="font-extrabold text-white text-sm">My Lots & Received Bids</h3>
            <p className="text-xs text-slate-400 mt-0.5">Review buyer offers, accept winning deals, and track payments</p>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: BUYER DASHBOARD
  // ==========================================
  if (user.role === 'BUYER') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Buyer Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                {t.roleBuyer}
              </span>
              <span className="text-xs text-slate-400">{user.name} ({user.district || 'National'})</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Procurement Command Center
            </h1>
            <p className="text-xs text-slate-400">Farm-gate crop discovery, transparent bidding, and purchase contracts</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/browse-lots"
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              Explore Marketplace
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm transition-card">
            <span className="text-xs font-bold text-slate-400 block">Available Lots</span>
            <span className="text-2xl font-black text-white mt-1 block">4 Active</span>
          </div>
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm transition-card">
            <span className="text-xs font-bold text-slate-400 block">Active Bids</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">2 Submitted</span>
          </div>
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm transition-card">
            <span className="text-xs font-bold text-slate-400 block">Finalized Contracts</span>
            <span className="text-2xl font-black text-yellow-400 mt-1 block">1 Completed</span>
          </div>
          <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm transition-card">
            <span className="text-xs font-bold text-slate-400 block">Total Sourced (GMV)</span>
            <span className="text-2xl font-black text-white mt-1 block">₹2,25,000</span>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/browse-lots"
            className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm hover:border-amber-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <ShoppingBag className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="font-extrabold text-white text-sm">Crop Marketplace</h3>
            <p className="text-xs text-slate-400 mt-0.5">Discover fresh harvest lots with APMC mandi benchmark guides</p>
          </Link>

          <Link
            href="/my-bids"
            className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm hover:border-amber-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <Gavel className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="font-extrabold text-white text-sm">Bid Management Desk</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track status of active offers and negotiations</p>
          </Link>

          <Link
            href="/transactions"
            className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm hover:border-amber-500 hover:shadow-md transition flex flex-col justify-between"
          >
            <FileCheck className="w-6 h-6 text-amber-400 mb-2" />
            <h3 className="font-extrabold text-white text-sm">Purchases & Settlement</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage legally binding contracts and update payment status</p>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-2">
          <span className="bg-slate-800 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            {t.roleAdmin}
          </span>
          <span className="text-xs text-slate-400">Ministry of Agriculture & APMC Directorate</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
          {t.adminTitle}
        </h1>
        <p className="text-xs text-slate-400">{t.adminSubtitle}</p>
      </div>

      <ImpactCard />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm space-y-1 transition-card">
          <span className="text-xs font-bold text-slate-400 block">Total GMV Settled</span>
          <span className="text-2xl font-black text-amber-400 block">
            ₹{adminStats?.totalGrossMerchandiseValue?.toLocaleString('en-IN') || '2,25,000'}
          </span>
          <p className="text-[11px] text-slate-500">100% Direct Payout to Farmers</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm space-y-1 transition-card">
          <span className="text-xs font-bold text-slate-400 block">Commission Saved</span>
          <span className="text-2xl font-black text-yellow-400 block">
            ₹{adminStats?.commissionSaved?.toLocaleString('en-IN') || '19,125'}
          </span>
          <p className="text-[11px] text-slate-500">8.5% Traditional Middleman Margin Retained</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm space-y-1 transition-card">
          <span className="text-xs font-bold text-slate-400 block">Active Trading APMCs</span>
          <span className="text-2xl font-black text-amber-300 block">
            {adminStats?.connectedMandis || 8} Mandis
          </span>
          <p className="text-[11px] text-slate-500">Agmarknet Gateway Synchronized</p>
        </div>
      </div>
    </div>
  );
}
