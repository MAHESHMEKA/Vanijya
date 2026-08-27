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
      showToast('Profile updated successfully!', 'success');
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
        <h2 className="text-xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-600">Please sign in to view and manage your profile details.</p>
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

  const isFarmer = user.role === 'FARMER';
  const isBuyer = user.role === 'BUYER';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          User Account & Trade Verification
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your credentials, trading location, and contact information</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner ${
            isFarmer ? 'bg-amber-100 text-amber-900' : isBuyer ? 'bg-amber-100 text-amber-900' : 'bg-slate-900 text-amber-400'
          }`}>
            {isFarmer ? <Sprout className="w-9 h-9" /> : isBuyer ? <Building2 className="w-9 h-9" /> : <ShieldAlert className="w-9 h-9" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
              {user.isVerified && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> VERIFIED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Account Type: <strong className="text-slate-800">{user.role}</strong></p>
          </div>
        </div>

        {/* Credentials Pill */}
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isFarmer
                ? 'Kisan Credit Card (KCC) & National APMC Trade Enrolled'
                : isBuyer
                ? 'FSSAI & Wholesale Trading License Enrolled'
                : 'National Platform Administrative Access'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {isFarmer
              ? 'Verified agricultural producer eligible for zero-commission direct buyer transactions.'
              : isBuyer
              ? 'Authorized institutional procurer authorized for bulk farm-gate settlement.'
              : 'Authorized oversight official for market price feeds and APMC compliance.'}
          </p>
        </div>

        {/* Profile Details / Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 border-t border-amber-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District / City</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isFarmer ? 'Farm-Gate Pickup Location' : 'Procurement Warehouse / Office Address'}
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3.5 pt-2 border-t border-amber-100 text-xs text-slate-700">
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900">{user.phone}</span>
              </div>
            )}

            {user.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900">{user.email}</span>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">{user.location || 'Location not specified'}</span>
                <span className="text-[11px] text-slate-500 block">
                  {user.district ? `${user.district}, ` : ''}{user.state || 'India'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 text-xs text-amber-800 font-extrabold hover:underline"
            >
              Edit Location Details →
            </button>
          </div>
        )}
      </div>

      <button
        onClick={logout}
        className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold border border-rose-200 transition flex items-center justify-center gap-1.5"
      >
        <LogOut className="w-4 h-4" />
        {t.navLogout}
      </button>
    </div>
  );
}
