'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { useToast } from '../../components/ui/toast';
import { StatusBadge } from '../../components/ui/status-badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import {
  Gavel,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  LogIn,
  Edit3,
  XCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function MyBidsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t, translateCrop, formatCurrency, formatUnit, formatDateLocalized } = useLanguage();
  const { showToast } = useToast();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modifyingBid, setModifyingBid] = useState<any | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [isModifying, setIsModifying] = useState(false);

  const [cancellingBid, setCancellingBid] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBids = () => {
    api.get<any[]>('/bids/my')
      .then((res) => {
        if (res) setBids(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBids();
    const interval = setInterval(fetchBids, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenModifyModal = (bid: any) => {
    setModifyingBid(bid);
    setNewQuantity(bid.quantity.toString());
  };

  const handleConfirmModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyingBid) return;

    const qty = parseFloat(newQuantity);
    const maxQty = modifyingBid.lot?.quantity || 1000;

    if (isNaN(qty) || qty <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }
    if (qty > maxQty) {
      showToast(`Quantity cannot exceed available lot quantity (${maxQty} ${modifyingBid.lot?.unit || 'Qtl'})`, 'error');
      return;
    }

    setIsModifying(true);
    try {
      await api.patch(`/bids/${modifyingBid.id}/quantity`, { quantity: qty });
      showToast(t.bidModifiedSuccess, 'success');
      setModifyingBid(null);
      fetchBids();
    } catch (err: any) {
      showToast(err.message || 'Failed to modify bid quantity', 'error');
    } finally {
      setIsModifying(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBid) return;

    setIsCancelling(true);
    try {
      await api.patch(`/bids/${cancellingBid.id}/cancel`, {});
      showToast(t.bidCancelledSuccess, 'success');
      setCancellingBid(null);
      fetchBids();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel bid', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {t.myBidsTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.myBidsSubtitle}</p>
        </div>

        <Link
          href="/browse-lots"
          className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/25 transition self-start md:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-slate-950" />
          {t.btnBrowseCatalog}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-amber-200 text-center space-y-3 max-w-md mx-auto">
          <Gavel className="w-12 h-12 text-amber-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900">{t.commonNoData}</h3>
          <p className="text-xs text-slate-500">{t.myBidsSubtitle}</p>
          <div className="pt-2">
            <Link
              href="/browse-lots"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4" /> {t.btnBrowseCatalog}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bids.map((bid) => {
            const isPending = bid.status === 'PENDING';
            const isCancelled = bid.status === 'WITHDRAWN' || bid.status === 'CANCELLED';
            const isAccepted = bid.status === 'ACCEPTED';
            const isRejected = bid.status === 'REJECTED';
            const cropName = bid.lot?.crop?.name || bid.lot?.cropName || 'Crop';
            const totalOfferValue = bid.price * bid.quantity;

            return (
              <div
                key={bid.id}
                className={`bg-white rounded-3xl border p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                  isAccepted
                    ? 'border-2 border-emerald-400 bg-emerald-50/20'
                    : isCancelled
                    ? 'border-slate-300 bg-slate-50/70 opacity-80'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-amber-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Title & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">
                        BID #{bid.id?.substring(0, 8)}
                      </span>
                      <h3 className="font-black text-slate-900 text-base leading-tight">
                        {translateCrop(cropName)}
                      </h3>
                    </div>
                    <StatusBadge status={bid.status} type="bid" />
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">{t.bidRateLabel}:</span>
                      <span className="text-base font-black text-amber-900">
                        {formatCurrency(bid.price)}/Qtl
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">{t.bidQtyLabel}:</span>
                      <span className="font-bold text-slate-900">
                        {bid.quantity} {formatUnit(bid.lot?.unit)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-amber-200/60">
                      <span className="text-slate-600 font-black uppercase text-[10px]">{t.commonTotal}:</span>
                      <span className="text-sm font-black text-emerald-800">
                        {formatCurrency(totalOfferValue)}
                      </span>
                    </div>
                  </div>

                  {bid.lot?.location && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="text-slate-400">{t.commonLocation}:</span>
                      <span className="font-semibold text-slate-700 truncate">{bid.lot.location}</span>
                    </p>
                  )}
                </div>

                {/* Bottom Actions for Buyer */}
                <div className="pt-2 border-t border-amber-100/80 space-y-2">
                  {isPending && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenModifyModal(bid)}
                        className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {t.btnModifyQty}
                      </button>

                      <button
                        onClick={() => setCancellingBid(bid)}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {t.btnCancelBid}
                      </button>
                    </div>
                  )}

                  {isAccepted && (
                    <Link
                      href="/transactions"
                      className="block w-full text-center bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2 rounded-xl text-xs shadow-md shadow-emerald-700/20 transition"
                    >
                      {t.btnViewInvoice} &rarr;
                    </Link>
                  )}

                  {isCancelled && (
                    <div className="text-center text-[11px] font-bold text-slate-500 bg-slate-100 py-1.5 rounded-xl">
                      {t.bidWithdrawnBadge}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. MODAL: MODIFY BID QUANTITY */}
      {modifyingBid && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-amber-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">{t.modifyQtyModalTitle}</h3>
              </div>
              <button
                onClick={() => setModifyingBid(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmModify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.newQtyLabel}
                </label>
                <input
                  type="number"
                  min="1"
                  max={modifyingBid.lot?.quantity || 1000}
                  step="any"
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-300 rounded-xl text-sm font-black focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setModifyingBid(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  {t.commonCancel}
                </button>
                <button
                  type="submit"
                  disabled={isModifying}
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                >
                  {isModifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t.btnSaveQty}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: CANCEL BID CONFIRMATION */}
      {cancellingBid && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">{t.cancelBidModalTitle}</h3>
                <p className="text-xs text-slate-500">{translateCrop(cancellingBid.lot?.crop?.name || 'Crop')}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
              {t.cancelBidConfirmDesc}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancellingBid(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                {t.commonClose}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md shadow-rose-600/20 transition flex items-center gap-1.5"
              >
                {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t.btnConfirmCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
