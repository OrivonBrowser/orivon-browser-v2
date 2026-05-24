import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, Shield, Lock, AlertTriangle 
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';

export default function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
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
      className="w-[480px] bg-[#111218] border border-[#1e2030] rounded-xl p-10 shadow-2xl relative text-[#f8fafc] font-inter"
    >
       <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <div className="w-10 h-10 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center justify-center text-[#6366f1] mb-8">
                  <LayoutGrid size={20} />
               </div>
               <h1 className="text-[24px] font-bold mb-4">Welcome to Orivon</h1>
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
               <h1 className="text-[24px] font-bold mb-4">Secure Your Identity</h1>
               <p className="text-[#94a3b8] text-[14px] leading-relaxed mb-8">
                  Orivon is non-custodial. We never store your keys. You must back up your seed phrase now to ensure you never lose access to your funds.
               </p>
               <div className="border-l-4 border-[#ef4444] p-4 bg-[#161720]/30 rounded-r-lg mb-10">
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
               <h1 className="text-[24px] font-bold mb-4">Set Action Password</h1>
               <p className="text-[#94a3b8] text-[14px] leading-relaxed mb-8">
                  This password will be required for every transaction and sensitive action you perform in Orivon.
               </p>
               
               <div className="space-y-5 mb-10">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] block mb-2 px-1">New Password</label>
                    <input 
                      type="password" 
                      value={pw} 
                      onChange={e => {setPw(e.target.value); setError('');}}
                      className="w-full h-11 rounded-lg bg-[#0d0e14] border border-[#1e2030] px-4 text-[#f8fafc] font-bold text-lg outline-none focus:border-[#6366f1] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] block mb-2 px-1">Confirm Password</label>
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
