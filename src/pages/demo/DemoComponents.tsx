import React from 'react';
import { motion } from 'motion/react';
import logo from '@/assets/logo.png';
import { Info, Check, Globe } from 'lucide-react';

export function DemoWatermark() {
  return (
    <div className="fixed bottom-6 right-8 flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity pointer-events-none select-none z-[1000]">
      <img src={logo} className="h-4 object-contain opacity-40" alt="Orivon" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">Powered by Orivon Browser</span>
    </div>
  );
}

interface IPFSBannerProps {
  url: string;
  score: 'Trustless' | 'Partial' | 'Centralized';
  message?: string;
}

export function IPFSBanner({ url, score, message }: IPFSBannerProps) {
  const isTrustless = score === 'Trustless';
  const isPartial = score === 'Partial';
  
  return (
    <div className="w-full h-[36px] bg-[#111218] border-b border-[#1e2030] flex items-center justify-center gap-8 z-[100] shrink-0">
      <div className="flex items-center gap-2.5">
        <Globe size={13} className="text-[#6366f1]" />
        <span className="text-[12px] font-medium text-[#64748b]">
          Browsing <span className="text-[#f8fafc] mono tabular">{url}</span> via IPFS
        </span>
      </div>
      <div className="w-px h-3 bg-[#1e2030]" />
      <div className="flex items-center gap-2">
        <span className="text-label text-[#64748b]">Web3 Score:</span>
        <span className={`text-[11px] font-bold uppercase tracking-widest ${isTrustless ? 'text-[#22c55e]' : isPartial ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
          {score}
        </span>
      </div>
      <div className="w-px h-3 bg-[#1e2030]" />
      <div className="flex items-center gap-2 text-[12px] font-medium text-[#64748b]">
        <span>{message || (isTrustless ? 'No centralized server involved' : 'Some centralized components')}</span>
        {isTrustless && <Check size={12} className="text-[#22c55e]" strokeWidth={4} />}
      </div>
    </div>
  );
}
