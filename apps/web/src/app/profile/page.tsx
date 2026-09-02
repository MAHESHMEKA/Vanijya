'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { useToast } from '../../components/ui/toast';
import { PhotoCapture } from '../../components/common/photo-capture';
import { LocationCapture } from '../../components/common/location-capture';
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
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Camera,
  Navigation,
} from 'lucide-react';

export default function UnifiedProfilePage() {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [location, setLocation] = useState('');
  const [organization, setOrganization] = useState('');
  const [gstin, setGstin] = useState('');
  const [fssai, setFssai] = useState('');
  const [kccNumber, setKccNumber] = useState('');
  const [apmcLicense, setApmcLicense] = useState('');
  const [geoCoordinates, setGeoCoordinates] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDistrict(user.district || '');
      setState(user.state || '');
      setLocation(user.location || '');
      setOrganization(user.organization || '');
      setGstin(user.gstin || '');
      setFssai(user.fssai || '');
      setKccNumber(user.kccNumber || '');
      setApmcLicense(user.apmcLicense || '');
      if (user.geoPoint?.coordinates) {
        setGeoCoordinates({
          longitude: user.geoPoint.coordinates[0],
          latitude: user.geoPoint.coordinates[1],
        });
      }
    }
  }, [user]);

  const handlePhotoUpdated = async (base64: string | null) => {
    if (!base64) return;
    try {
      // Extract data to upload via base64 or multipart
      await api.post('/users/profile-photo/base64', { photoBase64: base64 }).catch(async () => {
        // Fallback: send as part of user update
        await api.patch('/users/me', { profilePhotoBase64: base64 });
      });
      await refreshUser();
      setShowPhotoEditor(false);
      showToast('Profile photo updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update photo', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        name,
        district,
        state,
        location,
        organization: organization || undefined,
        gstin: gstin || undefined,
        fssai: fssai || undefined,
        kccNumber: kccNumber || undefined,
        apmcLicense: apmcLicense || undefined,
      };

      if (geoCoordinates) {
        payload.latitude = geoCoordinates.latitude;
        payload.longitude = geoCoordinates.longitude;
      }

      await api.patch('/users/me', payload);
      await refreshUser();
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

  const isComplete = user.profileCompletionStatus === 'COMPLETE' || user.profileCompletionPercentage === 100;
  const completionPct = user.profileCompletionPercentage ?? (isComplete ? 100 : 70);
  const userPhoto = (user as any)?.profilePhoto?.url || (user as any)?.photo;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {t.profileTitle}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{t.profileSubtitle}</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200 shadow-sm space-y-6">
        {/* Profile Header with Photo */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 bg-amber-50 shadow-md flex items-center justify-center shrink-0">
              {userPhoto ? (
                <img src={userPhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-amber-900">
                  {user.name ? user.name.charAt(0) : 'U'}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPhotoEditor(!showPhotoEditor)}
              className="absolute -bottom-2 -right-2 bg-slate-900 hover:bg-slate-800 text-amber-400 p-1.5 rounded-xl shadow border border-amber-400 transition"
              title="Update Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                {roleLabel}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t.verificationBadge}
              </span>
            </div>
            {geoCoordinates && (
              <p className="text-[11px] text-emerald-800 font-mono font-bold flex items-center justify-center sm:justify-start gap-1 pt-0.5">
                <Navigation className="w-3 h-3 text-emerald-600" />
                GPS: {geoCoordinates.latitude.toFixed(4)}° N, {geoCoordinates.longitude.toFixed(4)}° E
              </p>
            )}
          </div>
        </div>

        {/* Optional Live Photo Capture Overlay/Widget */}
        {showPhotoEditor && (
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Update Identity Profile Picture
              </span>
              <button
                type="button"
                onClick={() => setShowPhotoEditor(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <PhotoCapture onPhotoSelected={handlePhotoUpdated} initialPhotoUrl={userPhoto} />
          </div>
        )}

        {/* Profile Completion Meter */}
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-black text-amber-950 uppercase tracking-wider">
              {t.profileCompletionBannerTitle}
            </span>
            <span className="font-black text-amber-900">{completionPct}%</span>
          </div>
          <div className="w-full bg-amber-200/60 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                completionPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-700" />
                {t.fieldContact}
              </label>
              <input
                type="text"
                disabled
                value={user.phone || user.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* GPS Location Capture */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">GPS Geolocation</label>
            <LocationCapture
              initialCoords={geoCoordinates}
              onLocationCaptured={(coords) => setGeoCoordinates(coords)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldState}</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldDistrict}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldLocation}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Village Pimpalgaon, Niphad Taluka"
              className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {isFarmer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-amber-100 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.kccOptionalLabel}</label>
                <input
                  type="text"
                  value={kccNumber}
                  onChange={(e) => setKccNumber(e.target.value)}
                  placeholder="e.g. KCC-MH-NSK-8821"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.apmcOptionalLabel}</label>
                <input
                  type="text"
                  value={apmcLicense}
                  onChange={(e) => setApmcLicense(e.target.value)}
                  placeholder="e.g. APMC-NSK-FMR-1042"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          {isBuyer && (
            <div className="space-y-4 border-t border-amber-100 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldOrganization}</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.gstinOptionalLabel}</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fssaiOptionalLabel}</label>
                  <input
                    type="text"
                    value={fssai}
                    onChange={(e) => setFssai(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t.btnSaveProfile}
            </button>
          </div>
        </form>

        <div className="border-t border-amber-100 pt-4 flex justify-between items-center text-xs">
          <span className="text-slate-400">Account Session ID: {user.id}</span>
          <button
            type="button"
            onClick={logout}
            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t.navLogout}
          </button>
        </div>
      </div>
    </div>
  );
}
