import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Wallet, Send, Download, Globe,
  Cpu, Activity, History, ExternalLink,
  MessageSquare, Layers, Box, Store,
  ChevronRight, Circle, MoreHorizontal,
  Copy, Check, ArrowRight, Shield, Settings, Lock,
  Moon, Sun, Eye, EyeOff, AlertTriangle, ArrowLeft,
  ShoppingCart, RefreshCw, X, Zap, ArrowUpRight, ArrowDownLeft, Plus, LayoutGrid, CheckCircle2,
  Database, Share2, TrendingUp
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
  const { theme, setTheme, hasOnboarded, setHasOnboarded } = useSettings();
  
  const [view, setView] = useState<'main' | 'backup' | 'send' | 'receive' | 'import'>('main');
  const [initialLoading, setInitialLoading] = useState(true);

  // Force onboarding in development mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      setHasOnboarded(false);
    }
  }, [setHasOnboarded]);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 600);
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
      <div className="h-full w-full flex flex-col items-center justify-center gap-6 bg-[#0d0e14]">
        <img src={logo} alt="Orivon" className="h-10 object-contain opacity-20" />
        <Spinner size={24} color="#6366f1" />
      </div>
    );
  }

  if (view === 'backup') return <BackupView onBack={() => setView('main')} />;
  if (view === 'send') return <SendView onBack={() => setView('main')} />;
  if (view === 'receive') return <ReceiveView onBack={() => setView('main')} address={activeAccount?.addresses.eth || ''} />;
  if (view === 'import') return <ImportView onBack={() => setView('main')} />;

  return (
    <div className="text-[#f8fafc] min-h-full w-full flex flex-col font-inter bg-[#0d0e14] overflow-y-auto pb-20 relative animate-fade">
      <AnimatePresence>
        {!hasOnboarded && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[5000] backdrop-blur-xl bg-black/60 flex items-center justify-center p-6"
           >
              <OnboardingOverlay onComplete={() => { setHasOnboarded(true); setView('backup'); }} />
           </motion.div>
        )}
      </AnimatePresence>

      <div className={!hasOnboarded ? 'blur-md pointer-events-none transition-all duration-500' : 'transition-all duration-500'}>
        <DashboardStatsBar />

        <div className="w-full max-w-[960px] mx-auto px-8 pt-10">
          <WalletBox onImport={() => setView('import')} onBackup={() => setView('backup')} setView={setView} />

          <div className="grid grid-cols-12 gap-6 mt-8">
            <div className="col-span-7 space-y-6">
               <NodesWidget />
               <FeaturedWeb3Sites onOpen={onOpenBrowser} />
            </div>
            <div className="col-span-5 space-y-6">
               <WhyOrivon />
               <NetworkStatusWidget />
               <RecentSites />
            </div>
          </div>

          <div className="mt-10">
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
      initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }}
      className="w-[480px] bg-[#111218] border border-[#1e2030] rounded-xl p-10 shadow-2xl relative"
    >
       <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <div className="w-10 h-10 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center justify-center text-[#6366f1] mb-8">
                  <LayoutGrid size={20} />
               </div>
               <h1 className="title-page mb-4">Welcome to Orivon Dashboard</h1>
               <p className="text-[#94a3b8] text-[14px] leading-relaxed mb-8">
                  This is your Web3 mission control. Manage your assets, run native nodes, and explore decentralized platforms with maximum privacy.
               </p>
               <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-[13px] font-medium text-[#f8fafc]">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /> Unified Multi-Chain Wallet
                  </div>
                  <div className="flex items-center gap-3 text-[13px] font-medium text-[#f8fafc]">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" /> One-Click Bitcoin & IPFS Nodes
                  </div>
                  <div className="flex items-center gap-3 text-[13px] font-medium text-[#f8fafc]">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" /> Real-time Web3 Trust Scores
                  </div>
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <div className="w-10 h-10 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center justify-center text-amber-500 mb-8">
                  <Shield size={20} />
               </div>
               <h1 className="title-page mb-4">Secure Your Identity</h1>
               <p className="text-[#94a3b8] text-[14px] leading-relaxed mb-8">
                  Orivon is non-custodial. We never store your keys. You must back up your seed phrase now to ensure you never lose access to your funds.
               </p>
               <div className="border-l-3 border-[#ef4444] p-4 bg-[#161720]/30 rounded-r-lg mb-10">
                  <div className="flex items-center gap-2 text-[#ef4444] font-bold text-[11px] uppercase tracking-widest mb-1.5">
                     <AlertTriangle size={14} /> Important
                  </div>
                  <p className="text-[12px] text-[#ef4444] font-medium leading-relaxed m-0">
                     Without your backup, your funds cannot be recovered if you lose access to this device.
                  </p>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <div className="w-10 h-10 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center justify-center text-[#6366f1] mb-8">
                  <Lock size={20} />
               </div>
               <h1 className="title-page mb-4">Set Action Password</h1>
               <p className="text-[#94a3b8] text-[14px] leading-relaxed mb-8">
                  This password will be required for every transaction and sensitive action you perform in Orivon.
               </p>
               
               <div className="space-y-5 mb-10">
                  <div>
                    <label className="text-label text-[#64748b] block mb-2 px-1">New Password</label>
                    <input 
                      type="password" 
                      value={pw} 
                      onChange={e => {setPw(e.target.value); setError('');}}
                      className="w-full h-11 rounded-lg bg-[#0d0e14] border border-[#1e2030] px-4 text-[#f8fafc] font-bold text-lg outline-none focus:border-[#6366f1] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-label text-[#64748b] block mb-2 px-1">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPw} 
                      onChange={e => {setConfirmPw(e.target.value); setError('');}}
                      className="w-full h-11 rounded-lg bg-[#0d0e14] border border-[#1e2030] px-4 text-[#f8fafc] font-bold text-lg outline-none focus:border-[#6366f1] transition-all"
                    />
                  </div>
                  {error && <p className="text-[#ef4444] text-[11px] font-bold uppercase text-center mt-2">{error}</p>}
               </div>
            </motion.div>
          )}
       </AnimatePresence>

       <button 
         onClick={handleNext}
         className="w-full h-11 rounded-lg bg-[#6366f1] text-white font-semibold text-[14px] uppercase tracking-widest hover:bg-[#4f46e5] active:scale-[0.98] transition-all border-none cursor-pointer"
       >
          {step === 3 ? 'Protect & Back Up' : 'Continue'}
       </button>
    </motion.div>
  );
}

