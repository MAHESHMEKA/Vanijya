'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../lib/language-context';

interface LocationCaptureProps {
  onLocationCaptured: (coords: { latitude: number; longitude: number; accuracy?: number } | null) => void;
  initialCoords?: { latitude: number; longitude: number } | null;
}

export function LocationCapture({ onLocationCaptured, initialCoords }: LocationCaptureProps) {
  const { t } = useLanguage();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(
    initialCoords || null,
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const detectLocation = () => {
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please enter your location details manually.');
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const captured = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
        };
        setCoords(captured);
        setIsDetecting(false);
        onLocationCaptured(captured);
      },
      (error) => {
        setIsDetecting(false);
        let msg = 'Unable to fetch current GPS coordinates. You may enter your district & state manually.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can still enter your district, state, and address manually.';
        }
        setErrorMsg(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const clearLocation = () => {
    setCoords(null);
    setErrorMsg(null);
    onLocationCaptured(null);
  };

  return (
    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-emerald-700" />
          <span>GPS Geolocation Coordination</span>
        </label>
        {coords && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {t.locationDetected || 'GPS Acquired'}
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed">
        Vanijya connects you to optimal regional mandis and calculates spatial transport arbitrage using exact geo-coordinates.
      </p>

      {coords ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-emerald-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 font-mono">
                {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                GeoJSON Point [lng: {coords.longitude}, lat: {coords.latitude}] {coords.accuracy ? `(±${coords.accuracy}m accuracy)` : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetecting}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              Update GPS
            </button>
            <button
              type="button"
              onClick={clearLocation}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={detectLocation}
          disabled={isDetecting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-sm transition disabled:opacity-50"
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t.detectingLocation || 'Detecting GPS Coordinates...'}</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>{t.useCurrentLocation || 'Detect My Current Location'}</span>
            </>
          )}
        </button>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
