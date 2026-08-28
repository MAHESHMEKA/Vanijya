'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { useToast } from '../../components/ui/toast';
import {
  UserCircle,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Award,
  LogOut,
  Save,
  Loader2,
  LogIn,
  Building2,
  Sprout,
  ShieldAlert,
} from 'lucide-react';

export default function UnifiedProfilePage() {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [location, setLocation] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDistrict(user.district || '');
      setState(user.state || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch('/users/me', {
        name,
        district,
        state,
        location,
      });
      await refreshUser();
      setIsEditing(false);
      showToast(t.profileSavedSuccess, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-amber-200 shadow-md text-center space-y-4 my-8">
        <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">{t.commonLoginRequired}</h2>
        <p className="text-xs text-slate-600">{t.profileSubtitle}</p>
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

  const isFarmer = user.role === 'FARMER';
  const isBuyer = user.role === 'BUYER';
  const roleLabel = isFarmer ? t.roleFarmer : isBuyer ? t.roleBuyer : t.roleAdmin;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {t.profileTitle}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{t.profileSubtitle}</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner ${
            isFarmer ? 'bg-amber-100 text-amber-900' : isBuyer ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-amber-400'
          }`}>
            {isFarmer ? <Sprout className="w-8 h-8" /> : isBuyer ? <Building2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                {roleLabel}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t.verificationBadge}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 border-t border-amber-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.phoneOrEmailLabel}</label>
            <input
              type="text"
              disabled
              value={user.phone || user.email || ''}
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.districtLabel}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Nashik"
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.stateLabel}</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.addressLabel}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Farm Gate, Village Niphad, Nashik"
              className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-amber-100">
            <button
              type="button"
              onClick={logout}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.navLogout}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {t.btnSaveProfile}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
