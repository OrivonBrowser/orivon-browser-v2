import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, ArrowRight, Command, Cpu, Layers } from 'lucide-react';
import { WalletAddresses } from '../types';

interface OnboardingProps {
  onFinish: (addresses: WalletAddresses) => void;
  seed: string;
}

export default function Onboarding({ onFinish, seed }: OnboardingProps) {
  const [step, setStep] = useState<'INITIAL' | 'SEED' | 'IMPORT' | 'DERIVED'>('INITIAL');
  const [password, setPassword] = useState('');
  const [importPhrase, setImportPhrase] = useState('');

  const deriveAddresses = (): WalletAddresses => {
    return {
      btc: `bc1q${Math.random().toString(36).substring(2, 15)}`,
      eth: `0x${Math.random().toString(16).substring(2, 42)}`,
      sol: `SOL${Math.random().toString(36).substring(2, 32)}`,
    };
  };

  const [addresses, setAddresses] = useState<WalletAddresses | null>(null);

  const handleInitialize = () => {
    if (password.length < 4) return;
    const newAddresses = deriveAddresses();
    setAddresses(newAddresses);
    setStep('DERIVED');
  };

  const handleImport = () => {
    if (importPhrase.trim().split(/\s+/).length >= 12 && password.length >= 4) {
      handleInitialize();
    }
  };

  return (
    <div className="relative h-full w-full bg-[#050505] flex flex-col items-center justify-center overflow-hidden noise-bg font-sans">
      {/* Browser Chrome Header */}
      <div className="absolute top-0 left-0 w-full z-50">
        <div className="h-9 bg-[#121212] flex items-center px-4 gap-2 border-b border-white/5">
          <div className="flex gap-1.5 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80 border border-black/10"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80 border border-black/10"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80 border border-black/10"></div>
          </div>
          <div className="flex items-center gap-2 ml-3 h-7 bg-[#1e1e1e] px-4 rounded-t-lg border-x border-t border-white/5 min-w-[120px] shadow-sm">
            <div className="w-2 h-2 bg-orivon-accent rounded-[1px]"></div>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Orivon Shell</span>
          </div>
        </div>

        <div className="h-10 bg-[#1a1a1a] flex items-center px-5 gap-5 border-b border-white/5">
          <div className="flex gap-3 text-white/10">
            <ArrowRight size={12} className="rotate-180" />
            <ArrowRight size={12} />
            <Layers size={12} className="opacity-50" />
          </div>
          <div className="flex-1 h-6 bg-black/40 border border-white/5 rounded-full flex items-center px-4 gap-3">
             <div className="w-1 h-1 rounded-full bg-orivon-accent animate-pulse"></div>
             <span className="text-[9px] text-white/20 font-mono tracking-tight">orivon://gateway/protocol_initialization</span>
          </div>
          <div className="flex gap-4 items-center">
             <Shield size={12} className="text-orivon-accent opacity-50" />
             <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
               <span className="text-[6px] font-bold text-blue-400">B</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center pt-16 relative px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orivon-accent/[0.03] blur-[140px] pointer-events-none rounded-full"></div>

        <AnimatePresence mode="wait">
          {step === 'INITIAL' && (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center space-y-10 z-10"
            >
              <div className="space-y-6 text-center max-w-lg">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-6xl md:text-8xl font-black text-white tracking-[0.2em] uppercase"
                >
                  ORIVON
                </motion.h1>
                <div className="space-y-3">
                  <p className="text-white/80 text-base font-medium tracking-tight">
                    The Decentralized Operating Layer.
                  </p>
                  <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-bold leading-relaxed max-w-sm mx-auto">
                    Zero middlemen // Peer-to-peer distribution <br/>
                    Isolated WASM runtime protocols.
                  </p>
                </div>
              </div>

              {/* Compact Interaction Hub */}
              <div className="w-full max-w-[320px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2rem] p-3 shadow-2xl flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button 
                    onClick={() => setStep('SEED')}
                    className="flex flex-col items-center justify-center gap-2 py-8 border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10 transition-all rounded-[1.5rem] group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <Shield size={14} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40 group-hover:text-white">Create Wallet</span>
                  </button>

                  <button 
                    onClick={() => setStep('IMPORT')}
                    className="flex flex-col items-center justify-center gap-2 py-8 border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10 transition-all rounded-[1.5rem] group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <Key size={14} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40 group-hover:text-white">Import Wallet</span>
                  </button>
                </div>

                <button 
                  onClick={() => onFinish(deriveAddresses())}
                  className="w-full h-16 bg-white text-black flex items-center justify-center gap-4 rounded-[1.5rem] hover:bg-orivon-accent transition-all active:scale-[0.98] group shadow-xl cursor-pointer"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Launch System</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex gap-8 font-mono text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">
                <div>Build 0.94.1</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-orivon-accent animate-pulse"></div>
                  P2P Node Active
                </div>
              </div>
            </motion.div>
          )}

          {step === 'SEED' && (
            <motion.div 
              key="seed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-[360px] w-full space-y-6 bg-white/[0.02] border border-white/5 backdrop-blur-3xl p-8 rounded-[2rem] z-10"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-black tracking-tighter text-white uppercase">Identity Seed</h2>
                <p className="text-white/30 text-[8px] uppercase tracking-widest font-bold">Physical backup mandatory</p>
              </div>
              
              <div className="grid grid-cols-3 gap-1 p-5 border border-white/5 bg-black/40 font-mono text-[8px] rounded-xl">
                {seed.split(' ').map((word, i) => (
                  <div key={i} className="flex gap-2 items-center py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/10 font-bold">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className="text-white/80">{word}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <input 
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Master Authorization Phrase"
                  onKeyDown={(e) => e.key === 'Enter' && handleInitialize()}
                  className="w-full bg-black/40 border border-white/5 px-5 py-4 rounded-xl focus:outline-none focus:border-white/20 transition-all font-mono text-[10px] text-white text-center placeholder:opacity-20"
                />
                <button 
                  onClick={handleInitialize}
                  disabled={password.length < 4}
                  className="btn-primary !p-4 rounded-xl w-full !text-[10px] cursor-pointer"
                >
                  Bind Identity Node
                </button>
                <button 
                  onClick={() => setStep('INITIAL')}
                  className="w-full text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all cursor-pointer"
                >
                  Cancel Initialization
                </button>
              </div>
            </motion.div>
          )}

          {step === 'IMPORT' && (
            <motion.div 
              key="import"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-[360px] w-full space-y-6 bg-white/[0.02] border border-white/5 backdrop-blur-3xl p-8 rounded-[2rem] z-10"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-black tracking-tighter text-white uppercase">Import Node</h2>
                <p className="text-white/30 text-[8px] uppercase tracking-widest font-bold">BIP-39 Mnemonic Phrase</p>
              </div>

              <div className="space-y-4">
                <textarea 
                  autoFocus
                  value={importPhrase}
                  onChange={(e) => setImportPhrase(e.target.value)}
                  placeholder="Enter your recovery phrase..."
                  className="w-full h-24 bg-black/40 border border-white/5 px-5 py-4 rounded-xl focus:outline-none focus:border-white/20 transition-all font-mono text-[10px] text-white resize-none placeholder:opacity-20 leading-relaxed"
                />
                
                <div className="space-y-2">
                   <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Master Password"
                    className="w-full bg-black/40 border border-white/5 px-5 py-4 rounded-xl focus:outline-none focus:border-white/20 transition-all font-mono text-[10px] text-white text-center placeholder:opacity-20"
                  />
                  <button 
                    onClick={handleImport}
                    disabled={importPhrase.trim().split(/\s+/).length < 12 || password.length < 4}
                    className="btn-primary !p-4 rounded-xl w-full !text-[10px] cursor-pointer"
                  >
                    Restore & Sync Node
                  </button>
                </div>
                
                <button 
                  onClick={() => setStep('INITIAL')}
                  className="w-full text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all cursor-pointer"
                >
                  Return to Gateway
                </button>
              </div>
            </motion.div>
          )}

          {step === 'DERIVED' && addresses && (
            <motion.div 
              key="derived"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[360px] w-full space-y-8 bg-white/[0.02] border border-white/5 backdrop-blur-3xl p-8 rounded-[2rem] z-10"
            >
              <div className="space-y-1.5 text-center">
                <h2 className="text-xl font-black tracking-tighter text-white uppercase">Node Bindings</h2>
                <p className="text-white/30 text-[8px] font-bold uppercase tracking-[0.2em]">Synchronization Successful</p>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: 'BTC_CORE', val: addresses.btc, color: 'text-orivon-accent' },
                  { label: 'ETH_EVM', val: addresses.eth, color: 'text-orivon-blue' },
                  { label: 'SOL_NET', val: addresses.sol, color: 'text-white' }
                ].map(addr => (
                  <div key={addr.label} className="p-4 border border-white/5 bg-black/40 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all shadow-inner">
                    <div className="space-y-1 flex-1">
                      <div className="text-[7px] font-mono font-bold text-white/20 uppercase tracking-[0.2em]">{addr.label}</div>
                      <div className={`text-[9px] break-all font-mono opacity-60 ${addr.color}`}>{addr.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onFinish(addresses)}
                className="btn-primary w-full !p-5 rounded-xl shadow-xl !text-[10px] cursor-pointer"
              >
                Enter Sovereign Shell
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 right-8 flex gap-8 opacity-20 pointer-events-none">
        <div className="text-[7px] font-mono text-white/50 uppercase tracking-[0.6em] font-black">Secure_Protocol_Node: v0.94-Active</div>
      </div>
    </div>
  );
}
