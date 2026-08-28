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
  ShoppingBag,
  ArrowLeft,
  Gavel,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  TrendingUp,
  Loader2,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function BuyerLotDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t, translateCrop, formatCurrency, formatUnit } = useLanguage();
  const { showToast } = useToast();

  const [lot, setLot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [bidPrice, setBidPrice] = useState('2200');
  const [bidQuantity, setBidQuantity] = useState('100');
  const [bidMessage, setBidMessage] = useState('Farm gate pickup with instant electronic settlement.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<any>(`/lots/${id}`)
      .then((res) => {
        setLot(res);
        if (res) {
          setBidPrice(res.expectedPrice.toString());
          setBidQuantity(res.quantity.toString());
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast(t.commonLoginRequired, 'info');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/lots/${id}/bids`, {
        price: parseFloat(bidPrice),
        quantity: parseFloat(bidQuantity),
        message: bidMessage,
      });

      showToast(t.bidPlacedSuccess, 'success');
      router.push('/my-bids');
    } catch (err: any) {
      showToast(err.message || 'Failed to place bid', 'error');
    } finally {
      setIsSubmitting(false);
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
        <h2 className="text-xl font-black text-slate-900">{t.commonNoData}</h2>
        <Link href="/browse-lots" className="inline-block text-xs font-bold text-amber-800 hover:underline">
          &larr; {t.commonBack}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <Link href="/browse-lots" className="inline-flex items-center gap-1 text-xs text-amber-800 font-bold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> {t.commonBack}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Lot Specifications */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-amber-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400">LOT #{lot.id?.substring(0, 8)}</span>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                <ShoppingBag className="w-6 h-6 text-amber-600" />
                {translateCrop(lot.crop?.name || lot.cropName || 'Crop')}
              </h1>
            </div>
            <StatusBadge status={lot.status} />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 flex justify-between">
              <span className="text-slate-500 font-bold">{t.farmerAskingRate}:</span>
              <strong className="text-amber-900 font-black text-sm">{formatCurrency(lot.expectedPrice)}/Qtl</strong>
            </div>

            <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 flex justify-between">
              <span className="text-slate-500 font-bold">{t.commonQuantity}:</span>
              <strong className="text-slate-900 font-black">{lot.quantity} {formatUnit(lot.unit)}</strong>
            </div>

            <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 flex justify-between">
              <span className="text-slate-500 font-bold">{t.commonGrade}:</span>
              <strong className="text-slate-900 font-bold">{lot.qualityGrade || 'Grade A'}</strong>
            </div>

            <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 flex justify-between">
              <span className="text-slate-500 font-bold">{t.commonLocation}:</span>
              <span className="text-slate-800 font-bold">{lot.location || 'Nashik'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Place Bid Form */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              <Gavel className="w-3.5 h-3.5" /> Direct Digital Sourcing Desk
            </div>
            <h2 className="text-xl font-black text-slate-900">{t.btnPlaceBid}</h2>
            <p className="text-xs text-slate-500">{t.buyerMarketplaceSubtitle}</p>
          </div>

          <form onSubmit={handlePlaceBid} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.bidRateLabel}</label>
              <input
                type="number"
                required
                min="1"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                placeholder="2200"
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.bidQtyLabel}</label>
              <input
                type="number"
                required
                min="1"
                value={bidQuantity}
                onChange={(e) => setBidQuantity(e.target.value)}
                placeholder="100"
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.messageLabel}</label>
              <textarea
                rows={2}
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                placeholder={t.messagePlaceholder}
                className="w-full px-3.5 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs shadow-md shadow-amber-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.submittingBid}
                </>
              ) : (
                t.btnConfirmBid
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
