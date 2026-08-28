'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { StatusBadge } from '../../components/ui/status-badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import {
  Package,
  PlusCircle,
  Gavel,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  LogIn,
  Flame,
  CheckCircle2,
  Clock,
  XCircle,
  Layers,
  ShoppingBag,
  CreditCard,
  UserCheck,
} from 'lucide-react';

type LotTab = 'ALL' | 'BIDDING' | 'SOLD' | 'OPEN' | 'CANCELLED';

export default function MyLotsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t, translateCrop, formatCurrency, formatUnit, formatDateLocalized } = useLanguage();
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LotTab>('ALL');

  const fetchLots = () => {
    api.get<any[]>('/lots')
      .then((res) => {
        if (res) {
          const userLots = user?.id ? res.filter((l) => l.farmerId === user.id || l.farmer?.name === user.name) : res;
          setLots(userLots.length > 0 ? userLots : res);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLots();
    const interval = setInterval(fetchLots, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-amber-200 shadow-md text-center space-y-4 my-8">
        <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">{t.commonLoginRequired}</h2>
        <p className="text-xs text-slate-600">{t.loginSubtitle}</p>
        <div className="pt-2">
          <Link
            href="/login"
            className="block w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black py-3 rounded-2xl text-xs transition shadow"
          >
            {t.btnSignIn}
          </Link>
        </div>
      </div>
    );
  }

  // Filter lots according to tab
  const filteredLots = lots.filter((lot) => {
    if (activeTab === 'ALL') return true;
    return lot.status === activeTab;
  });

  const countAll = lots.length;
  const countBidding = lots.filter((l) => l.status === 'BIDDING').length;
  const countSold = lots.filter((l) => l.status === 'SOLD').length;
  const countOpen = lots.filter((l) => l.status === 'OPEN').length;
  const countCancelled = lots.filter((l) => l.status === 'CANCELLED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {t.activeLotsTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.myLotsSubtitle}</p>
        </div>

        <Link
          href="/create-lot"
          className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/25 transition transform active:scale-95 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          {t.btnPublishLot}
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {t.tabAll}
          <span className={`text-[10px] px-2 py-0.2 rounded-full ${activeTab === 'ALL' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-slate-700'}`}>
            {countAll}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('BIDDING')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'BIDDING'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
              : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
          {t.tabBidding}
          <span className={`text-[10px] px-2 py-0.2 rounded-full ${activeTab === 'BIDDING' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-slate-700'}`}>
            {countBidding}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SOLD')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'SOLD'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t.tabSold}
          <span className={`text-[10px] px-2 py-0.2 rounded-full ${activeTab === 'SOLD' ? 'bg-white text-emerald-800' : 'bg-amber-100 text-slate-700'}`}>
            {countSold}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('OPEN')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'OPEN'
              ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-sm'
              : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          {t.tabOpen}
          <span className={`text-[10px] px-2 py-0.2 rounded-full ${activeTab === 'OPEN' ? 'bg-amber-900 text-white' : 'bg-amber-100 text-slate-700'}`}>
            {countOpen}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'CANCELLED'
              ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-sm'
              : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-50'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          {t.tabCancelled}
          <span className={`text-[10px] px-2 py-0.2 rounded-full ${activeTab === 'CANCELLED' ? 'bg-rose-900 text-white' : 'bg-amber-100 text-slate-700'}`}>
            {countCancelled}
          </span>
        </button>
      </div>

      {loading ? (
        <CardSkeleton count={3} />
      ) : filteredLots.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-amber-200 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            {activeTab === 'BIDDING' ? t.noBiddingTitle : activeTab === 'SOLD' ? t.noSoldTitle : t.noLotsTitle}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'BIDDING' ? t.noBiddingDesc : activeTab === 'SOLD' ? t.noSoldDesc : t.noLotsDesc}
          </p>
          <div className="pt-2">
            <Link
              href="/create-lot"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" /> {t.btnPublishLot}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLots.map((lot) => {
            const isBidding = lot.status === 'BIDDING';
            const isSold = lot.status === 'SOLD';
            const bids = lot.bids || [];
            const highestBid = bids.reduce((max: number, b: any) => (b.price > max ? b.price : max), 0);
            const txn = lot.transaction;
            const buyerName = txn?.buyer?.name || 'Verified Wholesale Buyer';
            const totalDealValue = txn?.totalAmount || (lot.expectedPrice * lot.quantity);
            const paymentStatus = txn?.payment?.status || 'PENDING';

            return (
              <div
                key={lot.id}
                className={`bg-white rounded-3xl border p-5 space-y-4 shadow-sm hover:shadow-md transition relative flex flex-col justify-between ${
                  isBidding
                    ? 'border-2 border-orange-400 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30'
                    : isSold
                    ? 'border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/30 via-white to-green-50/30'
                    : 'border-amber-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Title & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black ${
                        isBidding ? 'bg-orange-100 text-orange-800' : isSold ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base leading-tight">
                          {translateCrop(lot.crop?.name || lot.cropName || 'Crop')}
                        </h3>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-700" />
                          {lot.location || 'Nashik Yard'}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={lot.status} />
                  </div>

                  {/* ACTIVE BIDDING DEDICATED VIEW */}
                  {isBidding && (
                    <div className="bg-white p-3.5 rounded-2xl border border-orange-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">{t.askingRateLabel}:</span>
                        <strong className="text-slate-800">{formatCurrency(lot.expectedPrice)}/Qtl</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-orange-100">
                        <span className="text-orange-600 font-black flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" />
                          {t.topBuyerOfferLabel}:
                        </span>
                        <strong className="text-orange-700 text-sm font-black">
                          {highestBid > 0 ? `${formatCurrency(highestBid)}/Qtl` : '₹0'}
                        </strong>
                      </div>
                      <div className="text-[10px] text-orange-950 font-bold bg-orange-50 px-2 py-1 rounded-xl text-center">
                        🔥 {bids.length} {t.offersCountLabel}
                      </div>
                    </div>
                  )}

                  {/* SOLD DEDICATED VIEW */}
                  {isSold && (
                    <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">{t.buyerLabel}:</span>
                        <strong className="text-slate-900 font-bold flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          {buyerName}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-100">
                        <span className="text-slate-500 font-bold">{t.contractTotalLabel}:</span>
                        <strong className="text-emerald-700 text-sm font-black">
                          {formatCurrency(totalDealValue)}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-100">
                        <span className="text-slate-500 font-bold">{t.paymentStatusLabel}:</span>
                        <StatusBadge status={paymentStatus} type="payment" />
                      </div>
                    </div>
                  )}

                  {/* STANDARD DETAILS (for Open / Cancelled) */}
                  {!isBidding && !isSold && (
                    <div className="bg-amber-50/40 p-3 rounded-2xl border border-amber-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>{t.commonQuantity}:</span>
                        <strong className="text-slate-900">{lot.quantity} {formatUnit(lot.unit)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.askingRateLabel}:</span>
                        <strong className="text-amber-900 font-bold">{formatCurrency(lot.expectedPrice)}/Qtl</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.commonGrade}:</span>
                        <span className="text-slate-800 font-semibold">{lot.qualityGrade || 'Grade A'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Button */}
                <div className="pt-2 border-t border-amber-100/80">
                  <Link
                    href={`/my-lots/${lot.id}`}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm ${
                      isBidding
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 hover:opacity-90 shadow-orange-500/20'
                        : isSold
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                    }`}
                  >
                    <span>{isBidding ? t.btnViewOffers : isSold ? t.btnViewContract : t.commonViewDetails}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
