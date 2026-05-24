import React, { useState } from 'react';
import { 
  Search, Star, Download, Check, Shield, 
  Globe, Filter, Store
} from 'lucide-react';
import { motion } from 'motion/react';
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
  const [activeCategory, setActiveCategory] = useState('Featured');

  const apps = [
    { name: 'Uniswap Module', icon: 'U', color: '#ff007a', desc: 'Decentralized exchange module. Trade any token trustlessly.', score: 'Trustless', rating: 4.9, downloads: '284k', url: 'uniswap.eth', category: 'DeFi' },
    { name: 'ENS Resolver', icon: '🌐', color: '#6366f1', desc: 'Resolve .eth, .crypto, and .btc domains natively.', score: 'Trustless', rating: 5.0, downloads: '891k', url: 'btcnode.eth', category: 'DNS' },
    { name: 'IPFS Module', icon: 'H', color: '#06b6d4', desc: 'Access and serve content on the distributed web.', score: 'Trustless', rating: 4.8, downloads: '445k', url: 'btcnode.eth', category: 'Utilities' },
    { name: 'Monero Wallet', icon: 'M', color: '#f97316', desc: 'Private transactions with native XMR support.', score: 'Trustless', rating: 4.7, downloads: '127k', category: 'Wallets' },
    { name: 'Tor Network', icon: 'O', color: '#a855f7', desc: 'Browse anonymously through the Tor network.', score: 'High Privacy', rating: 4.8, downloads: '312k', category: 'Utilities' },
    { name: 'Bitcoin Node', icon: 'B', color: '#f59e0b', desc: 'Run a full pruned Bitcoin node in one click.', score: 'Trustless', rating: 4.9, downloads: '98k', url: 'btcnode.eth', category: 'Nodes' },
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

      {/* Hero Header */}
      <div className="relative pt-24 pb-16 px-8 flex flex-col items-center text-center overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#6366f1]/5 blur-[120px] rounded-full pointer-events-none" />
         
         <motion.div 
           initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
           className="z-10"
         >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#818cf8] text-[10px] font-bold uppercase tracking-widest mb-6">
               <Store className="w-3 h-3" /> Decentralized App Store
            </div>
            <h1 className="text-[42px] font-bold mb-6 tracking-tight leading-tight max-w-2xl mx-auto">
               Power your browser with <span className="text-[#6366f1]">Native Web3 Modules</span>
            </h1>
            <p className="text-[#94a3b8] text-[15px] font-medium max-w-[600px] mb-12 leading-relaxed mx-auto">
               Extend Orivon with trustless modules, secure wallets, and localized nodes. 
               Every application is verified by Orivon protocol for security and privacy.
            </p>
            
            <div className="w-full max-w-[540px] relative group mx-auto">
               <div className="absolute inset-0 bg-[#6366f1]/20 blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity rounded-xl" />
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#6366f1] transition-colors z-20" size={20} />
               <input 
                  placeholder="Search 1,200+ decentralized modules..."
                  className="w-full h-14 rounded-xl bg-[#111218] border border-[#1e2030] pl-12 pr-4 font-semibold outline-none focus:border-[#6366f1] transition-all shadow-2xl relative z-10 text-[15px]"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex gap-2">
                  <div className="px-1.5 py-0.5 rounded border border-[#1e2030] text-[9px] text-[#475569] font-bold">⌘</div>
                  <div className="px-1.5 py-0.5 rounded border border-[#1e2030] text-[9px] text-[#475569] font-bold">K</div>
               </div>
            </div>
         </motion.div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8">
         {/* Filter & Categories Bar */}
         <div className="flex items-center justify-between mb-12 sticky top-0 z-30 bg-[#0d0e14]/80 backdrop-blur-xl py-4 border-b border-[#1e2030]/50">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
               {['Featured', 'DeFi', 'Social', 'Nodes', 'Wallets', 'Utilities'].map((cat) => (
                  <button 
                     key={cat} 
                     onClick={() => setActiveCategory(cat)}
                     className={`px-5 py-2 rounded-lg text-[12px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                        activeCategory === cat 
                        ? 'bg-[#6366f1] text-white border-[#6366f1] shadow-lg shadow-[#6366f1]/20' 
                        : 'bg-[#111218] text-[#64748b] border-[#1e2030] hover:text-[#f8fafc] hover:border-[#6366f1]/50'
                     }`}
                  >
                     {cat}
                  </button>
               ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#111218] border border-[#1e2030] rounded-lg text-[#64748b] hover:text-[#f8fafc] transition-all text-[12px] font-bold uppercase tracking-widest shrink-0">
               <Filter size={14} /> Filter
            </button>
         </div>

         {/* App Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {apps.map((app, idx) => (
               <motion.div 
                 key={app.name} 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 onClick={() => handleNavigate(app.url)}
                 className="group bg-[#111218] border border-[#1e2030] rounded-2xl p-6 hover:border-[#6366f1]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col shadow-sm hover:shadow-2xl hover:shadow-[#6366f1]/5"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/5 blur-2xl rounded-full -mr-16 -mt-16 group-hover:bg-[#6366f1]/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-6 relative">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ backgroundColor: app.color }}>
                        {app.icon}
                     </div>
                     <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-[#f59e0b] text-[11px] font-bold tabular mb-1">
                           <Star size={10} fill="currentColor" /> {app.rating}
                        </div>
                        <span className="text-[9px] font-bold text-[#475569] uppercase tracking-widest">{app.downloads} DLs</span>
                     </div>
                  </div>
                  
                  <div className="flex-1 relative mb-8">
                     <h3 className="text-[17px] font-bold text-[#f8fafc] mb-2 group-hover:text-[#6366f1] transition-colors">{app.name}</h3>
                     <p className="text-[#64748b] text-[13px] font-medium leading-relaxed line-clamp-2">
                        {app.desc}
                     </p>
                  </div>

                  <div className="flex items-center justify-between relative pt-6 border-t border-[#1e2030]/50">
                     <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${app.score === 'Trustless' ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${app.score === 'Trustless' ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`}>
                           {app.score}
                        </span>
                     </div>
                     <button 
                       onClick={(e) => handleInstall(e, app)}
                       disabled={installedApps[app.name] || !!installing}
                       className={`h-9 px-5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        installedApps[app.name] 
                        ? 'bg-transparent border border-[#1e2030] text-[#475569]' 
                        : 'bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-lg shadow-[#6366f1]/20 active:scale-95 border-none cursor-pointer'
                       }`}
                     >
                        {installing === app.name ? (
                           <Spinner size={12} color="#fff" />
                        ) : installedApps[app.name] ? (
                           <><Check size={12} strokeWidth={4} /> Installed</>
                        ) : (
                           <><Download size={12} /> Install</>
                        )}
                     </button>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Trust Section Redesign */}
         <div className="bg-[#111218] border border-[#1e2030] rounded-3xl p-10 shadow-2xl relative overflow-hidden mb-20">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Shield size={200} />
            </div>
            
            <div className="relative z-10 max-w-3xl">
               <h2 className="text-[20px] font-bold mb-10 uppercase tracking-[0.2em] text-[#f8fafc] flex items-center gap-3">
                  <Shield className="text-[#6366f1]" size={20} /> Orivon Security Protocol
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {[
                    { color: '#22c55e', name: 'Trustless', desc: 'Content served via IPFS/P2P. Verified no central control point exists.' },
                    { color: '#f59e0b', name: 'Partial', desc: 'Utilizes decentralized storage but depends on a centralized API or gateway.' },
                    { color: '#a855f7', name: 'Private', desc: 'Trustless connection combined with ZK-proofs or Tor-routing anonymity.' },
                    { color: '#6366f1', name: 'Native', desc: 'Built by Orivon team. Deeply integrated with browser runtime modules.' },
                  ].map(item => (
                    <div key={item.name} className="flex gap-5">
                       <div className="w-10 h-10 rounded-xl bg-[#0d0e14] border border-[#1e2030] flex items-center justify-center shrink-0">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                       </div>
                       <div className="flex flex-col">
                          <span className="font-bold text-[14px] uppercase tracking-widest mb-2" style={{ color: item.color }}>{item.name}</span>
                          <p className="text-[13px] font-medium text-[#64748b] leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <DemoWatermark />
    </div>
  );
}