function DashboardStatsBar() {
  return (
    <div className="w-full h-[36px] border-b border-[#1e2030] bg-[#111218] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-6">
         <div className="flex items-center gap-2">
           <span className="text-label text-[#64748b]">Web3 Sites:</span>
           <span className="text-[12px] font-semibold tabular text-[#f8fafc]">1,247,832</span>
         </div>
         <div className="w-px h-3 bg-[#1e2030]" />
         <div className="flex items-center gap-2">
           <span className="text-label text-[#64748b]">Trackers Blocked:</span>
           <span className="text-[12px] font-semibold tabular text-[#f8fafc]">48,291,047</span>
         </div>
         <div className="w-px h-3 bg-[#1e2030]" />
         <div className="flex items-center gap-2">
           <span className="text-label text-[#64748b]">Nodes Active:</span>
           <span className="text-[12px] font-semibold tabular text-[#f8fafc]">3</span>
         </div>
      </div>

      <div className="flex items-center gap-2">
         <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
         <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Network: Online</span>
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
    <div className="w-full bg-[#111218] border border-[#1e2030] rounded-xl p-8 shadow-sm relative group">
      <div className="flex justify-between items-start mb-10">
        <WalletComps.default onImport={onImport} />
        
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-md bg-[#161720] border border-[#1e2030] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-label text-[#94a3b8]">Ethereum Mainnet</span>
          </div>
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-lg hover:bg-[#1e2030] flex items-center justify-center text-[#64748b] hover:text-[#f8fafc] transition-all border-none bg-transparent cursor-pointer"
            >
              <MoreHorizontal size={18} />
            </button>
            <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      className="absolute top-10 right-0 w-52 bg-[#161720] border border-[#1e2030] rounded-lg p-1 z-50 shadow-2xl overflow-hidden"
                    >
                      {[
                        { label: 'View Seed Phrase', icon: <Eye size={14}/>, onClick: () => { onBackup(); setMenuOpen(false); } },
                        { label: 'Copy Address', icon: <Copy size={14}/>, onClick: () => { handleCopy(activeAccount?.addresses.eth || ''); setMenuOpen(false); } },
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className="w-full px-3 py-2 flex items-center gap-3 bg-transparent border-none text-[#94a3b8] text-[12px] font-medium cursor-pointer rounded-md text-left hover:bg-[#1e2030] hover:text-[#f8fafc] transition-all"
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
        <div className="text-[42px] font-bold text-[#f8fafc] tabular tracking-tight leading-none mb-2">
          ${(activeAccount.balance_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[15px] font-semibold text-[#64748b] tabular">{activeAccount.balance_eth} ETH</span>
          <div className="flex items-center gap-1 text-[#22c55e] font-semibold text-[13px] tabular">
             <TrendingUp size={14} strokeWidth={2.5} /> +$306.82 today
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-[#475569] mono text-[12px] h-6">
          <span className="group-hover:text-[#64748b] transition-colors">{activeAccount?.addresses.eth.slice(0, 10)}...{activeAccount?.addresses.eth.slice(-8)}</span>
          <button onClick={() => handleCopy(activeAccount?.addresses.eth || '')} className="p-1 hover:text-[#f8fafc] transition-colors cursor-pointer bg-transparent border-none opacity-0 group-hover:opacity-100">
            {copied ? <Check size={14} className="text-[#22c55e]" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-12">
        {[
          { label: 'Send', icon: <ArrowUpRight size={16}/>, onClick: () => setView('send') },
          { label: 'Receive', icon: <ArrowDownLeft size={16}/>, onClick: () => setView('receive') },
          { label: 'Buy', icon: <Plus size={16}/> },
          { label: 'Swap', icon: <RefreshCw size={16}/> },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className="w-[110px] h-10 rounded-lg bg-[#161720] border border-[#1e2030] text-[#94a3b8] text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#1e2030] hover:text-[#f8fafc] hover:border-[#6366f1] transition-all border-none cursor-pointer group/btn"
          >
            {btn.icon}
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-[#1e2030] pt-8">
        <div className="flex gap-8 mb-8">
          {(['tokens', 'nfts', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[13px] font-semibold uppercase tracking-widest bg-transparent border-none cursor-pointer relative transition-all ${
                activeTab === tab ? 'text-[#f8fafc]' : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]" />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-1">
           {activeTab === 'tokens' && tokens.map(token => (
             <div key={token.symbol} className="flex items-center justify-between p-3.5 rounded-lg border-l-2 border-transparent hover:bg-[#161720] transition-all group" style={{ borderLeftColor: token.color }}>
                <div className="flex items-center gap-4 pl-1">
                   <div className="flex flex-col">
                      <span className="font-semibold text-[#f8fafc] text-[13px]">{token.symbol}</span>
                      <span className="text-[12px] text-[#64748b] font-medium">{token.name}</span>
                   </div>
                </div>
                <div className="flex-1 flex justify-center text-[13px] text-[#94a3b8] tabular font-medium">
                   {token.amount} {token.symbol}
                </div>
                <div className="flex items-center gap-10">
                   <div className="text-right flex flex-col">
                      <span className="font-semibold text-[#f8fafc] text-[13px] tabular">${token.value_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <span className={`text-[12px] font-semibold tabular ${token.change_24h > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {token.change_24h > 0 ? '+' : ''}{token.change_24h}%
                      </span>
                   </div>
                </div>
             </div>
           ))}
           {activeTab !== 'tokens' && (
              <div className="py-12 flex flex-col items-center justify-center gap-4 text-[#475569]">
                 <div className="w-12 h-12 rounded-xl border border-[#1e2030] flex items-center justify-center opacity-40">
                    {activeTab === 'nfts' ? <Layers size={24} /> : <Activity size={24} />}
                 </div>
                 <span className="text-label uppercase tracking-widest">No {activeTab} Found</span>
              </div>
           )}
        </div>
        
        <div className="mt-10 flex justify-between items-center text-[#475569] text-[11px] font-semibold uppercase tracking-[0.12em]">
           <span>Secured by Orivon Protocol</span>
           <span className="text-muted">Total Value: <span className="text-[#94a3b8] tabular">${(activeAccount.balance_usd || 0).toLocaleString()}</span></span>
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
    }, 1500);
  };

  const activeCount = Object.values(nodes).filter(s => s === 'Online').length;

  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="title-section">Web3 Nodes</h2>
        <span className="text-[11px] font-semibold uppercase text-[#22c55e] tracking-wider">{activeCount} Active</span>
      </div>

      <div className="divide-y divide-[#1e2030]">
        {[
          { id: 'ipfs', name: 'IPFS Node', sub: 'Distributed file system', icon: <Database size={16} className="text-[#06b6d4]" /> },
          { id: 'bittorrent', name: 'BitTorrent Node', sub: 'Peer-to-peer file sharing', icon: <Share2 size={16} className="text-[#f59e0b]" /> },
          { id: 'bitcoin', name: 'Bitcoin Node Pruned', sub: 'Pruned node, quick sync', icon: <Circle size={16} className="text-[#f97316]" fill="currentColor" /> }
        ].map(node => (
          <div key={node.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center justify-center">
                 {node.icon}
              </div>
              <div className="flex flex-col">
                 <span className="text-[13px] font-semibold text-[#f8fafc]">{node.name}</span>
                 <span className="text-[12px] text-[#64748b] font-medium">{node.sub}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${nodes[node.id] === 'Online' ? 'bg-[#22c55e]' : nodes[node.id] === 'Syncing' ? 'bg-[#f59e0b] animate-pulse' : 'bg-[#374151]'}`} />
                  <span className={`text-[12px] font-medium uppercase tracking-wider ${nodes[node.id] === 'Online' ? 'text-[#22c55e]' : nodes[node.id] === 'Syncing' ? 'text-[#f59e0b]' : 'text-[#64748b]'}`}>
                     {nodes[node.id]}
                  </span>
               </div>
               <button 
                 onClick={() => nodes[node.id] === 'Offline' ? startNode(node.id) : setNodes(p => ({...p, [node.id]: 'Offline'}))}
                 className={`min-w-[72px] h-8 rounded-md font-semibold text-[11px] uppercase tracking-wider transition-all border cursor-pointer ${
                  nodes[node.id] === 'Online' ? 'bg-transparent border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/5' : 'bg-transparent border-[#1e2030] text-[#94a3b8] hover:border-[#6366f1] hover:text-[#818cf8]'
                 }`}
               >
                 {loading[node.id] ? <Spinner size={12} /> : nodes[node.id] === 'Online' ? 'Stop' : 'Start'}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyOrivon() {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5 shadow-sm">
      <h2 className="title-section mb-6">Why Orivon</h2>
      <div className="space-y-1">
        {[
          { icon: <Shield size={14} />, title: 'Zero Trackers', desc: 'Your data never leaves your device.' },
          { icon: <Globe size={14} />, title: 'True Web3', desc: 'Native .eth domain support built in.' },
          { icon: <Zap size={14} />, title: 'Instant Nodes', desc: 'Run Bitcoin and IPFS in one click.' },
          { icon: <CheckCircle2 size={14} />, title: 'Web3 Scores', desc: 'Real-time trustsite indicators.' }
        ].map((item, i) => (
          <div key={item.title}>
            <div className="flex gap-4 py-3.5">
               <div className="text-[#6366f1] mt-0.5">{item.icon}</div>
               <div className="flex flex-col">
                  <div className="text-[13px] font-semibold text-[#f8fafc] mb-0.5">{item.title}</div>
                  <div className="text-[12px] text-[#64748b] leading-snug font-medium">{item.desc}</div>
               </div>
            </div>
            {i < 3 && <div className="h-px bg-[#161720] ml-8" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function NetworkStatusWidget() {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="title-section">Network Status</h2>
        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
      </div>
      <div className="space-y-4">
         {[
           { name: 'ENS Resolver', status: 'Active', icon: <Search size={14} /> },
           { name: 'IPFS Gateway', status: 'Active', icon: <Database size={14} /> },
           { name: 'Web3 Score', status: 'Active', icon: <Shield size={14} /> },
           { name: 'Bitcoin Node', status: 'Offline', icon: <Zap size={14} /> }
         ].map(item => (
           <div key={item.name} className="flex justify-between items-center group cursor-default">
              <div className="flex items-center gap-3">
                 <span className="text-[#475569] group-hover:text-[#64748b] transition-colors">{item.icon}</span>
                 <span className="text-[13px] font-medium text-[#f1f5f9]">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className={`w-1 h-1 rounded-full ${item.status === 'Active' ? 'bg-[#22c55e]' : 'bg-[#374151]'}`} />
                 <span className={`text-[11px] font-semibold uppercase tracking-widest ${item.status === 'Active' ? 'text-[#22c55e]' : 'text-[#64748b]'}`}>{item.status}</span>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}

function FeaturedWeb3Sites({ onOpen }: { onOpen?: (u: string) => void }) {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5 shadow-sm">
      <h2 className="title-section mb-6">Explore Web3</h2>
      <div className="grid grid-cols-3 gap-2">
        {[
          { name: 'Uniswap', domain: 'uniswap.eth', color: '#ff007a' },
          { name: 'Mastodon', domain: 'mastodon.eth', color: '#2b90d9' },
          { name: 'IPFS', domain: 'ipfs.eth', color: '#06b6d4' },
          { name: 'OpenSea', domain: 'opensea.eth', color: '#2081e2' },
          { name: 'Gitcoin', domain: 'gitcoin.eth', color: '#00cc85' },
          { name: 'App Store', domain: 'apps.orivon.eth', color: '#6366f1' }
        ].map(site => (
          <button 
            key={site.name} 
            onClick={() => onOpen?.(site.domain)}
            className="flex items-center gap-3 p-3 rounded-lg border-none bg-transparent hover:bg-[#161720] transition-all cursor-pointer group text-left"
          >
             <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-[14px] shrink-0" style={{ backgroundColor: site.color }}>
                {site.name.charAt(0)}
             </div>
             <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                   <span className="font-semibold text-[#f8fafc] text-[13px] truncate">{site.name}</span>
                   <div className="w-1 h-1 rounded-full bg-[#22c55e] shrink-0" />
                </div>
                <div className="text-[11px] text-[#6366f1] font-medium mono truncate">{site.domain}</div>
             </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecentSites() {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5 shadow-sm">
      <h2 className="title-section mb-6">Recent Sites</h2>
      <div className="space-y-5">
        {[
          { name: 'uniswap.eth', time: '2m ago', score: '#22c55e' },
          { name: 'mastodon.eth', time: '1h ago', score: '#22c55e' },
          { name: 'opensea.eth', time: '3h ago', score: '#f59e0b' },
          { name: 'google.com', time: '5h ago', score: '#ef4444' }
        ].map(site => (
          <div key={site.name} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-6 h-6 rounded-md bg-[#161720] border border-[#1e2030] flex items-center justify-center font-bold text-[#475569] text-[10px]">
                  {site.name.charAt(0).toUpperCase()}
               </div>
               <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[#f8fafc]">{site.name}</span>
                  <span className="text-[11px] text-[#475569] font-medium tabular">{site.time}</span>
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
    <div className="w-full bg-[#111218] border border-[#1e2030] rounded-xl p-10 flex justify-between items-center relative overflow-hidden">
      <div className="max-w-[60%]">
        <span className="text-label text-[#6366f1] block mb-4">The Web3 Browser</span>
        <h2 className="text-[22px] font-bold text-[#f8fafc] mb-4 tracking-tight">The browser Web3 has been waiting for.</h2>
        <p className="text-[#94a3b8] text-[14px] leading-relaxed font-medium mb-8">
          Orivon is the first browser built from the ground up for Web3. Native ENS domains, one-click nodes, built-in Web3 Scores, and a unified wallet for every chain.
        </p>
        <div className="space-y-3">
           {[
             'Open any .eth domain instantly',
             'Run a Bitcoin node in one click',
             'Know exactly how trustless every site is'
           ].map(item => (
             <div key={item} className="flex items-center gap-3 text-[13px] font-semibold text-[#64748b]">
                <Check size={14} className="text-[#6366f1]" strokeWidth={3} />
                {item}
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col gap-8 text-right pr-4">
         {[
           { val: '2B', label: 'People coming to Web3' },
           { val: '1 Browser', label: 'Built to onboard them' },
           { val: '0', label: 'Compromises on decentralization' }
         ].map(stat => (
           <div key={stat.label} className="flex flex-col">
              <span className="text-[28px] font-bold text-[#f8fafc] tabular tracking-tighter leading-none">{stat.val}</span>
              <span className="text-[12px] text-[#64748b] font-medium mt-1 uppercase tracking-wider">{stat.label}</span>
           </div>
         ))}
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
      initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }}
      className="w-[480px] bg-[#111218] border border-[#1e2030] rounded-xl p-10 shadow-2xl relative"
    >
       <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <div className="w-10 h-10 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center justify-center text-[#6366f1] mb-8">
                  <LayoutGrid size={20} />
               </div>
               <h1 className="title-page mb-4">Welcome to Orivon Dashboard</h1>
               <p className="text-[#94a3b8] text-[14px] leading-relaxed mb-8">
                  This is your Web3 mission control. Manage your assets, run native nodes, and explore decentralized platforms with maximum privacy.
               </p>
               <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-[13px] font-medium text-[#f8fafc]">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /> Unified Multi-Chain Wallet
                  </div>
                  <div className="flex items-center gap-3 text-[13px] font-medium text-[#f8fafc]">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" /> One-Click Bitcoin & IPFS Nodes
                  </div>
                  <div className="flex items-center gap-3 text-[13px] font-medium text-[#f8fafc]">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" /> Real-time Web3 Trust Scores
                  </div>
               </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <div className="w-10 h-10 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center justify-center text-amber-500 mb-8">
                  <Shield size={20} />
               </div>
               <h1 className="title-page mb-4">Secure Your Identity</h1>
               <p className="text-[#94a3b8] text-[14px] leading-relaxed mb-8">
                  Orivon is non-custodial. We never store your keys. You must back up your seed phrase now to ensure you never lose access to your funds.
               </p>
               <div className="border-l-3 border-[#ef4444] p-4 bg-[#161720]/30 rounded-r-lg mb-10">
                  <div className="flex items-center gap-2 text-[#ef4444] font-bold text-[11px] uppercase tracking-widest mb-1.5">
                     <AlertTriangle size={14} /> Important
                  </div>
                  <p className="text-[12px] text-[#ef4444] font-medium leading-relaxed m-0">
                     Without your backup, your funds cannot be recovered if you lose access to this device.
                  </p>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <div className="w-10 h-10 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center justify-center text-[#6366f1] mb-8">
                  <Lock size={20} />
               </div>
               <h1 className="title-page mb-4">Set Action Password</h1>
               <p className="text-[#94a3b8] text-[14px] leading-relaxed mb-8">
                  This password will be required for every transaction and sensitive action you perform in Orivon.
               </p>
               
               <div className="space-y-5 mb-10">
                  <div>
                    <label className="text-label text-[#64748b] block mb-2 px-1">New Password</label>
                    <input 
                      type="password" 
                      value={pw} 
                      onChange={e => {setPw(e.target.value); setError('');}}
                      className="w-full h-11 rounded-lg bg-[#0d0e14] border border-[#1e2030] px-4 text-[#f8fafc] font-bold text-lg outline-none focus:border-[#6366f1] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-label text-[#64748b] block mb-2 px-1">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPw} 
                      onChange={e => {setConfirmPw(e.target.value); setError('');}}
                      className="w-full h-11 rounded-lg bg-[#0d0e14] border border-[#1e2030] px-4 text-[#f8fafc] font-bold text-lg outline-none focus:border-[#6366f1] transition-all"
                    />
                  </div>
                  {error && <p className="text-[#ef4444] text-[11px] font-bold uppercase text-center mt-2">{error}</p>}
               </div>
            </motion.div>
          )}
       </AnimatePresence>

       <button 
         onClick={handleNext}
         className="w-full h-11 rounded-lg bg-[#6366f1] text-white font-semibold text-[14px] uppercase tracking-widest hover:bg-[#4f46e5] active:scale-[0.98] transition-all border-none cursor-pointer"
       >
          {step === 3 ? 'Protect & Back Up' : 'Continue'}
       </button>
    </motion.div>
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
      <div className="text-[#f8fafc] min-h-full w-full py-16 px-5 flex flex-col items-center font-inter bg-[#0d0e14]">
        <div className="w-full max-w-[440px]">
          <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#64748b] hover:text-[#f8fafc] cursor-pointer mb-12 transition-all font-semibold text-[13px] uppercase tracking-wider">
            <ArrowLeft size={16} /> Back
          </button>
          
          <h1 className="title-page mb-4">Enter Password</h1>
          <p className="text-[#94a3b8] text-[14px] leading-relaxed mb-10">
             Please enter your Orivon Action Password to view your seed phrase.
          </p>
          
          <div className="mb-10">
             <label className="text-label text-[#64748b] block mb-2 px-1">Your Password</label>
             <input 
               type="password" 
               autoFocus
               value={pwInput} 
               onChange={e => {setPwInput(e.target.value); setError('');}}
               onKeyDown={e => e.key === 'Enter' && handleReveal()}
               className="w-full h-11 rounded-lg bg-[#111218] border border-[#1e2030] px-4 text-[#f8fafc] font-bold text-lg outline-none focus:border-[#6366f1] transition-all"
             />
             {error && <p className="text-[#ef4444] text-[11px] font-bold uppercase mt-3 px-1">{error}</p>}
          </div>

          <button 
            onClick={handleReveal}
            className="w-full h-11 rounded-lg bg-[#6366f1] text-white font-semibold text-[14px] hover:bg-[#4f46e5] active:scale-[0.98] transition-all border-none cursor-pointer"
          >
             Unlock & Reveal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-[#f8fafc] min-h-full w-full py-16 px-5 flex flex-col items-center font-inter bg-[#0d0e14]">
      <div className="w-full max-w-[600px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#64748b] hover:text-[#f8fafc] cursor-pointer mb-12 transition-all font-semibold text-[13px] uppercase tracking-wider">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="border-l-3 border-[#ef4444] p-5 bg-transparent mb-12">
          <div className="text-[13px] text-[#ef4444] font-semibold leading-relaxed">
            Never share your seed phrase with anyone. Anyone who has these 12 words has full access to your funds.
          </div>
        </div>

        <h1 className="title-page mb-3">Backup your wallet</h1>
        <p className="text-[#94a3b8] text-[14px] font-medium mb-12">Write down these 12 words in order and keep them somewhere safe offline.</p>

        <div className="relative mb-12 group">
          <div className="grid grid-cols-3 gap-y-8 gap-x-12">
            {words.map((word, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-[#64748b] mono w-5 shrink-0 tabular">{i + 1}</span>
                <span className="font-semibold text-[#f8fafc] text-[15px] mono tracking-tight">{word}</span>
              </div>
            ))}
          </div>
          {!revealed && (
            <div className="absolute -inset-4 bg-transparent backdrop-blur-xl z-10 flex items-center justify-center rounded-xl">
               <button 
                 onClick={() => setRevealed(true)}
                 className="bg-transparent border border-[#6366f1] text-[#818cf8] px-8 h-10 rounded-lg font-semibold text-[13px] hover:bg-[#6366f1] hover:text-white transition-all cursor-pointer"
               >
                  Reveal Seed Phrase
               </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleCopyAll}
            className="w-full h-11 rounded-lg bg-[#111218] border border-[#1e2030] text-[#94a3b8] font-semibold text-[13px] uppercase tracking-widest cursor-pointer hover:border-[#6366f1] hover:text-[#f8fafc] transition-all flex items-center justify-center gap-3"
          >
            {copied ? <CheckCircle2 size={16} className="text-[#22c55e]" /> : <Copy size={16} />}
            {copied ? 'Copied to clipboard' : 'Copy all 12 words'}
          </button>
          <button
            onClick={onBack}
            className="w-full h-11 rounded-lg bg-[#6366f1] text-white font-semibold text-[14px] uppercase tracking-widest cursor-pointer hover:bg-[#4f46e5] transition-all border-none mt-2"
          >
            I have saved it
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
    }, 1200);
  };

  if (success) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-10 bg-[#0d0e14]">
        <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mb-8">
          <Check size={32} className="text-[#22c55e]" />
        </div>
        <h1 className="title-page mb-2">Wallet Connected</h1>
        <p className="text-[#94a3b8] font-medium text-[14px]">Trading Wallet has been successfully imported.</p>
      </div>
    );
  }

  return (
    <div className="text-[#f8fafc] min-h-full w-full py-16 px-5 flex flex-col items-center font-inter bg-[#0d0e14]">
      <div className="w-full max-w-[560px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#64748b] hover:text-[#f8fafc] cursor-pointer mb-12 transition-all font-semibold text-[13px] uppercase tracking-wider">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="title-page mb-2">Import Wallet</h1>
        <p className="text-[#94a3b8] mb-12 font-medium text-[14px]">Enter your 12 word seed phrase to connect an existing wallet</p>

        <div className="mb-4 text-[#64748b] text-[11px] font-semibold uppercase tracking-widest italic pl-1">Demo seed phrase pre-filled. Click Import to continue.</div>
        
        <div className="grid grid-cols-3 gap-3 mb-12">
          {DEMO_IMPORT.map((word, i) => (
            <div key={i} className="relative">
              <span className="absolute top-2 left-2.5 text-[9px] font-bold text-[#475569] mono tabular uppercase">{i + 1}</span>
              <div className="w-full h-11 rounded-lg bg-[#111218] border border-[#1e2030] flex items-center px-4 pt-1.5 text-[#f8fafc] font-semibold text-[14px] mono">{word}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full h-11 rounded-lg font-bold text-[14px] transition-all flex items-center justify-center gap-4 border-none bg-[#6366f1] text-white cursor-pointer hover:bg-[#4f46e5]"
        >
          {loading ? <Spinner size={18} color="#fff" /> : "Verify and Import"}
        </button>
      </div>
    </div>
  );
}

function SendView({ onBack }: { onBack: () => void }) {
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
    }, 1800);
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-[#0d0e14]/90 fixed inset-0 z-[1000] flex flex-col items-center justify-center text-center backdrop-blur-sm">
        <Spinner size={32} color="#6366f1" className="mb-8" />
        <h2 className="text-xl font-bold text-[#f8fafc] mb-2 uppercase tracking-widest">Broadcasting</h2>
        <p className="text-[#94a3b8] font-medium text-[14px]">Processing your transaction on Ethereum Mainnet...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-10 bg-[#0d0e14]">
        <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mb-8">
          <Check size={32} className="text-[#22c55e]" />
        </div>
        <h1 className="title-page mb-2">Transaction Sent</h1>
        <p className="text-[#94a3b8] font-medium text-[14px]">Your funds are on the way!</p>
      </div>
    );
  }

  return (
    <div className="text-[#f8fafc] min-h-full w-full py-16 px-5 flex flex-col items-center font-inter bg-[#0d0e14]">
      <div className="w-full max-w-[500px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#64748b] hover:text-[#f8fafc] cursor-pointer mb-12 transition-all font-semibold text-[13px] uppercase tracking-wider">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="title-page mb-10">Send Crypto</h1>

        <div className="space-y-6">
          <div>
            <label className="text-label text-[#64748b] block mb-2 px-1">Network</label>
            <div className="h-12 rounded-lg bg-[#111218] border border-[#1e2030] flex items-center px-4 gap-3 hover:bg-[#161720] transition-colors cursor-pointer group">
              <div className="w-5 h-5 rounded-full bg-[#627eea] flex items-center justify-center text-[10px] font-black text-white italic">Ξ</div>
              <span className="flex-1 font-semibold text-[13px] text-[#f8fafc]">Ethereum Mainnet</span>
              <ChevronRight size={16} className="text-[#475569] group-hover:text-[#64748b]" />
            </div>
          </div>

          <div>
            <label className="text-label text-[#64748b] block mb-2 px-1">Recipient Address</label>
            <input
              placeholder="0x... or .eth name"
              className="w-full h-12 rounded-lg bg-[#111218] border border-[#1e2030] px-4 text-[#f8fafc] font-semibold text-[14px] outline-none focus:border-[#6366f1] transition-all placeholder:text-[#374151]"
            />
          </div>

          <div>
            <label className="text-label text-[#64748b] block mb-2 px-1">Amount</label>
            <div className="relative">
              <input
                placeholder="0.0"
                className="w-full h-12 rounded-lg bg-[#111218] border border-[#1e2030] pl-4 pr-16 text-[#f8fafc] font-bold text-xl outline-none focus:border-[#6366f1] transition-all placeholder:text-[#374151] tabular"
              />
              <div className="absolute right-4 top-3 font-bold text-[#6366f1] text-sm">ETH</div>
            </div>
            <div className="flex justify-between mt-2.5 text-[11px] font-semibold text-[#475569] px-1 uppercase tracking-wider tabular">
              <span>Balance: {activeAccount.balance_eth} ETH</span>
              <span>≈ ${(activeAccount.balance_usd || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-6 bg-[#111218] border border-[#1e2030] rounded-xl space-y-4">
             <div className="flex justify-between items-center text-[12px] font-medium text-[#64748b]">
                <span>ESTIMATED FEE</span>
                <span className="text-[#f8fafc] font-semibold tabular">$1.03</span>
             </div>
             <div className="h-px bg-[#161720]" />
             <div className="flex justify-between items-center text-[12px] font-medium text-[#64748b]">
                <span>WEB3 SCORE</span>
                <div className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
                   <span className="text-[#22c55e] font-bold tracking-widest">TRUSTLESS</span>
                </div>
             </div>
          </div>

          <button
            onClick={handleSend}
            className="h-11 rounded-lg bg-[#6366f1] text-white border-none font-bold text-[14px] uppercase tracking-widest cursor-pointer hover:bg-[#4f46e5] active:scale-[0.98] transition-all mt-4 w-full"
          >
            Confirm and Send
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
    const timer = setTimeout(() => setGenerating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-[#f8fafc] min-h-full w-full py-16 px-5 flex flex-col items-center font-inter text-center bg-[#0d0e14]">
      <div className="w-full max-w-[440px]">
        <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-[#64748b] hover:text-[#f8fafc] cursor-pointer mb-12 transition-all font-semibold text-[13px] uppercase tracking-wider mx-auto">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="title-page mb-2">Receive Crypto</h1>
        <p className="text-[#94a3b8] mb-12 font-medium text-[14px]">Your Ethereum wallet address</p>

        <div className="bg-white p-6 rounded-2xl inline-block mb-12 shadow-sm relative min-w-[240px] min-h-[240px]">
          {generating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size={24} color="#6366f1" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-black flex flex-wrap p-1">
              {Array.from({ length: 484 }).map((_, i) => (
                <div key={i} className="w-[10px] h-[10px]" style={{ background: Math.random() > 0.5 ? '#fff' : '#000' }} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-4 flex items-center gap-4 mb-10 shadow-sm">
           <span className="flex-1 text-[12px] text-[#f8fafc] mono font-medium break-all">{address}</span>
           <button onClick={handleCopy} className="bg-[#1e2030] border border-[#1e2030] rounded-lg h-9 px-4 text-[#f8fafc] text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:border-[#6366f1] transition-all active:scale-95">
             {copied ? 'Copied' : 'Copy'}
           </button>
        </div>

        <div className="border-l-3 border-[#6366f1]/40 p-4 text-left items-start">
           <p className="text-[12px] text-[#64748b] font-medium leading-relaxed m-0 uppercase tracking-tight">
             Only send compatible tokens to this address. Sending unsupported tokens may result in permanent loss.
           </p>
        </div>
      </div>
    </div>
  );
}
