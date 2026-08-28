'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { useToast } from '../../components/ui/toast';
import { StatusBadge } from '../../components/ui/status-badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import { formatINR } from '@vanijya/shared-utils';
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
  const { t } = useLanguage();
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
      showToast('Bid quantity updated successfully.', 'success');
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
      showToast('Bid cancelled successfully.', 'success');
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
        <h2 className="text-xl font-black text-slate-900">Buyer Login Required</h2>
        <p className="text-xs text-slate-600">Sign in to track your active bids, modify quantities, and manage purchase offers.</p>
        <div className="pt-2">
          <Link
            href="/login"
            className="block w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black py-3 rounded-2xl text-xs transition shadow"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {t.myBidsTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Track status of active offers, adjust quantities, and monitor settlements</p>
        </div>

        <Link
          href="/browse-lots"
          className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition self-start md:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-slate-950" />
          Explore More Crop Lots
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-amber-200 text-center space-y-3 max-w-md mx-auto">
          <Gavel className="w-10 h-10 text-amber-300 mx-auto" />
          <h2 className="text-base font-black text-slate-900">No Bids Submitted Yet</h2>
          <p className="text-xs text-slate-500">Explore the marketplace to place your first direct farm-gate bid.</p>
          <Link
            href="/browse-lots"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow transition"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => {
            const isPending = bid.status === 'PENDING';
            const isWithdrawn = bid.status === 'WITHDRAWN';
            const isAccepted = bid.status === 'ACCEPTED';
            const isRejected = bid.status === 'REJECTED';

            return (
              <div
                key={bid.id}
                className={`bg-white p-5 rounded-3xl border shadow-sm transition space-y-3 transition-card ${
                  isWithdrawn
                    ? 'border-slate-200 bg-slate-50/50 opacity-80'
                    : isAccepted
                    ? 'border-emerald-300 ring-2 ring-emerald-400/20'
                    : 'border-amber-200 hover:border-amber-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">
                        {bid.lot?.crop?.name || 'Crop'} ({bid.quantity} {bid.lot?.unit || 'Qtl'})
                      </span>
                      {isWithdrawn ? (
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                          Bid Cancelled by Buyer
                        </span>
                      ) : (
                        <StatusBadge status={bid.status} type="bid" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Farmer: {bid.lot?.farmer?.name || 'Patel Farms'}</p>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-lg font-black text-slate-900">
                      ₹{bid.price} <span className="text-xs font-normal text-slate-400">/ Qtl</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 block">
                      Total: {formatINR(bid.price * bid.quantity)}
                    </span>
                  </div>
                </div>

                {/* PENDING BID CONTROLS: Modify Quantity & Cancel Bid */}
                {isPending && (
                  <div className="pt-3 border-t border-amber-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-900 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      Awaiting Farmer Decision
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModifyModal(bid)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-extrabold text-xs hover:bg-amber-100 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        Modify Quantity
                      </button>

                      <button
                        onClick={() => setCancellingBid(bid)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-extrabold text-xs hover:bg-red-100 transition"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        Cancel Bid
                      </button>
                    </div>
                  </div>
                )}

                {/* ACCEPTED DEAL */}
                {isAccepted && (
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                    <span className="text-xs text-emerald-800 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Deal Accepted by Farmer!
                    </span>
                    <Link
                      href="/transactions"
                      className="inline-flex items-center gap-1 text-xs font-black text-amber-800 hover:underline"
                    >
                      View Purchase Contract <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                {/* WITHDRAWN AUDIT NOTE */}
                {isWithdrawn && (
                  <div className="pt-1 text-[11px] text-slate-400 font-medium italic">
                    Withdrawn by you on {new Date(bid.updatedAt || bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. History preserved for audit records.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: MODIFY BID QUANTITY */}
      {/* ========================================================= */}
      {modifyingBid && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-amber-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-black text-slate-900">Modify Bid Quantity</h3>
              </div>
              <button
                onClick={() => setModifyingBid(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmModify} className="space-y-4">
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Crop:</span>
                  <span className="text-slate-950 font-black">{modifyingBid.lot?.crop?.name}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Offer Rate:</span>
                  <span className="text-slate-950 font-black">₹{modifyingBid.price}/Qtl</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Total Available Lot:</span>
                  <span className="text-amber-900 font-black">{modifyingBid.lot?.quantity || 100} {modifyingBid.lot?.unit || 'Qtl'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  New Quantity ({modifyingBid.lot?.unit || 'Quintals'})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={modifyingBid.lot?.quantity || 1000}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-300 rounded-xl text-base font-black focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Current bid: {modifyingBid.quantity} {modifyingBid.lot?.unit || 'Qtl'}. Max limit: {modifyingBid.lot?.quantity || 100} {modifyingBid.lot?.unit || 'Qtl'}.
                </span>
              </div>

              <div className="p-3 bg-amber-100/70 rounded-xl border border-amber-300 text-xs flex items-center justify-between">
                <span className="font-bold text-amber-950">New Total Bid Value:</span>
                <span className="text-base font-black text-slate-950">
                  {formatINR(modifyingBid.price * (parseFloat(newQuantity) || 0))}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModifyingBid(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModifying}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md hover:from-amber-300 hover:to-yellow-400 transition flex items-center justify-center gap-1.5"
                >
                  {isModifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Confirm Modification'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CANCEL BID CONFIRMATION */}
      {/* ========================================================= */}
      {cancellingBid && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-red-100 pb-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Cancel this Bid?</h3>
                <p className="text-[11px] text-slate-500">This action will withdraw your offer from the farmer</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/50 rounded-2xl border border-red-100 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Produce:</span>
                <span className="text-slate-950 font-black">{cancellingBid.lot?.crop?.name}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Quantity:</span>
                <span className="text-slate-950 font-black">{cancellingBid.quantity} {cancellingBid.lot?.unit || 'Qtl'}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Bid Price:</span>
                <span className="text-slate-950 font-black">₹{cancellingBid.price}/Qtl</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 border-t border-red-200/50 pt-1">
                <span>Total Commitment:</span>
                <span className="text-red-700 font-black">{formatINR(cancellingBid.price * cancellingBid.quantity)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              The bid status will be updated to <strong>WITHDRAWN</strong> and preserved in the audit log. The farmer will be notified that this offer was retracted.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCancellingBid(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                Keep Bid Active
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-black text-xs shadow-md hover:bg-red-700 transition flex items-center justify-center gap-1.5"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Bid'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
