'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
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
} from 'lucide-react';

export default function MyBidsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const interval = setInterval(fetchBids, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto bg-slate-900/90 p-8 rounded-3xl border border-amber-500/30 shadow-2xl text-center space-y-4 my-8">
        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Buyer Login Required</h2>
        <p className="text-xs text-slate-400">Sign in to track your active bids and purchase offers.</p>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {t.myBidsTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Track status of active offers and negotiations</p>
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
        <div className="bg-slate-900/80 p-10 rounded-3xl border border-amber-500/20 text-center space-y-3 max-w-md mx-auto">
          <Gavel className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-base font-black text-white">No Bids Submitted Yet</h2>
          <p className="text-xs text-slate-400">Explore the marketplace to place your first direct farm-gate bid.</p>
          <Link
            href="/browse-lots"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow transition"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <div
              key={bid.id}
              className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm hover:border-amber-500 transition space-y-3 transition-card"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">
                      {bid.lot?.crop?.name || 'Crop'} ({bid.quantity} {bid.lot?.unit || 'Qtl'})
                    </span>
                    <StatusBadge status={bid.status} type="bid" />
                  </div>
                  <p className="text-xs text-slate-400">Farmer: {bid.lot?.farmer?.name || 'Patel Farms'}</p>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-lg font-black text-white">
                    ₹{bid.price} <span className="text-xs font-normal text-slate-400">/ Qtl</span>
                  </span>
                  <span className="text-xs font-bold text-amber-300 block">
                    Total: ₹{(bid.price * bid.quantity)?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {bid.status === 'ACCEPTED' && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-extrabold flex items-center gap-1">
                    ✓ Deal Accepted by Farmer!
                  </span>
                  <Link
                    href="/transactions"
                    className="inline-flex items-center gap-1 text-xs font-black text-amber-400 hover:text-amber-300 transition"
                  >
                    View Purchase Contract <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
