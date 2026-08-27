'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { StatusBadge } from '../../components/ui/status-badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import {
  ShoppingBag,
  Search,
  Filter,
  MapPin,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function BrowseLotsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLots = () => {
    api.get<any[]>('/lots')
      .then((res) => {
        if (res) setLots(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLots();
    const interval = setInterval(fetchLots, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredLots = lots.filter((lot) => {
    const matchesCrop = selectedCrop === 'ALL' || lot.crop?.name?.toLowerCase() === selectedCrop.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      lot.crop?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.farmer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-amber-500/20 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          {t.buyerMarketplaceTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.buyerMarketplaceSubtitle}</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchLotsPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-amber-500/30 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm placeholder:text-slate-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {['ALL', 'Tomato', 'Onion', 'Potato', 'Wheat', 'Paddy'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition border shrink-0 ${
                selectedCrop === crop
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 border-amber-500/20 hover:bg-slate-800 hover:text-amber-300'
              }`}
            >
              {crop === 'ALL' ? t.filterAllCrops : crop}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredLots.length === 0 ? (
        <div className="bg-slate-900/80 p-10 rounded-3xl border border-amber-500/20 text-center space-y-3 max-w-md mx-auto">
          <ShoppingBag className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-base font-black text-white">No Crop Lots Matching Filter</h2>
          <p className="text-xs text-slate-400">Try clearing filters or search query to view available harvest lots.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-slate-900/80 p-5 rounded-3xl border border-amber-500/20 shadow-sm hover:border-amber-500 hover:shadow-md transition space-y-4 flex flex-col justify-between transition-card"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-white tracking-tight">
                      {lot.crop?.name || 'Crop'} ({lot.quantity} {lot.unit || 'Qtl'})
                    </span>
                    <p className="text-[11px] text-amber-400/90 font-semibold">
                      Producer: {lot.farmer?.name || 'Verified Farmer'}
                    </p>
                  </div>
                  <StatusBadge status={lot.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-2xl border border-amber-500/20">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">Expected Rate</span>
                    <span className="font-black text-amber-300 text-sm">₹{lot.expectedPrice}/Qtl</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">Quality Grade</span>
                    <span className="font-black text-white text-sm">{lot.qualityGrade || 'GRADE_A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{lot.location || 'Nashik Farm Gate'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {lot.bids?.length || 0} active bid{lot.bids?.length !== 1 ? 's' : ''}
                </span>
                <Link
                  href={`/browse-lots/${lot.id}`}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
                >
                  {t.btnPlaceBid} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
