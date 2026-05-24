import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, CheckCircle, Copy } from 'lucide-react';
import { DEMO_WALLET } from '../constants';

function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div 
        className="absolute inset-0 rounded-full border-[3px] border-[#6366f1]" 
        style={{ borderWidth: size * 0.06 }}
      />
      <div 
        className="absolute inset-[22%] rounded-full border-[2px] border-[#6366f1] opacity-60" 
        style={{ borderWidth: size * 0.04 }}
      />
    </div>
  );
}

export default function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const [moment, setMoment] = useState(1);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 bg-[#0d0e14] z-[10000] flex flex-col items-center justify-center font-inter text-[#f8fafc] overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {moment === 1 ? (
          <motion.div
            key="moment1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center px-6 w-full max-w-[800px]"
          >
            <div className="flex flex-col items-center gap-3 mb-[48px]">
              <LogoMark size={64} />
              <span className="text-[13px] font-bold text-white tracking-[0.18em] uppercase">ORIVON</span>
            </div>

            <div className="space-y-1 mb-[24px]">
              <h1 className="text-[36px] font-bold text-[#f8fafc] tracking-[-0.02em] leading-[1.2]">
                The internet was built for everyone.
              </h1>
              <h1 className="text-[36px] font-bold text-[#6366f1] tracking-[-0.02em] leading-[1.2]">
                Web3 was built to give it back.
              </h1>
            </div>

            <div className="flex flex-col gap-0 mb-[48px]">
              <p className="text-[16px] text-[#94a3b8] font-normal leading-[1.8]">Browse .eth domains natively.</p>
              <p className="text-[16px] text-[#94a3b8] font-normal leading-[1.8]">Run a Bitcoin node in one click.</p>
              <p className="text-[16px] text-[#94a3b8] font-normal leading-[1.8]">Know exactly how trustless every site is.</p>
            </div>

            <button
              onClick={() => setMoment(2)}
              className="h-[52px] px-[40px] bg-[#6366f1] text-white rounded-[12px] text-[15px] font-semibold tracking-[-0.01em] hover:bg-[#4f46e5] active:scale-[0.98] transition-all duration-150 cursor-pointer border-none mb-[24px]"
            >
              Enter the World of Orivon
            </button>

            <p className="text-[12px] text-[#475569]">
              No accounts. No sign-up. No data collection. Just the Web3 browser.
            </p>
          </motion.div>
        ) : (
          <WalletCreationAnimation onComplete={onComplete} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WalletCreationAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(1);
  const [statusText, setStatusText] = useState('Generating entropy');
  const [dots, setDots] = useState('');
  const [address, setAddress] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [gridChars, setGridChars] = useState<string[]>(Array(12).fill(''));
  const fullAddress = DEMO_WALLET.address;

  // Dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setStatusText('Deriving keys'), 800);
    const t2 = setTimeout(() => setStatusText('Creating wallet'), 1400);
    const t3 = setTimeout(() => {
      setPhase(2);
      setStatusText('Wallet Created');
    }, 2000);
    const t4 = setTimeout(() => {
      setPhase(3);
    }, 2800);
    const t5 = setTimeout(() => {
      setShowButton(true);
    }, 2800);

    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
    };
  }, []);

  // Entropy grid flicker
  useEffect(() => {
    if (phase !== 1) return;
    const chars = '0123456789ABCDEF';
    const interval = setInterval(() => {
      const newChars = Array(12).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]);
      setGridChars(newChars);
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  // Staggered checkmarks in Phase 2
  const [resolvedIndices, setResolvedIndices] = useState<number[]>([]);
  useEffect(() => {
    if (phase === 2) {
      const timers: NodeJS.Timeout[] = [];
      for (let i = 0; i < 12; i++) {
        timers.push(setTimeout(() => {
          setResolvedIndices(prev => [...prev, i]);
        }, i * 60));
      }
      return () => timers.forEach(clearTimeout);
    }
  }, [phase]);

  // Typewriter address
  useEffect(() => {
    if (phase < 3) return;
    let i = 0;
    const interval = setInterval(() => {
      setAddress(fullAddress.slice(0, i + 1));
      i++;
      if (i >= fullAddress.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [phase, fullAddress]);

  const handleDashboard = async () => {
    if (window.electronAPI?.onboarding) {
        await window.electronAPI.onboarding.complete();
    }
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center w-full"
    >
      <div className="flex flex-col items-center gap-2 mb-[48px]">
        <LogoMark size={40} />
        <span className="text-[11px] font-bold text-white tracking-[0.18em] uppercase">ORIVON</span>
      </div>

      <div className="relative w-[200px] h-[200px] flex items-center justify-center mb-[32px]">
        {/* Circle Border */}
        <div 
          className="absolute w-[160px] h-[160px] rounded-full border-2 transition-colors duration-400"
          style={{ borderColor: phase >= 2 ? '#22c55e' : '#1e2030' }}
        />

        {/* Spinner */}
        <AnimatePresence>
          {phase === 1 && (
            <motion.div
              key="spinner-p1"
              className="absolute w-[160px] h-[160px] rounded-full border-t-2 border-[#6366f1]"
              style={{ borderRight: '2px solid transparent', borderBottom: '2px solid transparent', borderLeft: '2px solid transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              exit={{ opacity: 0 }}
            />
          )}
          {phase === 2 && (
            <motion.div
              key="spinner-p2"
              className="absolute w-[160px] h-[160px] rounded-full border-t-2 border-[#6366f1]"
              style={{ borderRight: '2px solid transparent', borderBottom: '2px solid transparent', borderLeft: '2px solid transparent' }}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Outer Glow */}
        {phase === 3 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute w-[160px] h-[160px] rounded-full"
            style={{ 
              boxShadow: '0 0 0 8px rgba(34,197,94,0.08), 0 0 0 16px rgba(34,197,94,0.04)'
            }}
          />
        )}

        {/* Wallet Icon */}
        <div className="relative">
          <Wallet 
            size={48} 
            className="transition-all duration-[2000ms]"
            style={{ 
              color: phase === 1 ? '#6366f1' : 'white',
              transform: phase === 2 ? 'scale(1.1)' : 'scale(1)'
            }}
          />
          {phase === 3 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 text-[#22c55e] bg-[#0d0e14] rounded-full"
            >
              <CheckCircle size={20} fill="#0d0e14" />
            </motion.div>
          )}
        </div>

        {/* Entropy Grid */}
        {phase < 3 && (
          <div className="absolute top-[120px] grid grid-cols-4 gap-x-3 gap-y-1 font-mono text-[10px]">
            {gridChars.map((char, i) => (
              <span 
                key={i} 
                style={{ 
                  color: phase === 2 && resolvedIndices.includes(i) ? '#22c55e' : ['#1e2030', '#2d2e45', '#3d3e55', '#6366f1'][Math.floor(Math.random() * 4)],
                  transition: 'color 0.2s'
                }}
              >
                {phase === 2 && resolvedIndices.includes(i) ? '✓' : char}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <h2 className={`transition-all duration-300 ${phase === 3 ? 'text-[18px] font-semibold text-[#f8fafc]' : 'text-[14px] text-[#94a3b8]'}`}>
          {statusText}{phase < 2 && dots}
        </h2>
        {phase === 3 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[13px] text-[#94a3b8]"
          >
            Your wallet is ready. Your seed phrase is safely stored.
          </motion.p>
        )}
      </div>

      {phase === 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-[12px] flex flex-col items-center"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] text-[#64748b]">{address}</span>
            {address === fullAddress && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Copy size={14} className="text-[#64748b] cursor-pointer hover:text-[#f8fafc]" />
              </motion.div>
            )}
          </div>

          <div className="h-[48px] mt-[32px]">
            {showButton && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleDashboard}
                className="h-[48px] px-[36px] bg-[#6366f1] text-white rounded-[12px] text-[14px] font-semibold tracking-[-0.01em] hover:bg-[#4f46e5] active:scale-[0.98] transition-all duration-150 cursor-pointer border-none"
              >
                Open Dashboard
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
