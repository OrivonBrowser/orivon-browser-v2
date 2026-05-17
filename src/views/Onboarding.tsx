import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, ArrowRight, Command, Cpu, Layers, Sun, Moon } from 'lucide-react';
import { WalletAddresses } from '../types';

interface OnboardingProps {
  onFinish: (addresses: WalletAddresses) => void;
  seed: string;
}

export default function Onboarding({ onFinish, seed }: OnboardingProps) {
  const [step, setStep] = useState<'INITIAL' | 'SEED' | 'IMPORT' | 'DERIVED'>('INITIAL');
  const [password, setPassword] = useState('');
  const [importPhrase, setImportPhrase] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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

  const isDark = theme === 'dark';

  return (
    <div className={`relative h-full w-full flex flex-col items-center justify-center overflow-hidden noise-bg font-sans transition-colors duration-700 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
      {/* Browser Chrome Header */}
      <div className="absolute top-0 left-0 w-full z-50">
        <div className={`h-9 flex items-center px-4 gap-2 border-b transition-colors duration-500 ${isDark ? 'bg-[#121212] border-white/5' : 'bg-[#eeeeee] border-black/5'}`}>
          <div className="flex gap-1.5 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80 border border-black/10"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80 border border-black/10"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80 border border-black/10"></div>
          </div>
          <div className={`flex items-center gap-2 ml-3 h-7 px-4 rounded-t-lg border-x border-t min-w-[120px] shadow-sm transition-colors duration-500 ${isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-black/5'}`}>
            <div className="w-2 h-2 bg-orivon-accent rounded-[1px]"></div>
            <span className={`text-[9px] font-black uppercase tracking-tighter ${isDark ? 'text-white/40' : 'text-black/40'}`}>Orivon Shell</span>
          </div>
        </div>

        <div className={`h-10 flex items-center px-5 gap-5 border-b transition-colors duration-500 ${isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-[#f0f0f0] border-black/5'}`}>
          <div className={`flex gap-3 ${isDark ? 'text-white/10' : 'text-black/10'}`}>
            <ArrowRight size={12} className="rotate-180" />
            <ArrowRight size={12} />
            <Layers size={12} className="opacity-50" />
          </div>
          <div className={`flex-1 h-6 border rounded-full flex items-center px-4 gap-3 transition-colors duration-500 ${isDark ? 'bg-black/40 border-white/5' : 'bg-white/60 border-black/5'}`}>
             <div className="w-1 h-1 rounded-full bg-orivon-accent animate-pulse"></div>
             <span className={`text-[9px] font-mono tracking-tight ${isDark ? 'text-white/20' : 'text-black/20'}`}>orivon://gateway/protocol_initialization</span>
          </div>
          <div className="flex gap-4 items-center">
             <Shield size={12} className={`text-orivon-accent ${isDark ? 'opacity-50' : 'opacity-80'}`} />
             <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors duration-500 ${isDark ? 'bg-blue-500/20 border-blue-500/40' : 'bg-blue-500/10 border-blue-500/20'}`}>
               <span className="text-[6px] font-bold text-blue-400">B</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center pt-16 relative px-6">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[140px] pointer-events-none rounded-full transition-colors duration-1000 ${isDark ? 'bg-orivon-accent/[0.03]' : 'bg-orivon-accent/[0.08]'}`}></div>

        <AnimatePresence mode="wait">
          {step === 'INITIAL' && (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center space-y-10 z-10"
            >
              <div className="space-y-8 text-center max-w-lg">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-7xl md:text-9xl font-black tracking-[0.15em] uppercase transition-colors duration-500 ${isDark ? 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'text-black drop-shadow-[0_0_30px_rgba(0,0,0,0.05)]'}`}
                >
                  ORIVON
                </motion.h1>
                <div className="space-y-5">
                  <p className={`text-xl font-bold tracking-tight transition-colors duration-500 ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                    The Decentralized Operating Layer.
                  </p>
                  <div className="space-y-1.5">
                    <p className={`text-[9px] uppercase tracking-[0.5em] font-black leading-relaxed transition-colors duration-500 ${isDark ? 'text-white/20' : 'text-black/20'}`}>
                      Zero middlemen <span className="opacity-30 px-1">//</span> Peer-to-peer distribution
                    </p>
                    <p className={`text-[9px] uppercase tracking-[0.5em] font-black leading-relaxed transition-colors duration-500 ${isDark ? 'text-white/20' : 'text-black/20'}`}>
                      Isolated WASM runtime protocols.
                    </p>
                  </div>
                </div>
              </div>

              {/* Compact Interaction Hub */}
              <div className={`w-full max-w-[320px] backdrop-blur-3xl rounded-[2rem] p-3 shadow-2xl flex flex-col gap-1.5 border transition-all duration-500 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5 shadow-xl'}`}>
                <div className="grid grid-cols-2 gap-1.5">
                  <button 
                    onClick={() => setStep('SEED')}
                    className={`flex flex-col items-center justify-center gap-2 py-8 border transition-all rounded-[1.5rem] group cursor-pointer ${isDark ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10' : 'border-black/5 bg-black/[0.01] hover:bg-black/[0.04] hover:border-black/10'}`}
                  >
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${isDark ? 'border-white/5 group-hover:bg-white group-hover:text-black' : 'border-black/10 group-hover:bg-black group-hover:text-white'}`}>
                      <Shield size={14} />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors ${isDark ? 'text-white/40 group-hover:text-white' : 'text-black/40 group-hover:text-black'}`}>Create Wallet</span>
                  </button>

                  <button 
                    onClick={() => setStep('IMPORT')}
                    className={`flex flex-col items-center justify-center gap-2 py-8 border transition-all rounded-[1.5rem] group cursor-pointer ${isDark ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10' : 'border-black/5 bg-black/[0.01] hover:bg-black/[0.04] hover:border-black/10'}`}
                  >
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${isDark ? 'border-white/5 group-hover:bg-white group-hover:text-black' : 'border-black/10 group-hover:bg-black group-hover:text-white'}`}>
                      <Key size={14} />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors ${isDark ? 'text-white/40 group-hover:text-white' : 'text-black/40 group-hover:text-black'}`}>Import Wallet</span>
                  </button>
                </div>

                <button 
                  onClick={() => onFinish(deriveAddresses())}
                  className={`w-full h-16 flex items-center justify-center gap-4 rounded-[1.5rem] transition-all active:scale-[0.98] group shadow-xl cursor-pointer ${isDark ? 'bg-white text-black hover:bg-orivon-accent' : 'bg-black text-white hover:bg-orivon-accent'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Launch System</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex gap-4 font-mono text-[7px] font-bold uppercase tracking-[0.2em]">
                <div className={`px-3 py-1.5 rounded-full border transition-colors duration-500 ${isDark ? 'bg-white/[0.03] border-white/5 text-white/30' : 'bg-black/[0.03] border-black/5 text-black/30'}`}>
                  Build 0.94.1
                </div>
                <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors duration-500 ${isDark ? 'bg-white/[0.03] border-white/5 text-white/40' : 'bg-black/[0.03] border-black/5 text-black/40'}`}>
                  <div className="w-1 h-1 rounded-full bg-orivon-accent animate-pulse shadow-[0_0_8px_rgba(255,165,0,0.4)]"></div>
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
              className={`max-w-[360px] w-full space-y-6 backdrop-blur-3xl p-8 rounded-[2rem] z-10 border transition-all duration-500 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}
            >
              <div className="space-y-2 text-center">
                <h2 className={`text-xl font-black tracking-tighter uppercase transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Identity Seed</h2>
                <p className={`text-[8px] uppercase tracking-widest font-bold transition-colors ${isDark ? 'text-white/30' : 'text-black/30'}`}>Physical backup mandatory</p>
              </div>
              
              <div className={`grid grid-cols-3 gap-1 p-5 border font-mono text-[8px] rounded-xl transition-all ${isDark ? 'border-white/5 bg-black/40' : 'border-black/5 bg-white/40'}`}>
                {seed.split(' ').map((word, i) => (
                  <div key={i} className={`flex gap-2 items-center py-1.5 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                    <span className={`font-bold ${isDark ? 'text-white/10' : 'text-black/10'}`}>{(i + 1).toString().padStart(2, '0')}</span>
                    <span className={isDark ? 'text-white/80' : 'text-black/80'}>{word}</span>
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
                  className={`w-full border px-5 py-4 rounded-xl focus:outline-none transition-all font-mono text-[10px] text-center placeholder:opacity-20 ${isDark ? 'bg-black/40 border-white/5 focus:border-white/20 text-white' : 'bg-white/40 border-black/5 focus:border-black/20 text-black'}`}
                />
                <button 
                  onClick={handleInitialize}
                  disabled={password.length < 4}
                  className={`btn-primary !p-4 rounded-xl w-full !text-[10px] cursor-pointer ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
                >
                  Bind Identity Node
                </button>
                <button 
                  onClick={() => setStep('INITIAL')}
                  className={`w-full text-[8px] font-bold uppercase tracking-[0.3em] transition-all cursor-pointer ${isDark ? 'text-white/20 hover:text-white' : 'text-black/20 hover:text-black'}`}
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
              className={`max-w-[360px] w-full space-y-6 backdrop-blur-3xl p-8 rounded-[2rem] z-10 border transition-all duration-500 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}
            >
              <div className="space-y-2 text-center">
                <h2 className={`text-xl font-black tracking-tighter uppercase transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Import Node</h2>
                <p className={`text-[8px] uppercase tracking-widest font-bold transition-colors ${isDark ? 'text-white/30' : 'text-black/30'}`}>BIP-39 Mnemonic Phrase</p>
              </div>

              <div className="space-y-4">
                <textarea 
                  autoFocus
                  value={importPhrase}
                  onChange={(e) => setImportPhrase(e.target.value)}
                  placeholder="Enter your recovery phrase..."
                  className={`w-full h-24 border px-5 py-4 rounded-xl focus:outline-none transition-all font-mono text-[10px] resize-none placeholder:opacity-20 leading-relaxed ${isDark ? 'bg-black/40 border-white/5 focus:border-white/20 text-white' : 'bg-white/40 border-black/5 focus:border-black/20 text-black'}`}
                />
                
                <div className="space-y-2">
                   <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Master Password"
                    className={`w-full border px-5 py-4 rounded-xl focus:outline-none transition-all font-mono text-[10px] text-center placeholder:opacity-20 ${isDark ? 'bg-black/40 border-white/5 focus:border-white/20 text-white' : 'bg-white/40 border-black/5 focus:border-black/20 text-black'}`}
                  />
                  <button 
                    onClick={handleImport}
                    disabled={importPhrase.trim().split(/\s+/).length < 12 || password.length < 4}
                    className={`btn-primary !p-4 rounded-xl w-full !text-[10px] cursor-pointer ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
                  >
                    Restore & Sync Node
                  </button>
                </div>
                
                <button 
                  onClick={() => setStep('INITIAL')}
                  className={`w-full text-[8px] font-bold uppercase tracking-[0.3em] transition-all cursor-pointer ${isDark ? 'text-white/20 hover:text-white' : 'text-black/20 hover:text-black'}`}
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
              className={`max-w-[360px] w-full space-y-8 backdrop-blur-3xl p-8 rounded-[2rem] z-10 border transition-all duration-500 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}
            >
              <div className="space-y-1.5 text-center">
                <h2 className={`text-xl font-black tracking-tighter uppercase transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Node Bindings</h2>
                <p className={`text-[8px] font-bold uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-white/30' : 'text-black/30'}`}>Synchronization Successful</p>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: 'BTC_CORE', val: addresses.btc, color: 'text-orivon-accent' },
                  { label: 'ETH_EVM', val: addresses.eth, color: 'text-orivon-blue' },
                  { label: 'SOL_NET', val: addresses.sol, color: isDark ? 'text-white' : 'text-black' }
                ].map(addr => (
                  <div key={addr.label} className={`p-4 border rounded-xl flex items-center justify-between group transition-all shadow-inner ${isDark ? 'border-white/5 bg-black/40 hover:border-white/10' : 'border-black/5 bg-white/40 hover:border-black/10'}`}>
                    <div className="space-y-1 flex-1">
                      <div className={`text-[7px] font-mono font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/20' : 'text-black/20'}`}>{addr.label}</div>
                      <div className={`text-[9px] break-all font-mono opacity-60 ${addr.color}`}>{addr.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onFinish(addresses)}
                className={`btn-primary w-full !p-5 rounded-xl shadow-xl !text-[10px] cursor-pointer ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
              >
                Enter Sovereign Shell
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme Toggle - Bottom Left */}
      <div className="absolute bottom-6 left-8 z-50">
        <button 
          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          className={`group relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-500 cursor-pointer overflow-hidden ${isDark ? 'bg-[#121212] border-white/10 hover:border-white/30' : 'bg-[#eeeeee] border-black/10 hover:border-black/30'}`}
        >
          <motion.div
            animate={{ 
              y: isDark ? 0 : 40,
              opacity: isDark ? 1 : 0,
              scale: isDark ? 1 : 0.5
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute"
          >
            <Moon size={16} className="text-white" />
          </motion.div>
          <motion.div
            animate={{ 
              y: isDark ? -40 : 0,
              opacity: isDark ? 0 : 1,
              scale: isDark ? 0.5 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute"
          >
            <Sun size={16} className="text-black" />
          </motion.div>
        </button>
      </div>

      <div className={`absolute bottom-6 right-8 flex gap-8 opacity-20 pointer-events-none transition-colors duration-500 ${isDark ? 'text-white' : 'text-black'}`}>
        <div className="text-[7px] font-mono uppercase tracking-[0.6em] font-black">Secure_Protocol_Node: v0.94-Active</div>
      </div>
    </div>
  );
}
