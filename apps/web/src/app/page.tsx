'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { useLanguage } from '../lib/language-context';
import { ImpactCard } from '../components/ui/impact-card';
import { api } from '../lib/api';
import {
  TrendingUp,
  Sprout,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  CheckCircle2,
  Building2,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';

export default function UnifiedHomePage() {
  const { user, isAuthenticated } = useAuth();
  const { t, translateCrop, formatCurrency } = useLanguage();
  const [heroPriceData, setHeroPriceData] = useState<any>(null);

  useEffect(() => {
    api.get<any>('/prices/dashboard?cropName=Tomato')
      .then((data) => setHeroPriceData(data))
      .catch(() => {
        setHeroPriceData({
          crop: 'Tomato',
          todayPrice: { modalPrice: 2233, minPrice: 1950, maxPrice: 2450 },
          analytics: { sma7: 2213, trend: 'BULLISH', percentChange: 6.8 },
          sellingWindow: { recommendation: 'Sell within next 24-48 Hours', confidence: 'HIGH' },
          comparison: { bestNearbyMarket: { marketName: 'Lasalgaon APMC', netGainPerQtl: 96 } },
        });
      });
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 rounded-3xl p-6 md:p-12 text-white shadow-2xl border border-amber-500/30">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            {t.heroPill}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            {t.heroHeadline}
          </h1>

          <p className="text-amber-100/90 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            {t.heroSubheadline}
          </p>

          {/* Action Gateway Buttons */}
          <div className="flex flex-wrap gap-3.5 pt-4">
            <Link
              href="/prices"
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition transform active:scale-95"
            >
              <TrendingUp className="w-4 h-4 text-slate-950" />
              {t.btnExplorePrices}
            </Link>

            <Link
              href={isAuthenticated && user?.role === 'FARMER' ? '/create-lot' : '/login'}
              className="bg-amber-600 hover:bg-amber-500 text-white font-black px-6 py-3.5 rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-amber-600/30 transition transform active:scale-95"
            >
              <Sprout className="w-4 h-4 text-yellow-300" />
              {t.btnStartSelling}
            </Link>

            <Link
              href="/browse-lots"
              className="bg-slate-900/90 hover:bg-slate-800 text-amber-200 border border-amber-500/30 font-black px-6 py-3.5 rounded-2xl text-sm flex items-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              {t.btnSourceProduce}
            </Link>
          </div>
        </div>

        {/* Hero Live Mandi Card Widget */}
        <div className="mt-8 pt-6 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-200 font-bold">
              <span>{translateCrop('Tomato')} {t.todayPriceLabel}</span>
              <span className="text-amber-400 font-black">▲ +6.8%</span>
            </div>
            <div className="text-2xl font-black text-white">
              {formatCurrency(heroPriceData?.todayPrice?.modalPrice || 2233)} <span className="text-xs font-normal text-amber-200">/ Qtl</span>
            </div>
            <p className="text-[10px] text-amber-200/80">Nashik APMC Main Yard</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-200 font-bold">
              <span>{t.spatialArbitrageLabel}</span>
              <span className="text-yellow-400 font-black">+₹96 {t.netGainBadge}</span>
            </div>
            <div className="text-2xl font-black text-yellow-300">
              {formatCurrency(2380)} <span className="text-xs font-normal text-amber-200">/ Qtl</span>
            </div>
            <p className="text-[10px] text-amber-200/80">Lasalgaon APMC (24 km transport offset)</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-200 font-bold">
              <span>{t.bestSellingWindowLabel}</span>
              <span className="bg-amber-400/30 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded">{t.optimalBadge}</span>
            </div>
            <div className="text-sm font-black text-white leading-snug">
              {t.sellNowAdvisory}
            </div>
            <p className="text-[10px] text-amber-200/80">{t.recommendationLabel} (92% Confidence)</p>
          </div>
        </div>
      </div>

      {/* 2. Impact Metrics */}
      <ImpactCard />

      {/* 3. Four-Step Interactive Trade Journey */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {t.howItWorksTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
            {t.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">{t.step1Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step1Desc}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">{t.step2Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step2Desc}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">{t.step3Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step3Desc}</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">{t.step4Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step4Desc}</p>
          </div>
        </div>
      </div>

      {/* 4. Value Propositions for Farmers and Buyers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/10 p-6 md:p-8 rounded-3xl border border-amber-200 space-y-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-amber-700" />
            <h3 className="font-black text-lg text-slate-900">{t.farmerBenefitsTitle}</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Real-time benchmark modal prices across multiple nearby APMC mandis.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Direct transparent bids from verified institutional buyers with zero commission deductions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Instant digital contract generation and verified direct bank settlements.</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-slate-900/5 via-slate-900/10 to-slate-900/5 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-800" />
            <h3 className="font-black text-lg text-slate-900">{t.buyerBenefitsTitle}</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Single-point procurement catalog with verified crop quality grades and GPS farm coordinates.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Direct bidding and negotiation desk with customizable volume procurement.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Complete supply chain auditability and standardized digital tax invoices.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 5. National Policy Alignment */}
      <div className="bg-slate-950 text-white p-6 md:p-8 rounded-3xl border border-amber-500/20 text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> {t.govtAlignmentTitle}
        </div>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          {t.govtAlignmentDesc}
        </p>
      </div>
    </div>
  );
}
