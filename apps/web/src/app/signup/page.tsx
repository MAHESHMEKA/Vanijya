'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useLanguage } from '../../lib/language-context';
import { useToast } from '../../components/ui/toast';
import { Captcha, CaptchaHandle } from '../../components/security/captcha';
import {
  Sprout,
  Building2,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock,
  Lock,
  Phone,
  Mail,
  MapPin,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  Info,
} from 'lucide-react';

type AccountPersona = 'FARMER' | 'BUYER';

export default function UnifiedSignupPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const captchaRef = useRef<CaptchaHandle>(null);

  // Workflow Steps: 'SELECT_PERSONA' -> 'FILL_FORM' -> 'SUBMITTED'
  const [step, setStep] = useState<'SELECT_PERSONA' | 'FILL_FORM' | 'SUBMITTED'>('SELECT_PERSONA');
  const [persona, setPersona] = useState<AccountPersona>('FARMER');

  // Common Identity Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nashik');
  const [location, setLocation] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(language);

  // Farmer Specific Fields
  const [village, setVillage] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('Tomato');
  const [farmSize, setFarmSize] = useState('5.0');
  const [kccNumber, setKccNumber] = useState('');
  const [apmcLicense, setApmcLicense] = useState('');

  // Buyer Specific Fields
  const [organization, setOrganization] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessType, setBusinessType] = useState('Wholesale Trader / Processor');
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [gstin, setGstin] = useState('');
  const [fssai, setFssai] = useState('');

  // Security CAPTCHA State
  const [captchaData, setCaptchaData] = useState<{ captchaId: string; captchaAnswer: string }>({
    captchaId: '',
    captchaAnswer: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);

  // Password Strength Evaluation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const rulesPassed = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  let strengthLabel = t.passwordStrengthWeak;
  let strengthColor = 'bg-rose-500';
  let strengthPercent = 20;

  if (rulesPassed >= 5) {
    strengthLabel = t.passwordStrengthStrong;
    strengthColor = 'bg-emerald-500';
    strengthPercent = 100;
  } else if (rulesPassed >= 3) {
    strengthLabel = t.passwordStrengthMedium;
    strengthColor = 'bg-amber-500';
    strengthPercent = 60;
  }

  const isPasswordValid = rulesPassed === 5;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSelectPersona = (chosen: AccountPersona) => {
    setPersona(chosen);
    setErrorMessage(null);
    if (chosen === 'FARMER') {
      setLocation('Village Pimpalgaon, Niphad Taluka, Nashik');
      setVillage('Pimpalgaon Baswant');
      setState('Maharashtra');
      setDistrict('Nashik');
    } else {
      setLocation('Vashi APMC Complex, Navi Mumbai');
      setState('Maharashtra');
      setDistrict('Mumbai');
      setWarehouseLocation('Vashi APMC Sector 19, Navi Mumbai');
    }
    setStep('FILL_FORM');
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage(t.passwordRuleNotice);
      showToast(t.passwordRuleNotice, 'error');
      return;
    }

    if (!doPasswordsMatch) {
      setErrorMessage(t.passwordMatchError);
      showToast(t.passwordMatchError, 'error');
      return;
    }

    if (!captchaData.captchaAnswer || captchaData.captchaAnswer.trim() === '') {
      setErrorMessage(t.errCaptchaRequired);
      showToast(t.errCaptchaRequired, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        role: persona,
        name: persona === 'BUYER' && organization ? `${organization} (${contactPerson || name})` : name,
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        state,
        district,
        location,
        preferredLanguage,
        captchaId: captchaData.captchaId,
        captchaAnswer: captchaData.captchaAnswer.trim().toUpperCase(),
      };

      if (persona === 'FARMER') {
        payload.name = name;
        payload.village = village;
        payload.primaryCrop = primaryCrop;
        payload.farmSize = parseFloat(farmSize) || undefined;
        payload.kccNumber = kccNumber || undefined;
        payload.apmcLicense = apmcLicense || undefined;
      } else {
        payload.organization = organization;
        payload.contactPerson = contactPerson || name;
        payload.businessType = businessType;
        payload.warehouseLocation = warehouseLocation;
        payload.gstin = gstin || undefined;
        payload.fssai = fssai || undefined;
      }

      const res = await api.post<any>('/auth/register', payload);

      setRegisteredUserId(res.userId || 'usr-reg-new');
      setStep('SUBMITTED');
      showToast(t.registrationSubmittedTitle, 'success');
    } catch (err: any) {
      const msg = err.message || t.errServerError;
      setErrorMessage(msg);
      showToast(msg, 'error');
      captchaRef.current?.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3: REGISTRATION SUBMITTED SUCCESS SCREEN
  // -------------------------------------------------------------
  if (step === 'SUBMITTED') {
    return (
      <div className="max-w-lg mx-auto bg-white p-8 md:p-10 rounded-3xl border-2 border-amber-300 shadow-xl text-center space-y-6 my-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-3.5 py-1 rounded-full border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            {t.pendingApprovalBadge}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {t.registrationSubmittedTitle}
          </h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            {t.pendingApprovalDesc}
          </p>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-amber-100 pb-2 font-bold">
            <span className="text-slate-500">Account Type:</span>
            <span className="text-slate-900 font-black">
              {persona === 'FARMER' ? `🌾 ${t.roleFarmer.split(' ')[0]}` : `🏢 ${t.roleBuyer.split(' ')[0]}`}
            </span>
          </div>
          <div className="flex justify-between border-b border-amber-100 pb-2">
            <span className="text-slate-500">Applicant:</span>
            <strong className="text-slate-900">{name || organization}</strong>
          </div>
          <div className="flex justify-between border-b border-amber-100 pb-2">
            <span className="text-slate-500">Mobile Number:</span>
            <strong className="text-slate-900">{phone}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Region:</span>
            <strong className="text-slate-900">{district}, {state}</strong>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="block w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs transition shadow-md shadow-amber-500/25"
          >
            &larr; {t.btnBackToLogin}
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 1: PERSONA SELECTION
  // -------------------------------------------------------------
  if (step === 'SELECT_PERSONA') {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs text-amber-800 font-bold hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> {t.commonBack} to {t.navLogin}
        </Link>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-amber-200 shadow-md space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold shadow-md shadow-amber-500/25">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {t.stepPersonaSelect}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t.signupTitle}</h1>
            <p className="text-xs text-slate-500">{t.signupSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Farmer Persona Card */}
            <button
              type="button"
              onClick={() => handleSelectPersona('FARMER')}
              className="p-5 rounded-3xl border-2 border-amber-200 hover:border-amber-500 bg-gradient-to-b from-amber-50/60 to-white hover:shadow-lg transition text-left space-y-3 group"
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition">
                🌾
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
                  {t.accountTypeFarmer}
                  <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition" />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t.accountTypeFarmerDesc}
                </p>
              </div>
              <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                0% Middleman Commission
              </span>
            </button>

            {/* Buyer Persona Card */}
            <button
              type="button"
              onClick={() => handleSelectPersona('BUYER')}
              className="p-5 rounded-3xl border-2 border-amber-200 hover:border-amber-500 bg-gradient-to-b from-amber-50/60 to-white hover:shadow-lg transition text-left space-y-3 group"
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition">
                🏢
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
                  {t.accountTypeBuyer}
                  <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition" />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t.accountTypeBuyerDesc}
                </p>
              </div>
              <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Verified Mandi Sourcing
              </span>
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Already registered on Vanijya? </span>
            <Link href="/login" className="text-xs font-bold text-amber-800 hover:underline">
              {t.btnSignIn}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 2: FILL REGISTRATION DETAILS FORM
  // -------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-300">
      <button
        type="button"
        onClick={() => setStep('SELECT_PERSONA')}
        className="inline-flex items-center gap-1 text-xs text-amber-800 font-bold hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Switch Account Persona
      </button>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-amber-200 shadow-md space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {persona === 'FARMER' ? '🌾 Farmer Registration' : '🏢 Buyer Registration'}
            </span>
            <span className="text-xs text-slate-400 font-medium">Vanijya Verification Portal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {persona === 'FARMER' ? 'Farmer Producer Registration' : 'Institutional Buyer Registration'}
          </h1>
          <p className="text-xs text-slate-500">
            Submit your credentials for administrative verification. Verified accounts receive direct marketplace access.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitRegistration} className="space-y-5">
          {/* Section: Basic Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              1. Basic Identity & Contact Details
            </h3>

            {persona === 'FARMER' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldName} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh V. Patel"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldOrganization} *</label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. FreshCart Agro Limited"
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.contactPersonLabel} *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => {
                      setContactPerson(e.target.value);
                      setName(e.target.value);
                    }}
                    placeholder="e.g. Praveen Kumar"
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  Email Address {persona === 'BUYER' ? '*' : '(Optional)'}
                </label>
                <input
                  type="email"
                  required={persona === 'BUYER'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contact@domain.in"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Passwords & Strength Meter */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              2. Security Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.passwordLabel} *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2.5 pr-10 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.confirmPasswordLabel} *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  className={`w-full px-3.5 py-2.5 bg-amber-50/40 border rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:outline-none ${
                    confirmPassword && !doPasswordsMatch
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-amber-200 focus:ring-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* Live Password Strength Meter */}
            {password && (
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-600">Password Strength:</span>
                  <span
                    className={
                      rulesPassed >= 5
                        ? 'text-emerald-700 font-black'
                        : rulesPassed >= 3
                        ? 'text-amber-700 font-bold'
                        : 'text-rose-700 font-bold'
                    }
                  >
                    {strengthLabel}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${strengthPercent}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                  <span className={hasMinLength ? 'text-emerald-700 font-bold' : ''}>
                    {hasMinLength ? '✓' : '•'} 8+ characters
                  </span>
                  <span className={hasUpper && hasLower ? 'text-emerald-700 font-bold' : ''}>
                    {hasUpper && hasLower ? '✓' : '•'} Upper & lowercase
                  </span>
                  <span className={hasNumber ? 'text-emerald-700 font-bold' : ''}>
                    {hasNumber ? '✓' : '•'} Numbers (0-9)
                  </span>
                  <span className={hasSpecial ? 'text-emerald-700 font-bold' : ''}>
                    {hasSpecial ? '✓' : '•'} Special symbol (@#$%)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: Geographic & Region Coordinates */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              3. Geographic & Operational Region
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldState} *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldDistrict} *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Nashik"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {persona === 'FARMER' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.villageLabel} *</label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={t.villagePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldLocation} *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Village Pimpalgaon, Niphad Taluka"
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Procurement Yard / Office Address *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Vashi APMC Sector 19, Navi Mumbai"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Section: Role Specific Agronomic / Commercial Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              {persona === 'FARMER' ? '4. Agricultural Profile & Compliance' : '4. Commercial Registration & Licenses'}
            </h3>

            {persona === 'FARMER' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.primaryCropLabel}</label>
                    <select
                      value={primaryCrop}
                      onChange={(e) => setPrimaryCrop(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Tomato">Tomato</option>
                      <option value="Onion">Onion</option>
                      <option value="Potato">Potato</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Paddy">Paddy / Rice</option>
                      <option value="Maize">Maize</option>
                      <option value="Soybean">Soybean</option>
                      <option value="Cotton">Cotton</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.farmSizeLabel}</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      placeholder="5.0"
                      className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.kccOptionalLabel}</label>
                    <input
                      type="text"
                      value={kccNumber}
                      onChange={(e) => setKccNumber(e.target.value)}
                      placeholder="e.g. KCC-MAH-992144"
                      className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.apmcOptionalLabel}</label>
                    <input
                      type="text"
                      value={apmcLicense}
                      onChange={(e) => setApmcLicense(e.target.value)}
                      placeholder="e.g. APMC-NSK-TRD-401"
                      className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.businessTypeLabel}</label>
                    <input
                      type="text"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      placeholder="e.g. Food Processor / Wholesale Trader"
                      className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.warehouseLabel}</label>
                    <input
                      type="text"
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                      placeholder="e.g. Vashi Sector 19 Warehouse Hub"
                      className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.gstinOptionalLabel}</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 27AABCU9603R1ZM"
                      className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.fssaiOptionalLabel}</label>
                    <input
                      type="text"
                      value={fssai}
                      onChange={(e) => setFssai(e.target.value)}
                      placeholder="e.g. 10019022009876"
                      className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Section: Preferred Language */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">{t.preferredLanguageLabel}</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPreferredLanguage('en')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  preferredLanguage === 'en'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                    : 'bg-amber-50/50 text-slate-700 border-amber-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPreferredLanguage('hi')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  preferredLanguage === 'hi'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                    : 'bg-amber-50/50 text-slate-700 border-amber-200'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setPreferredLanguage('te')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  preferredLanguage === 'te'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                    : 'bg-amber-50/50 text-slate-700 border-amber-200'
                }`}
              >
                తెలుగు
              </button>
            </div>
          </div>

          {/* Section: Visual Alphanumeric CAPTCHA */}
          <Captcha
            ref={captchaRef}
            onCaptchaChange={setCaptchaData}
            disabled={isSubmitting}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
            className={`w-full font-black py-4 rounded-2xl text-xs uppercase tracking-wider transition transform shadow-md flex items-center justify-center gap-2 ${
              isSubmitting || !isPasswordValid || !doPasswordsMatch
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.submittingRegistration}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                {t.btnSubmitRegistration}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
