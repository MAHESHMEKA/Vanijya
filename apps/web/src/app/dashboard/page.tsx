'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
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
  Flame,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Users,
  Activity,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';

type AdminTab = 'OVERVIEW' | 'LOTS' | 'BIDS' | 'USERS' | 'TRANSACTIONS' | 'ACTIVITY';

export default function SmartDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, translateCrop, formatCurrency, formatUnit, formatDateLocalized, translateStatus } = useLanguage();

  const [farmerLots, setFarmerLots] = useState<any[]>([]);
  const [farmerBids, setFarmerBids] = useState<any[]>([]);
  const [buyerLots, setBuyerLots] = useState<any[]>([]);
  const [buyerBids, setBuyerBids] = useState<any[]>([]);

  // Admin states
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminLots, setAdminLots] = useState<any[]>([]);
  const [adminBids, setAdminBids] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any>({ farmers: [], buyers: [] });
  const [adminTransactions, setAdminTransactions] = useState<any[]>([]);
  const [adminActivity, setAdminActivity] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<AdminTab>('OVERVIEW');

  const [loadingContent, setLoadingContent] = useState(true);

  const loadData = () => {
    if (!isAuthenticated) return;

    if (user?.role === 'FARMER') {
      Promise.all([
        api.get<any[]>('/lots'),
        api.get<any[]>('/bids/my'),
      ])
        .then(([lotsRes, bidsRes]) => {
          const userLots = lotsRes ? lotsRes.filter((l) => l.farmerId === user.id || l.farmer?.name === user.name) : [];
          setFarmerLots(userLots.length > 0 ? userLots : lotsRes || []);
          setFarmerBids(bidsRes || []);
        })
        .catch(() => {})
        .finally(() => setLoadingContent(false));
    } else if (user?.role === 'BUYER') {
      Promise.all([
        api.get<any[]>('/lots'),
        api.get<any[]>('/bids/my'),
      ])
        .then(([lotsRes, bidsRes]) => {
          setBuyerLots(lotsRes || []);
          setBuyerBids(bidsRes || []);
        })
        .catch(() => {})
        .finally(() => setLoadingContent(false));
    } else if (user?.role === 'ADMIN') {
      Promise.all([
        api.get<any>('/admin/dashboard'),
        api.get<any[]>('/admin/lots'),
        api.get<any[]>('/admin/bids'),
        api.get<any>('/admin/users'),
        api.get<any[]>('/admin/transactions'),
        api.get<any[]>('/admin/activity'),
      ])
        .then(([stats, lots, bids, users, txns, activity]) => {
          setAdminStats(stats);
          setAdminLots(lots || []);
          setAdminBids(bids || []);
          setAdminUsers(users || { farmers: [], buyers: [] });
          setAdminTransactions(txns || []);
          setAdminActivity(activity || []);
        })
        .catch(() => {})
        .finally(() => setLoadingContent(false));
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  if (isLoading || loadingContent) {
    return <CardSkeleton count={3} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-amber-200 shadow-md text-center space-y-4 my-8 animate-in fade-in">
        <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">{t.commonLoginRequired}</h2>
        <p className="text-xs text-slate-600">{t.loginSubtitle}</p>
        <div className="pt-2">
          <Link
            href="/login"
            className="block w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-2xl text-xs transition shadow-md shadow-amber-500/20"
          >
            {t.btnSignIn}
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: FARMER COMMAND CENTER
  // ==========================================
  if (user.role === 'FARMER') {
    const activeBiddingLots = farmerLots.filter((l) => l.status === 'BIDDING');
    const soldLots = farmerLots.filter((l) => l.status === 'SOLD');
    const openLots = farmerLots.filter((l) => l.status === 'OPEN');
    const pendingBidsCount = farmerBids.filter((b) => b.status === 'PENDING').length;

    const totalSaleValue = soldLots.reduce((acc, l) => acc + (l.transaction?.totalAmount || (l.expectedPrice * l.quantity)), 0);
    const pendingPaymentsValue = soldLots
      .filter((l) => l.transaction?.payment?.status !== 'PAID')
      .reduce((acc, l) => acc + (l.transaction?.totalAmount || 0), 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-6 md:p-8 rounded-3xl text-slate-950 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5" /> {t.farmerDashboardTitle}
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              {t.farmerWelcomeTitle}, {user.name} 👋
            </h1>
            <p className="text-xs md:text-sm font-bold text-slate-900/90 max-w-xl">
              {t.farmerTagline}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5 relative z-10">
            <Link
              href="/create-lot"
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition"
            >
              <PlusCircle className="w-4 h-4" /> {t.btnPublishLot}
            </Link>
            <Link
              href="/my-lots"
              className="bg-white/90 hover:bg-white text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow transition"
            >
              <Layers className="w-4 h-4" /> {t.btnViewAllLots} ({farmerLots.length})
            </Link>
          </div>
        </div>

        {/* 6 REAL FARMER KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-3xl border border-orange-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-orange-900 tracking-wider">{t.kpiActiveBidding}</span>
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500 animate-pulse" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">{activeBiddingLots.length}</span>
            <span className="text-[10px] text-orange-800 font-bold block">{t.kpiActiveBiddingSub}</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-3xl border border-emerald-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">{t.kpiSoldLots}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">{soldLots.length}</span>
            <span className="text-[10px] text-emerald-800 font-bold block">{t.kpiSoldLotsSub}</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiPendingBids}</span>
              <Gavel className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">{pendingBidsCount}</span>
            <span className="text-[10px] text-slate-500 font-bold block">{t.kpiPendingBidsSub}</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiOpenLots}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">{openLots.length}</span>
            <span className="text-[10px] text-slate-500 font-bold block">{t.kpiOpenLotsSub}</span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-3xl border border-amber-300 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-950 tracking-wider">{t.kpiTotalSales}</span>
              <DollarSign className="w-4 h-4 text-amber-800" />
            </div>
            <span className="text-xl font-black text-slate-950 block">{formatCurrency(totalSaleValue)}</span>
            <span className="text-[10px] text-amber-900 font-bold block">{t.kpiTotalSalesSub}</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiPendingPay}</span>
              <CreditCard className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-xl font-black text-slate-950 block">{formatCurrency(pendingPaymentsValue)}</span>
            <span className="text-[10px] text-slate-500 font-bold block">{t.kpiPendingPaySub}</span>
          </div>
        </div>

        {/* Section 1: Active Bidding Lots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600 fill-orange-500" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{t.sectionActiveBidding}</h2>
            </div>
            <Link href="/my-lots" className="text-xs text-amber-800 font-bold hover:underline">
              {t.commonViewDetails} &rarr;
            </Link>
          </div>

          {activeBiddingLots.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-amber-200 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">{t.noBiddingTitle}</p>
              <p className="text-[11px] text-slate-400">{t.noBiddingDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeBiddingLots.map((lot) => {
                const bids = lot.bids || [];
                const highestBid = bids.reduce((max: number, b: any) => (b.price > max ? b.price : max), 0);
                const highestBidObj = bids.find((b: any) => b.price === highestBid);

                return (
                  <div key={lot.id} className="bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50 p-5 rounded-3xl border-2 border-orange-400 shadow-md space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base text-slate-950">{translateCrop(lot.crop?.name || lot.cropName || 'Crop')}</span>
                      <StatusBadge status="BIDDING" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-2xl border border-amber-200">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t.askingRateLabel}</span>
                        <span className="font-bold text-slate-800">{formatCurrency(lot.expectedPrice)}/Qtl</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-orange-600 font-black block">{t.topBuyerOfferLabel}</span>
                        <span className="font-black text-orange-700 text-sm">{highestBid > 0 ? `${formatCurrency(highestBid)}/Qtl` : '₹0'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-slate-600">
                        {bids.length} {t.offersCountLabel}
                      </span>
                      <Link
                        href={`/my-lots/${lot.id}`}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-sm hover:opacity-90 transition"
                      >
                        {t.btnViewOffers}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Sold Produce */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{t.sectionSoldContracts}</h2>
            </div>
            <Link href="/my-lots" className="text-xs text-amber-800 font-bold hover:underline">
              {t.commonViewDetails} &rarr;
            </Link>
          </div>

          {soldLots.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-amber-200 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">{t.noSoldTitle}</p>
              <p className="text-[11px] text-slate-400">{t.noSoldDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {soldLots.map((lot) => {
                const txn = lot.transaction;
                const buyerName = txn?.buyer?.name || 'Verified Commercial Buyer';
                const totalAmt = txn?.totalAmount || (lot.expectedPrice * lot.quantity);
                const paymentStatus = txn?.payment?.status || 'PENDING';

                return (
                  <div key={lot.id} className="bg-gradient-to-br from-emerald-50/50 via-white to-green-50/50 p-5 rounded-3xl border-2 border-emerald-400 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base text-slate-950">{translateCrop(lot.crop?.name || lot.cropName || 'Crop')}</span>
                      <StatusBadge status="SOLD" />
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-emerald-200 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>{t.buyerLabel}:</span>
                        <strong className="text-slate-900">{buyerName}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>{t.contractTotalLabel}:</span>
                        <strong className="text-emerald-700 text-sm font-black">{formatCurrency(totalAmt)}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                        <span>{t.paymentStatusLabel}:</span>
                        <StatusBadge status={paymentStatus} type="payment" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: BUYER PROCUREMENT DESK
  // ==========================================
  if (user.role === 'BUYER') {
    const activeBidsCount = buyerBids.filter((b) => b.status === 'PENDING').length;
    const acceptedBids = buyerBids.filter((b) => b.status === 'ACCEPTED');
    const totalPurchasedVolume = acceptedBids.reduce((acc, b) => acc + (b.quantity || 0), 0);
    const totalSpend = acceptedBids.reduce((acc, b) => acc + (b.price * b.quantity), 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-amber-500/30 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" /> {t.buyerMarketplaceTitle}
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            {t.buyerWelcomeTitle}, {user.name} 🏢
          </h1>
          <p className="text-xs md:text-sm text-amber-200/90 max-w-xl font-medium">
            {t.buyerTagline}
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5 pt-2">
            <Link
              href="/browse-lots"
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition"
            >
              <ShoppingBag className="w-4 h-4" /> {t.btnBrowseCatalog}
            </Link>
            <Link
              href="/my-bids"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-amber-500/30 transition"
            >
              <Gavel className="w-4 h-4 text-amber-400" /> {t.btnViewMyBids} ({buyerBids.length})
            </Link>
          </div>
        </div>

        {/* Buyer KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiActiveBids}</span>
            <span className="text-2xl font-black text-slate-950 block">{activeBidsCount}</span>
            <span className="text-[10px] text-amber-700 font-bold block">{t.kpiPendingBidsSub}</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiPurchases}</span>
            <span className="text-2xl font-black text-emerald-700 block">{acceptedBids.length}</span>
            <span className="text-[10px] text-emerald-800 font-bold block">{t.kpiSoldLotsSub}</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiProcuredVolume}</span>
            <span className="text-2xl font-black text-slate-950 block">{totalPurchasedVolume} {formatUnit('QUINTALS')}</span>
            <span className="text-[10px] text-slate-500 font-bold block">{t.commonTotal}</span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-3xl border border-amber-300 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-950 tracking-wider">{t.kpiTotalSpent}</span>
            <span className="text-xl font-black text-slate-950 block">{formatCurrency(totalSpend)}</span>
            <span className="text-[10px] text-amber-900 font-bold block">{t.commonTotal}</span>
          </div>
        </div>

        {/* Active Marketplace Listings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">{t.buyerMarketplaceTitle}</h2>
            <Link href="/browse-lots" className="text-xs text-amber-800 font-bold hover:underline">
              {t.commonViewDetails} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buyerLots.slice(0, 3).map((lot) => (
              <div key={lot.id} className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-slate-950">{translateCrop(lot.crop?.name || lot.cropName || 'Crop')}</span>
                  <StatusBadge status={lot.status} />
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-amber-50/40 p-3 rounded-2xl border border-amber-100">
                  <div className="flex justify-between">
                    <span>{t.commonQuantity}:</span>
                    <strong className="text-slate-900">{lot.quantity} {formatUnit(lot.unit)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.farmerAskingRate}:</span>
                    <strong className="text-amber-900 font-black">{formatCurrency(lot.expectedPrice)}/Qtl</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.commonLocation}:</span>
                    <span className="text-slate-800">{lot.location || 'Nashik'}</span>
                  </div>
                </div>

                <Link
                  href={`/browse-lots/${lot.id}`}
                  className="block w-full text-center bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-2 rounded-xl text-xs shadow-md shadow-amber-500/20 transition"
                >
                  {t.btnPlaceBid}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ADMIN NATIONAL MONITORING COCKPIT
  // ==========================================
  if (user.role === 'ADMIN') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Admin Header */}
        <div className="bg-slate-950 text-white p-6 md:p-8 rounded-3xl border border-amber-500/30 shadow-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> {t.adminTitle}
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            {t.adminTitle} ⚙️
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl font-medium">
            {t.adminSubtitle}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-amber-200/80 scrollbar-none">
          {[
            { key: 'OVERVIEW', label: t.tabOverview, icon: BarChart3 },
            { key: 'LOTS', label: t.tabLots, icon: Package },
            { key: 'BIDS', label: t.tabBids, icon: Gavel },
            { key: 'USERS', label: t.tabUsers, icon: Users },
            { key: 'TRANSACTIONS', label: t.tabTxns, icon: FileText },
            { key: 'ACTIVITY', label: t.tabActivity, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setAdminTab(tab.key as AdminTab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition whitespace-nowrap ${
                  adminTab === tab.key
                    ? 'bg-slate-900 text-amber-400 shadow-md font-black'
                    : 'bg-white border border-amber-200 text-slate-700 hover:bg-amber-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {adminTab === 'OVERVIEW' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiTotalLots}</span>
                <span className="text-2xl font-black text-slate-950 block">{adminStats?.totalLots || adminLots.length}</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiTotalBids}</span>
                <span className="text-2xl font-black text-slate-950 block">{adminStats?.totalBids || adminBids.length}</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiTotalGMV}</span>
                <span className="text-xl font-black text-amber-900 block">{formatCurrency(adminStats?.totalGMV || 396000)}</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiActiveFarmers}</span>
                <span className="text-2xl font-black text-emerald-700 block">{adminStats?.activeFarmers || 2}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Crop Lots Monitor */}
        {adminTab === 'LOTS' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-amber-100 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900">{t.lotsMonitorTitle}</h3>
              <span className="text-xs text-slate-500">{adminLots.length} {t.kpiTotalLots}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/70 border-b border-amber-200 text-slate-700 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">{t.tableColLotId}</th>
                    <th className="p-3">{t.tableColCrop}</th>
                    <th className="p-3">{t.tableColFarmer}</th>
                    <th className="p-3">{t.tableColQty}</th>
                    <th className="p-3">{t.tableColPrice}</th>
                    <th className="p-3">{t.tableColStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {adminLots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-amber-50/40 transition">
                      <td className="p-3 font-mono font-bold text-slate-700">{lot.id}</td>
                      <td className="p-3 font-bold text-slate-900">{translateCrop(lot.crop?.name || lot.cropName || 'Crop')}</td>
                      <td className="p-3 text-slate-700">{lot.farmer?.name || 'Ramesh Patel'}</td>
                      <td className="p-3 font-bold">{lot.quantity} {formatUnit(lot.unit)}</td>
                      <td className="p-3 font-black text-amber-900">{formatCurrency(lot.expectedPrice)}/Qtl</td>
                      <td className="p-3"><StatusBadge status={lot.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Bids Monitor */}
        {adminTab === 'BIDS' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-amber-100 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900">{t.bidsMonitorTitle}</h3>
              <span className="text-xs text-slate-500">{adminBids.length} {t.kpiTotalBids}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/70 border-b border-amber-200 text-slate-700 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">{t.tableColBuyer}</th>
                    <th className="p-3">{t.tableColCrop}</th>
                    <th className="p-3">{t.tableColPrice}</th>
                    <th className="p-3">{t.tableColQty}</th>
                    <th className="p-3">{t.tableColAmount}</th>
                    <th className="p-3">{t.tableColStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {adminBids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-amber-50/40 transition">
                      <td className="p-3 font-bold text-slate-900">{bid.buyer?.name || 'FreshCart Agro Ltd.'}</td>
                      <td className="p-3 font-bold text-slate-800">{translateCrop(bid.lot?.crop?.name || 'Crop')}</td>
                      <td className="p-3 font-black text-amber-900">{formatCurrency(bid.price)}/Qtl</td>
                      <td className="p-3 font-bold">{bid.quantity} {formatUnit(bid.lot?.unit)}</td>
                      <td className="p-3 font-black text-emerald-800">{formatCurrency(bid.price * bid.quantity)}</td>
                      <td className="p-3"><StatusBadge status={bid.status} type="bid" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Live Activity */}
        {adminTab === 'ACTIVITY' && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-5 space-y-3 animate-in fade-in">
            <h3 className="font-black text-sm text-slate-900">{t.activityStreamTitle}</h3>
            <div className="space-y-2">
              {adminActivity.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-amber-50/40 rounded-2xl border border-amber-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <strong className="text-slate-900 block font-bold">{act.action}</strong>
                      <span className="text-[11px] text-slate-500">{act.details}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{formatDateLocalized(act.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
