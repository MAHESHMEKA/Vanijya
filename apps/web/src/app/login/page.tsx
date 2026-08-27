'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { useToast } from '../../components/ui/toast';
import {
  LogIn,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Lock,
  Phone,
  UserCheck,
  Building2,
  Sprout,
  ShieldAlert,
} from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('Farmer@123');
  const [selectedRole, setSelectedRole] = useState<'FARMER' | 'BUYER' | 'ADMIN'>('FARMER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-amber-500/30 shadow-2xl text-center space-y-4 my-8 animate-in fade-in">
        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Signed In Successfully</h2>
        <p className="text-xs text-slate-300">
          Logged in as <strong className="text-amber-300">{user.name}</strong> ({user.role})
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="block w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-2xl text-xs transition shadow-md shadow-amber-500/20"
          >
            Go to {user.role === 'FARMER' ? 'Farmer Hub' : user.role === 'BUYER' ? 'Procurement Desk' : 'Admin Panel'}
          </Link>
        </div>
      </div>
    );
  }

  const handleRoleSelect = (role: 'FARMER' | 'BUYER' | 'ADMIN') => {
    setSelectedRole(role);
    if (role === 'FARMER') {
      setIdentifier('9876543210');
      setPassword('Farmer@123');
    } else if (role === 'BUYER') {
      setIdentifier('buyer@freshcart.com');
      setPassword('Buyer@123');
    } else if (role === 'ADMIN') {
      setIdentifier('admin@vanijya.gov.in');
      setPassword('Admin@123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const loggedInUser = await login(identifier, password, selectedRole);
      showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> {t.navHome}
      </Link>

      <div className="bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-amber-500/30 shadow-2xl space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold shadow-md shadow-amber-500/25">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t.loginTitle}</h1>
          <p className="text-xs text-slate-400">{t.loginSubtitle}</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300">
            {t.roleSelectLabel}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleSelect('FARMER')}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                selectedRole === 'FARMER'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-400 shadow-md font-black'
                  : 'bg-slate-950 text-slate-300 border-amber-500/20 hover:bg-slate-800 hover:text-amber-300'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>{t.roleFarmer}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('BUYER')}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                selectedRole === 'BUYER'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-400 shadow-md font-black'
                  : 'bg-slate-950 text-slate-300 border-amber-500/20 hover:bg-slate-800 hover:text-amber-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t.roleBuyer}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('ADMIN')}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                selectedRole === 'ADMIN'
                  ? 'bg-slate-800 text-amber-400 border-amber-400 shadow-md font-black'
                  : 'bg-slate-950 text-slate-300 border-amber-500/20 hover:bg-slate-800 hover:text-amber-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t.roleAdmin}</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              {t.phoneOrEmailLabel}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 9876543210 or buyer@freshcart.com"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-sm font-medium text-white focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              {t.passwordLabel}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-sm font-medium text-white focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-600"
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
                {t.signingIn}
              </>
            ) : (
              t.btnSignIn
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Kisan Credit Card (KCC) & National APMC Trade Enrolled
        </div>
      </div>
    </div>
  );
}
