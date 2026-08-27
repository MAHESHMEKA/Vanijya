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
} from 'lucide-react';

export default function BuyerLotDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [lot, setLot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [bidPrice, setBidPrice] = useState('2250');
  const [bidQuantity, setBidQuantity] = useState('100');
  const [bidMessage, setBidMessage] = useState('Farm gate pickup with instant electronic settlement.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<any>(`/lots/${id}`)
      .then((res) => {
        setLot(res);
        if (res) {
          setBidPrice((res.expectedPrice + 50).toString());
          setBidQuantity(res.quantity.toString());
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in as a buyer to place a bid', 'info');
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

      showToast('Bid offer submitted directly to the farmer!', 'success');
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
      <div className="bg-slate-900/90 p-8 rounded-3xl border border-amber-500/30 text-center space-y-4">
        <h2 className="text-xl font-black text-white">Crop Lot Not Found</h2>
        <Link href="/browse-lots" className="inline-block text-xs font-bold text-amber-400 hover:underline">
          ← Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Link href="/browse-lots" className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Lot Specifications */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-slate-900/80 p-6 md:p-8 rounded-3xl border border-amber-500/20 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Lot #{lot.id?.substring(0, 8)}
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {lot.crop?.name || 'Crop'} ({lot.quantity} {lot.unit || 'Quintals'})
                </h1>
              </div>
              <StatusBadge status={lot.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/20">
                <span className="text-slate-400 font-bold block text-[10px]">Farmer Expected Rate</span>
                <span className="font-black text-amber-300 text-sm">₹{lot.expectedPrice}/Qtl</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/20">
                <span className="text-slate-400 font-bold block text-[10px]">Quality Grade</span>
                <span className="font-black text-white text-sm">{lot.qualityGrade || 'GRADE_A'}</span>
              </div>
            </div>

            <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/30 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>APMC Mandi Benchmark Reference: ₹2,320/Qtl</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Direct farm-gate sourcing allows a competitive bid of ₹2,250/Qtl while saving transport and yard fees.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Farm Pickup Location: <strong className="text-white">{lot.location || 'Nashik Farm Gate'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Col: Live Bidding Console */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Gavel className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black text-white">Bidding Desk</h2>
            </div>

            <form onSubmit={handlePlaceBid} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Offer Price per Quintal (₹/Qtl)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-sm font-black text-white focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sourcing Quantity (Quintals)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={lot.quantity}
                  value={bidQuantity}
                  onChange={(e) => setBidQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-sm font-black text-white focus:bg-slate-900 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/20 text-xs">
                <span className="text-slate-400 block text-[10px] font-bold">Total Bid Sourcing Value</span>
                <span className="text-base font-black text-amber-300">
                  ₹{(parseFloat(bidPrice || '0') * parseFloat(bidQuantity || '0'))?.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || lot.status === 'SOLD'}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs shadow-md shadow-amber-500/20 transition transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Offer...
                  </>
                ) : lot.status === 'SOLD' ? (
                  'Lot Already Sold'
                ) : (
                  'Confirm & Submit Bid'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
