import { useState } from 'react';
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
  Cpu
} from 'lucide-react';

interface BrowserModeProps {
  url: string;
  onExit: () => void;
}

export default function BrowserMode({ url, onExit }: BrowserModeProps) {
  const [showTrustScore, setShowTrustScore] = useState(false);
  const [showWalletDrawer, setShowWalletDrawer] = useState(false);
  const [password, setPassword] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleConnect = () => {
    if (password.length > 0) {
      setIsAuthorizing(true);
      setTimeout(() => {
        setIsAuthorizing(false);
        setWalletConnected(true);
        setShowWalletDrawer(false);
      }, 1000);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-black">
      {/* OS Bar - Sophisticated Chrome */}
      <div className="h-10 border-b border-orivon-border px-4 flex items-center justify-between text-[9px] font-bold text-orivon-muted uppercase tracking-widest bg-black">
        <div className="flex items-center gap-4">
          <div className="text-white">Orivon Runtime</div>
          <div className="w-[1px] h-3 bg-orivon-border"></div>
          <div>Port_3000 // Secured</div>
        </div>
        <div className="flex gap-4">
          <div>Memory: 142MB</div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orivon-accent"></span>
            Thread_0 active
          </div>
        </div>
      </div>

      {/* Browser Chrome */}
      <div className="h-16 nav-blur flex items-center px-6 gap-6 z-40">
        <div className="flex items-center gap-2">
          <button 
            onClick={onExit}
            className="w-10 h-10 border border-orivon-border flex items-center justify-center hover:border-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <button className="w-10 h-10 border border-orivon-border flex items-center justify-center opacity-20 cursor-not-allowed">
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="flex-1 max-w-4xl relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
             <Lock size={12} className="text-orivon-accent" />
             <div className="text-[9px] font-mono font-bold text-orivon-accent border border-orivon-accent/30 px-1.5 rounded-[1px]">P2P</div>
          </div>
          <div className="w-full h-11 bg-white/5 border border-orivon-border px-16 flex items-center text-xs font-mono text-white/80 group-focus-within:border-white/40 transition-all">
            {url || 'shell:root'}
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
             <RotateCcw size={14} className="text-orivon-muted hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowTrustScore(!showTrustScore)}
              className="px-4 py-2 border border-orivon-border bg-white/5 flex items-center gap-3 hover:border-white transition-all"
            >
              <ShieldCheck size={14} className="text-orivon-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest">98% SCR</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${showTrustScore ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showTrustScore && (
                <motion.div 
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  className="absolute top-full right-0 mt-1 w-64 web3-card p-6 shadow-2xl origin-top z-50 bg-black/95 backdrop-blur-xl"
                >
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold text-orivon-muted uppercase tracking-[0.2em] border-b border-orivon-border pb-2">Verification Registry</div>
                    {[
                      { label: 'Origin_Signature', value: 'VALIDATED', color: 'text-orivon-accent' },
                      { label: 'Contract_Audit', value: 'PASSED', color: 'text-orivon-blue' },
                      { label: 'Network_Lag', value: '1.2ms', color: 'text-white' }
                    ].map(m => (
                      <div key={m.label} className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-orivon-muted">{m.label}</span>
                        <span className={`font-bold ${m.color}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="w-10 h-10 border border-orivon-border flex items-center justify-center hover:border-white transition-all">
             <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Viewport Frame */}
      <div className="flex-1 p-8 grid-bg relative overflow-hidden flex flex-col">
        {/* Connection Success Notification */}
        <AnimatePresence>
          {walletConnected && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className="bg-orivon-accent text-black px-8 py-3 font-bold tracking-widest text-[10px] uppercase shadow-[0_0_40px_rgba(0,255,135,0.3)] flex items-center gap-3">
                <CheckCircle2 size={16} />
                Protocol Auth Success: Node_72
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 web3-card bg-black flex flex-col relative overflow-hidden group/viewport">
          {/* Subtle Frame Overlays */}
          <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-white/5 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-white/5 pointer-events-none"></div>

          {/* Uniswap Interaction Mock */}
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[radial-gradient(circle_at_40%_20%,rgba(0,209,255,0.05)_0%,transparent_50%)]">
            
            <div className="w-full max-w-lg bg-[#050505] border border-orivon-border overflow-hidden">
               {/* App Header */}
               <div className="px-8 py-6 border-b border-orivon-border flex justify-between items-center bg-white/[0.02]">
                  <div className="text-sm font-bold uppercase tracking-tight">Swap Interface</div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-orivon-accent"></div>
                    <div className="text-[9px] font-mono font-bold text-orivon-muted uppercase">V3_STABLE</div>
                  </div>
               </div>

               <div className="p-8 space-y-6">
                  {/* Swapper */}
                  <div className="space-y-4">
                    <div className="p-6 bg-orivon-surface border border-orivon-border hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-orivon-muted uppercase tracking-widest">
                        <span>Input</span>
                        <span className="font-mono">BAL: 1.42 ETH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-4xl font-bold font-mono tracking-tighter">1.00</div>
                        <div className="flex items-center gap-3 px-4 py-2 border border-orivon-border bg-black font-bold text-xs uppercase">
                           <div className="w-4 h-4 rounded-full bg-orivon-blue"></div>
                           ETH
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center -my-6 z-10 relative">
                      <div className="w-10 h-10 bg-black border border-orivon-border flex items-center justify-center rotate-45">
                        <div className="-rotate-45">
                          <ChevronDown size={14} className="text-orivon-muted" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-orivon-surface border border-orivon-border hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-orivon-muted uppercase tracking-widest">
                        <span>Output (Est.)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-4xl font-bold font-mono tracking-tighter text-white/50">3,200.41</div>
                        <div className="flex items-center gap-3 px-4 py-2 border border-orivon-border bg-black font-bold text-xs uppercase">
                           <div className="w-4 h-4 rounded-full bg-orivon-accent"></div>
                           ORV
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => !walletConnected && setShowWalletDrawer(true)}
                    className={`w-full py-6 font-bold uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-4 ${
                      walletConnected 
                        ? 'border border-orivon-accent/40 text-orivon-accent bg-orivon-accent/5' 
                        : 'bg-white text-black hover:bg-orivon-accent active:scale-[0.99]'
                    }`}
                  >
                    {walletConnected ? (
                      <>
                        <ShieldCheck size={18} />
                        Identity Link Active
                      </>
                    ) : (
                      <>
                        <Wallet size={18} />
                        Link Native Shell Identity
                      </>
                    )}
                  </button>
               </div>
            </div>
            
            <div className="mt-12 flex gap-12 font-mono text-[9px] font-bold text-orivon-muted uppercase tracking-widest">
               <div>ORACLE: VERIFIED</div>
               <div>LATENY: 0.8MS</div>
               <div>ISOLATION: FULL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Auth Drawer */}
      <AnimatePresence>
        {showWalletDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWalletDrawer(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full max-w-md bg-orivon-surface border-l border-orivon-border z-[70] shadow-2xl flex flex-col"
            >
              <div className="h-20 border-b border-orivon-border flex items-center justify-between px-10">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border border-white/20 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-orivon-accent" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white">Auth Request</div>
                </div>
                <button 
                  onClick={() => setShowWalletDrawer(false)}
                  className="w-10 h-10 border border-orivon-border flex items-center justify-center hover:border-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 p-10 space-y-12">
                <div className="space-y-4">
                   <div className="text-[9px] font-mono font-bold text-orivon-accent uppercase tracking-widest">Identity Bridge</div>
                   <h3 className="text-3xl font-bold tracking-tighter leading-tight">Authorize Protocol <br />Connection?</h3>
                   <p className="text-orivon-muted text-xs leading-relaxed max-w-xs font-medium">
                     You are granting <span className="text-white">uniswap.eth</span> access to your derived address context. Private keys remain in the hyper-isolated shell.
                   </p>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold text-orivon-muted uppercase tracking-[0.2em]">Verify Master Auth Phrase</label>
                      <input 
                        type="password"
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                        className="w-full bg-black border border-orivon-border px-6 py-5 focus:outline-none focus:border-white transition-all font-mono text-xs text-white"
                      />
                   </div>

                   <button 
                    onClick={handleConnect}
                    disabled={isAuthorizing || password.length === 0}
                    className="w-full btn-primary !py-6 text-xs"
                   >
                     {isAuthorizing ? (
                       <div className="w-4 h-4 border-2 border-black border-t-white rounded-full animate-spin"></div>
                     ) : (
                       "Authorize & Bind"
                     )}
                   </button>
                </div>

                <div className="p-6 bg-orivon-accent/5 border border-orivon-accent/10 rounded-[1px] space-y-3">
                   <div className="flex items-center gap-3">
                      <AlertCircle size={14} className="text-orivon-accent" />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-orivon-accent">Sandbox Integrity</div>
                   </div>
                   <p className="text-[9px] text-orivon-accent/60 font-mono leading-relaxed uppercase">
                     Session is running in kernel-isolation-mode. XJ-92 analyzer is monitoring all outbound packet entropy.
                   </p>
                </div>
              </div>

              <div className="p-10 border-t border-orivon-border flex items-center justify-between font-mono text-[8px] text-orivon-muted font-bold uppercase tracking-widest">
                <div>Kernel: 0.94-B</div>
                <div className="flex items-center gap-2">
                   <Cpu size={10} />
                   Secure_IO
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
