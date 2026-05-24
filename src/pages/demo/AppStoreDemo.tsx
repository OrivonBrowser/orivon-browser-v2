import React, { useState } from 'react';
import { 
  Search, Star, Download, Check, Shield, 
  Globe, Box, Zap, Coins, Info, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DemoWatermark, IPFSBanner } from './DemoComponents';
import Spinner from '../../components/Spinner';

interface AppStoreDemoProps {
  onInstall: (app: any) => Promise<boolean>;
}

export default function AppStoreDemo({ onInstall }: AppStoreDemoProps) {
  const [installed, setInstalled] = useState<Record<string, boolean>>({
    'Uniswap Module': true,
    'ENS Resolver': true,
    'IPFS Module': true,
    'Bitcoin Node': true,
  });
  const [installing, setInstalling] = useState<string | null>(null);

  const apps = [
    { name: 'Uniswap Module', icon: 'U', color: '#ff007a', desc: 'Decentralized exchange module. Trade any token trustlessly.', score: 'Trustless', rating: 4.9, downloads: '284k' },
    { name: 'ENS Resolver', icon: '🌐', color: '#6366f1', desc: 'Resolve .eth, .crypto, and .btc domains natively.', score: 'Trustless', rating: 5.0, downloads: '891k' },
    { name: 'IPFS Module', icon: 'H', color: '#06b6d4', desc: 'Access and serve content on the distributed web.', score: 'Trustless', rating: 4.8, downloads: '445k' },
    { name: 'Monero Wallet', icon: 'M', color: '#f97316', desc: 'Private transactions with native XMR support.', score: 'Trustless', rating: 4.7, downloads: '127k' },
    { name: 'Tor Network', icon: 'O', color: '#a855f7', desc: 'Browse anonymously through the Tor network.', score: 'High Privacy', rating: 4.8, downloads: '312k' },
    { name: 'Bitcoin Node', icon: 'B', color: '#f59e0b', desc: 'Run a full pruned Bitcoin node in one click.', score: 'Trustless', rating: 4.9, downloads: '98k' },
  ];

  const handleInstall = async (app: any) => {
    if (installed[app.name] || installing) return;
    
    const approved = await onInstall(app);
    if (approved) {
      setInstalling(app.name);
      setTimeout(() => {
        setInstalled(prev => ({ ...prev, [app.name]: true }));
        setInstalling(null);
      }, 2000);
    }
  };

  return (
    <div className="h-full w-full bg-[#0a0b12] text-[#f1f5f9] font-inter overflow-y-auto scrollbar-thin relative pb-20">
      <IPFSBanner url="apps.orivon.eth" score="Trustless" />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#13141f] to-transparent pt-16 pb-12 px-8 flex flex-col items-center text-center">
         <h1 className="text-4xl font-black mb-4 tracking-tight">Orivon App Store</h1>
         <p className="text-[#94a3b8] text-lg font-medium max-w-[600px] mb-8">
            Extend your Web3 browser with modules, wallets, nodes, and DApps. Every app is Web3 Score verified.
         </p>
         <div className="w-full max-w-[500px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5563]" size={20} />
            <input 
               placeholder="Search apps and modules..."
               className="w-full h-14 rounded-2xl bg-[#1a1b26] border border-[#2d2e45] pl-12 pr-4 font-bold outline-none focus:border-[#6366f1] transition-all shadow-2xl"
            />
         </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-8">
         {/* Categories */}
         <div className="flex gap-8 mb-10 overflow-x-auto scrollbar-none pb-2">
            {['Featured', 'DeFi', 'Social', 'Nodes', 'Wallets', 'DNS', 'Utilities'].map((cat, i) => (
               <span key={cat} className={`text-[13px] font-black uppercase tracking-widest cursor-pointer whitespace-nowrap border-b-2 pb-2 transition-all ${i === 0 ? 'text-white border-[#6366f1]' : 'text-[#4b5563] border-transparent hover:text-white'}`}>
                  {cat}
               </span>
            ))}
         </div>

         {/* App Grid */}
         <div className="grid grid-cols-3 gap-6 mb-16">
            {apps.map(app => (
               <div key={app.name} className="bg-[#13141f] border border-[#2d2e45] rounded-[24px] p-6 shadow-xl flex flex-col transition-all hover:border-[#6366f1]/30 hover:scale-[1.02] group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-2xl" style={{ backgroundColor: app.color }}>
                        {app.icon}
                     </div>
                     <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                           <Star size={12} fill="currentColor" /> {app.rating}
                        </div>
                        <span className="text-[10px] font-bold text-[#4b5563] mt-1 uppercase">{app.downloads} DL</span>
                     </div>
                  </div>
                  
                  <h3 className="text-[17px] font-black mb-2">{app.name}</h3>
                  <p className="text-[#94a3b8] text-xs font-medium leading-relaxed mb-6 flex-1">
                     {app.desc}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                        <span className="text-[10px] font-black text-[#22c55e] uppercase tracking-widest">{app.score}</span>
                     </div>
                     <button 
                       onClick={() => handleInstall(app)}
                       disabled={installed[app.name] || !!installing}
                       className={`h-9 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border-none cursor-pointer flex items-center gap-2 ${
                        installed[app.name] ? 'bg-white/5 text-[#22c55e]' : 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-lg shadow-indigo-500/10 hover:brightness-110 active:scale-95'
                       }`}
                     >
                        {installing === app.name ? (
                           <div className="flex items-center gap-2">
                              <Spinner size={12} color="#fff" /> Installing
                           </div>
                        ) : installed[app.name] ? (
                           <><Check size={14} strokeWidth={4} /> Installed</>
                        ) : 'Install'}
                     </button>
                  </div>
               </div>
            ))}
         </div>

         {/* Explain Section */}
         <div className="bg-gradient-to-br from-[#1a1b2e] to-[#13141f] border border-[#2d2e45] rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
            <h2 className="text-xl font-black mb-6 uppercase tracking-wider">Understanding Web3 Scores</h2>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
               {[
                 { color: '#22c55e', name: 'Trustless', desc: 'Content served from decentralized storage. No central server.' },
                 { color: '#f59e0b', name: 'Partial', desc: 'Mix of decentralized and centralized components.' },
                 { color: '#ef4444', name: 'Centralized', desc: 'Traditional web server. Data could be compromised.' },
                 { color: '#a855f7', name: 'Private', desc: 'Trustless AND privacy preserving.' },
               ].map(item => (
                 <div key={item.name} className="flex gap-4">
                    <div className="w-4 h-4 rounded-full mt-1 shrink-0 shadow-lg" style={{ backgroundColor: item.color }} />
                    <div className="flex flex-col">
                       <span className="font-black text-sm uppercase tracking-widest mb-1" style={{ color: item.color }}>{item.name}</span>
                       <p className="text-[13px] font-medium text-[#94a3b8] leading-snug">{item.desc}</p>
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
