'use client';

import React from 'react';
import { useLanguage } from '../../lib/language-context';
import { Globe } from 'lucide-react';
import { Language } from '../../lib/translations';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const options: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'te', label: 'తెలుగు' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-amber-500/30 text-xs shadow-inner">
      <Globe className="w-3.5 h-3.5 text-amber-400 ml-1 shrink-0" />
      <div className="flex gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.code}
            onClick={() => setLanguage(opt.code)}
            className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition ${
              language === opt.code
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow-sm'
                : 'text-slate-300 hover:text-amber-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
