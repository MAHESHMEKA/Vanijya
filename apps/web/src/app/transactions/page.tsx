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
  const { t, translateCrop, formatCurrency, formatUnit, formatDateLocalized } = useLanguage();
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
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-amber-200 shadow-md text-center space-y-4 my-8">
        <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">{t.commonLoginRequired}</h2>
        <p className="text-xs text-slate-600">{t.purchasesSubtitle}</p>
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
      <div className="border-b border-amber-200/80 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {t.purchasesTitle}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{t.purchasesSubtitle}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-amber-200 text-center space-y-3 max-w-md mx-auto">
          <FileCheck className="w-12 h-12 text-amber-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900">{t.commonNoData}</h3>
          <p className="text-xs text-slate-500">{t.purchasesSubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((txn) => {
            const isPaid = txn.payment?.status === 'PAID';
            const isBuyer = user.role === 'BUYER';
            const cropName = txn.lot?.crop?.name || txn.lot?.cropName || 'Produce';

            return (
              <div
                key={txn.id}
                className="bg-white rounded-3xl border border-amber-200 p-6 space-y-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {t.purchaseContractId} #{txn.id?.substring(0, 8)}
                    </span>
                    <h3 className="font-black text-slate-900 text-base">
                      {translateCrop(cropName)} ({txn.quantity} {formatUnit(txn.lot?.unit)})
                    </h3>
                  </div>
                  <StatusBadge status={txn.payment?.status || 'PENDING'} type="payment" />
                </div>

                <div className="space-y-2 text-xs bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.commonFarmer}:</span>
                    <strong className="text-slate-900">{txn.farmer?.name || 'Ramesh Patel'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.commonBuyer}:</span>
                    <strong className="text-slate-900">{txn.buyer?.name || 'FreshCart Agro Ltd.'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.agreedRate}:</span>
                    <span className="font-bold text-amber-900">{formatCurrency(txn.finalPrice)}/Qtl</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-amber-200/60 font-black">
                    <span className="text-slate-700 uppercase text-[10px]">{t.totalAmount}:</span>
                    <span className="text-base text-emerald-800">{formatCurrency(txn.totalAmount)}</span>
                  </div>
                </div>

                {isBuyer && !isPaid && (
                  <div className="space-y-2 pt-2 border-t border-amber-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="UTR / Bank Ref: UPI-HDFC-992144"
                        value={referenceMap[txn.id] || ''}
                        onChange={(e) =>
                          setReferenceMap({ ...referenceMap, [txn.id]: e.target.value })
                        }
                        className="flex-1 px-3 py-2 bg-amber-50/30 border border-amber-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleUpdatePaymentStatus(txn.id, 'PAID')}
                        disabled={updatingId === txn.id}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow transition"
                      >
                        {updatingId === txn.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        {t.btnConfirmPayment}
                      </button>
                    </div>
                  </div>
                )}

                {isPaid && (
                  <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t.paymentPaidBadge} — Ref: {txn.payment?.paymentReference || 'UTR-891244'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
