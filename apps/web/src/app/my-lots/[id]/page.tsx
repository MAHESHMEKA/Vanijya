'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { useLanguage } from '../../../lib/language-context';
import { useToast } from '../../../components/ui/toast';
import { StatusBadge } from '../../../components/ui/status-badge';
import { CardSkeleton } from '../../../components/ui/skeleton';
import {
  Package,
  ArrowLeft,
  Gavel,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Check,
  Loader2,
  FileCheck,
} from 'lucide-react';

export default function LotDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t, translateCrop, formatCurrency, formatUnit, formatDateLocalized } = useLanguage();
  const { showToast } = useToast();

  const [lot, setLot] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLotData = () => {
    if (!id) return;
    Promise.all([
      api.get<any>(`/lots/${id}`),
      api.get<any[]>(`/lots/${id}/bids`).catch(() => []),
    ])
      .then(([lotRes, bidsRes]) => {
        setLot(lotRes);
        setBids(bidsRes || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLotData();
    const interval = setInterval(fetchLotData, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const handleAcceptBid = async (bidId: string) => {
    setActionLoading(bidId);
    try {
      await api.patch(`/bids/${bidId}/accept`);
      showToast(t.bidAcceptedSuccess, 'success');
      fetchLotData();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept bid', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setActionLoading(bidId);
    try {
      await api.patch(`/bids/${bidId}/reject`);
      showToast(t.bidRejectedSuccess, 'info');
      fetchLotData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject bid', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-amber-200 text-center space-y-4">
        <h2 className="text-xl font-black text-slate-900">{t.noLotsTitle}</h2>
        <Link href="/my-lots" className="inline-block text-xs font-bold text-amber-800 hover:underline">
          &larr; {t.commonBack}
        </Link>
      </div>
    );
  }

  const isSold = lot.status === 'SOLD';
  const highestPrice = bids.length > 0 ? Math.max(...bids.map((b) => b.price)) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Link href="/my-lots" className="inline-flex items-center gap-1 text-xs text-amber-800 font-bold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> {t.commonBack}
      </Link>

      {/* Lot Summary Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Lot #{lot.id?.substring(0, 8)}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-600" />
              {translateCrop(lot.crop?.name || lot.cropName || 'Crop')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={lot.status} />
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-slate-500 font-bold block">{t.commonQuantity}</span>
            <strong className="text-slate-900 text-sm font-black mt-0.5 block">
              {lot.quantity} {formatUnit(lot.unit)}
            </strong>
          </div>

          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-slate-500 font-bold block">{t.askingRateLabel}</span>
            <strong className="text-amber-900 text-sm font-black mt-0.5 block">
              {formatCurrency(lot.expectedPrice)}/Qtl
            </strong>
          </div>

          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-slate-500 font-bold block">{t.commonGrade}</span>
            <strong className="text-slate-900 text-sm font-black mt-0.5 block">
              {lot.qualityGrade || 'Grade A'}
            </strong>
          </div>

          <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-slate-500 font-bold block">{t.commonLocation}</span>
            <strong className="text-slate-900 text-sm font-black mt-0.5 block truncate">
              {lot.location || 'Nashik'}
            </strong>
          </div>
        </div>
      </div>

      {/* Received Bids Table / Card List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {t.incomingOffersTitle} ({bids.length})
            </h2>
          </div>

          {highestPrice && (
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              {t.topBuyerOfferLabel}: {formatCurrency(highestPrice)}/Qtl
            </span>
          )}
        </div>

        {bids.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-amber-200 text-center space-y-2">
            <Clock className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-xs font-bold text-slate-700">{t.noIncomingOffers}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bids.map((bid) => {
              const isAccepted = bid.status === 'ACCEPTED';
              const isPending = bid.status === 'PENDING';
              const buyerName = bid.buyer?.name || 'FreshCart Agro Ltd.';

              return (
                <div
                  key={bid.id}
                  className={`bg-white p-5 rounded-3xl border space-y-3 shadow-sm hover:shadow transition ${
                    isAccepted ? 'border-2 border-emerald-400 bg-emerald-50/20' : 'border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <strong className="text-slate-900 text-sm font-bold">{buyerName}</strong>
                    </div>
                    <StatusBadge status={bid.status} type="bid" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-amber-50/40 p-3 rounded-2xl border border-amber-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">{t.bidRateLabel}</span>
                      <span className="text-base font-black text-amber-900">
                        {formatCurrency(bid.price)}/Qtl
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">{t.bidQtyLabel}</span>
                      <span className="text-sm font-bold text-slate-800">
                        {bid.quantity} {formatUnit(lot.unit)}
                      </span>
                    </div>
                  </div>

                  {bid.message && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                      &ldquo;{bid.message}&rdquo;
                    </p>
                  )}

                  {/* Actions for Farmer */}
                  {isPending && !isSold && user?.role === 'FARMER' && (
                    <div className="flex gap-2 pt-2 border-t border-amber-100">
                      <button
                        onClick={() => handleAcceptBid(bid.id)}
                        disabled={actionLoading === bid.id}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
                      >
                        {actionLoading === bid.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        {t.btnAcceptOffer}
                      </button>

                      <button
                        onClick={() => handleRejectBid(bid.id)}
                        disabled={actionLoading === bid.id}
                        className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-xs border border-rose-200 transition"
                      >
                        {t.btnRejectOffer}
                      </button>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="pt-2 text-center text-xs font-bold text-emerald-700 bg-emerald-100/50 py-1.5 rounded-xl flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {t.bidAcceptedSuccess}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
