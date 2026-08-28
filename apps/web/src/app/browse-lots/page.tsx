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
  const { t, translateCrop, formatCurrency, formatUnit } = useLanguage();
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
      <div className="border-b border-amber-200/80 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {t.buyerMarketplaceTitle}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{t.buyerMarketplaceSubtitle}</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchLotsPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {['ALL', 'Tomato', 'Onion', 'Potato', 'Wheat', 'Paddy'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition border shrink-0 ${
                selectedCrop === crop
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-500 font-black shadow-md shadow-amber-500/20'
                  : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50/50'
              }`}
            >
              {crop === 'ALL' ? t.filterAllCrops : translateCrop(crop)}
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
        <div className="bg-white p-10 rounded-3xl border border-amber-200 text-center space-y-3 max-w-md mx-auto">
          <ShoppingBag className="w-10 h-10 text-amber-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">{t.commonNoData}</h3>
          <p className="text-xs text-slate-500">{t.buyerMarketplaceSubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-white rounded-3xl border border-amber-200 p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-base text-slate-900">
                    {translateCrop(lot.crop?.name || lot.cropName || 'Crop')}
                  </span>
                  <StatusBadge status={lot.status} />
                </div>

                <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{t.commonQuantity}:</span>
                    <strong className="text-slate-900">{lot.quantity} {formatUnit(lot.unit)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.farmerAskingRate}:</span>
                    <strong className="text-amber-900 font-black text-sm">{formatCurrency(lot.expectedPrice)}/Qtl</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.commonGrade}:</span>
                    <span className="text-slate-800 font-semibold">{lot.qualityGrade || 'Grade A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.commonLocation}:</span>
                    <span className="text-slate-800 truncate">{lot.location || 'Nashik'}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/browse-lots/${lot.id}`}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition"
              >
                <span>{t.btnPlaceBid}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
