import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  ChevronDown, 
  Lock, 
  ExternalLink,
  Wallet,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Cpu,
  User,
  LogOut,
  Settings,
  Shield,
  Search
} from 'lucide-react';
import { AppState, WalletAddresses } from '../types';

interface BrowserModeProps {
  url: string;
  identity: AppState['identity'];
  onExit: () => void;
  onNavigate: (url: string) => void;
  onUnlock: () => void;
  onLock: () => void;
  onInitialize: (addresses: WalletAddresses) => void;
  seed: string;
}

export default function BrowserMode({ 
  url: initialUrl, 
  identity, 
  onExit, 
  onNavigate, 
  onUnlock, 
  onLock,
  onInitialize,
  seed
}: BrowserModeProps) {
  const [url, setUrl] = useState(initialUrl);
  const [displayUrl, setDisplayUrl] = useState(initialUrl);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [history, setHistory] = useState<string[]>(initialUrl ? [initialUrl] : []);
  const [historyIndex, setHistoryIndex] = useState(history.length - 1);

  const urlInputRef = useRef<HTMLInputElement>(null);

  const getWalletStatus = () => {
    if (!identity.isInitialized) return 'GUEST';
    if (identity.isLocked) return 'LOCKED';
    return 'UNLOCKED';
  };

  const status = getWalletStatus();

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = displayUrl.trim().toLowerCase();
    if (!target) return;

    if (target.endsWith('.eth')) {
      onNavigate(target);
    } else {
      setUrl(target);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), target]);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const handleCreateWallet = () => {
    if (password.length < 4) return;
    setIsAuthorizing(true);
    setTimeout(() => {
      onInitialize({
        btc: `bc1q${Math.random().toString(36).substring(2, 12)}`,
        eth: `0x${Math.random().toString(16).substring(2, 42)}`,
        sol: `SOL${Math.random().toString(36).substring(2, 22)}`,
      });
      setIsAuthorizing(false);
      setShowCreateModal(false);
    }, 1500);
  };

  const handleUnlock = () => {
    if (password.length < 4) return;
    setIsAuthorizing(true);
    setTimeout(() => {
      onUnlock();
      setIsAuthorizing(false);
      setPassword('');
      setShowWalletMenu(false);
    }, 1000);
  };

  return (
    <div className="h-full w-full flex flex-col bg-black text-white font-sans overflow-hidden">
      {/* Universal Browser Chrome */}
      <div className="h-16 border-b border-white/5 flex items-center px-6 gap-6 bg-[#0a0a0a] z-50">
        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (historyIndex > 0) {
                const prev = history[historyIndex - 1];
                setHistoryIndex(historyIndex - 1);
                setUrl(prev);
                setDisplayUrl(prev);
              } else {
                onExit();
              }
            }}
            className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all text-white/50 hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            disabled={historyIndex >= history.length - 1}
            onClick={() => {
              const next = history[historyIndex + 1];
              setHistoryIndex(historyIndex + 1);
              setUrl(next);
              setDisplayUrl(next);
            }}
            className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* URL Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 max-w-3xl relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/40 group-focus-within:text-orivon-accent transition-colors">
            {url.endsWith('.eth') ? <Lock size={12} className="text-orivon-accent" /> : <Search size={12} />}
          </div>
          <input 
            ref={urlInputRef}
            type="text"
            value={displayUrl}
            onChange={(e) => setDisplayUrl(e.target.value)}
            placeholder="Search or enter decentralized protocol path..."
            className="w-full h-11 bg-white/[0.03] border border-white/5 rounded-2xl px-12 text-sm font-mono focus:outline-none focus:border-orivon-accent/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <RotateCcw size={14} className="text-white/20 hover:text-white transition-colors cursor-pointer" onClick={() => setUrl(url)} />
          </div>
        </form>

        {/* Identity Widget */}
        <div className="flex items-center gap-4">
           <button 
             onClick={onExit}
             className="w-10 h-10 rounded-xl bg-gradient-to-br from-orivon-accent to-orivon-blue p-px shadow-lg shadow-orivon-accent/10 hover:scale-105 active:scale-95 transition-all"
             title="Return to Dashboard"
           >
             <div className="w-full h-full bg-[#0c0c0c] rounded-[10px] flex items-center justify-center overflow-hidden">
                <User size={18} className="text-orivon-accent" />
             </div>
           </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden bg-[#050505] flex flex-col">
        <div className="flex-1 p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={url}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full rounded-[2rem] border border-white/5 bg-black overflow-hidden flex flex-col relative shadow-2xl"
            >
              <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none"></div>
              
              {/* Content Mockup */}
              <div className="flex-1 overflow-y-auto p-12 relative z-10 custom-scrollbar">
                {url.endsWith('.eth') ? (
                  <div className="max-w-4xl mx-auto space-y-16">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-orivon-accent rounded-3xl flex items-center justify-center text-black">
                              <Shield size={32} />
                           </div>
                           <div className="space-y-1">
                              <h1 className="text-4xl font-black tracking-tight uppercase">{url.replace('.eth', '').toUpperCase()} PROXY</h1>
                              <p className="text-orivon-accent text-[10px] font-mono font-bold tracking-[0.3em] uppercase">P2P Kernel Node Enabled</p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-mono text-[10px] text-white/40">v2.4.1_WASM</div>
                           <div className="px-4 py-2 bg-orivon-accent/10 border border-orivon-accent/30 rounded-xl font-mono text-[10px] text-orivon-accent">SECURE_TUNNEL</div>
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-6">
                        {[
                          { label: 'Total Volume', value: '$142.1M', change: '+2.4%' },
                          { label: 'Network TVL', value: '$8.4B', change: '+0.8%' },
                          { label: 'Active Users', value: '7,412', change: '+12.5%' }
                        ].map(stat => (
                          <div key={stat.label} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-white/10 transition-all group">
                             <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{stat.label}</div>
                             <div className="flex items-baseline gap-3">
                                <div className="text-2xl font-black">{stat.value}</div>
                                <div className="text-[10px] font-bold text-orivon-accent">{stat.change}</div>
                             </div>
                             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '60%' }}
                                  className="h-full bg-orivon-accent"
                                />
                             </div>
                          </div>
                        ))}
                     </div>

                     <div className="p-12 rounded-[3.5rem] bg-white/[0.01] border border-white/5 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="w-20 h-20 rounded-full border border-orivon-accent/20 flex items-center justify-center animate-pulse">
                           <Cpu size={32} className="text-orivon-accent" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-2xl font-black uppercase tracking-tight">Decentralized Execution Shell</h3>
                           <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                             This application is running locally within your kernel-isolated WASM runtime. No external servers are hosting this session.
                           </p>
                        </div>
                        <button className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orivon-accent transition-all active:scale-[0.98]">
                           Launch Protocol Application
                        </button>
                     </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto py-20 space-y-12">
                     <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-white/20 scale-110">
                           <Search size={40} />
                        </div>
                        <div className="space-y-4">
                           <h2 className="text-5xl font-black tracking-tighter uppercase whitespace-nowrap">Web2 Gateway Simulation</h2>
                           <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed font-medium">
                             Connected to <span className="text-white font-bold">{url || 'Orivon Index'}</span> via standard HTTP encapsulation. Protocol enforcement active.
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-48 rounded-3xl bg-white/[0.03] border border-white/5 p-8 flex flex-col justify-end space-y-3 group hover:border-white/10 transition-all cursor-pointer">
                             <div className="w-10 h-1 bg-white/10 rounded-full group-hover:bg-orivon-accent transition-colors"></div>
                             <div className="h-4 w-2/3 bg-white/5 rounded-md"></div>
                             <div className="h-3 w-1/2 bg-white/[0.02] rounded-md"></div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Browser Info Strip */}
        <div className="h-8 border-t border-white/5 bg-[#050505] flex items-center justify-between px-8 text-[8px] font-mono font-black uppercase tracking-[0.2em] text-white/20">
           <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-orivon-accent animate-pulse"></div>
                 Network_Status: High_Integrity
              </div>
              <div className="flex items-center gap-2">
                 <Cpu size={10} />
                 Isolation_Layer: Level_4
              </div>
           </div>
           <div>Session_Time: 14:22:04 // Orivon_Kernel_Active</div>
        </div>
      </div>

      {/* Create Wallet Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-orivon-accent/5 blur-[80px] pointer-events-none"></div>
              
              <div className="space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="space-y-3">
                       <div className="w-12 h-12 bg-orivon-accent/10 rounded-2xl flex items-center justify-center text-orivon-accent">
                          <ShieldCheck size={24} />
                       </div>
                       <h2 className="text-3xl font-black tracking-tight uppercase">Identity Initialization</h2>
                       <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Establish your kernel binding</p>
                    </div>
                    <button 
                      onClick={() => setShowCreateModal(false)}
                      className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all"
                    >
                      <X size={16} />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                       <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Protocol Recovery Phrase</div>
                       <div className="grid grid-cols-3 gap-2">
                          {seed.split(' ').slice(0, 6).map((w, i) => (
                            <div key={i} className="text-[10px] font-mono text-white/60 bg-black/40 px-3 py-2 border border-white/5 rounded-lg flex gap-2">
                               <span className="opacity-20">{i+1}</span>
                               <span className="font-bold">{w}</span>
                            </div>
                          ))}
                       </div>
                       <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest text-center mt-2 italic">Seed is locally encrypted & transient</p>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Master Access Phrase</label>
                          <input 
                            type="password"
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter 4+ characters..."
                            className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-xl focus:outline-none focus:border-orivon-accent transition-all font-mono text-sm text-center"
                          />
                       </div>
                       <button 
                         disabled={isAuthorizing || password.length < 4}
                         onClick={handleCreateWallet}
                         className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orivon-accent transition-all active:scale-[0.98] shadow-xl"
                       >
                         {isAuthorizing ? 'Binding Node...' : 'Initialize Identity Protocol'}
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
