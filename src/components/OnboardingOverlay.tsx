import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Shield, Zap, ChevronRight, ArrowLeft 
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { DEMO_WALLET, DASHBOARD_URL } from '../constants';
import { useTabsStore } from '../store/tabs';

export default function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const { navigateTab, activeTabId } = useTabsStore();

  const handleEnter = () => {
    navigateTab(activeTabId, DASHBOARD_URL, DASHBOARD_URL, 'https');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-[#0d0e14] z-[10000] flex flex-col items-center justify-center font-inter text-[#f8fafc]">
       <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center px-6 max-w-[640px]"
            >
               <img src={logo} alt="Orivon" className="h-12 mb-8 object-contain" />
               <h1 className="text-[32px] font-bold mb-4 tracking-[-0.03em] leading-tight">
                  The internet is centralized. We built the fix.
               </h1>
               <p className="text-[16px] text-[#94a3b8] leading-[1.6] max-width-[480px] mb-12">
                  Orivon is the first browser built from the ground up for Web3. Open any .eth domain, run a Bitcoin node, and know exactly how trustless every site is. All from one browser.
               </p>
               <button 
                 onClick={() => setStep(2)}
                 className="h-[48px] w-[200px] bg-[#6366f1] text-white rounded-[10px] text-[15px] font-semibold hover:bg-[#4f46e5] transition-all cursor-pointer border-none shadow-lg shadow-[#6366f1]/20"
               >
                  Get Started
               </button>
               <button 
                 onClick={handleEnter}
                 className="mt-4 text-[12px] text-[#475569] hover:text-[#64748b] bg-transparent border-none cursor-pointer"
               >
                  Skip for now
               </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full max-w-[560px] px-6"
            >
               <h2 className="text-[24px] font-bold mb-10">Three things that change everything.</h2>
               
               <div className="w-full space-y-4 mb-12">
                  {[
                    { 
                      icon: <Globe size={20} className="text-[#6366f1]" />, 
                      title: "Browse the real Web3", 
                      desc: "Type mastodon.eth. It just loads.",
                      delay: 0
                    },
                    { 
                      icon: <Shield size={20} className="text-[#22c55e]" />, 
                      title: "Know what to trust", 
                      desc: "Every site gets a Web3 Score. Green means trustless.",
                      delay: 0.15
                    },
                    { 
                      icon: <Zap size={20} className="text-[#f59e0b]" />, 
                      title: "One click nodes", 
                      desc: "Run Bitcoin and IPFS directly in your browser.",
                      delay: 0.3
                    }
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: card.delay, duration: 0.4 }}
                      className="h-[72px] w-full bg-[#111218] border border-[#1e2030] rounded-[12px] flex items-center px-6 gap-6"
                    >
                       <div className="shrink-0">{card.icon}</div>
                       <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-[#f8fafc]">{card.title}</span>
                          <span className="text-[13px] text-[#64748b]">{card.desc}</span>
                       </div>
                    </motion.div>
                  ))}
               </div>

               <div className="flex flex-col items-center gap-4">
                  <button 
                    onClick={() => setStep(3)}
                    className="h-[48px] w-[200px] bg-[#6366f1] text-white rounded-[10px] text-[15px] font-semibold hover:bg-[#4f46e5] transition-all cursor-pointer border-none"
                  >
                     Next
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    className="text-[12px] text-[#475569] hover:text-[#64748b] bg-transparent border-none cursor-pointer flex items-center gap-1"
                  >
                     <ArrowLeft size={12} /> Back
                  </button>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full max-w-[480px] px-6 text-center"
            >
               <h2 className="text-[24px] font-bold mb-4">Your Web3 identity is ready.</h2>
               <p className="text-[16px] text-[#94a3b8] leading-relaxed mb-10">
                  We created a secure wallet for you. No seed phrase walls, no setup headaches. Your wallet is ready the moment you open Orivon.
               </p>

               <div className="w-full bg-[#111218] border border-[#1e2030] rounded-[12px] p-6 text-left mb-6 shadow-xl">
                  <div className="flex justify-between items-start mb-1">
                     <span className="text-[13px] font-semibold text-[#f8fafc]">{DEMO_WALLET.name}</span>
                  </div>
                  <div className="text-[12px] text-[#64748b] font-mono mb-6">
                     {DEMO_WALLET.address.slice(0, 6)}...{DEMO_WALLET.address.slice(-4)}
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                     <span className="text-[14px] text-[#94a3b8]">Balance:</span>
                     <span className="text-[16px] font-bold text-[#f8fafc]">{DEMO_WALLET.balance_eth} ETH</span>
                     <span className="text-[14px] text-[#64748b]">·</span>
                     <span className="text-[14px] text-[#64748b]">${DEMO_WALLET.balance_usd.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-[#1e2030] w-full mb-4" />
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 text-[12px] text-[#22c55e]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /> Created automatically ✓
                     </div>
                     <div className="flex items-center gap-2 text-[12px] text-[#64748b]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#64748b]" /> Backup available in Dashboard ✓
                     </div>
                  </div>
               </div>

               <p className="text-[12px] text-[#64748b] mb-10">
                  Your seed phrase is safely stored. Back it up anytime from the Dashboard.
               </p>

               <button 
                 onClick={handleEnter}
                 className="h-[48px] w-[200px] bg-[#6366f1] text-white rounded-[10px] text-[15px] font-semibold hover:bg-[#4f46e5] transition-all cursor-pointer border-none"
               >
                  Enter Orivon
               </button>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}

