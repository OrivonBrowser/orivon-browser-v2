import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Eye, EyeOff, Copy, CheckCircle, Shield, Key, Globe } from 'lucide-react';
import { useWalletStore } from '../store/wallet';

type Step = 'welcome' | 'create-phrase' | 'create-password' | 'import' | 'encrypting' | 'success';

interface OnboardingProps {
  onDone: (hasWallet: boolean) => void;
}

const SLIDE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } },
};

export default function Onboarding({ onDone }: OnboardingProps) {
  const { generateMnemonic, createWallet, importWallet } = useWalletStore();

  const [step, setStep]             = useState<Step>('welcome');
  const [mode, setMode]             = useState<'create' | 'import'>('create');
  const [mnemonic]                  = useState(() => generateMnemonic());
  const [importPhrase, setImport]   = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [copied, setCopied]         = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState('');

  const words = mnemonic.split(' ');

  const copyPhrase = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = useCallback(async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPw) { setError('Passwords do not match'); return; }
    setError(''); setStep('encrypting');
    try {
      await createWallet(mnemonic, password, setProgress);
      setStep('success');
    } catch (e) {
      setStep('create-password');
      setError(String(e));
    }
  }, [password, confirmPw, mnemonic, createWallet]);

  const handleImport = useCallback(async () => {
    const phrase = importPhrase.trim();
    const wc = phrase.split(/\s+/).length;
    if (wc !== 12 && wc !== 24) { setError('Enter a valid 12 or 24-word recovery phrase'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setStep('encrypting');
    try {
      await importWallet(phrase, password, setProgress);
      setStep('success');
    } catch (e) {
      setStep('import');
      setError(String(e));
    }
  }, [importPhrase, password, importWallet]);

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00FF87]/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">
        <AnimatePresence mode="wait">

          {/* ── Welcome ─────────────────────────────────────────────────────── */}
          {step === 'welcome' && (
            <motion.div key="welcome" {...SLIDE} className="space-y-8">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#00FF87] flex items-center justify-center mx-auto">
                  <Globe size={22} className="text-black" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-white">Orivon</h1>
                  <p className="text-sm text-white/40 mt-1">Your Web3 browser</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <WelcomeBtn
                  icon={<Shield size={16} />}
                  label="Create new wallet"
                  sub="Generate a fresh wallet with seed phrase"
                  onClick={() => { setMode('create'); setStep('create-phrase'); }}
                  accent
                />
                <WelcomeBtn
                  icon={<Key size={16} />}
                  label="Import existing wallet"
                  sub="Restore from your 12 or 24-word phrase"
                  onClick={() => { setMode('import'); setStep('import'); }}
                />
                <button
                  onClick={() => onDone(false)}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[13px] text-white/35 hover:text-white/60 transition-colors"
                >
                  <Globe size={14} />
                  Browse without wallet
                </button>
              </div>

              <p className="text-center text-[11px] text-white/20">
                v0.94.1 · Electron · Chromium
              </p>
            </motion.div>
          )}

          {/* ── Seed phrase display ──────────────────────────────────────────── */}
          {step === 'create-phrase' && (
            <motion.div key="phrase" {...SLIDE} className="space-y-6">
              <StepHeader title="Your recovery phrase" sub="Write these 12 words down and keep them safe. They cannot be recovered." onBack={() => setStep('welcome')} />

              <div className="grid grid-cols-3 gap-1.5">
                {words.map((word, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-2">
                    <span className="text-[10px] text-white/25 w-4 shrink-0 tabular-nums">{i + 1}</span>
                    <span className="text-[12px] font-medium text-white/80">{word}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={copyPhrase}
                className={`flex items-center justify-center gap-2 w-full h-10 rounded-xl text-[12px] font-medium border transition-all ${
                  copied
                    ? 'border-[#00FF87]/30 text-[#00FF87] bg-[#00FF87]/8'
                    : 'border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                }`}
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>

              <PrimaryBtn onClick={() => setStep('create-password')}>
                I've saved my phrase <ArrowRight size={15} />
              </PrimaryBtn>
            </motion.div>
          )}

          {/* ── Create password ──────────────────────────────────────────────── */}
          {step === 'create-password' && (
            <motion.div key="create-pw" {...SLIDE} className="space-y-5">
              <StepHeader title="Protect your wallet" sub="Set a password to encrypt your wallet locally." onBack={() => setStep('create-phrase')} />
              <PasswordFields
                password={password} setPassword={setPassword}
                confirm={confirmPw} setConfirm={setConfirmPw}
                show={showPw} toggleShow={() => setShowPw(p => !p)}
                onSubmit={handleCreate}
              />
              {error && <ErrorMsg text={error} />}
              <PrimaryBtn onClick={handleCreate} disabled={password.length < 6 || password !== confirmPw}>
                Create wallet
              </PrimaryBtn>
            </motion.div>
          )}

          {/* ── Import ──────────────────────────────────────────────────────── */}
          {step === 'import' && (
            <motion.div key="import" {...SLIDE} className="space-y-5">
              <StepHeader title="Import wallet" sub="Enter your recovery phrase to restore access." onBack={() => setStep('welcome')} />
              <textarea
                value={importPhrase}
                onChange={e => setImport(e.target.value)}
                placeholder="Enter your 12 or 24-word recovery phrase..."
                rows={3}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 font-mono resize-none transition-colors"
              />
              <PasswordFields
                password={password} setPassword={setPassword}
                show={showPw} toggleShow={() => setShowPw(p => !p)}
                onSubmit={handleImport}
                singleField
                placeholder="Set a new wallet password"
              />
              {error && <ErrorMsg text={error} />}
              <PrimaryBtn
                onClick={handleImport}
                disabled={importPhrase.trim().split(/\s+/).length < 12 || password.length < 6}
              >
                Import wallet
              </PrimaryBtn>
            </motion.div>
          )}

          {/* ── Encrypting ──────────────────────────────────────────────────── */}
          {step === 'encrypting' && (
            <motion.div key="encrypting" {...SLIDE} className="text-center space-y-6 py-4">
              <div className="relative w-16 h-16 mx-auto">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
                  <circle
                    cx="32" cy="32" r="28"
                    stroke="#00FF87" strokeWidth="3" fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[13px] font-semibold text-white/70">{Math.round(progress)}%</span>
                </div>
              </div>
              <div>
                <p className="text-[15px] font-medium text-white/80">Encrypting wallet</p>
                <p className="text-[12px] text-white/30 mt-1">This takes a moment...</p>
              </div>
            </motion.div>
          )}

          {/* ── Success ─────────────────────────────────────────────────────── */}
          {step === 'success' && (
            <motion.div key="success" {...SLIDE} className="text-center space-y-7 py-2">
              <div className="w-14 h-14 rounded-full bg-[#00FF87]/15 border border-[#00FF87]/25 flex items-center justify-center mx-auto">
                <CheckCircle size={24} className="text-[#00FF87]" />
              </div>
              <div>
                <p className="text-[17px] font-semibold text-white">Wallet ready</p>
                <p className="text-[13px] text-white/40 mt-1.5">Your wallet is encrypted and stored locally.</p>
              </div>
              <PrimaryBtn onClick={() => onDone(true)}>
                Open your dashboard <ArrowRight size={15} />
              </PrimaryBtn>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function WelcomeBtn({ icon, label, sub, onClick, accent }: {
  icon: React.ReactNode; label: string; sub: string;
  onClick: () => void; accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all group ${
        accent
          ? 'bg-[#00FF87] border-[#00FF87] hover:brightness-105'
          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        accent ? 'bg-black/15' : 'bg-white/[0.06]'
      }`}>
        <span className={accent ? 'text-black' : 'text-white/50'}>{icon}</span>
      </div>
      <div>
        <p className={`text-[13px] font-semibold leading-none mb-1 ${accent ? 'text-black' : 'text-white/90'}`}>{label}</p>
        <p className={`text-[11px] ${accent ? 'text-black/60' : 'text-white/35'}`}>{sub}</p>
      </div>
    </button>
  );
}

function StepHeader({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  return (
    <div className="space-y-1">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-white/60 mb-4 transition-colors">
        <ArrowLeft size={13} /> Back
      </button>
      <h2 className="text-[17px] font-semibold text-white/90">{title}</h2>
      <p className="text-[12px] text-white/40 leading-relaxed">{sub}</p>
    </div>
  );
}

function PasswordFields({ password, setPassword, confirm, setConfirm, show, toggleShow, onSubmit, singleField, placeholder }: {
  password: string; setPassword: (v: string) => void;
  confirm?: string; setConfirm?: (v: string) => void;
  show: boolean; toggleShow: () => void;
  onSubmit: () => void;
  singleField?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={placeholder || 'Password (min 6 characters)'}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && !singleField && setConfirm && confirm && onSubmit()}
          className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 pr-11 text-[13px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
        />
        <button onClick={toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {!singleField && setConfirm && (
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm password"
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-[13px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
        />
      )}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-[#00FF87] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return <p className="text-[12px] text-red-400 text-center">{text}</p>;
}
