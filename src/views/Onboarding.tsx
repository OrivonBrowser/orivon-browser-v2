import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, ArrowRight, Command, Cpu, Layers } from 'lucide-react';
import { WalletAddresses } from '../types';

interface OnboardingProps {
  onFinish: (addresses: WalletAddresses) => void;
  seed: string;
}

export default function Onboarding({ onFinish, seed }: OnboardingProps) {
  const [step, setStep] = useState<'INITIAL' | 'SEED' | 'DERIVED'>('INITIAL');
  const [password, setPassword] = useState('');

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

  return (
    <div className="relative h-full w-full bg-[#050505] flex flex-col items-center justify-center overflow-hidden noise-bg font-sans">
      {/* Browser Chrome Header */}
      <div className="absolute top-0 left-0 w-full z-50">
        <div className="h-10 bg-[#121212] flex items-center px-4 gap-2 border-b border-white/5">
          <div className="flex gap-1.5 px-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/10"></div>
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/10"></div>
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-black/10"></div>
          </div>
          <div className="flex items-center gap-2 ml-4 h-8 bg-[#1e1e1e] px-4 rounded-t-lg border-x border-t border-white/5 min-w-[140px] shadow-sm">
            <div className="w-2.5 h-2.5 bg-orivon-accent rounded-sm"></div>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-tight">Orivon Shell</span>
          </div>
          <div className="w-6 h-6 flex items-center justify-center text-white/10 hover:text-white/30 transition-colors cursor-pointer text-lg font-light">+</div>
        </div>

        <div className="h-11 bg-[#1a1a1a] flex items-center px-6 gap-6 border-b border-white/5">
          <div className="flex gap-4 text-white/20">
            <ArrowRight size={14} className="rotate-180 opacity-50" />
            <ArrowRight size={14} className="opacity-50" />
            <Layers size={14} className="opacity-30" />
          </div>
          <div className="flex-1 h-7 bg-black/40 border border-white/5 rounded-full flex items-center px-4 gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-orivon-accent animate-pulse"></div>
             <span className="text-[10px] text-white/30 font-mono tracking-tight">orivon://gateway/identity_init</span>
          </div>
          <div className="flex gap-4 items-center">
             <Shield size={13} className="text-orivon-accent opacity-80" />
             <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
               <span className="text-[7px] font-bold text-blue-400">B</span>
             </div>
          </div>
        </div>
      </div>

      {/* Hero Content Section */}
      <div className="flex-1 w-full flex flex-col items-center justify-center pt-20 relative px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-orivon-accent/[0.02] blur-[160px] pointer-events-none rounded-full"></div>

        <AnimatePresence mode="wait">
          {step === 'INITIAL' && (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center space-y-16 z-10"
            >
              <div className="space-y-8 text-center max-w-2xl">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                  className="text-7xl md:text-9xl font-black text-white tracking-[0.3em] uppercase drop-shadow-2xl"
                >
                  ORIVON
                </motion.h1>
                <div className="space-y-4">
                  <p className="text-white/70 text-xl font-medium tracking-tight">
                    Explore the possibilities of Orivon browser.
                  </p>
                  <p className="text-white/20 text-[10px] font-mono uppercase tracking-[0.5em] font-bold">
                    Direct P2P // Zero-Resolution Runtime
                  </p>
                </div>
              </div>

              {/* Minimal Decentralized Interaction Hub */}
              <div className="w-full max-w-md bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setStep('SEED')}
                    className="flex flex-col items-center justify-center gap-3 py-10 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all rounded-[2rem] group"
                  >
                    <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <Shield size={16} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Create Wallet</span>
                  </button>

                  <button className="flex flex-col items-center justify-center gap-3 py-10 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all rounded-[2rem] group opacity-30 hover:opacity-100">
                    <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <Key size={16} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Import Wallet</span>
                  </button>
                </div>

                <button 
                  onClick={() => onFinish(deriveAddresses())}
                  className="w-full h-20 bg-white text-black flex items-center justify-center gap-5 rounded-[2rem] hover:bg-orivon-accent transition-all active:scale-[0.98] group shadow-xl"
                >
                  <span className="text-xs font-black uppercase tracking-[0.4em]">Launch Browser</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex gap-10 font-mono text-[8px] font-bold text-white/10 uppercase tracking-[0.4em] pt-4">
                <div>Kernel_v0.94-Alpha</div>
                <div>Status: Ready</div>
              </div>
            </motion.div>
          )}

          {step === 'SEED' && (
            <motion.div 
              key="seed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full space-y-8 bg-white/[0.02] border border-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] z-10"
            >
              <div className="space-y-3 text-center">
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Identity Seed</h2>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Physical backup recommended.</p>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 p-6 border border-white/5 bg-black/40 font-mono text-[9px] rounded-2xl shadow-inner">
                {seed.split(' ').map((word, i) => (
                  <div key={i} className="flex gap-2 items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/20">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className="text-white font-bold">{word}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <input 
                    type="password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Master Auth Phrase"
                    onKeyDown={(e) => e.key === 'Enter' && handleInitialize()}
                    className="w-full bg-black/60 border border-white/10 px-6 py-5 rounded-2xl focus:outline-none focus:border-white transition-all font-mono text-xs text-white text-center shadow-2xl placeholder:opacity-20"
                  />
                </div>
                <div className="flex flex-col gap-3">
                   <button 
                    onClick={handleInitialize}
                    disabled={password.length < 4}
                    className="btn-primary !p-5 rounded-2xl w-full !text-[11px] shadow-lg"
                  >
                    Authorize & Bind Node
                  </button>
                  <button 
                    onClick={() => setStep('INITIAL')}
                    className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all py-2"
                   >
                     Go Back
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'DERIVED' && addresses && (
            <motion.div 
              key="derived"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full space-y-10 bg-white/[0.02] border border-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] z-10"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Layer-1 Bindings</h2>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em]">Protocol Integration Successful</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'BTC_SEGWIT', val: addresses.btc, color: 'text-orivon-accent' },
                  { label: 'ETH_EVM', val: addresses.eth, color: 'text-orivon-blue' },
                  { label: 'SOL_NET', val: addresses.sol, color: 'text-white' }
                ].map(addr => (
                  <div key={addr.label} className="p-5 border border-white/5 bg-black/40 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all shadow-inner">
                    <div className="space-y-1">
                      <div className="text-[8px] font-mono font-bold text-white/20 uppercase tracking-[0.3em]">{addr.label}</div>
                      <div className={`text-[10px] break-all font-mono opacity-80 ${addr.color}`}>{addr.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onFinish(addresses)}
                className="btn-primary w-full !p-6 rounded-2xl shadow-xl !text-[11px]"
              >
                Establish Runtime Shell
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 right-10 flex gap-10 opacity-10 pointer-events-none">
        <div className="text-[8px] font-mono text-white/50 uppercase tracking-[0.5em] font-bold">Encrypted_Runtime: Enabled</div>
      </div>
    </div>
  );
}
