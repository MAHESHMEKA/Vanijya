'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useLanguage } from '../../lib/language-context';
import { useToast } from '../../components/ui/toast';
import { Captcha, CaptchaHandle } from '../../components/security/captcha';
import { PhotoCapture } from '../../components/common/photo-capture';
import { LocationCapture } from '../../components/common/location-capture';
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
  Camera,
  Navigation,
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

  // Photo and Geolocation State
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [geoCoordinates, setGeoCoordinates] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);

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

      if (photoBase64) {
        payload.profilePhotoBase64 = photoBase64;
      }

      if (geoCoordinates) {
        payload.latitude = geoCoordinates.latitude;
        payload.longitude = geoCoordinates.longitude;
      }

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

        {photoBase64 && (
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-emerald-500 shadow-md">
            <img src={photoBase64} alt="Applicant" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-amber-100 pb-2 font-bold">
            <span className="text-slate-500">Account Type:</span>
            <span className="text-slate-900 font-black">
              {persona === 'FARMER' ? `🌾 Farmer Producer` : `🏢 Institutional Buyer`}
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
          <div className="flex justify-between border-b border-amber-100 pb-2">
            <span className="text-slate-500">Region:</span>
            <strong className="text-slate-900">{district}, {state}</strong>
          </div>
          {geoCoordinates && (
            <div className="flex justify-between">
              <span className="text-slate-500">GPS Coordinates:</span>
              <strong className="text-emerald-800 font-mono">
                {geoCoordinates.latitude.toFixed(4)}° N, {geoCoordinates.longitude.toFixed(4)}° E
              </strong>
            </div>
          )}
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
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-amber-200 shadow-md space-y-6 text-center">
          <div className="space-y-1">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase">
              SIH 26132 Unified Verification Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight pt-2">
              {t.signupTitle}
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select your primary marketplace role to begin the official verification onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {/* Persona: Farmer */}
            <button
              type="button"
              onClick={() => handleSelectPersona('FARMER')}
              className="p-5 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 transition space-y-3 group text-left relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition">
                🌾
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
                  {t.accountTypeFarmer}
                  <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition" />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t.accountTypeFarmerDesc}
                </p>
              </div>
              <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                0% Middleman Commission
              </span>
            </button>

            {/* Persona: Buyer */}
            <button
              type="button"
              onClick={() => handleSelectPersona('BUYER')}
              className="p-5 rounded-2xl border-2 border-amber-200 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition space-y-3 group text-left relative overflow-hidden"
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
                Direct Farm-Gate Procurement
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
            Submit your credentials, live photo, and GPS location for admin review and market access.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitRegistration} className="space-y-6">
          {/* Section 1: Applicant Profile Photo Capture */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-700" />
              1. Identity Profile Photo Verification
            </h3>
            <PhotoCapture onPhotoSelected={setPhotoBase64} required={true} />
          </div>

          {/* Section 2: Basic Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              2. Basic Identity & Contact Details
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

          {/* Section 3: Geolocation and Regional Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              3. Geolocation & Sourcing Hub
            </h3>

            {/* GPS Capture Widget */}
            <LocationCapture onLocationCaptured={setGeoCoordinates} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldState} *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
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
                    placeholder="e.g. Pimpalgaon Baswant"
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fieldLocation}</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Niphad Taluka Farm Gate"
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.warehouseLabel} *</label>
                <input
                  type="text"
                  required
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  placeholder="e.g. Sector 19, Vashi APMC Terminal"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Section 4: Operational Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              4. Operational & Licensing Credentials
            </h3>

            {persona === 'FARMER' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.primaryCropLabel}</label>
                  <select
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Tomato">🍅 Tomato (टमाटर / టమోటా)</option>
                    <option value="Onion">🧅 Onion (प्याज / ఉల్లిపాయ)</option>
                    <option value="Potato">🥔 Potato (आलू / బంగాళాదుంప)</option>
                    <option value="Wheat">🌾 Wheat (गेहूं / గోధుమలు)</option>
                    <option value="Paddy">🍚 Paddy / Rice (धान / వరి)</option>
                    <option value="Cotton">🌱 Cotton (कपास / పత్తి)</option>
                    <option value="Soybean">🫘 Soybean (सोयाबीन / సోయాబీన్)</option>
                    <option value="Maize">🌽 Maize (मक्का / మొక్కజొన్న)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.farmSizeLabel} (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.businessTypeLabel}</label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Food Processor / Institutional Buyer"
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.gstinOptionalLabel}</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 27AABCU9603R1ZM"
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.fssaiOptionalLabel}</label>
                  <input
                    type="text"
                    value={fssai}
                    onChange={(e) => setFssai(e.target.value)}
                    placeholder="e.g. 10019022009876"
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Password Security */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              5. Account Security Credentials
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
                    placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Symbol"
                    className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-600">Password Strength:</span>
                  <span className={rulesPassed >= 5 ? 'text-emerald-700' : rulesPassed >= 3 ? 'text-amber-700' : 'text-rose-700'}>
                    {strengthLabel}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${strengthPercent}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Security Visual CAPTCHA */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              6. Visual Security CAPTCHA Challenge
            </h3>
            <Captcha
              ref={captchaRef}
              onCaptchaChange={(data) => setCaptchaData(data)}
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Registration Dossier...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Submit Application for Verification</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-500">
            By submitting, you declare that all uploaded identity documents and crop/business credentials are accurate.
          </p>
        </form>
      </div>
    </div>
  );
}
