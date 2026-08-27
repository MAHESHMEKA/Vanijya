'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { StatusBadge } from '../../components/ui/status-badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import {
  Package,
  PlusCircle,
  Gavel,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  LogIn,
} from 'lucide-react';

export default function MyLotsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLots = () => {
    api.get<any[]>('/lots')
      .then((res) => {
        if (res) {
          const userLots = user?.id ? res.filter((l) => l.farmerId === user.id || l.farmer?.name === user.name) : res;
          setLots(userLots.length > 0 ? userLots : res);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLots();
    const interval = setInterval(fetchLots, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-amber-200 shadow-md text-center space-y-4 my-8">
        <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Farmer Login Required</h2>
        <p className="text-xs text-slate-600">Please sign in to view your published crop lots and received bids.</p>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {t.activeLotsTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage harvest listings, review incoming offers, and finalize deals</p>
        </div>

        <Link
          href="/create-lot"
          className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/25 transition transform active:scale-95 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          {t.btnPublishLot}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : lots.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-amber-200 shadow-sm text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-3xl flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">No Crop Lots Published Yet</h2>
            <p className="text-xs text-slate-500">
              List your harvested produce with expected prices to receive direct offers from verified buyers.
            </p>
          </div>
          <Link
            href="/create-lot"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            Publish First Crop Lot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lots.map((lot) => {
            const bidsCount = lot.bids?.length || 0;
            const highestBid = lot.bids && lot.bids.length > 0 ? Math.max(...lot.bids.map((b: any) => b.price)) : null;

            return (
              <div
                key={lot.id}
                className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm hover:border-amber-500 hover:shadow-md transition space-y-4 flex flex-col justify-between transition-card"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      {lot.crop?.name || 'Crop'} ({lot.quantity} {lot.unit || 'Qtl'})
                    </span>
                    <StatusBadge status={lot.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">Expected Rate</span>
                      <span className="font-black text-slate-900">₹{lot.expectedPrice}/Qtl</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">Quality Grade</span>
                      <span className="font-black text-amber-800">{lot.qualityGrade || 'GRADE_A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{lot.location || 'Nashik Farm Gate'}</span>
                  </div>

                  {bidsCount > 0 && (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-amber-700" />
                        <span className="font-extrabold text-amber-950">
                          {bidsCount} Buyer Offer{bidsCount > 1 ? 's' : ''} Received
                        </span>
                      </div>
                      {highestBid && (
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                          Top: ₹{highestBid}/Qtl
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-amber-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Listed: {new Date(lot.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  <Link
                    href={`/my-lots/${lot.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 hover:text-amber-900"
                  >
                    View Offers & Timeline <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
