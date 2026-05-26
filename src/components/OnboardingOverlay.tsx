import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '@/assets/logo.png';

export default function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'welcome' | 'creating'>('welcome');

  const handleEnter = () => setStep('creating');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center font-inter overflow-hidden"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay so text is legible over the background */}
      <div className="absolute inset-0 bg-black/60" />

      <AnimatePresence mode="wait">
        {step === 'welcome' ? (
          <WelcomeScreen key="welcome" onEnter={handleEnter} />
        ) : (
          <CreatingScreen key="creating" onComplete={onComplete} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-col items-center text-center px-6 max-w-[680px] w-full"
    >
      {/* Logo */}
      <motion.img
        src={logo}
        alt="Orivon"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-20 h-20 rounded-[22px] mb-10 shadow-2xl shadow-black/40"
      />

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-[38px] font-bold text-white tracking-[-0.02em] leading-[1.2] mb-8"
      >
        The browser Web3 has been waiting for.
      </motion.h1>

      {/* Sub-lines */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="flex flex-col gap-1 mb-10"
      >
        {[
          'Open any .eth domain.',
          'Run a Bitcoin node in one click.',
          'Know how trustless every site is.',
        ].map((line) => (
          <p key={line} className="text-[17px] text-[#94a3b8] font-normal leading-[1.8]">
            {line}
          </p>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        onClick={onEnter}
        className="h-[52px] px-[44px] bg-[#6366f1] text-white rounded-[12px] text-[15px] font-semibold tracking-[-0.01em] hover:bg-[#4f46e5] active:scale-[0.98] transition-all duration-150 cursor-pointer border-none mb-6 shadow-xl shadow-indigo-500/30"
      >
        Enter Orivon
      </motion.button>

      {/* Fine print */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="text-[12px] text-[#475569]"
      >
        No extensions. No setup. Just Orivon.
      </motion.p>
    </motion.div>
  );
}

function CreatingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(1);
  const [statusText, setStatusText] = useState('Generating entropy');
  const [dots, setDots] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [gridChars, setGridChars] = useState<string[]>(Array(12).fill(''));
  const [resolvedIndices, setResolvedIndices] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setStatusText('Deriving keys'), 800);
    const t2 = setTimeout(() => setStatusText('Creating wallet'), 1400);
    const t3 = setTimeout(() => { setPhase(2); setStatusText('Wallet Created'); }, 2000);
    const t4 = setTimeout(() => setPhase(3), 2800);
    const t5 = setTimeout(() => setShowButton(true), 2800);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== 1) return;
    const chars = '0123456789ABCDEF';
    const interval = setInterval(() => {
      setGridChars(Array(12).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]));
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 2) return;
    const timers = Array.from({ length: 12 }, (_, i) =>
      setTimeout(() => setResolvedIndices(prev => [...prev, i]), i * 60)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

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
      className="relative z-10 flex flex-col items-center w-full"
    >
      {/* Logo small */}
      <img src={logo} alt="Orivon" className="w-10 h-10 rounded-[10px] mb-10 shadow-lg" />

      {/* Spinner circle */}
      <div className="relative w-[200px] h-[200px] flex items-center justify-center mb-8">
        <div
          className="absolute w-[160px] h-[160px] rounded-full border-2 transition-colors duration-500"
          style={{ borderColor: phase >= 2 ? '#22c55e' : '#1e2030' }}
        />

        <AnimatePresence>
          {phase <= 2 && (
            <motion.div
              key="spinner"
              className="absolute w-[160px] h-[160px] rounded-full border-t-2 border-[#6366f1]"
              style={{ borderRight: '2px solid transparent', borderBottom: '2px solid transparent', borderLeft: '2px solid transparent' }}
              animate={{ rotate: 360 }}
              transition={{ duration: phase === 1 ? 1 : 0.5, repeat: phase === 1 ? Infinity : 0, ease: phase === 1 ? 'linear' : 'easeOut' }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {phase === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute w-[160px] h-[160px] rounded-full"
            style={{ boxShadow: '0 0 0 8px rgba(34,197,94,0.08), 0 0 0 16px rgba(34,197,94,0.04)' }}
          />
        )}

        {/* Centre icon — wallet emoji stand-in */}
        <div className="text-[44px] select-none" style={{ filter: phase >= 2 ? 'none' : 'grayscale(0.4)' }}>
          💼
        </div>

        {/* Entropy grid */}
        {phase < 3 && (
          <div className="absolute top-[124px] grid grid-cols-4 gap-x-3 gap-y-1 font-mono text-[10px]">
            {gridChars.map((char, i) => (
              <span
                key={i}
                style={{
                  color: phase === 2 && resolvedIndices.includes(i)
                    ? '#22c55e'
                    : ['#1e2030', '#2d2e45', '#3d3e55', '#6366f1'][Math.floor(Math.random() * 4)],
                  transition: 'color 0.2s',
                }}
              >
                {phase === 2 && resolvedIndices.includes(i) ? '✓' : char}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 mb-8">
        <h2
          className="transition-all duration-300 text-white"
          style={{ fontSize: phase === 3 ? 18 : 14, fontWeight: phase === 3 ? 600 : 400 }}
        >
          {statusText}{phase < 2 && dots}
        </h2>
        {phase === 3 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[13px] text-[#94a3b8]">
            Your wallet is ready. Your seed phrase is safely stored.
          </motion.p>
        )}
      </div>

      <div className="h-[52px]">
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleDashboard}
            className="h-[52px] px-[40px] bg-[#6366f1] text-white rounded-[12px] text-[15px] font-semibold hover:bg-[#4f46e5] active:scale-[0.98] transition-all duration-150 cursor-pointer border-none shadow-xl shadow-indigo-500/30"
          >
            Open Dashboard
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
