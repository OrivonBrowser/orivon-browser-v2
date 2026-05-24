import React from 'react';
import AppStore from '../../components/AppStore';
import { IPFSBanner, DemoWatermark } from './DemoComponents';

interface AppStoreDemoProps {
  onInstall: (app: any) => Promise<boolean>;
  onNavigate?: (url: string) => void;
}

export default function AppStoreDemo({ onInstall, onNavigate }: AppStoreDemoProps) {
  const handleToast = (title: string, sub: string) => {
    // In demo mode, we just log or ignore toast
    console.log(`Demo Toast: ${title} - ${sub}`);
  };

  return (
    <div className="h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-y-auto scrollbar-thin relative pb-20 animate-fade">
      <IPFSBanner url="apps.orivon.eth" score="Trustless" />

      {/* Hero Header */}
      <div className="relative pt-24 pb-16 px-8 flex flex-col items-center text-center overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#6366f1]/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#818cf8] text-[10px] font-bold uppercase tracking-widest mb-6">
               Decentralized App Store
            </div>
            <h1 className="text-[42px] font-bold mb-6 tracking-tight leading-tight max-w-2xl mx-auto">
               Power your browser with <span className="text-[#6366f1]">Native Web3 Modules</span>
            </h1>
         </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8">
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
