import React from 'react';
import { motion } from 'motion/react';
import logo from '@/assets/logo.png';
import { Info, Check } from 'lucide-react';

export function DemoWatermark() {
  return (
    <div className="fixed bottom-6 right-8 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity pointer-events-none select-none z-[1000]">
      <img src={logo} className="h-4 object-contain" alt="Orivon" />
      <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Powered by Orivon Browser</span>
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
    <div className="w-full bg-[#1a1b2e]/60 backdrop-blur-md border-b border-white/5 py-2 px-4 flex items-center justify-center gap-6 z-[100]">
      <div className="flex items-center gap-2 text-[11px] font-bold">
        <span className="text-sm">{isTrustless ? '🌐' : isPartial ? '🌐' : '⚠️'}</span>
        <span className="text-gray-400">You are browsing <span className="text-white font-mono">{url}</span> via IPFS</span>
      </div>
      <div className="w-px h-3 bg-white/10" />
      <div className="flex items-center gap-2 text-[11px] font-bold">
        <span className="text-gray-400">Web3 Score:</span>
        <span className={`uppercase tracking-widest ${isTrustless ? 'text-[#22c55e]' : isPartial ? 'text-[#f59e0b]' : 'text-[#f87171]'}`}>
          {score}
        </span>
      </div>
      <div className="w-px h-3 bg-white/10" />
      <div className="flex items-center gap-2 text-[11px] font-bold">
        <span className="text-gray-400">{message || (isTrustless ? 'No centralized server involved' : 'Some centralized components')}</span>
        {isTrustless ? <Check size={12} className="text-[#22c55e]" strokeWidth={4} /> : <Info size={12} className="text-[#f59e0b]" />}
      </div>
    </div>
  );
}
