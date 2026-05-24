import React, { useState } from 'react';
import { 
  Search, Star, Download, Check, Shield, 
  Globe, Box, Zap, Coins, Info, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DemoWatermark, IPFSBanner } from './DemoComponents';
import Spinner from '../../components/Spinner';
import { useSessionStore } from '../../store/session';

interface AppStoreDemoProps {
  onInstall: (app: any) => Promise<boolean>;
  onNavigate?: (url: string) => void;
}

export default function AppStoreDemo({ onInstall, onNavigate }: AppStoreDemoProps) {
  const { installedApps, installApp } = useSessionStore();
  const [installing, setInstalling] = useState<string | null>(null);

  const apps = [
    { name: 'Uniswap Module', icon: 'U', color: '#ff007a', desc: 'Decentralized exchange module. Trade any token trustlessly.', score: 'Trustless', rating: 4.9, downloads: '284k', url: 'uniswap.eth' },
    { name: 'ENS Resolver', icon: '🌐', color: '#6366f1', desc: 'Resolve .eth, .crypto, and .btc domains natively.', score: 'Trustless', rating: 5.0, downloads: '891k', url: 'btcnode.eth' },
    { name: 'IPFS Module', icon: 'H', color: '#06b6d4', desc: 'Access and serve content on the distributed web.', score: 'Trustless', rating: 4.8, downloads: '445k', url: 'btcnode.eth' },
    { name: 'Monero Wallet', icon: 'M', color: '#f97316', desc: 'Private transactions with native XMR support.', score: 'Trustless', rating: 4.7, downloads: '127k' },
    { name: 'Tor Network', icon: 'O', color: '#a855f7', desc: 'Browse anonymously through the Tor network.', score: 'High Privacy', rating: 4.8, downloads: '312k' },
    { name: 'Bitcoin Node', icon: 'B', color: '#f59e0b', desc: 'Run a full pruned Bitcoin node in one click.', score: 'Trustless', rating: 4.9, downloads: '98k', url: 'btcnode.eth' },
  ];

  const handleInstall = async (e: React.MouseEvent, app: any) => {
    e.stopPropagation();
    if (installedApps[app.name] || installing) return;
    
    const approved = await onInstall(app);
    if (approved) {
      setInstalling(app.name);
      setTimeout(() => {
        installApp(app.name);
        setInstalling(null);
      }, 2000);
    }
  };

  const handleNavigate = (url?: string) => {
    if (url && onNavigate) {
       onNavigate(url);
    }
  };

  return (
    <div className="h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-y-auto scrollbar-thin relative pb-20 animate-fade">
      <IPFSBanner url="apps.orivon.eth" score="Trustless" />

      {/* Hero */}
      <div className="pt-20 pb-16 px-8 flex flex-col items-center text-center">
         <h1 className="text-[32px] font-bold mb-4 tracking-tight">Orivon App Store</h1>
         <p className="text-[#94a3b8] text-lg font-medium max-w-[540px] mb-10 leading-relaxed">
            Extend your Web3 browser with modules, wallets, nodes, and DApps. Every app is Web3 Score verified.
         </p>
         <div className="w-full max-w-[480px] relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#6366f1] transition-colors" size={20} />
            <input 
               placeholder="Search apps and modules..."
               className="w-full h-12 rounded-xl bg-[#111218] border border-[#1e2030] pl-12 pr-4 font-semibold outline-none focus:border-[#6366f1] transition-all shadow-sm"
            />
         </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-8">
         {/* Categories */}
         <div className="flex gap-10 mb-10 border-b border-[#1e2030] pb-px">
            {['Featured', 'DeFi', 'Social', 'Nodes', 'Wallets', 'DNS', 'Utilities'].map((cat, i) => (
               <span key={cat} className={`text-[13px] font-semibold uppercase tracking-widest cursor-pointer whitespace-nowrap border-b-2 pb-3 transition-all ${i === 0 ? 'text-[#f8fafc] border-[#6366f1]' : 'text-[#64748b] border-transparent hover:text-[#f8fafc]'}`}>
                  {cat}
               </span>
            ))}
         </div>

         {/* App List */}
         <div className="space-y-1 mb-16">
            {apps.map(app => (
               <div 
                 key={app.name} 
                 onClick={() => handleNavigate(app.url)}
                 className="flex items-center gap-6 p-4 rounded-xl hover:bg-[#111218] border border-transparent hover:border-[#1e2030] transition-all cursor-pointer group"
               >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl shrink-0 shadow-sm" style={{ backgroundColor: app.color }}>
                     {app.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3 mb-0.5">
                        <h3 className="text-[14px] font-semibold text-[#f8fafc] group-hover:text-[#6366f1] transition-colors">{app.name}</h3>
                        <div className="flex items-center gap-1 text-[#f59e0b] text-[11px] font-bold tabular">
                           <Star size={10} fill="currentColor" /> {app.rating}
                        </div>
                     </div>
                     <p className="text-[#64748b] text-[13px] font-medium truncate leading-tight">
                        {app.desc}
                     </p>
                  </div>

                  <div className="flex items-center gap-8 shrink-0 pl-4">
                     <span className="text-[11px] font-semibold text-[#475569] uppercase tabular">{app.downloads} DL</span>
                     <span className={`text-[11px] font-bold uppercase tracking-wider ${app.score === 'Trustless' ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`}>
                        {app.score}
                     </span>
                     <button 
                       onClick={(e) => handleInstall(e, app)}
                       disabled={installedApps[app.name] || !!installing}
                       className={`min-w-[100px] h-8 rounded-md font-semibold text-[11px] uppercase tracking-wider transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                        installedApps[app.name] ? 'bg-transparent border-[#1e2030] text-[#64748b]' : 'bg-transparent border-[#6366f1] text-[#818cf8] hover:bg-[#6366f1] hover:text-white'
                       }`}
                     >
                        {installing === app.name ? (
                           <Spinner size={12} color="#fff" />
                        ) : installedApps[app.name] ? (
                           <><Check size={12} strokeWidth={4} /> Installed</>
                        ) : 'Install'}
                     </button>
                  </div>
               </div>
            ))}
         </div>

         {/* Explain Section */}
         <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-8 shadow-sm mb-20 relative overflow-hidden">
            <h2 className="text-[15px] font-semibold mb-8 uppercase tracking-widest text-[#f8fafc]">Understanding Web3 Scores</h2>
            <div className="grid grid-cols-2 gap-x-16 gap-y-8">
               {[
                 { color: '#22c55e', name: 'Trustless', desc: 'Content served from decentralized storage. No central server.' },
                 { color: '#f59e0b', name: 'Partial', desc: 'Mix of decentralized and centralized components.' },
                 { color: '#ef4444', name: 'Centralized', desc: 'Traditional web server. Data could be compromised.' },
                 { color: '#a855f7', name: 'Private', desc: 'Trustless AND privacy preserving.' },
               ].map(item => (
                 <div key={item.name} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex flex-col">
                       <span className="font-bold text-[13px] uppercase tracking-wider mb-1" style={{ color: item.color }}>{item.name}</span>
                       <p className="text-[13px] font-medium text-[#64748b] leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <DemoWatermark />
    </div>
  );
}
