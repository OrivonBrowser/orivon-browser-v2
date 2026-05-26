import React from 'react';
import AppStore from '../../components/AppStore';
import { IPFSBanner, DemoWatermark } from './DemoComponents';

interface AppStoreDemoProps {
  onInstall: (app: any) => Promise<boolean>;
  onNavigate?: (url: string) => void;
}

export default function AppStoreDemo({ onInstall, onNavigate }: AppStoreDemoProps) {
  const handleToast = (title: string, sub: string) => {
    console.log(`Toast: ${title} — ${sub}`);
  };

  return (
    <div className="h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-y-auto scrollbar-thin relative pb-20 animate-fade">
      <IPFSBanner url="apps.orivon.eth" score="Trustless" />

      {/* Editorial header */}
      <div className="relative pt-20 pb-12 px-10 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top center, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-[1200px] mx-auto">
          <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#6366f1] mb-4">
            Decentralized Modules
          </div>
          <h1
            className="font-black tracking-[-0.04em] leading-none uppercase text-[#e2e8f0] mb-4"
            style={{ fontSize: 'clamp(40px, 5.5vw, 80px)' }}
          >
            App Store
          </h1>
          <p className="text-[14px] text-[#475569] font-medium max-w-[480px] leading-relaxed">
            Extend your browser with native Web3 modules. All sandboxed, all verifiable, all yours.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#1e2030]" />

      {/* App store content */}
      <div className="max-w-[1200px] mx-auto px-10 pt-10">
        <AppStore
          onOpen={onNavigate}
          onToast={handleToast}
          isDemo={true}
        />
      </div>

      <DemoWatermark />
    </div>
  );
}
