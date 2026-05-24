import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, ArrowDown, Settings, Info, Check, 
  ExternalLink, ArrowUpRight, Search, Zap, X, CheckCircle2
} from 'lucide-react';
import { DEMO_WALLET } from '../../constants';
import { DemoWatermark, IPFSBanner } from './DemoComponents';
import Spinner from '../../components/Spinner';

interface UniswapDemoProps {
  onRequestApproval: (details: any) => Promise<boolean>;
}

export default function UniswapDemo({ onRequestApproval }: UniswapDemoProps) {
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSwap = async () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    const approved = await onRequestApproval({
      type: 'Swap',
      from: '1 ETH',
      to: '3,201.83 USDC',
      fee: '~$2.14',
      score: 'Trustless'
    });

    if (approved) {
      setTxStatus('pending');
      setTimeout(() => setTxStatus('success'), 2000);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-[#0a0b12] flex flex-col items-center justify-center gap-4">
        <Spinner size={32} color="#6366f1" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6366f1] animate-pulse">Resolving uniswap.eth...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#0d0e14] text-[#f8fafc] font-inter overflow-hidden flex flex-col relative animate-fade">
      <IPFSBanner url="uniswap.eth" score="Trustless" />
      
      {/* Navbar */}
      <nav className="h-16 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-10">
          <div className="w-8 h-8 bg-[#ff007a] rounded-lg flex items-center justify-center font-bold text-white italic">U</div>
          <div className="flex items-center gap-8 text-[14px] font-semibold text-[#64748b]">
             <span className="text-[#f8fafc]">Swap</span>
             <span className="hover:text-[#f8fafc] transition-colors cursor-pointer">Tokens</span>
             <span className="hover:text-[#f8fafc] transition-colors cursor-pointer">NFTs</span>
             <span className="hover:text-[#f8fafc] transition-colors cursor-pointer">Pool</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-[#111218] border border-[#1e2030] rounded-lg px-3 py-1.5 flex items-center gap-2 text-[12px] font-semibold">
              <div className="w-4 h-4 rounded-full bg-[#627eea] flex items-center justify-center text-[8px]">Ξ</div>
              Ethereum
           </div>
           
           <div className="relative">
             <button 
               onClick={() => setWalletMenuOpen(!walletMenuOpen)}
               className="flex items-center gap-2 transition-all hover:text-[#6366f1] bg-transparent border-none cursor-pointer"
             >
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-[12px] font-semibold text-[#94a3b8]">Connected 0x71C7...976F</span>
                <ChevronDown size={14} className={`text-[#64748b] transition-transform ${walletMenuOpen ? 'rotate-180' : ''}`} />
             </button>

             <AnimatePresence>
               {walletMenuOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setWalletMenuOpen(false)} />
                   <motion.div 
                     initial={{ opacity: 0, y: 4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }}
                     className="absolute top-10 right-0 w-64 bg-[#111218] border border-[#1e2030] rounded-xl p-5 shadow-2xl z-50 overflow-hidden"
                   >
                      <div className="font-semibold text-[#f8fafc] text-[13px] mb-1">{DEMO_WALLET.name}</div>
                      <div className="text-[11px] mono text-[#475569] mb-4 break-all">{DEMO_WALLET.address}</div>
                      <div className="flex justify-between items-center mb-6 tabular">
                         <span className="text-label">ETH Balance</span>
                         <span className="text-[13px] font-bold text-[#f8fafc]">{DEMO_WALLET.balance_eth} ETH</span>
                      </div>
                      <div className="h-px bg-[#1e2030] mb-4" />
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[11px] font-semibold text-[#22c55e] uppercase tracking-wider">
                            <Check size={12} strokeWidth={4} /> No extension needed
                         </div>
                         <div className="flex items-center gap-2 text-[11px] font-semibold text-[#22c55e] uppercase tracking-wider">
                            <Check size={12} strokeWidth={4} /> Orivon connects natively
                         </div>
                      </div>
                   </motion.div>
                 </>
               )}
             </AnimatePresence>
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-24">
        <div className="w-[480px] bg-[#111218] border border-[#1e2030] rounded-xl p-2 shadow-sm">
          <div className="p-3 flex justify-between items-center mb-1">
             <div className="flex gap-6">
                <span className="text-[14px] font-semibold text-[#f8fafc] border-b-2 border-[#6366f1] pb-2">Swap</span>
                <span className="text-[14px] font-semibold text-[#64748b] hover:text-[#f8fafc] transition-colors cursor-pointer pb-2">Buy</span>
             </div>
             <Settings size={18} className="text-[#64748b] cursor-pointer" />
          </div>

          <div className="space-y-1">
            <div className="bg-[#161720] rounded-xl p-4 border border-transparent focus-within:border-[#1e2030]">
               <div className="flex justify-between items-center mb-2">
                  <input readOnly value="1" className="bg-transparent border-none outline-none text-[32px] font-bold text-[#f8fafc] w-2/3 tabular" />
                  <div className="bg-[#1e2030] border border-[#1e2030] rounded-lg px-3 py-1.5 flex items-center gap-2 font-bold text-[14px] cursor-pointer hover:bg-[#161720] transition-colors">
                     <div className="w-5 h-5 rounded-full bg-[#627eea] flex items-center justify-center text-[10px]">Ξ</div>
                     ETH <ChevronDown size={16} />
                  </div>
               </div>
               <div className="text-[12px] font-medium text-[#64748b] tabular">
                  $3,218.40 <span className="ml-2 font-bold text-[#6366f1] cursor-pointer hover:underline">Max</span>
               </div>
            </div>

            <div className="flex justify-center -my-3.5 relative z-10">
               <div className="w-9 h-9 bg-[#111218] border-4 border-[#111218] rounded-lg flex items-center justify-center text-[#64748b] cursor-pointer hover:text-[#f8fafc] transition-all shadow-sm">
                  <ArrowDown size={16} strokeWidth={2.5} />
               </div>
            </div>

            <div className="bg-[#161720] rounded-xl p-4 border border-transparent focus-within:border-[#1e2030]">
               <div className="flex justify-between items-center mb-2">
                  <input readOnly value="3,201.83" className="bg-transparent border-none outline-none text-[32px] font-bold text-[#f8fafc] w-2/3 tabular" />
                  <div className="bg-[#ff007a]/10 border border-[#ff007a]/20 rounded-lg px-3 py-1.5 flex items-center gap-2 font-bold text-[14px] cursor-pointer hover:bg-[#ff007a]/20 transition-colors text-[#ff007a]">
                     <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] text-[#ff007a]">U</div>
                     USDC <ChevronDown size={16} />
                  </div>
               </div>
               <div className="text-[12px] font-medium text-[#64748b] tabular">$3,201.83</div>
            </div>
          </div>

          <div className="p-3">
             <button 
               onClick={handleSwap}
               className="w-full h-12 rounded-lg bg-[#6366f1] text-white font-bold text-[15px] hover:bg-[#4f46e5] transition-all cursor-pointer border-none shadow-sm"
             >
                Swap
             </button>
          </div>
          
          <div className="px-3 pb-3 text-[11px] font-semibold text-[#475569] space-y-2 uppercase tracking-wider tabular">
             <div className="flex justify-between tabular">
                <span>1 ETH = 3,201.83 USDC</span>
                <span className="flex items-center gap-1"><Zap size={10} className="text-[#6366f1]" /> $2.14</span>
             </div>
             <div className="flex justify-between">
                <span>Price impact</span>
                <span className="text-[#22c55e]">0.12%</span>
             </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
             <motion.div 
               initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
               className="w-[400px] bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden shadow-2xl"
             >
                <div className="p-6 border-b border-[#1e2030] flex justify-between items-center">
                   <h2 className="text-[14px] font-semibold uppercase tracking-widest text-[#f8fafc]">Confirm Swap</h2>
                   <X size={18} className="text-[#64748b] cursor-pointer hover:text-[#f8fafc]" onClick={() => setShowConfirm(false)} />
                </div>
                <div className="p-8 space-y-6">
                   <div className="flex justify-between items-center tabular">
                      <div className="flex flex-col">
                         <span className="text-label mb-1">Sending</span>
                         <span className="text-2xl font-bold">1.0000 ETH</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#627eea] flex items-center justify-center">Ξ</div>
                   </div>
                   <div className="flex justify-center -my-3">
                      <ArrowDown size={18} className="text-[#475569]" />
                   </div>
                   <div className="flex justify-between items-center tabular">
                      <div className="flex flex-col">
                         <span className="text-label mb-1">Receiving</span>
                         <span className="text-2xl font-bold text-[#f8fafc]">3,201.83 USDC</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#2775ca] flex items-center justify-center font-bold">U</div>
                   </div>

                   <div className="bg-[#161720] border border-[#1e2030] rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between text-[12px] font-medium text-[#64748b]">
                         <span>Signing with</span>
                         <span className="text-[#f8fafc] font-semibold flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#6366f1]" /> Orivon Wallet</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#22c55e]">
                         <span>No extension required</span>
                         <Check size={14} strokeWidth={4} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#22c55e]">
                         <span>Web3 Score: Trustless</span>
                         <Check size={14} strokeWidth={4} />
                      </div>
                   </div>

                   <button 
                     onClick={handleConfirm}
                     className="w-full h-12 rounded-lg bg-[#6366f1] text-white font-bold text-[15px] hover:bg-[#4f46e5] active:scale-[0.98] transition-all border-none cursor-pointer"
                   >
                      Confirm in Orivon Wallet
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Notifications */}
      <AnimatePresence>
        {txStatus !== 'idle' && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1100] min-w-[340px]"
          >
             <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-4 shadow-2xl flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txStatus === 'pending' ? 'bg-[#6366f1]/5' : 'bg-[#22c55e]/5'}`}>
                   {txStatus === 'pending' ? <Spinner size={20} color="#6366f1" /> : <CheckCircle2 size={20} className="text-[#22c55e]" />}
                </div>
                <div className="flex flex-col">
                   <span className="font-bold text-[#f8fafc] text-[13px]">
                      {txStatus === 'pending' ? 'Submitting Transaction' : 'Transaction Submitted'}
                   </span>
                   <span className="text-[11px] font-semibold text-[#64748b] flex items-center gap-1 cursor-pointer hover:text-[#f8fafc] transition-colors">
                      View on Etherscan <ExternalLink size={10} />
                   </span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DemoWatermark />
    </div>
  );
}
