import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lot' | 'bid' | 'payment' | 'transaction';
}

export function StatusBadge({ status, type = 'lot' }: StatusBadgeProps) {
  let colorStyles = 'bg-slate-100 text-slate-800 border-slate-200';
  let label = status;

  switch (status) {
    case 'OPEN':
      colorStyles = 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
      label = 'OPEN FOR BIDS';
      break;
    case 'BIDDING':
      colorStyles = 'bg-yellow-100 text-amber-950 border-yellow-300 font-bold';
      label = 'ACTIVE BIDDING';
      break;
    case 'SOLD':
      colorStyles = 'bg-amber-600 text-white border-amber-700 font-black shadow-sm';
      label = 'SOLD & LOCKED';
      break;
    case 'CANCELLED':
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-200';
      label = 'CANCELLED';
      break;
    case 'PENDING':
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-200';
      label = 'PENDING REVIEW';
      break;
    case 'ACCEPTED':
      colorStyles = 'bg-amber-100 text-amber-950 border-amber-400 font-black shadow-sm';
      label = 'ACCEPTED';
      break;
    case 'REJECTED':
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-200';
      label = 'REJECTED';
      break;
    case 'INITIATED':
      colorStyles = 'bg-blue-50 text-blue-800 border-blue-200';
      label = 'PAYMENT DISPATCHED';
      break;
    case 'PAID':
      colorStyles = 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-600 font-black shadow-sm';
      label = 'SETTLED (PAID)';
      break;
    case 'COMPLETED':
      colorStyles = 'bg-amber-700 text-white border-amber-800 font-black shadow-sm';
      label = 'CONTRACT COMPLETED';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${colorStyles}`}
    >
      {label}
    </span>
  );
}
