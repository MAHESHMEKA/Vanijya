'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { useToast } from '../../components/ui/toast';
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
  AlertTriangle,
  UserCheck,
  UserX,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Loader2,
} from 'lucide-react';

type AdminTab = 'OVERVIEW' | 'REGISTRATIONS' | 'LOTS' | 'BIDS' | 'USERS' | 'TRANSACTIONS' | 'ACTIVITY';

export default function SmartDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, translateCrop, formatCurrency, formatUnit, formatDateLocalized, translateStatus } = useLanguage();
  const { showToast } = useToast();

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
  const [adminRegistrations, setAdminRegistrations] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<AdminTab>('OVERVIEW');

  // Registration Filter & Modal states
  const [regFilterRole, setRegFilterRole] = useState<string>('ALL');
  const [regFilterStatus, setRegFilterStatus] = useState<string>('ALL');
  const [regSearch, setRegSearch] = useState('');
  const [regSort, setRegSort] = useState<'desc' | 'asc'>('desc');
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [rejectingUser, setRejectingUser] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

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
        api.get<any[]>('/admin/registrations'),
      ])
        .then(([stats, lots, bids, users, txns, activity, registrations]) => {
          setAdminStats(stats);
          setAdminLots(lots || []);
          setAdminBids(bids || []);
          setAdminUsers(users || { farmers: [], buyers: [] });
          setAdminTransactions(txns || []);
          setAdminActivity(activity || []);
          setAdminRegistrations(registrations || []);
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

  // Profile completion status helpers
  const isProfileIncomplete = user.profileCompletionStatus === 'INCOMPLETE' || (user.profileCompletionPercentage !== undefined && user.profileCompletionPercentage < 100);
  const completionPercentage = user.profileCompletionPercentage ?? (isProfileIncomplete ? 60 : 100);
  const missingFieldsList = user.missingFields || [];

  const renderProfileCompletionBanner = () => {
    if (!isProfileIncomplete) return null;

    return (
      <div className="bg-amber-50 border-2 border-amber-400 p-4 md:p-5 rounded-3xl shadow-sm space-y-3 animate-in fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200 text-amber-950 rounded-2xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                {t.profileCompletionBannerTitle} ({completionPercentage}%)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {t.profileCompletionBannerDesc}
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            {t.btnCompleteProfile} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Missing Fields Checklist */}
        {missingFieldsList.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="text-slate-500 font-bold">{t.missingFieldsLabel}</span>
            {missingFieldsList.map((field) => (
              <span
                key={field}
                className="bg-white border border-amber-300 text-amber-950 px-2 py-0.5 rounded-md font-bold"
              >
                • {field}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Admin Approve Action
  const handleApproveApplicant = async (applicantId: string) => {
    setIsProcessingAction(true);
    try {
      await api.patch(`/admin/users/${applicantId}/approve`, {});
      showToast(t.statusApproved, 'success');
      setSelectedApplicant(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve applicant', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Admin Reject Action
  const handleRejectApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingUser || !rejectionReason.trim()) {
      showToast('Please enter a rejection reason', 'error');
      return;
    }

    setIsProcessingAction(true);
    try {
      await api.patch(`/admin/users/${rejectingUser.id}/reject`, {
        reason: rejectionReason.trim(),
      });
      showToast(t.statusRejected, 'info');
      setRejectingUser(null);
      setRejectionReason('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject applicant', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // ==========================================
  // VIEW 1: FARMER COMMAND CENTER
  // ==========================================
  if (user.role === 'FARMER') {
    const activeBiddingLots = farmerLots.filter((l) => l.status === 'BIDDING');
    const soldLots = farmerLots.filter((l) => l.status === 'SOLD');
    const openLots = farmerLots.filter((l) => l.status === 'OPEN');
    const pendingBidsCount = farmerBids.filter((b) => b.status === 'PENDING').length;
    const totalSalesAmount = soldLots.reduce((acc, l) => acc + (l.expectedPrice * l.quantity), 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Profile completion banner */}
        {renderProfileCompletionBanner()}

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-6 md:p-8 rounded-3xl text-slate-950 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-slate-950/20 bg-amber-100 shadow-md shrink-0 flex items-center justify-center">
              {(user as any)?.profilePhoto?.url || (user as any)?.photo ? (
                <img
                  src={(user as any)?.profilePhoto?.url || (user as any)?.photo}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-amber-900">
                  {user.name ? user.name.charAt(0) : '🌾'}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-400 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {user.isVerified || user.approvalStatus === 'APPROVED' ? t.verifiedFarmerBadge : t.pendingApprovalBadge}
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                {t.farmerWelcomeTitle}, {user.name} 🌾
              </h1>
              <p className="text-xs font-bold text-amber-950 max-w-xl">
                {user.district && user.state ? `${user.district}, ${user.state} • ` : ''}{t.farmerTagline}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5 relative z-10">
            <Link
              href="/create-lot"
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-black/10 transition"
            >
              <PlusCircle className="w-4 h-4" /> {t.btnPublishLot}
            </Link>
            <Link
              href="/my-lots"
              className="bg-white/80 hover:bg-white text-slate-950 font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-amber-700/20 transition"
            >
              <Package className="w-4 h-4" /> {t.btnViewAllLots} ({farmerLots.length})
            </Link>
          </div>
        </div>

        {/* 6 FARMER KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[10px] font-black uppercase">{t.kpiActiveBidding}</span>
              <Flame className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 block">{activeBiddingLots.length}</span>
            <span className="text-[10px] text-slate-400">{t.kpiActiveBiddingSub}</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-3xl border border-emerald-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="text-[10px] font-black uppercase">{t.kpiSoldLots}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 block">{soldLots.length}</span>
            <span className="text-[10px] text-emerald-700 font-bold">{t.kpiSoldLotsSub}</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-black uppercase">{t.kpiPendingBids}</span>
              <Gavel className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 block">{pendingBidsCount}</span>
            <span className="text-[10px] text-slate-400">{t.kpiPendingBidsSub}</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-black uppercase">{t.kpiOpenLots}</span>
              <Package className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 block">{openLots.length}</span>
            <span className="text-[10px] text-slate-400">{t.kpiOpenLotsSub}</span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-3xl border border-amber-300 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-amber-900">
              <span className="text-[10px] font-black uppercase">{t.kpiTotalSales}</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <span className="text-2xl font-black text-slate-900 block">{formatCurrency(totalSalesAmount)}</span>
            <span className="text-[10px] text-amber-800 font-bold">{t.kpiTotalSalesSub}</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-black uppercase">{t.kpiPendingPay}</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 block">₹0</span>
            <span className="text-[10px] text-slate-400">{t.kpiPendingPaySub}</span>
          </div>
        </div>

        {/* Section 1: Active Bidding Produce */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{t.sectionActiveBidding}</h2>
            </div>
            <Link href="/my-lots" className="text-xs text-amber-800 font-bold hover:underline">
              {t.commonViewDetails} &rarr;
            </Link>
          </div>

          {activeBiddingLots.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-amber-200 text-center space-y-1">
              <span className="text-xs font-black text-slate-700 block">{t.noBiddingTitle}</span>
              <span className="text-[11px] text-slate-500">{t.noBiddingDesc}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeBiddingLots.map((lot) => {
                const bids = farmerBids.filter((b) => b.lotId === lot.id);
                const highestBid = bids.length > 0 ? Math.max(...bids.map((b) => b.price)) : lot.expectedPrice;
                return (
                  <div key={lot.id} className="bg-white p-5 rounded-3xl border-2 border-amber-400 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base text-slate-900">{translateCrop(lot.crop?.name || 'Crop')}</span>
                      <StatusBadge status={lot.status} />
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.askingRateLabel}:</span>
                        <strong className="text-slate-800">{formatCurrency(lot.expectedPrice)}/Qtl</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.topBuyerOfferLabel}:</span>
                        <strong className="text-emerald-700 font-black text-sm">{formatCurrency(highestBid)}/Qtl</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.offersCountLabel}:</span>
                        <span className="font-bold text-amber-800">{bids.length} Offers</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">{lot.quantity} {lot.unit || 'QUINTAL'}</span>
                      <Link
                        href={`/my-lots/${lot.id}`}
                        className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-sm hover:opacity-90 transition"
                      >
                        {t.btnViewOffers} &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Sold & Finalized Contracts */}
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
              <span className="text-xs font-black text-slate-700 block">{t.noSoldTitle}</span>
              <span className="text-[11px] text-slate-500">{t.noSoldDesc}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {soldLots.map((lot) => {
                const txn = lot.transaction;
                const payStatus = txn?.payment?.status || 'PAID';
                return (
                  <div key={lot.id} className="bg-white p-5 rounded-3xl border border-emerald-300 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base text-slate-900">{translateCrop(lot.crop?.name || 'Crop')}</span>
                      <StatusBadge status="SOLD" />
                    </div>

                    <div className="space-y-1.5 text-xs bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.buyerLabel}:</span>
                        <span className="font-bold text-slate-900">{txn?.buyer?.name || 'FreshCart Agro Ltd.'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t.contractTotalLabel}:</span>
                        <span className="font-black text-emerald-700">{formatCurrency(txn?.totalAmount || (lot.expectedPrice * lot.quantity))}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{t.paymentStatusLabel}:</span>
                        <StatusBadge status={payStatus} />
                      </div>
                    </div>

                    <div className="pt-1 text-right">
                      <Link
                        href={`/my-lots/${lot.id}`}
                        className="inline-block bg-slate-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl hover:bg-slate-800 transition"
                      >
                        {t.btnViewContract}
                      </Link>
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
  // VIEW 2: BUYER PROCUREMENT COCKPIT
  // ==========================================
  if (user.role === 'BUYER') {
    const activeBids = buyerBids.filter((b) => b.status === 'PENDING');
    const wonBids = buyerBids.filter((b) => b.status === 'ACCEPTED');
    const totalSpent = wonBids.reduce((acc, b) => acc + (b.price * b.quantity), 0);
    const totalVolume = wonBids.reduce((acc, b) => acc + b.quantity, 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Profile completion banner */}
        {renderProfileCompletionBanner()}

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/40 bg-slate-900 shadow-md shrink-0 flex items-center justify-center">
              {(user as any)?.profilePhoto?.url || (user as any)?.photo ? (
                <img
                  src={(user as any)?.profilePhoto?.url || (user as any)?.photo}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-amber-400">
                  {user.name ? user.name.charAt(0) : '🏢'}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {user.isVerified || user.approvalStatus === 'APPROVED' ? t.verifiedBuyerBadge : t.pendingApprovalBadge}
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {t.buyerWelcomeTitle}, {user.name} 🏢
              </h1>
              <p className="text-xs md:text-sm font-medium text-slate-300 max-w-xl">
                {user.district && user.state ? `${user.district}, ${user.state} • ` : ''}{t.buyerTagline}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5 relative z-10">
            <Link
              href="/browse-lots"
              className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 hover:opacity-95 transition"
            >
              <ShoppingBag className="w-4 h-4" /> {t.btnBrowseCatalog}
            </Link>
            <Link
              href="/my-bids"
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 border border-amber-500/20 transition"
            >
              <Gavel className="w-4 h-4" /> {t.btnViewMyBids} ({activeBids.length})
            </Link>
          </div>
        </div>

        {/* 4 BUYER KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-black uppercase tracking-wider">{t.kpiActiveBids}</span>
              <Gavel className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">{activeBids.length}</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="text-[10px] font-black uppercase tracking-wider">{t.kpiPurchases}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">{wonBids.length}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-black uppercase tracking-wider">{t.kpiProcuredVolume}</span>
              <Package className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">{totalVolume} Qtl</span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-3xl border border-amber-300 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-amber-950">
              <span className="text-[10px] font-black uppercase tracking-wider">{t.kpiTotalSpent}</span>
              <DollarSign className="w-4 h-4 text-amber-800" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">{formatCurrency(totalSpent)}</span>
          </div>
        </div>

        {/* Section: Live Sourcing Catalog Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-700" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{t.buyerMarketplaceTitle}</h2>
            </div>
            <Link href="/browse-lots" className="text-xs text-amber-800 font-bold hover:underline">
              {t.commonViewDetails} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {buyerLots.slice(0, 6).map((lot) => (
              <div key={lot.id} className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm hover:border-amber-400 transition space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-slate-950">{translateCrop(lot.crop?.name || 'Crop')}</span>
                  <StatusBadge status={lot.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t.commonQuantity}</span>
                    <span className="font-bold text-slate-800">{lot.quantity} {lot.unit || 'QUINTAL'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t.farmerAskingRate}</span>
                    <span className="font-black text-amber-800">{formatCurrency(lot.expectedPrice)}/Qtl</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    📍 {lot.location}
                  </span>
                  <Link
                    href={`/browse-lots/${lot.id}`}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-sm hover:opacity-90 transition"
                  >
                    {t.btnPlaceBid}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ADMIN OVERSIGHT COCKPIT
  // ==========================================
  const stats = adminStats || {
    totalFarmers: 2,
    totalBuyers: 2,
    pendingFarmers: 0,
    pendingBuyers: 0,
    approvedToday: 4,
    rejectedToday: 0,
    activeLots: 3,
    activeBiddingLots: 1,
    soldLots: 1,
    cancelledLots: 0,
    pendingBids: 1,
    acceptedBids: 1,
    cancelledBids: 1,
    modifiedBids: 1,
    totalTransactionValue: 174000,
    completedPaymentsValue: 174000,
  };

  // Filter registrations
  const filteredRegistrations = adminRegistrations.filter((reg) => {
    if (regFilterRole !== 'ALL' && reg.role !== regFilterRole) return false;
    if (regFilterStatus !== 'ALL' && reg.approvalStatus !== regFilterStatus) return false;
    if (regSearch.trim() !== '') {
      const q = regSearch.toLowerCase();
      const matchName = reg.name?.toLowerCase().includes(q);
      const matchPhone = reg.phone?.includes(q);
      const matchOrg = reg.organization?.toLowerCase().includes(q);
      const matchDistrict = reg.district?.toLowerCase().includes(q);
      const matchState = reg.state?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchOrg && !matchDistrict && !matchState) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Admin Header */}
      <div className="bg-slate-950 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-amber-500/20 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> {t.adminTitle}
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            {t.adminTitle}
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-300 max-w-2xl">
            {t.adminSubtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 mt-6 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: t.tabOverview, icon: BarChart3 },
            { id: 'REGISTRATIONS', label: t.tabRegistrations, icon: UserCheck, count: stats.pendingFarmers + stats.pendingBuyers },
            { id: 'LOTS', label: t.tabLots, icon: Package },
            { id: 'BIDS', label: t.tabBids, icon: Gavel },
            { id: 'USERS', label: t.tabUsers, icon: Users },
            { id: 'TRANSACTIONS', label: t.tabTxns, icon: FileText },
            { id: 'ACTIVITY', label: t.tabActivity, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as AdminTab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ADMIN TAB 1: OVERVIEW */}
      {adminTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiTotalLots}</span>
              <span className="text-2xl font-black text-slate-950 block">{adminLots.length || stats.activeLots + stats.soldLots}</span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.kpiTotalBids}</span>
              <span className="text-2xl font-black text-slate-950 block">{adminBids.length || stats.pendingBids + stats.acceptedBids}</span>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-3xl border border-amber-300 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-950 tracking-wider">{t.kpiTotalGMV}</span>
              <span className="text-2xl font-black text-slate-950 block">{formatCurrency(stats.totalTransactionValue)}</span>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">{t.kpiSettledPayments}</span>
              <span className="text-2xl font-black text-slate-950 block">{formatCurrency(stats.completedPaymentsValue)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Registration Verification Quick Widget */}
            <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-700" /> {t.tabRegistrations}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-900 block">{t.kpiPendingFarmers}</span>
                  <span className="text-xl font-black text-slate-950">{stats.pendingFarmers || 0}</span>
                </div>
                <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-900 block">{t.kpiPendingBuyers}</span>
                  <span className="text-xl font-black text-slate-950">{stats.pendingBuyers || 0}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminTab('REGISTRATIONS')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs rounded-xl transition flex items-center justify-center gap-1"
              >
                {t.registrationsTitle} &rarr;
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700" /> {t.usersDirectoryTitle}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200">
                  <span className="text-xs font-bold text-slate-500 block">{t.kpiActiveFarmers}</span>
                  <span className="text-xl font-black text-slate-950">{stats.totalFarmers}</span>
                </div>
                <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200">
                  <span className="text-xs font-bold text-slate-500 block">{t.kpiActiveBuyers}</span>
                  <span className="text-xl font-black text-slate-950">{stats.totalBuyers}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-700" /> {t.activityStreamTitle}
              </h3>
              <div className="space-y-1.5">
                {adminActivity.slice(0, 3).map((act, i) => (
                  <div key={i} className="text-xs p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">{act.action}</span>
                    <span className="text-[10px] text-slate-400">{formatDateLocalized(act.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN TAB 2: REGISTRATION REQUESTS (FEATURE COMPLETE) */}
      {adminTab === 'REGISTRATIONS' && (
        <div className="space-y-5">
          {/* 4 Registration KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-amber-50 p-5 rounded-3xl border border-amber-300 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-amber-900">
                <span className="text-[10px] font-black uppercase tracking-wider">{t.kpiPendingFarmers}</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <span className="text-2xl font-black text-slate-950 block">{stats.pendingFarmers || 0}</span>
            </div>

            <div className="bg-amber-50 p-5 rounded-3xl border border-amber-300 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-amber-900">
                <span className="text-[10px] font-black uppercase tracking-wider">{t.kpiPendingBuyers}</span>
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <span className="text-2xl font-black text-slate-950 block">{stats.pendingBuyers || 0}</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-emerald-900">
                <span className="text-[10px] font-black uppercase tracking-wider">{t.kpiApprovedToday}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-slate-950 block">{stats.approvedToday || 0}</span>
            </div>

            <div className="bg-rose-50 p-5 rounded-3xl border border-rose-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-rose-900">
                <span className="text-[10px] font-black uppercase tracking-wider">{t.kpiRejectedToday}</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-2xl font-black text-slate-950 block">{stats.rejectedToday || 0}</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  placeholder={t.searchRegistrationsPlaceholder}
                  className="w-full pl-8 pr-3 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={regFilterRole}
                onChange={(e) => setRegFilterRole(e.target.value)}
                className="px-3 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
              >
                <option value="ALL">{t.filterAllRoles}</option>
                <option value="FARMER">🌾 {t.roleFarmer.split(' ')[0]}</option>
                <option value="BUYER">🏢 {t.roleBuyer.split(' ')[0]}</option>
              </select>

              <select
                value={regFilterStatus}
                onChange={(e) => setRegFilterStatus(e.target.value)}
                className="px-3 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
              >
                <option value="ALL">{t.filterAllApprovalStatuses}</option>
                <option value="PENDING">🟡 {t.statusPendingApproval}</option>
                <option value="APPROVED">🟢 {t.statusApproved}</option>
                <option value="REJECTED">🔴 {t.statusRejected}</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-bold shrink-0">
              Showing {filteredRegistrations.length} Applications
            </div>
          </div>

          {/* Registration Requests Table */}
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-amber-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">{t.registrationsTitle}</h2>
            </div>

            {filteredRegistrations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {t.commonNoData} matching the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-50/70 border-b border-amber-100 text-[11px] font-black text-amber-950 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Applicant / Entity</th>
                      <th className="py-3 px-4">Account Type</th>
                      <th className="py-3 px-4">Mobile & Contact</th>
                      <th className="py-3 px-4">District / State</th>
                      <th className="py-3 px-4">Submission Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-amber-50/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-300 bg-amber-100 flex items-center justify-center shrink-0">
                              {(reg as any)?.profilePhoto?.url || (reg as any)?.photo ? (
                                <img
                                  src={(reg as any)?.profilePhoto?.url || (reg as any)?.photo}
                                  alt={reg.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-bold text-amber-900">
                                  {reg.name ? reg.name.charAt(0) : 'U'}
                                </span>
                              )}
                            </div>
                            <div>
                              <strong className="text-slate-900 block">{reg.name || reg.organization}</strong>
                              {reg.organization && reg.contactPerson && (
                                <span className="text-[10px] text-slate-500">Contact: {reg.contactPerson}</span>
                              )}
                              {reg.geoPoint?.coordinates && (
                                <span className="text-[9px] text-emerald-700 font-mono font-bold block">
                                  GPS: {reg.geoPoint.coordinates[1].toFixed(2)}°N, {reg.geoPoint.coordinates[0].toFixed(2)}°E
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              reg.role === 'FARMER'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {reg.role === 'FARMER' ? '🌾 Farmer' : '🏢 Buyer'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {reg.phone}
                          {reg.email && <span className="block font-sans text-[10px] text-slate-400">{reg.email}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {reg.district || '—'}, {reg.state || '—'}
                          {reg.village && <span className="block text-[10px] text-slate-400">Village: {reg.village}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {formatDateLocalized(reg.createdAt)}
                        </td>
                        <td className="py-3.5 px-4">
                          {reg.approvalStatus === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-700" /> {t.statusApproved}
                            </span>
                          ) : reg.approvalStatus === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300" title={reg.rejectionReason}>
                              <X className="w-3 h-3 text-rose-700" /> {t.statusRejected}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-700" /> {t.statusPendingApproval}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedApplicant(reg)}
                              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl font-bold text-[11px] transition flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> {t.btnViewApplication}
                            </button>

                            {reg.approvalStatus === 'PENDING' && (
                              <>
                                <button
                                  type="button"
                                  disabled={isProcessingAction}
                                  onClick={() => handleApproveApplicant(reg.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] transition flex items-center gap-1 shadow-sm"
                                >
                                  <Check className="w-3 h-3" /> {t.btnApproveApplication}
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessingAction}
                                  onClick={() => setRejectingUser(reg)}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[11px] transition flex items-center gap-1 shadow-sm"
                                >
                                  <X className="w-3 h-3" /> {t.btnRejectApplication}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN TAB 3: LOTS MONITOR */}
      {adminTab === 'LOTS' && (
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900">{t.lotsMonitorTitle}</h2>
          <div className="divide-y divide-amber-100">
            {adminLots.map((lot) => (
              <div key={lot.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-black text-slate-900 block text-sm">{translateCrop(lot.crop?.name || 'Crop')}</span>
                  <span className="text-slate-500">{lot.farmer?.name} • {lot.location}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{lot.quantity} {lot.unit || 'QUINTAL'} @ {formatCurrency(lot.expectedPrice)}</span>
                  <StatusBadge status={lot.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN TAB 4: BIDS MONITOR */}
      {adminTab === 'BIDS' && (
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900">{t.bidsMonitorTitle}</h2>
          <div className="divide-y divide-amber-100">
            {adminBids.map((bid) => (
              <div key={bid.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-black text-slate-900 block text-sm">{bid.buyer?.name || 'Buyer'}</span>
                  <span className="text-slate-500">Lot: {translateCrop(bid.lot?.crop?.name || 'Crop')}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-amber-900 block">{formatCurrency(bid.price)}/Qtl ({bid.quantity} Qtl)</span>
                  <StatusBadge status={bid.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN TAB 5: USERS DIRECTORY */}
      {adminTab === 'USERS' && (
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900">{t.usersDirectoryTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h3 className="font-black text-amber-900 uppercase tracking-wider text-[11px]">{t.kpiActiveFarmers}</h3>
              {(adminUsers.farmers || []).map((u: any) => (
                <div key={u.id} className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <span className="font-bold text-slate-900 block">{u.name}</span>
                  <span className="text-slate-500">{u.district}, {u.state} • {u.phone}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-amber-900 uppercase tracking-wider text-[11px]">{t.kpiActiveBuyers}</h3>
              {(adminUsers.buyers || []).map((u: any) => (
                <div key={u.id} className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <span className="font-bold text-slate-900 block">{u.name}</span>
                  <span className="text-slate-500">{u.district}, {u.state} • {u.email || u.phone}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN TAB 6: TRANSACTIONS LEDGER */}
      {adminTab === 'TRANSACTIONS' && (
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900">{t.txnsLedgerTitle}</h2>
          <div className="divide-y divide-amber-100 text-xs">
            {adminTransactions.map((txn) => (
              <div key={txn.id} className="py-3.5 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block">ID: {txn.id}</span>
                  <span className="text-slate-500">{txn.farmer?.name} &rarr; {txn.buyer?.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-700 block text-sm">{formatCurrency(txn.totalAmount)}</span>
                  <StatusBadge status={txn.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN TAB 7: ACTIVITY STREAM */}
      {adminTab === 'ACTIVITY' && (
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900">{t.activityStreamTitle}</h2>
          <div className="divide-y divide-amber-100 text-xs">
            {adminActivity.map((act, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <span className="font-black text-slate-900 block">{act.action}</span>
                  <span className="text-slate-500">{act.actor?.name} ({act.actor?.role})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">{formatDateLocalized(act.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: APPLICANT DOSSIER REVIEW MODAL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-amber-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 bg-amber-100 flex items-center justify-center shrink-0 shadow-sm">
                  {(selectedApplicant as any)?.profilePhoto?.url || (selectedApplicant as any)?.photo ? (
                    <img
                      src={(selectedApplicant as any)?.profilePhoto?.url || (selectedApplicant as any)?.photo}
                      alt={selectedApplicant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-black text-amber-900">
                      {selectedApplicant.name ? selectedApplicant.name.charAt(0) : 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {selectedApplicant.role === 'FARMER' ? '🌾 Farmer Dossier' : '🏢 Buyer Dossier'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {selectedApplicant.name || selectedApplicant.organization}
                  </h3>
                  {selectedApplicant.geoPoint?.coordinates && (
                    <span className="text-[10px] text-emerald-800 font-mono font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      GPS: {selectedApplicant.geoPoint.coordinates[1].toFixed(4)}°N, {selectedApplicant.geoPoint.coordinates[0].toFixed(4)}°E
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                  {t.applicantDetails}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Mobile:</span>
                    <strong className="text-slate-900">{selectedApplicant.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email:</span>
                    <strong className="text-slate-900">{selectedApplicant.email || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">District & State:</span>
                    <strong className="text-slate-900">{selectedApplicant.district}, {selectedApplicant.state}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Village / Location:</span>
                    <strong className="text-slate-900">{selectedApplicant.village || selectedApplicant.location || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {selectedApplicant.role === 'FARMER' ? (
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider block">
                    {t.agriculturalProfile}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block">Primary Crop:</span>
                      <strong className="text-slate-900">{selectedApplicant.primaryCrop || 'Tomato'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Farm Size:</span>
                      <strong className="text-slate-900">{selectedApplicant.farmSize || 5} Acres</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">KCC Number:</span>
                      <strong className="text-slate-900 font-mono">{selectedApplicant.kccNumber || 'Not submitted'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">APMC License:</span>
                      <strong className="text-slate-900 font-mono">{selectedApplicant.apmcLicense || 'Not submitted'}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider block">
                    {t.commercialProfile}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block">Organization:</span>
                      <strong className="text-slate-900">{selectedApplicant.organization || selectedApplicant.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Contact Person:</span>
                      <strong className="text-slate-900">{selectedApplicant.contactPerson || selectedApplicant.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Business Type:</span>
                      <strong className="text-slate-900">{selectedApplicant.businessType || 'Wholesale Trader'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Warehouse Hub:</span>
                      <strong className="text-slate-900">{selectedApplicant.warehouseLocation || selectedApplicant.location}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">GSTIN:</span>
                      <strong className="text-slate-900 font-mono">{selectedApplicant.gstin || 'Not submitted'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">FSSAI:</span>
                      <strong className="text-slate-900 font-mono">{selectedApplicant.fssai || 'Not submitted'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {selectedApplicant.rejectionReason && (
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900">
                  <span className="font-bold block">Rejection Reason on Record:</span>
                  <p className="text-[11px] mt-0.5">{selectedApplicant.rejectionReason}</p>
                </div>
              )}
            </div>

            {selectedApplicant.approvalStatus === 'PENDING' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-amber-100">
                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={() => handleApproveApplicant(selectedApplicant.id)}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> {t.btnConfirmApprove}
                </button>
                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={() => {
                    const applicant = selectedApplicant;
                    setSelectedApplicant(null);
                    setRejectingUser(applicant);
                  }}
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <X className="w-3.5 h-3.5" /> {t.btnRejectApplication}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT REASON PROMPT DIALOG */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                {t.rejectModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setRejectingUser(null)}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Rejecting registration for <strong>{rejectingUser.name || rejectingUser.organization}</strong> ({rejectingUser.role}). {t.rejectModalDesc}
            </p>

            <form onSubmit={handleRejectApplicant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.rejectionReasonPrompt}
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t.rejectionReasonPlaceholder}
                  className="w-full p-3 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRejectingUser(null)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  {t.commonCancel}
                </button>
                <button
                  type="submit"
                  disabled={isProcessingAction || !rejectionReason.trim()}
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                >
                  {isProcessingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t.btnConfirmReject}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
