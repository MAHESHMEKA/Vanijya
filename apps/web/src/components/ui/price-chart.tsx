'use client';

import React from 'react';

interface PricePoint {
  date: string;
  modalPrice: number;
  arrivalQuantity?: number;
}

interface PriceChartProps {
  data: PricePoint[];
  cropName: string;
}

export function PriceChart({ data, cropName }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center bg-slate-900 rounded-2xl border border-dashed border-amber-500/30 text-xs text-amber-400">
        No price history points available for {cropName}
      </div>
    );
  }

  const prices = data.map((d) => d.modalPrice);
  const minPrice = Math.min(...prices) * 0.96;
  const maxPrice = Math.max(...prices) * 1.04;
  const range = maxPrice - minPrice || 1;

  const width = 600;
  const height = 180;
  const padding = 30;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((d.modalPrice - minPrice) / range) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full bg-slate-900/80 p-4 md:p-5 rounded-3xl border border-amber-500/20 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-white tracking-tight flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          7-Day Mandi Price Trend ({cropName})
        </span>
        <span className="text-[11px] font-black text-amber-300 bg-slate-950 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
          Latest: ₹{data[data.length - 1]?.modalPrice?.toLocaleString('en-IN')}/Qtl
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
          <defs>
            <linearGradient id="goldenPriceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#334155"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Fill Area */}
          <path d={areaD} fill="url(#goldenPriceGradient)" />

          {/* Stroke Line */}
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
              <text
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="9"
                fill="#cbd5e1"
                fontWeight="bold"
              >
                {new Date(p.date).toLocaleDateString('en-IN', { weekday: 'narrow', day: 'numeric' })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
