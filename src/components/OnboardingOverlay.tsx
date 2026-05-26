import React, { useState, useEffect } from 'react';
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
      <div className="absolute inset-0 bg-black/70" />

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

const glassCard: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.07)',
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  border: '1px solid rgba(255, 255, 255, 0.13)',
  boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
  borderRadius: 48,
};

const ease = [0.22, 1, 0.36, 1] as const;

const ticker = [
  'OPEN .ETH DOMAINS',
  'RUN BITCOIN NODES',
  'TRUSTLESS BROWSING',
  'WEB3 NATIVE',
  'DECENTRALIZED WEB',
  'NO EXTENSIONS NEEDED',
];

function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-10 flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-start justify-between px-16 pt-12 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease }}
          className="flex items-center gap-3"
        >
          <img
            src={logo}
            alt="Orivon"
            className="w-10 h-10 rounded-[12px]"
            style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.45)' }}
          />
          <span
            className="font-bold text-base tracking-[0.18em] uppercase"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            Orivon
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease }}
          className="max-w-[260px] text-right text-[13px] leading-[1.75]"
          style={{ color: 'rgba(203,213,225,0.42)' }}
        >
          The fastest Web3 browser. Open .eth domains, run Bitcoin nodes, and browse with trustless confidence.
        </motion.p>
      </div>

      {/* Giant 3-line headline */}
      <div className="flex-1 flex flex-col justify-center px-16">
        <div className="flex flex-col">
          {[
            { text: 'THE BROWSER', accent: false, delay: 0.18 },
            { text: 'WEB3',        accent: true,  delay: 0.30 },
            { text: 'DESERVES.',   accent: false, delay: 0.42 },
          ].map(({ text, accent, delay }) => (
            <div
              key={text}
              className="overflow-hidden"
              style={{ lineHeight: 0.9 }}
            >
              <motion.h1
                initial={{ y: '108%' }}
                animate={{ y: 0 }}
                transition={{ delay, duration: 0.82, ease }}
                className="font-black uppercase"
                style={
                  accent
                    ? {
                        fontSize: 'clamp(52px, 7.5vw, 108px)',
                        letterSpacing: '-0.04em',
                        lineHeight: 0.9,
                        background: 'linear-gradient(95deg, #6366f1 0%, #a5b4fc 55%, #818cf8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }
                    : {
                        fontSize: 'clamp(52px, 7.5vw, 108px)',
                        letterSpacing: '-0.04em',
                        lineHeight: 0.9,
                        color: '#e2e8f0',
                      }
                }
              >
                {text}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.92, duration: 0.55, ease }}
          className="flex items-center gap-5 mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 14px 44px rgba(99,102,241,0.7)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onEnter}
            className="flex items-center gap-2.5 h-[52px] px-8 text-white rounded-full text-[15px] font-bold tracking-[0.02em] cursor-pointer border-none"
            style={{ background: '#6366f1', boxShadow: '0 6px 28px rgba(99,102,241,0.5)' }}
          >
            Enter Orivon
            <span
              className="flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-black"
              style={{ background: 'rgba(255,255,255,0.22)' }}
            >
              →
            </span>
          </motion.button>
          <span
            className="text-[12px] font-medium tracking-[0.07em] uppercase"
            style={{ color: 'rgba(148,163,184,0.38)' }}
          >
            No extensions · No setup · Free
          </span>
        </motion.div>
      </div>

      {/* Ticker strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05, duration: 0.6 }}
        className="shrink-0 overflow-hidden py-3 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="flex gap-6 whitespace-nowrap"
          style={{ width: 'max-content' }}
        >
          {[...ticker, ...ticker].map((item, i) => (
            <React.Fragment key={i}>
              <span
                className="text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ color: 'rgba(255,255,255,0.18)' }}
              >
                {item}
              </span>
              <span style={{ color: 'rgba(99,102,241,0.35)', fontSize: 10, fontWeight: 700 }}>
                —
              </span>
            </React.Fragment>
          ))}
        </motion.div>
      </motion.div>

      {/* 3D shape — top-left angular prism */}
      <motion.div
        className="absolute top-0 left-0 pointer-events-none"
        initial={{ opacity: 0, x: -60, y: -60 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            width: 115,
            height: 158,
            background: 'linear-gradient(145deg, #818cf8 0%, #4f46e5 40%, #1e1b4b 100%)',
            borderRadius: '20px 6px 10px 6px',
            transform:
              'perspective(500px) rotateX(26deg) rotateY(-20deg) rotateZ(12deg) translate(-12px, -12px)',
            boxShadow:
              '18px 24px 72px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        />
      </motion.div>

      {/* 3D shape — bottom-right stacked discs */}
      <motion.div
        className="absolute bottom-12 right-8 pointer-events-none"
        initial={{ opacity: 0, x: 60, y: 60 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.06, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: 120, height: 190 }}
      >
        {[4, 3, 2, 1, 0].map((n) => (
          <div
            key={n}
            style={{
              position: 'absolute',
              bottom: n * 22,
              left: 5,
              width: 110,
              height: 110,
              background: `linear-gradient(130deg, rgba(129,140,248,${0.82 - n * 0.1}), rgba(67,56,202,${0.72 - n * 0.1}))`,
              borderRadius: '50%',
              transform: `perspective(350px) rotateX(${18 + n * 3}deg)`,
              boxShadow: `0 ${4 + n * 5}px ${12 + n * 10}px rgba(0,0,0,0.45)`,
            }}
          />
        ))}
      </motion.div>
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
      className="relative z-10 w-full max-w-[820px] px-6"
    >
      <div style={glassCard} className="flex flex-col items-center text-center px-20 py-16">

        <img src={logo} alt="Orivon" className="w-14 h-14 rounded-[14px] mb-10 shadow-lg" />

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

          <img
            src="/wallet.png"
            alt="Wallet"
            className="w-12 h-12 object-contain transition-all duration-500"
            style={{ opacity: phase >= 2 ? 1 : 0.45 }}
          />

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

        <div className="h-[56px]">
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleDashboard}
              className="h-[56px] px-[52px] bg-[#6366f1] text-white rounded-[14px] text-[16px] font-semibold hover:bg-[#4f46e5] active:scale-[0.97] transition-all duration-150 cursor-pointer border-none"
              style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.5)' }}
            >
              Open Dashboard
            </motion.button>
          )}
        </div>

      </div>
    </motion.div>
  );
}
