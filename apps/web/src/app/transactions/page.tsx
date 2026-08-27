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
  FileCheck,
  CreditCard,
  CheckCircle2,
  Building2,
  MapPin,
  Clock,
  Check,
  Loader2,
  LogIn,
} from 'lucide-react';

export default function TransactionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [referenceMap, setReferenceMap] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTransactions = () => {
    api.get<any[]>('/transactions')
      .then((res) => {
        if (res) {
          setTransactions(res);
          const refs: Record<string, string> = {};
          res.forEach((t) => {
            if (t.payment?.paymentReference) {
              refs[t.id] = t.payment.paymentReference;
            } else {
              refs[t.id] = 'UPI-HDFC-992144';
            }
          });
          setReferenceMap(refs);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdatePaymentStatus = async (transactionId: string, status: string) => {
    setUpdatingId(transactionId);
    try {
      await api.patch(`/payments/${transactionId}/status`, {
        status,
        paymentReference: referenceMap[transactionId] || 'UPI-HDFC-992144',
      });
      showToast(`Payment updated to ${status}!`, 'success');
      fetchTransactions();
    } catch (err: any) {
      showToast(err.message || 'Failed to update payment status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto bg-slate-900/90 p-8 rounded-3xl border border-amber-500/30 shadow-2xl text-center space-y-4 my-8">
        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Sign In to View Purchases</h2>
        <p className="text-xs text-slate-400">View legally binding purchase contracts and manage payment settlements.</p>
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-amber-500/20 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          {t.purchasesTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage legal purchase agreements and electronic digital settlements</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-slate-900/80 p-10 rounded-3xl border border-amber-500/20 text-center space-y-3 max-w-md mx-auto">
          <FileCheck className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-base font-black text-white">No Finalized Purchases Yet</h2>
          <p className="text-xs text-slate-400">When a farmer accepts your bid offer, the purchase contract will appear here.</p>
          <Link
            href="/browse-lots"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow transition"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => {
            const isPaid = txn.payment?.status === 'PAID';
            const isInitiated = txn.payment?.status === 'INITIATED';

            return (
              <div
                key={txn.id}
                className="bg-slate-900/80 p-6 md:p-8 rounded-3xl border border-amber-500/20 shadow-sm space-y-5 transition-card"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Contract #{txn.id?.substring(0, 8)}
                    </span>
                    <h2 className="text-xl font-black text-white tracking-tight">
                      {txn.lot?.crop?.name || 'Crop'} — {txn.quantity} {txn.lot?.unit || 'Qtl'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Farmer Seller: <strong className="text-amber-300">{txn.farmer?.name || 'Patel Farms'}</strong> ({txn.farmer?.district || 'Nashik'})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={txn.payment?.status || 'PENDING'} type="payment" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/20">
                    <span className="text-slate-400 font-bold block text-[10px]">Agreed Deal Rate</span>
                    <span className="font-black text-amber-300 text-sm">₹{txn.agreedPrice}/Qtl</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/20">
                    <span className="text-slate-400 font-bold block text-[10px]">Contract Total</span>
                    <span className="font-black text-yellow-300 text-sm">
                      ₹{txn.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/20">
                    <span className="text-slate-400 font-bold block text-[10px]">Payment Milestone</span>
                    <span className="font-black text-white text-sm">{txn.payment?.status || 'PENDING'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/20">
                    <span className="text-slate-400 font-bold block text-[10px]">Commission Cut</span>
                    <span className="font-black text-amber-400 text-sm">₹0 (Zero Cut)</span>
                  </div>
                </div>

                {/* Interactive Payment Settlement Actions */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-white">Digital Settlement & Bank UTR Reference</span>
                      <p className="text-[11px] text-slate-400">Record digital transaction reference for immediate farmer payout verification</p>
                    </div>

                    <input
                      type="text"
                      value={referenceMap[txn.id] || ''}
                      onChange={(e) => setReferenceMap({ ...referenceMap, [txn.id]: e.target.value })}
                      placeholder="e.g. UPI-HDFC-992144"
                      className="px-3 py-1.5 bg-slate-900 border border-amber-500/40 rounded-xl text-xs font-bold text-white w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  {!isPaid && (
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleUpdatePaymentStatus(txn.id, 'INITIATED')}
                        disabled={updatingId === txn.id}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
                      >
                        Mark Dispatched (Initiated)
                      </button>

                      <button
                        onClick={() => handleUpdatePaymentStatus(txn.id, 'PAID')}
                        disabled={updatingId === txn.id}
                        className="px-5 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                      >
                        {updatingId === txn.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Confirm Settlement (Paid)
                      </button>
                    </div>
                  )}

                  {isPaid && (
                    <div className="flex items-center gap-2 text-xs font-black text-amber-300 pt-1">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Payment Verified & Released to Farmer. Reference: {txn.payment?.paymentReference || 'UPI-HDFC-992144'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
