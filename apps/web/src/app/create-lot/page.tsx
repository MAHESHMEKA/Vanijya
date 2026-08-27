'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { useToast } from '../../components/ui/toast';
import {
  Sprout,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
  MapPin,
  LogIn,
} from 'lucide-react';

export default function CreateLotPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [crops, setCrops] = useState<{ id: string; name: string }[]>([
    { id: 'crop-1', name: 'Tomato' },
    { id: 'crop-2', name: 'Onion' },
    { id: 'crop-3', name: 'Potato' },
    { id: 'crop-4', name: 'Wheat' },
    { id: 'crop-5', name: 'Paddy' },
    { id: 'crop-6', name: 'Maize' },
  ]);

  const [cropId, setCropId] = useState('crop-1');
  const [selectedCropName, setSelectedCropName] = useState('Tomato');
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('QUINTAL');
  const [expectedPrice, setExpectedPrice] = useState('2200');
  const [qualityGrade, setQualityGrade] = useState('GRADE_A');
  const [location, setLocation] = useState('Pimpalgaon Farm Gate, Niphad, Nashik');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get<any[]>('/crops')
      .then((res) => {
        if (res && res.length > 0) {
          setCrops(res);
          setCropId(res[0].id);
          setSelectedCropName(res[0].name);
        }
      })
      .catch(() => {});

    if (user?.location) {
      setLocation(user.location);
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-amber-200 shadow-md text-center space-y-4 my-8">
        <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Sign In to Publish Produce</h2>
        <p className="text-xs text-slate-600">Please sign in with your farmer account to list crop lots for commercial buyers.</p>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/lots', {
        cropId: cropId || crops.find((c) => c.name === selectedCropName)?.id || '1',
        quantity: parseFloat(quantity),
        unit,
        expectedPrice: parseFloat(expectedPrice),
        qualityGrade,
        location,
      });

      showToast('Crop lot published successfully to the marketplace!', 'success');
      router.push('/my-lots');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish crop lot', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-amber-800 font-bold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              0% Commission
            </span>
            <span className="text-xs text-slate-500">Direct Farm-Gate Listing</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t.createLotTitle}</h1>
          <p className="text-xs text-slate-500">{t.createLotSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Commodity Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.lotCropLabel}</label>
            <select
              value={selectedCropName}
              onChange={(e) => {
                setSelectedCropName(e.target.value);
                const found = crops.find((c) => c.name === e.target.value);
                if (found) setCropId(found.id);
              }}
              className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {crops.map((crop) => (
                <option key={crop.id} value={crop.name}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Expected Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.lotQtyLabel}</label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.lotPriceLabel}</label>
              <input
                type="number"
                required
                min="1"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                placeholder="2200"
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Produce Grade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.lotGradeLabel}</label>
            <select
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="GRADE_A">Grade A (Premium Export Quality)</option>
              <option value="GRADE_B">Grade B (Standard Market Quality)</option>
              <option value="GRADE_C">Grade C (Fair Average Quality)</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.lotLocationLabel}</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Farm Gate, Village Niphad, Nashik"
              className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-2xl text-sm shadow-md shadow-amber-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing Crop Lot...
              </>
            ) : (
              t.btnConfirmPublish
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
