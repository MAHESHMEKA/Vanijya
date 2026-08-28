'use client';

import React from 'react';
import { useLanguage } from '../../lib/language-context';

interface StatusBadgeProps {
  status: string;
  type?: 'lot' | 'bid' | 'payment' | 'transaction';
}

export function StatusBadge({ status, type = 'lot' }: StatusBadgeProps) {
  const { translateStatus } = useLanguage();
  let colorStyles = 'bg-slate-100 text-slate-800 border-slate-200';
  const upperStatus = (status || '').toUpperCase();

  switch (upperStatus) {
    case 'OPEN':
      colorStyles = 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
      break;
    case 'BIDDING':
      colorStyles = 'bg-yellow-100 text-amber-950 border-yellow-300 font-bold';
      break;
    case 'SOLD':
      colorStyles = 'bg-amber-600 text-white border-amber-700 font-black shadow-sm';
      break;
    case 'CANCELLED':
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
    case 'PENDING':
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'ACCEPTED':
      colorStyles = 'bg-amber-100 text-amber-950 border-amber-400 font-black shadow-sm';
      break;
    case 'REJECTED':
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
    case 'WITHDRAWN':
      colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';
      break;
    case 'INITIATED':
      colorStyles = 'bg-blue-50 text-blue-800 border-blue-200';
      break;
    case 'PAID':
      colorStyles = 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-600 font-black shadow-sm';
      break;
    case 'COMPLETED':
      colorStyles = 'bg-amber-700 text-white border-amber-800 font-black shadow-sm';
      break;
  }

  const label = translateStatus(upperStatus);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${colorStyles}`}
    >
      {label}
    </span>
  );
}
