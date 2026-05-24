import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, ArrowDown, Settings, Info, Check, 
  ExternalLink, ArrowUpRight, Search, Zap, X
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
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-[#ff007a]/20 border-t-[#ff007a]"
        />
        <span className="text-xs font-black uppercase tracking-widest text-[#ff007a] animate-pulse">Resolving uniswap.eth...</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#0a0b12] text-white font-inter overflow-hidden flex flex-col relative">
      <IPFSBanner url="uniswap.eth" score="Trustless" />
      
      {/* Navbar */}
      <nav className="h-16 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-8">
          <div className="w-8 h-8 bg-[#ff007a] rounded-xl flex items-center justify-center font-black text-white italic">U</div>
          <div className="flex items-center gap-6 text-[14px] font-bold text-gray-400">
             <span className="text-white">Swap</span>
             <span className="hover:text-white transition-colors cursor-pointer">Tokens</span>
             <span className="hover:text-white transition-colors cursor-pointer">NFTs</span>
             <span className="hover:text-white transition-colors cursor-pointer">Pool</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-[#13141f] border border-[#2d2e45] rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-bold">
              <div className="w-4 h-4 rounded-full bg-[#627eea] flex items-center justify-center text-[8px]">Ξ</div>
              Ethereum
           </div>
           
           <div className="relative">
             <button 
               onClick={() => setWalletMenuOpen(!walletMenuOpen)}
               className="bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] rounded-xl px-4 py-1.5 flex items-center gap-2 text-xs font-black transition-all hover:bg-[#22c55e]/20"
             >
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                Orivon Wallet Connected
                <ChevronDown size={14} className={walletMenuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
             </button>

             <AnimatePresence>
               {walletMenuOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setWalletMenuOpen(false)} />
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                     className="absolute top-10 right-0 w-64 bg-[#13141f] border border-[#2d2e45] rounded-2xl p-5 shadow-2xl z-50 overflow-hidden"
                   >
                      <div className="font-black text-white text-sm mb-1">{DEMO_WALLET.name}</div>
                      <div className="text-[10px] font-mono text-[#4b5563] mb-4 break-all">{DEMO_WALLET.address}</div>
                      <div className="flex justify-between items-center mb-6">
                         <span className="text-xs font-bold text-gray-400">ETH Balance</span>
                         <span className="text-sm font-black text-white">{DEMO_WALLET.balance_eth} ETH</span>
                      </div>
                      <div className="h-px bg-white/5 mb-4" />
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2 text-[10px] font-black text-[#22c55e] uppercase tracking-tighter">
                            <Check size={12} strokeWidth={4} /> No extension needed
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-[#22c55e] uppercase tracking-tighter">
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
      <main className="flex-1 flex flex-col items-center pt-20">
        <div className="w-[480px] bg-[#13141f] border border-[#2d2e45] rounded-[24px] p-2 shadow-2xl">
          <div className="p-3 flex justify-between items-center mb-1">
             <div className="flex gap-4">
                <span className="text-[14px] font-bold text-white border-b-2 border-white pb-1">Swap</span>
                <span className="text-[14px] font-bold text-gray-500 hover:text-white transition-colors cursor-pointer">Buy</span>
             </div>
             <Settings size={18} className="text-gray-500 cursor-pointer" />
          </div>

          <div className="space-y-1">
            <div className="bg-[#1a1b26] rounded-2xl p-4 border border-transparent focus-within:border-[#2d2e45]">
               <div className="flex justify-between items-center mb-2">
                  <input readOnly value="1" className="bg-transparent border-none outline-none text-3xl font-black text-white w-2/3" />
                  <div className="bg-[#13141f] border border-[#2d2e45] rounded-full px-3 py-1.5 flex items-center gap-2 font-black text-sm cursor-pointer hover:bg-[#1e1f2e]">
                     <div className="w-5 h-5 rounded-full bg-[#627eea] flex items-center justify-center text-[10px]">Ξ</div>
                     ETH <ChevronDown size={16} />
                  </div>
               </div>
               <div className="text-[11px] font-bold text-gray-500">
                  $3,218.40 <span className="ml-2 font-black text-[#6366f1]">Max</span>
               </div>
            </div>

            <div className="flex justify-center -my-2.5 relative z-10">
               <div className="w-10 h-10 bg-[#13141f] border-4 border-[#13141f] rounded-xl flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-lg">
                  <ArrowDown size={18} />
               </div>
            </div>

            <div className="bg-[#1a1b26] rounded-2xl p-4 border border-transparent focus-within:border-[#2d2e45]">
               <div className="flex justify-between items-center mb-2">
                  <input readOnly value="3,201.83" className="bg-transparent border-none outline-none text-3xl font-black text-white w-2/3" />
                  <div className="bg-[#ff007a] rounded-full px-3 py-1.5 flex items-center gap-2 font-black text-sm cursor-pointer hover:brightness-110">
                     <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] text-[#ff007a]">U</div>
                     USDC <ChevronDown size={16} />
                  </div>
               </div>
               <div className="text-[11px] font-bold text-gray-500">$3,201.83</div>
            </div>
          </div>

          <div className="p-3">
             <button 
               onClick={handleSwap}
               className="w-full h-14 rounded-2xl bg-[#ff007a]/10 text-[#ff007a] font-black text-lg hover:bg-[#ff007a]/20 transition-all cursor-pointer uppercase tracking-widest border border-[#ff007a]/20"
             >
                Swap
             </button>
          </div>
          
          <div className="p-3 text-[11px] font-bold text-gray-500 space-y-1.5">
             <div className="flex justify-between">
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
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="w-[420px] bg-[#13141f] border border-[#2d2e45] rounded-[32px] overflow-hidden shadow-2xl"
             >
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                   <h2 className="text-lg font-black uppercase tracking-wider">Confirm Swap</h2>
                   <X size={20} className="text-gray-500 cursor-pointer" onClick={() => setShowConfirm(false)} />
                </div>
                <div className="p-8 space-y-6">
                   <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Sending</span>
                         <span className="text-2xl font-black">1.0000 ETH</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#627eea] flex items-center justify-center">Ξ</div>
                   </div>
                   <div className="flex justify-center -my-3">
                      <ArrowDown size={20} className="text-gray-600" />
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Receiving</span>
                         <span className="text-2xl font-black text-white">3,201.83 USDC</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#2775ca] flex items-center justify-center font-black">U</div>
                   </div>

                   <div className="bg-[#1a1b26] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                         <span>Signing with</span>
                         <span className="text-white flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" /> Orivon Wallet</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                         <span className="text-[#22c55e]">No extension required</span>
                         <Check size={14} className="text-[#22c55e]" strokeWidth={4} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                         <span className="text-[#22c55e]">Web3 Score: Trustless</span>
                         <Check size={14} className="text-[#22c55e]" strokeWidth={4} />
                      </div>
                   </div>

                   <button 
                     onClick={handleConfirm}
                     className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white font-black text-lg uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:brightness-110 active:scale-98 transition-all border-none cursor-pointer"
                   >
                      Confirm in Orivon
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
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1100] min-w-[360px]"
          >
             <div className="bg-[#13141f] border border-[#2d2e45] rounded-2xl p-5 shadow-2xl flex items-center gap-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${txStatus === 'pending' ? 'bg-[#6366f1]/10' : 'bg-[#22c55e]/10'}`}>
                   {txStatus === 'pending' ? <Spinner size={24} color="#6366f1" /> : <CheckCircle size={24} className="text-[#22c55e]" />}
                </div>
                <div className="flex flex-col">
                   <span className="font-black text-white uppercase tracking-wider text-sm">
                      {txStatus === 'pending' ? 'Submitting Transaction' : 'Transaction Submitted'}
                   </span>
                   <span className="text-xs font-bold text-gray-400 flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
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

function CheckCircle({ size, className }: { size?: number, className?: string }) {
   return (
     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
       <polyline points="22 4 12 14.01 9 11.01" />
     </svg>
   );
}
