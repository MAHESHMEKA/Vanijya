import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lot' | 'bid' | 'payment' | 'transaction';
}

export function StatusBadge({ status, type = 'lot' }: StatusBadgeProps) {
  let colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = status;

  switch (status) {
    case 'OPEN':
      colorStyles = 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold';
      label = 'OPEN FOR BIDS';
      break;
    case 'BIDDING':
      colorStyles = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 font-bold';
      label = 'ACTIVE BIDDING';
      break;
    case 'SOLD':
      colorStyles = 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md';
      label = 'SOLD & LOCKED';
      break;
    case 'CANCELLED':
      colorStyles = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
      label = 'CANCELLED';
      break;
    case 'PENDING':
      colorStyles = 'bg-slate-800 text-slate-300 border-slate-700 font-medium';
      label = 'PENDING REVIEW';
      break;
    case 'ACCEPTED':
      colorStyles = 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-black';
      label = 'ACCEPTED';
      break;
    case 'REJECTED':
      colorStyles = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
      label = 'REJECTED';
      break;
    case 'INITIATED':
      colorStyles = 'bg-blue-950/60 text-blue-300 border-blue-500/30';
      label = 'PAYMENT DISPATCHED';
      break;
    case 'PAID':
      colorStyles = 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-400 font-black shadow-md';
      label = 'SETTLED (PAID)';
      break;
    case 'COMPLETED':
      colorStyles = 'bg-amber-600 text-slate-950 border-amber-500 font-black shadow-md';
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
