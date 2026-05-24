import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Wallet, Send, Download, Globe,
  Cpu, Activity, History, ExternalLink,
  MessageSquare, Layers, Box, Store,
  ChevronRight, Circle, MoreHorizontal,
  Copy, Check, ArrowRight, Shield, Settings, Lock,
  Moon, Sun, Eye, EyeOff, AlertTriangle, ArrowLeft,
  ShoppingCart, RefreshCw, X, Zap, ArrowUpRight, ArrowDownLeft, Plus, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWalletStore, WalletAccount } from '../store/wallet';
import { useSettings } from '../store/settings';
import logo from '@/assets/logo.png';
import { ethers } from 'ethers';
import Spinner from '../components/Spinner';
import { DASHBOARD_URL, DEMO_WALLET } from '../constants';

import * as WalletComps from '../components/WalletComponents';

interface DashboardProps {
  onOpenBrowser?: (url: string) => void;
}

export default function Dashboard({ onOpenBrowser }: DashboardProps) {
  const { accounts, activeAccountId, getBalance, setBackedUp } = useWalletStore();
  const { searchEngine, setSearchEngine, theme, setTheme, hasOnboarded, setHasOnboarded } = useSettings();
  
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'activity'>('tokens');
  const [view, setView] = useState<'main' | 'backup' | 'send' | 'receive' | 'import'>('main');
  const [initialLoading, setInitialLoading] = useState(true);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    if (v === 'send') setView('send');
    else if (v === 'receive') setView('receive');
    else if (v === 'import') setView('import');
    else if (v === 'backup') setView('backup');
  }, []);

  if (initialLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-6" style={{ background: '#0a0b12' }}>
        <div className="relative">
          <img src={logo} alt="Orivon" className="h-16 object-contain animate-pulse" />
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
        </div>
        <Spinner size={28} color="#6366f1" />
      </div>
    );
  }

  if (view === 'backup') return <BackupView onBack={() => setView('main')} />;
  if (view === 'send') return <SendView onBack={() => setView('main')} onGoToBackup={() => setView('backup')} />;
  if (view === 'receive') return <ReceiveView onBack={() => setView('main')} address={activeAccount?.addresses.eth || ''} />;
  if (view === 'import') return <ImportView onBack={() => setView('main')} />;

  return (
    <div 
      className="text-white min-h-full w-full flex flex-col font-inter overflow-y-auto pb-20 relative"
      style={{
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 70%),
          #0a0b12
        `
      }}
    >
      {!hasOnboarded && (
         <div className="fixed inset-0 z-[5000] backdrop-blur-xl bg-black/40 flex items-center justify-center">
            <OnboardingOverlay onComplete={() => { setHasOnboarded(true); setView('backup'); }} />
         </div>
      )}

      <div className={!hasOnboarded ? 'blur-md pointer-events-none transition-all duration-700' : 'transition-all duration-700'}>
        <DashboardTopBar />

        <div className="w-full max-w-[1000px] mx-auto px-8 pt-10">
          <div className="animate-in" style={{ animationDelay: '100ms' }}>
            <WalletBox onImport={() => setView('import')} onBackup={() => setView('backup')} setView={setView} />
          </div>

          <div className="grid grid-cols-12 gap-8 mt-10">
            <div className="col-span-7 space-y-8 animate-in" style={{ animationDelay: '200ms' }}>
               <NodesWidget />
               <FeaturedWeb3Sites onOpen={onOpenBrowser} />
            </div>
            <div className="col-span-5 space-y-8 animate-in" style={{ animationDelay: '300ms' }}>
               <WhyOrivon />
               <NetworkStatusWidget />
               <RecentSites />
            </div>
          </div>

          <div className="mt-12 animate-in" style={{ animationDelay: '400ms' }}>
             <BottomPitch />
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const { setPassword } = useWalletStore();
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 3) {
      if (!pw || pw.length < 4) {
        setError('Password must be at least 4 characters');
        return;
      }
      if (pw !== confirmPw) {
        setError('Passwords do not match');
        return;
      }
      setPassword(pw);
      onComplete();
      return;
    }
    setStep(step + 1);
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="w-[520px] bg-[#13141f] border border-[#6366f1]/30 rounded-[32px] p-10 shadow-2xl relative overflow-hidden"
    >
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4f46e5] to-[#6366f1]" />
       
       <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
               <div className="w-16 h-16 rounded-[24px] bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1] mb-8">
                  <LayoutGrid size={32} />
               </div>
               <h1 className="text-3xl font-black mb-4 tracking-tight">Welcome to Orivon Dashboard</h1>
               <p className="text-[#94a3b8] text-lg font-medium leading-relaxed mb-8">
                  This is your Web3 mission control. From here you can manage your assets, run native nodes, and explore decentralized platforms with maximum privacy.
               </p>
               <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-4 text-sm font-bold">
                     <div className="w-2 h-2 rounded-full bg-[#22c55e]" /> Unified Multi-Chain Wallet
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold">
                     <div className="w-2 h-2 rounded-full bg-[#06b6d4]" /> One-Click Bitcoin & IPFS Nodes
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold">
                     <div className="w-2 h-2 rounded-full bg-[#6366f1]" /> Real-time Web3 Trust Scores
                  </div>
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
               <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 flex items-center justify-center text-amber-500 mb-8">
                  <Shield size={32} />
               </div>
               <h1 className="text-3xl font-black mb-4 tracking-tight">Secure Your Identity</h1>
               <p className="text-[#94a3b8] text-lg font-medium leading-relaxed mb-8">
                  Orivon is non-custodial. We never store your keys. You must back up your seed phrase now to ensure you never lose access to your funds.
               </p>
               <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-5 mb-10">
                  <div className="flex items-center gap-3 text-[#f87171] font-black text-xs uppercase tracking-widest mb-2">
                     <AlertTriangle size={16} /> Important
                  </div>
                  <p className="text-xs text-[#f87171]/80 font-bold leading-relaxed m-0">
                     Without your backup, your funds cannot be recovered if you lose access to this browser.
                  </p>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
               <div className="w-16 h-16 rounded-[24px] bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1] mb-8">
                  <Lock size={32} />
               </div>
               <h1 className="text-3xl font-black mb-4 tracking-tight">Set Action Password</h1>
               <p className="text-[#94a3b8] text-lg font-medium leading-relaxed mb-8">
                  This password will be required for every transaction and sensitive action you perform in Orivon.
               </p>
               
               <div className="space-y-4 mb-10">
                  <div>
                    <label className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest block mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={pw} 
                      onChange={e => {setPw(e.target.value); setError('');}}
                      className="w-full h-14 rounded-2xl bg-[#1a1b26] border border-[#2d2e45] px-5 text-white font-black text-xl outline-none focus:border-[#6366f1] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest block mb-2">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPw} 
                      onChange={e => {setConfirmPw(e.target.value); setError('');}}
                      className="w-full h-14 rounded-2xl bg-[#1a1b26] border border-[#2d2e45] px-5 text-white font-black text-xl outline-none focus:border-[#6366f1] transition-all"
                    />
                  </div>
                  {error && <p className="text-[#f87171] text-xs font-black uppercase text-center mt-4">{error}</p>}
               </div>
            </motion.div>
          )}
       </AnimatePresence>

       <button 
         onClick={handleNext}
         className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white font-black text-lg uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all border-none cursor-pointer"
       >
          {step === 3 ? 'Protect & Back Up' : 'Continue'}
       </button>
    </motion.div>
  );
}

function DashboardTopBar() {
  const [stats, setStats] = useState({ sites: 1247832, trackers: 48291047, nodes: 3 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        sites: prev.sites + Math.floor(Math.random() * 3),
        trackers: prev.trackers + Math.floor(Math.random() * 10),
        nodes: prev.nodes
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-14 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 shrink-0 animate-in">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
           <img src={logo} className="h-5 object-contain" alt="Orivon" />
           <span className="font-black text-sm tracking-tighter">ORIVON</span>
        </div>
        <span className="text-[9px] text-[#6366f1] font-bold tracking-widest uppercase -mt-0.5">The Web3 Browser</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-gray-400">
         <div className="flex items-center gap-2">
           <span className="text-base">🌐</span> Web3 Sites Loaded: <span className="text-white font-mono">{stats.sites.toLocaleString()}</span>
         </div>
         <div className="w-px h-3 bg-white/10" />
         <div className="flex items-center gap-2">
           <span className="text-base">🔒</span> Trackers Blocked: <span className="text-white font-mono">{stats.trackers.toLocaleString()}</span>
         </div>
         <div className="w-px h-3 bg-white/10" />
         <div className="flex items-center gap-2">
           <span className="text-base">⚡</span> Nodes Active: <span className="text-white font-mono">{stats.nodes}</span>
         </div>
      </div>

      <div className="flex items-center gap-3">
         <div className="w-2 h-2 rounded-full bg-[#22c55e] pulse-dot" />
         <span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-wider">Network: Online</span>
      </div>
    </div>
  );
}

function WalletBox({ onImport, onBackup, setView }: { onImport: () => void, onBackup: () => void, setView: any }) {
  const { accounts, activeAccountId } = useWalletStore();
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'activity'>('tokens');
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokens = activeAccount.id === 'wallet-demo-1' ? DEMO_WALLET.tokens : DEMO_WALLET.imported_wallet.tokens;

  return (
    <div className="w-full max-w-[900px] mx-auto bg-gradient-to-br from-[#13141f] to-[#1a1b2e] border border-[#2d2e45] rounded-[24px] p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
      
      <div className="flex justify-between items-start mb-10">
        <WalletComps.default onImport={onImport} />
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            Ethereum Mainnet
          </div>
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-[#4b5563] hover:text-white transition-all border border-transparent hover:border-white/10"
            >
              <MoreHorizontal size={20} />
            </button>
            <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-11 right-0 w-56 bg-[#13141f] border border-[#2d2e45] rounded-xl p-1.5 z-50 shadow-2xl overflow-hidden"
                    >
                      {[
                        { label: 'View Seed Phrase', icon: <Eye size={16}/>, onClick: () => { onBackup(); setMenuOpen(false); } },
                        { label: 'Copy Address', icon: <Copy size={16}/>, onClick: () => { handleCopy(activeAccount?.addresses.eth || ''); setMenuOpen(false); } },
                        { label: 'Rename Wallet', icon: <ExternalLink size={16}/>, onClick: () => setMenuOpen(false) },
                        { label: 'Remove Wallet', icon: <X size={16}/>, onClick: () => setMenuOpen(false) },
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className="w-full px-3 py-2.5 flex items-center gap-3 bg-transparent border-none text-[#94a3b8] text-[13px] font-bold cursor-pointer rounded-lg text-left hover:bg-white/5 hover:text-white transition-all"
                        >
                          {item.icon} {item.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="text-center mb-10">
        <div className="text-[54px] font-black text-white tracking-tighter mb-1">
          ${(activeAccount.balance_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center justify-center gap-3">
          <span className="text-lg font-bold text-[#818cf8]">{activeAccount.balance_eth} ETH</span>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="flex items-center gap-1.5 text-[#22c55e] font-black text-sm">
             <ArrowUpRight size={16} strokeWidth={3} /> +$306.82 today
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4 text-[#4b5563] font-mono text-xs">
          <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5">{activeAccount?.addresses.eth.slice(0, 10)}...{activeAccount?.addresses.eth.slice(-8)}</span>
          <button onClick={() => handleCopy(activeAccount?.addresses.eth || '')} className="p-1 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
            {copied ? <Check size={14} className="text-[#22c55e]" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-6 mb-12">
        {[
          { label: 'Send', icon: <ArrowUpRight size={22}/>, grad: 'from-[#4f46e5] to-[#6366f1]', shadow: 'shadow-indigo-500/20', onClick: () => setView('send') },
          { label: 'Receive', icon: <ArrowDownLeft size={22}/>, grad: 'from-[#059669] to-[#10b981]', shadow: 'shadow-emerald-500/20', onClick: () => setView('receive') },
          { label: 'Buy', icon: <Plus size={22}/>, grad: 'from-[#d97706] to-[#f59e0b]', shadow: 'shadow-amber-500/20' },
          { label: 'Swap', icon: <RefreshCw size={22}/>, grad: 'from-[#7c3aed] to-[#8b5cf6]', shadow: 'shadow-purple-500/20' },
        ].map(btn => (
          <div key={btn.label} className="flex flex-col items-center gap-2">
            <button
              onClick={btn.onClick}
              className={`w-[120px] h-14 rounded-[16px] bg-gradient-to-br ${btn.grad} text-white flex flex-col items-center justify-center transition-all duration-200 hover:scale-[1.05] hover:brightness-110 border-none cursor-pointer ${btn.shadow} shadow-lg group/btn`}
            >
              {btn.icon}
              <span className="text-[11px] font-black uppercase tracking-widest mt-1 opacity-80 group-hover/btn:opacity-100">{btn.label}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-[#2d2e45] pt-8">
        <div className="flex gap-8 mb-6">
          {(['tokens', 'nfts', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-[14px] font-black uppercase tracking-widest bg-transparent border-none cursor-pointer relative transition-all ${
                activeTab === tab ? 'text-white' : 'text-[#4b5563] hover:text-[#94a3b8]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]" />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
           {activeTab === 'tokens' && tokens.map(token => (
             <div key={token.symbol} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                   <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-sm shadow-inner" style={{ backgroundColor: token.color }}>
                      {token.symbol.charAt(0)}
                   </div>
                   <div className="flex flex-col">
                      <span className="font-bold text-white text-[15px]">{token.name}</span>
                      <span className="text-xs text-[#4b5563] font-bold tracking-wider uppercase">{token.symbol}</span>
                   </div>
                </div>
                <div className="flex items-center gap-12">
                   <div className={`text-sm font-black ${token.change_24h > 0 ? 'text-[#22c55e]' : 'text-[#f87171]'}`}>
                      {token.change_24h > 0 ? '+' : ''}{token.change_24h}%
                   </div>
                   <div className="text-right flex flex-col">
                      <span className="font-bold text-white text-[15px]">${token.value_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <span className="text-xs text-[#4b5563] font-bold">{token.amount} {token.symbol}</span>
                   </div>
                </div>
             </div>
           ))}
           {activeTab !== 'tokens' && (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-[#4b5563]">
                 <div className="w-16 h-16 rounded-3xl bg-white/2 border border-white/5 flex items-center justify-center opacity-50">
                    {activeTab === 'nfts' ? <Layers size={32} /> : <Activity size={32} />}
                 </div>
                 <span className="text-sm font-bold uppercase tracking-widest">No {activeTab} Found</span>
              </div>
           )}
        </div>
        
        <div className="mt-8 flex justify-between items-center text-[#4b5563] text-[11px] font-black uppercase tracking-[0.2em]">
           <span>Secured by Orivon Protocol</span>
           <span className="text-white/40">Total Portfolio Value: <span className="text-white">${(activeAccount.balance_usd || 0).toLocaleString()}</span></span>
        </div>
      </div>
    </div>
  );
}

function NodesWidget() {
  const [nodes, setNodes] = useState<Record<string, 'Online' | 'Offline' | 'Syncing'>>({
    ipfs: 'Online',
    bittorrent: 'Offline',
    bitcoin: 'Offline'
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const startNode = (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    setNodes(prev => ({ ...prev, [id]: 'Syncing' }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, [id]: false }));
      setNodes(prev => ({ ...prev, [id]: 'Online' }));
    }, 2000);
  };

  const activeCount = Object.values(nodes).filter(s => s === 'Online').length;

  return (
    <div className="bg-gradient-to-br from-[#13141f] to-[#1a1b2e] border border-[#2d2e45] rounded-[24px] p-6 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Zap size={20} className="text-[#6366f1]" />
          <h2 className="text-base font-black text-white uppercase tracking-wider">Web3 Nodes</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${activeCount > 0 ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20' : 'bg-white/5 text-[#4b5563]'}`}>
           {activeCount} Active
        </div>
      </div>

      <div className="space-y-4">
        {[
          { id: 'ipfs', name: 'IPFS Node', sub: 'Distributed file system', color: '#06b6d4', desc: 'Connected to 24 peers, 1.2 GB synced' },
          { id: 'bittorrent', name: 'BitTorrent Node', sub: 'Peer-to-peer file sharing', color: '#f59e0b', desc: 'Optimized for high-speed content delivery' },
          { id: 'bitcoin', name: 'Bitcoin Node Pruned', sub: 'Pruned node, quick sync', color: '#f97316', desc: 'Uses pre-synced snapshot. Syncs in minutes.' }
        ].map(node => (
          <div key={node.id} className="bg-white/2 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/5 hover:border-white/10">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg" style={{ backgroundColor: node.color }}>
                   {node.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                   <span className="font-bold text-white text-[14px]">{node.name}</span>
                   <span className="text-[11px] text-[#4b5563] font-bold uppercase tracking-wider">{node.sub}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${nodes[node.id] === 'Online' ? 'bg-[#22c55e] pulse-dot' : nodes[node.id] === 'Syncing' ? 'bg-[#f59e0b] animate-pulse' : 'bg-[#374151]'}`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${nodes[node.id] === 'Online' ? 'text-[#22c55e]' : nodes[node.id] === 'Syncing' ? 'text-[#f59e0b]' : 'text-[#4b5563]'}`}>
                       {nodes[node.id]}
                    </span>
                 </div>
                 <button 
                   onClick={() => nodes[node.id] === 'Offline' ? startNode(node.id) : setNodes(p => ({...p, [node.id]: 'Offline'}))}
                   className={`h-9 px-5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border-none cursor-pointer ${
                    nodes[node.id] === 'Online' ? 'bg-[#1e1f2e] text-[#f87171] hover:bg-rose-500/10' : 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-lg shadow-indigo-500/10 hover:brightness-110'
                   }`}
                 >
                   {loading[node.id] ? <Spinner size={14} /> : nodes[node.id] === 'Online' ? 'Stop' : 'Start'}
                 </button>
              </div>
            </div>
            {nodes[node.id] === 'Online' && (
               <div className="mt-3 text-[10px] font-bold text-[#4b5563] pl-14 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#22c55e]" /> {node.desc}
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyOrivon() {
  return (
    <div className="bg-[#13141f] border border-[#2d2e45] rounded-[24px] p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Zap size={20} className="text-[#6366f1]" />
        <h2 className="text-base font-black text-white uppercase tracking-wider">Why Orivon</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: '🔒', title: 'Zero Trackers', desc: 'Your data never leaves your device.' },
          { icon: '🌐', title: 'True Web3', desc: 'Native .eth domain support built in.' },
          { icon: '⚡', title: 'Instant Nodes', desc: 'Run Bitcoin and IPFS in one click.' },
          { icon: '🛡️', title: 'Web3 Scores', desc: 'Trustless site indicators built-in.' }
        ].map(item => (
          <div key={item.title} className="bg-[#1a1b26] border border-[#2d2e45] rounded-[16px] p-4 transition-all hover:border-[#6366f1] hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] group">
             <div className="text-2xl mb-2">{item.icon}</div>
             <div className="text-[13px] font-black text-white mb-1 group-hover:text-[#818cf8] transition-colors">{item.title}</div>
             <div className="text-[11px] text-[#4b5563] leading-tight font-bold">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NetworkStatusWidget() {
  return (
    <div className="bg-[#13141f] border border-[#2d2e45] rounded-[24px] p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-[#22c55e] pulse-dot" />
        <h2 className="text-base font-black text-white uppercase tracking-wider">Network Status</h2>
      </div>
      <div className="space-y-4">
         {[
           { name: 'ENS Resolver', status: 'Active', sub: 'Resolving .eth domains' },
           { name: 'IPFS Gateway', status: 'Active', sub: 'Distributed storage ready' },
           { name: 'Web3 Score', status: 'Active', sub: 'Powered by Orivon' },
           { name: 'Bitcoin Node', status: 'Offline', sub: 'Click to start' }
         ].map(item => (
           <div key={item.name} className="flex justify-between items-center group">
              <div className="flex flex-col">
                 <span className="text-[12px] font-bold text-[#f1f5f9]">{item.name}</span>
                 <span className="text-[10px] text-[#4b5563] font-bold uppercase tracking-wider">{item.sub}</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-[#22c55e]' : 'bg-[#374151]'}`} />
                 <button className="w-7 h-7 rounded-lg bg-white/2 border border-white/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-white/5 text-[#4b5563] hover:text-white cursor-pointer">
                    <ChevronRight size={14} />
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}

function FeaturedWeb3Sites({ onOpen }: { onOpen?: (u: string) => void }) {
  return (
    <div className="bg-[#13141f] border border-[#2d2e45] rounded-[24px] p-6 shadow-xl">
      <h2 className="text-base font-black text-white uppercase tracking-wider mb-6">Explore Web3</h2>
      <div className="grid grid-cols-3 gap-4">
        {[
          { name: 'Uniswap', domain: 'uniswap.eth', color: '#FF007A', score: 'green' },
          { name: 'Mastodon', domain: 'mastodon.eth', color: '#2b90d9', score: 'green' },
          { name: 'IPFS', domain: 'ipfs.eth', color: '#65c2cb', score: 'green' },
          { name: 'OpenSea', domain: 'opensea.eth', color: '#2081e2', score: 'amber' },
          { name: 'Gitcoin', domain: 'gitcoin.eth', color: '#00cc85', score: 'green' },
          { name: 'App Store', domain: 'apps.orivon.eth', color: '#6366f1', score: 'green' }
        ].map(site => (
          <button 
            key={site.name} 
            onClick={() => onOpen?.(site.domain)}
            className="bg-[#1a1b26] border border-[#2d2e45] rounded-[16px] p-4 transition-all hover:border-[#6366f1] hover:-translate-y-1 relative cursor-pointer text-left border-none group"
          >
             <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${site.score === 'green' ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'}`} />
             <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-xs mb-3 shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: site.color }}>
                {site.name.charAt(0)}
             </div>
             <div className="font-bold text-white text-[13px]">{site.name}</div>
             <div className="text-[11px] text-[#818cf8] font-bold">{site.domain}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecentSites() {
  return (
    <div className="bg-[#13141f] border border-[#2d2e45] rounded-[24px] p-6 shadow-xl">
      <h2 className="text-base font-black text-white uppercase tracking-wider mb-6">Recent Sites</h2>
      <div className="space-y-5">
        {[
          { name: 'uniswap.eth', time: '2 minutes ago', score: '#22c55e' },
          { name: 'mastodon.eth', time: '1 hour ago', score: '#22c55e' },
          { name: 'opensea.eth', time: '3 hours ago', score: '#f59e0b' },
          { name: 'google.com', time: '5 hours ago', score: '#ef4444' }
        ].map(site => (
          <div key={site.name} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center font-bold text-[#4b5563] text-xs">
                  {site.name.charAt(0).toUpperCase()}
               </div>
               <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-white">{site.name}</span>
                  <span className="text-[10px] text-[#4b5563] font-bold">{site.time}</span>
               </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: site.score }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BottomPitch() {
  return (
    <div className="w-full bg-gradient-to-br from-[#1a1b2e] to-[#13141f] border border-[#2d2e45] rounded-[20px] p-10 flex justify-between items-center shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366f1]/5 blur-[100px] rounded-full" />
      
      <div className="max-w-[60%]">
        <h2 className="text-2xl font-black text-white mb-4 tracking-tight">The browser Web3 has been waiting for.</h2>
        <p className="text-[#94a3b8] text-[14px] leading-relaxed font-medium mb-8">
          Orivon is the first browser built from the ground up for Web3. Native ENS domains, one-click nodes, built-in Web3 Scores, and a unified wallet for every chain. No extensions, no setup, no compromises.
        </p>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3">
           {[
             'Open any .eth domain instantly',
             'Run a Bitcoin node in one click',
             'Know exactly how trustless every site is',
             'Unified wallet for every chain'
           ].map(item => (
             <div key={item} className="flex items-center gap-3 text-[13px] font-bold text-[#f1f5f9]">
                <div className="w-5 h-5 rounded-full bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]">
                   <Check size={12} strokeWidth={4} />
                </div>
                {item}
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 text-right">
         {[
           { val: '2 Billion', label: 'People who will use Web3' },
           { val: '1 Browser', label: 'Built to onboard them all' },
           { val: '0 Compromises', label: 'On decentralization' }
         ].map(stat => (
           <div key={stat.label} className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tighter">{stat.val}</span>
              <span className="text-[10px] text-[#818cf8] font-black uppercase tracking-[0.2em]">{stat.label}</span>
           </div>
         ))}
      </div>
    </div>
  );
}

function BackupView({ onBack }: { onBack: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const { password } = useWalletStore();
  const [pwInput, setPwInput] = useState('');
  const [showPwEntry, setShowPwInput] = useState(true);
  const [error, setError] = useState('');

  const DEMO_MNEMONIC = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
  const words = DEMO_MNEMONIC.split(' ');

  const handleReveal = () => {
    if (pwInput === password || (!password && pwInput === '1234')) {
      setShowPwInput(false);
      setRevealed(true);
    } else {
      setError('Incorrect password');
    }
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(DEMO_MNEMONIC);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showPwEntry) {
    return (
      <div className="text-white min-h-full w-full py-16 px-5 flex flex-col items-center font-inter" style={{ background: '#0a0b12' }}>
        <div className="w-full max-w-[480px]">
          <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#4b5563] hover:text-white cursor-pointer mb-10 transition-colors font-black text-sm uppercase tracking-wider">
            <ArrowLeft size={18} /> BACK
          </button>
          
          <div className="w-16 h-16 rounded-[24px] bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1] mb-8">
             <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">Enter Password</h1>
          <p className="text-[#94a3b8] text-lg font-medium leading-relaxed mb-8">
             Please enter your Orivon Action Password to view your seed phrase.
          </p>
          
          <div className="space-y-6 mb-10">
             <div>
                <label className="text-[10px] font-black text-[#4b5563] uppercase tracking-widest block mb-2">Your Password</label>
                <input 
                  type="password" 
                  autoFocus
                  value={pwInput} 
                  onChange={e => {setPwInput(e.target.value); setError('');}}
                  onKeyDown={e => e.key === 'Enter' && handleReveal()}
                  className="w-full h-14 rounded-2xl bg-[#13141f] border border-[#2d2e45] px-5 text-white font-black text-xl outline-none focus:border-[#6366f1] transition-all"
                />
                {error && <p className="text-[#f87171] text-xs font-black uppercase mt-3">{error}</p>}
             </div>
          </div>

          <button 
            onClick={handleReveal}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white font-black text-lg uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all border-none cursor-pointer"
          >
             Unlock & Reveal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white min-h-full w-full py-16 px-5 flex flex-col items-center font-inter" style={{ background: '#0a0b12' }}>
      <div className="w-full max-w-[640px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#4b5563] hover:text-white cursor-pointer mb-10 transition-colors font-black text-sm">
          <ArrowLeft size={18} /> BACK TO DASHBOARD
        </button>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 mb-10 flex gap-5 animate-in">
          <AlertTriangle size={24} className="text-[#f87171] shrink-0" />
          <div>
            <div className="font-black text-[#f87171] mb-1 uppercase text-xs tracking-[0.1em]">CRITICAL SECURITY WARNING</div>
            <div className="text-sm text-[#f87171]/80 leading-relaxed font-bold">Never share your seed phrase with anyone. Not Orivon, not support, not anyone. Anyone who has these 12 words has full access to your funds.</div>
          </div>
        </div>

        <h1 className="text-3xl font-black mb-3 tracking-tight text-white animate-in" style={{ animationDelay: '100ms' }}>Backup your wallet</h1>
        <p className="text-[#94a3b8] mb-10 leading-relaxed font-bold animate-in" style={{ animationDelay: '150ms' }}>Write down these 12 words in order and keep them somewhere safe offline.</p>

        <div className="relative bg-[#13141f] border border-[#2d2e45] rounded-[24px] p-8 mb-10 overflow-hidden shadow-2xl animate-in" style={{ animationDelay: '200ms' }}>
          <div className={`grid grid-cols-3 gap-4 transition-all duration-700 ${revealed ? 'blur-0' : 'blur-[12px]'}`}>
            {words.map((word, i) => (
              <div key={i} className="flex flex-col bg-[#1a1b26] p-4 rounded-[12px] border border-[#2d2e45] relative">
                <span className="text-[10px] font-black text-[#6366f1] absolute top-2.5 left-3 uppercase tracking-tighter">{i + 1}</span>
                <span className="font-black text-white text-center mt-3 text-[16px]">{word}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 animate-in">
          <div className="relative">
            <button
              onClick={handleCopyAll}
              className="w-full h-14 rounded-2xl bg-[#1e1f2e] border border-[#2d2e45] text-[#a5b4fc] font-black uppercase tracking-[0.2em] text-xs cursor-pointer hover:border-[#6366f1] transition-all flex items-center justify-center gap-3"
            >
              {copied ? <CheckCircle2 size={18} className="text-[#22c55e]" /> : <Copy size={18} />}
              {copied ? 'Copied to clipboard' : 'Copy all 12 words'}
            </button>
          </div>
          <button
            onClick={onBack}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white border-none font-black text-lg uppercase tracking-widest cursor-pointer shadow-xl shadow-indigo-500/20 hover:brightness-110 active:scale-98 transition-all mt-2"
          >
            I HAVE SAVED IT
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportView({ onBack }: { onBack: () => void }) {
  const { importWallet } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const DEMO_IMPORT = [
    'venture', 'capital', 'market', 'chain', 'block', 'token',
    'wallet', 'defi', 'node', 'crypto', 'zero', 'proof'
  ];

  const handleImport = async () => {
    setLoading(true);
    setTimeout(async () => {
      await importWallet(DEMO_IMPORT.join(' '), '', 'Trading Wallet');
      setSuccess(true);
      setTimeout(() => onBack(), 1200);
    }, 1500);
  };

  if (success) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-10" style={{ background: '#0a0b12' }}>
        <motion.div initial={{scale:0}} animate={{scale:1}} className="w-24 h-24 rounded-full bg-[#22c55e] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <Check size={48} className="text-white" />
        </motion.div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Wallet Connected</h1>
        <p className="text-[#94a3b8] font-bold text-lg">Trading Wallet has been successfully imported.</p>
      </div>
    );
  }

  return (
    <div className="text-white min-h-full w-full py-16 px-5 flex flex-col items-center font-inter" style={{ background: '#0a0b12' }}>
      <div className="w-full max-w-[640px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#4b5563] hover:text-white cursor-pointer mb-10 transition-colors font-black text-sm">
          <ArrowLeft size={18} /> BACK
        </button>

        <h1 className="text-4xl font-black mb-2 tracking-tight text-white">Import Wallet</h1>
        <p className="text-[#94a3b8] mb-12 font-bold text-lg">Enter your 12 word seed phrase to connect an existing wallet</p>

        <div className="mb-4 text-[#4b5563] text-xs font-black uppercase tracking-widest pl-2">Demo seed phrase pre-filled. Click Import to continue.</div>
        
        <div className="grid grid-cols-3 gap-4 mb-10">
          {DEMO_IMPORT.map((word, i) => (
            <div key={i} className="flex flex-col bg-[#13141f] rounded-[16px] border border-[#6366f1]/40 p-4 transition-all">
              <span className="text-[10px] font-black text-[#6366f1] uppercase mb-1.5 tracking-tighter">{i + 1}</span>
              <div className="text-white font-black text-center text-base">{word}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full h-16 rounded-[20px] font-black text-lg uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-4 border-none bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white cursor-pointer hover:scale-[1.02] shadow-[0_10px_30px_rgba(99,102,241,0.4)] active:scale-95"
        >
          {loading ? <Spinner size={24} color="#fff" /> : "VERIFY AND IMPORT"}
        </button>
      </div>
    </div>
  );
}

function SendView({ onBack, onGoToBackup }: { onBack: () => void, onGoToBackup: () => void }) {
  const { accounts, activeAccountId } = useWalletStore();
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => onBack(), 1500);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-[#0a0b12]/95 fixed inset-0 z-[1000] flex flex-col items-center justify-center text-center">
        <Spinner size={56} color="#6366f1" className="mb-8" />
        <h2 className="text-3xl font-black text-white mb-3 tracking-tight uppercase tracking-[0.1em]">Broadcasting</h2>
        <p className="text-[#94a3b8] font-bold text-lg">Processing your transaction on Ethereum Mainnet...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-10" style={{ background: '#0a0b12' }}>
        <div className="w-24 h-24 rounded-full bg-[#22c55e] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <Check size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Transaction Sent</h1>
        <p className="text-[#94a3b8] font-bold text-lg">Your funds are on the way!</p>
      </div>
    );
  }

  return (
    <div className="text-white min-h-full w-full py-16 px-5 flex flex-col items-center font-inter" style={{ background: '#0a0b12' }}>
      <div className="w-full max-w-[540px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#4b5563] hover:text-white cursor-pointer mb-10 transition-colors font-black text-sm uppercase tracking-wider">
          <ArrowLeft size={18} /> BACK
        </button>

        <h1 className="text-4xl font-black mb-10 tracking-tight text-white">Send Crypto</h1>

        <div className="flex flex-col gap-8">
          <div>
            <label className="text-[11px] font-black text-[#4b5563] uppercase mb-3 block tracking-widest">Network</label>
            <div className="h-16 rounded-2xl bg-[#13141f] border border-[#2d2e45] flex items-center px-5 gap-4 hover:bg-[#1e1f2e] transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-[#627eea] flex items-center justify-center text-[11px] font-black text-white">Ξ</div>
              <span className="flex-1 font-bold text-[15px] text-[#f1f5f9]">Ethereum Mainnet</span>
              <ChevronRight size={18} className="text-[#4b5563] group-hover:text-[#94a3b8] transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-[#4b5563] uppercase mb-3 block tracking-widest">Recipient Address</label>
            <input
              placeholder="0x... or .eth name"
              className="w-full h-16 rounded-2xl bg-[#13141f] border border-[#2d2e45] px-5 text-[#f1f5f9] font-bold text-lg outline-none focus:border-[#6366f1] transition-all placeholder:text-[#374151]"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-[#4b5563] uppercase mb-3 block tracking-widest">Amount</label>
            <div className="relative">
              <input
                placeholder="0.0"
                className="w-full h-16 rounded-2xl bg-[#13141f] border border-[#2d2e45] pl-5 pr-20 text-[#f1f5f9] font-black text-3xl outline-none focus:border-[#6366f1] transition-all placeholder:text-[#374151]"
              />
              <div className="absolute right-5 top-4.5 font-black text-[#818cf8] text-xl">ETH</div>
            </div>
            <div className="flex justify-between mt-3 text-xs font-black text-[#4b5563] px-1 uppercase tracking-wider">
              <span>Balance: {activeAccount.balance_eth} ETH</span>
              <span>≈ ${(activeAccount.balance_usd || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-6 bg-[#13141f] border border-[#2d2e45] rounded-3xl space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#4b5563] uppercase tracking-wider">Estimated Fee</span>
                <span className="text-xs font-black text-white">0.00042 ETH ($1.03)</span>
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-xs font-bold text-[#4b5563] uppercase tracking-wider">Web3 Score</span>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#22c55e] pulse-dot" />
                   <span className="text-xs font-black text-[#22c55e] uppercase tracking-widest">TRUSTLESS</span>
                </div>
             </div>
          </div>

          <button
            onClick={handleSend}
            className="h-16 rounded-[20px] bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white border-none font-black text-lg uppercase tracking-widest cursor-pointer hover:scale-[1.02] shadow-[0_10px_30px_rgba(99,102,241,0.3)] active:scale-95 transition-all mt-4"
          >
            CONFIRM AND SEND
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiveView({ onBack, address }: { onBack: () => void, address: string }) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setGenerating(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-white min-h-full w-full py-16 px-5 flex flex-col items-center font-inter text-center" style={{ background: '#0a0b12' }}>
      <div className="w-full max-w-[440px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#4b5563] hover:text-white cursor-pointer mb-10 transition-colors font-black text-sm uppercase tracking-wider mx-auto">
          <ArrowLeft size={18} /> BACK
        </button>

        <h1 className="text-4xl font-black mb-3 tracking-tight text-white">Receive Crypto</h1>
        <p className="text-[#94a3b8] mb-12 font-bold text-lg">Your Ethereum wallet address</p>

        <div className="bg-white p-10 rounded-[48px] inline-block mb-10 shadow-[0_0_50px_rgba(99,102,241,0.1)] relative min-w-[280px] min-h-[280px]">
          {generating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size={40} color="#6366f1" />
            </div>
          ) : (
            <div className="w-52 h-52 bg-black flex flex-wrap p-1">
              {Array.from({ length: 484 }).map((_, i) => (
                <div key={i} className="w-[10px] h-[10px]" style={{ background: Math.random() > 0.5 ? '#fff' : '#000' }} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#13141f] border border-[#2d2e45] rounded-3xl p-5 flex items-center gap-5 mb-10 shadow-2xl">
           <span className="flex-1 text-[13px] text-white font-mono font-black break-all">{address}</span>
           <button onClick={handleCopy} className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] border-none rounded-xl px-6 h-11 text-white text-xs font-black uppercase tracking-widest cursor-pointer hover:brightness-110 transition-all active:scale-95 shadow-lg">
             {copied ? 'COPIED' : 'COPY'}
           </button>
        </div>

        <div className="bg-indigo-500/10 rounded-2xl p-5 flex gap-5 text-left items-start border border-indigo-500/20">
           <AlertTriangle size={24} className="text-[#6366f1] shrink-0 mt-1" />
           <p className="text-xs text-[#94a3b8] font-bold leading-relaxed m-0 uppercase tracking-tight">Only send compatible tokens to this address. Sending unsupported tokens may result in permanent loss.</p>
        </div>
      </div>
    </div>
  );
}
