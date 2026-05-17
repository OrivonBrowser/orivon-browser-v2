import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, ArrowLeft, Eye, EyeOff,
  Copy, CircleCheck, Shield, Key, Globe,
  CircleHelp, Settings
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';

type Step =
  | 'welcome'
  | 'choose'
  | 'create-phrase'
  | 'create-password'
  | 'import'
  | 'encrypting'
  | 'success';

interface OnboardingProps {
  onDone: (hasWallet: boolean) => void;
}

const SLIDE = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.18, ease: 'easeIn' } },
};

// ── Frosted card used by every step except welcome ────────────────────────────
function InnerCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        borderRadius: 20,
        padding: '36px 40px 36px',
        background: 'rgba(255,255,255,0.13)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
        textAlign: 'left',
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Onboarding({ onDone }: OnboardingProps) {
  const { generateMnemonic, createWallet, importWallet } = useWalletStore();

  const [step, setStep]           = useState<Step>('welcome');
  const [mnemonic]                = useState(() => generateMnemonic());
  const [importPhrase, setImport] = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [copied, setCopied]       = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');

  const words = mnemonic.split(' ');

  const copyPhrase = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = useCallback(async () => {
    if (password.length < 6)    { setError('Password must be at least 6 characters'); return; }
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
    if (wc !== 12 && wc !== 24) { setError('Enter a valid 12 or 24 word recovery phrase'); return; }
    if (password.length < 6)    { setError('Password must be at least 6 characters'); return; }
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
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
      }}
    >
      {/* Background image */}
      <img
        src="/background.jpg"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.5,
          zIndex: 0,
        }}
      />

      {/* Top-right icons */}
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 20, display: 'flex', gap: 20 }}>
        <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
          <CircleHelp size={20} />
        </button>
        <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
          <Settings size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <AnimatePresence mode="wait">

          {/* ── WELCOME ──────────────────────────────────────────────────── */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              {...SLIDE}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
            >
              {/* Logo — floats above, overlaps card top by ~58px */}
              <div style={{ position: 'relative', zIndex: 2, marginBottom: -58 }}>
                <div style={{
                  width: 116, height: 116,
                  borderRadius: 28,
                  background: 'linear-gradient(145deg, #00FF87, #00E87A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(0,255,135,0.40), 0 4px 12px rgba(0,0,0,0.5)',
                }}>
                  <Globe size={56} color="#000" strokeWidth={1.8} />
                </div>
              </div>

              {/* Card */}
              <div style={{
                width: '100%', maxWidth: 680, borderRadius: 24,
                /* paddingTop covers the logo overlap (58px) + breathing room (36px) */
                padding: '94px 64px 52px',
                background: 'rgba(255,255,255,0.16)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                textAlign: 'center',
                position: 'relative', zIndex: 1,
                boxShadow: '0 20px 60px rgba(0,0,0,0.30)',
              }}>
                {/* Headline */}
                <h1 style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '0 0 16px',
                  letterSpacing: '-0.8px',
                  lineHeight: 1.15,
                }}>
                  Web3. By Default.
                </h1>

                {/* Two-line subtitle */}
                <p style={{
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: 1.65,
                  margin: '0 0 44px',
                }}>
                  Browse ENS domains and decentralized apps natively.
                  <br />
                  Your wallet lives inside the browser, not an extension.
                </p>

                {/* Button — NOT full width, centered like Brave */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                  <button
                    onClick={() => setStep('choose')}
                    style={{
                      width: '68%', height: 56,
                      borderRadius: 9999,
                      background: '#4F46E5',
                      color: '#ffffff', fontSize: 17, fontWeight: 600,
                      border: 'none', cursor: 'pointer',
                      letterSpacing: '-0.1px',
                      boxShadow: '0 4px 20px rgba(79,70,229,0.45)',
                      transition: 'filter 0.15s, transform 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.14)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                    onMouseDown={e =>  { e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={e =>    { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    Create / Import Wallet
                  </button>

                  <button
                    onClick={() => onDone(false)}
                    style={{
                      background: 'none', border: 'none',
                      color: 'rgba(255,255,255,0.52)', fontSize: 16,
                      cursor: 'pointer', padding: '4px 0',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.52)')}
                  >
                    Skip
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Choose ────────────────────────────────────────────────────── */}
          {step === 'choose' && (
            <motion.div key="choose" {...SLIDE} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <InnerCard>
                <BackBtn onClick={() => setStep('welcome')} />
                <Title>Set up your wallet</Title>
                <Sub>How would you like to get started?</Sub>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  <OptionBtn
                    icon={<Shield size={18} color="#00FF87" />}
                    iconBg="rgba(0,255,135,0.15)"
                    label="Create new wallet"
                    sub="Generate a fresh 12-word seed phrase"
                    onClick={() => setStep('create-phrase')}
                    accent
                  />
                  <OptionBtn
                    icon={<Key size={18} color="rgba(255,255,255,0.55)" />}
                    iconBg="rgba(255,255,255,0.08)"
                    label="Import existing wallet"
                    sub="Restore from your 12 or 24-word phrase"
                    onClick={() => setStep('import')}
                  />
                </div>
              </InnerCard>
            </motion.div>
          )}

          {/* ── Seed phrase ───────────────────────────────────────────────── */}
          {step === 'create-phrase' && (
            <motion.div key="phrase" {...SLIDE} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <InnerCard>
                <BackBtn onClick={() => setStep('choose')} />
                <Title>Your recovery phrase</Title>
                <Sub>Write down these 12 words and store them somewhere safe. This is the only way to recover your wallet.</Sub>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, margin: '16px 0' }}>
                  {words.map((word, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 10px' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', width: 14, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.82)' }}>{word}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={copyPhrase}
                  style={{
                    width: '100%', height: 38, borderRadius: 10, fontSize: 12, fontWeight: 500,
                    background: copied ? 'rgba(0,255,135,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${copied ? 'rgba(0,255,135,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: copied ? '#00FF87' : 'rgba(255,255,255,0.45)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14,
                  }}
                >
                  {copied ? <CircleCheck size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>

                <PrimaryBtn onClick={() => setStep('create-password')}>
                  I have saved my phrase &nbsp;<ArrowRight size={14} />
                </PrimaryBtn>
              </InnerCard>
            </motion.div>
          )}

          {/* ── Password ──────────────────────────────────────────────────── */}
          {step === 'create-password' && (
            <motion.div key="create-pw" {...SLIDE} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <InnerCard>
                <BackBtn onClick={() => setStep('create-phrase')} />
                <Title>Protect your wallet</Title>
                <Sub>This password encrypts your wallet on your device. You will need it every time you unlock.</Sub>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
                  <PwInput value={password} onChange={setPassword} placeholder="Password (min 6 characters)" show={showPw} toggle={() => setShowPw(p => !p)} autoFocus onEnter={() => {}} />
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Confirm password"
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    style={inputStyle}
                  />
                </div>
                {error && <ErrMsg text={error} />}
                <PrimaryBtn onClick={handleCreate} disabled={password.length < 6 || password !== confirmPw}>
                  Create wallet
                </PrimaryBtn>
              </InnerCard>
            </motion.div>
          )}

          {/* ── Import ────────────────────────────────────────────────────── */}
          {step === 'import' && (
            <motion.div key="import" {...SLIDE} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <InnerCard>
                <BackBtn onClick={() => setStep('choose')} />
                <Title>Import your wallet</Title>
                <Sub>Enter your 12 or 24-word recovery phrase to restore access to your wallet.</Sub>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
                  <textarea
                    value={importPhrase}
                    onChange={e => setImport(e.target.value)}
                    placeholder="word1 word2 word3..."
                    rows={3}
                    style={{ ...inputStyle, resize: 'none', fontFamily: 'monospace', paddingTop: 12 }}
                  />
                  <PwInput value={password} onChange={setPassword} placeholder="Set a new password" show={showPw} toggle={() => setShowPw(p => !p)} autoFocus onEnter={handleImport} />
                </div>
                {error && <ErrMsg text={error} />}
                <PrimaryBtn onClick={handleImport} disabled={importPhrase.trim().split(/\s+/).length < 12 || password.length < 6}>
                  Import wallet
                </PrimaryBtn>
              </InnerCard>
            </motion.div>
          )}

          {/* ── Encrypting ────────────────────────────────────────────────── */}
          {step === 'encrypting' && (
            <motion.div key="encrypting" {...SLIDE} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <InnerCard>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 20px' }}>
                    <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
                      <circle
                        cx="32" cy="32" r="28"
                        stroke="#00FF87" strokeWidth="3" fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: '0 0 6px' }}>Encrypting your wallet</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Just a moment while we secure your keys</p>
                </div>
              </InnerCard>
            </motion.div>
          )}

          {/* ── Success ───────────────────────────────────────────────────── */}
          {step === 'success' && (
            <motion.div key="success" {...SLIDE} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <InnerCard>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}>
                    <CircleCheck size={26} color="#00FF87" />
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Wallet ready</p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', margin: '0 0 28px' }}>
                    Encrypted and stored locally on your device. Only you have access.
                  </p>
                  <PrimaryBtn onClick={() => onDone(true)}>
                    Open Orivon &nbsp;<ArrowRight size={14} />
                  </PrimaryBtn>
                </div>
              </InnerCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  borderRadius: 12,
  padding: '0 16px',
  fontSize: 13,
  color: 'rgba(255,255,255,0.8)',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  outline: 'none',
  fontFamily: 'inherit',
};

function PwInput({ value, onChange, placeholder, show, toggle, autoFocus, onEnter }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  show: boolean; toggle: () => void; autoFocus?: boolean; onEnter: () => void;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={e => e.key === 'Enter' && onEnter()}
        style={{ ...inputStyle, paddingRight: 40 }}
      />
      <button
        onClick={toggle}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', cursor: 'pointer', padding: 0 }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
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
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        width: '100%', height: 48, borderRadius: 9999,
        background: disabled ? 'rgba(79,70,229,0.35)' : '#4F46E5',
        color: '#ffffff', fontSize: 15, fontWeight: 600,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'filter 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
    >
      {children}
    </button>
  );
}

function OptionBtn({ icon, iconBg, label, sub, onClick, accent }: {
  icon: React.ReactNode; iconBg: string; label: string; sub: string;
  onClick: () => void; accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 14,
        background: accent ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${accent ? 'rgba(0,255,135,0.2)' : 'rgba(255,255,255,0.08)'}`,
        cursor: 'pointer', textAlign: 'left', width: '100%',
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: accent ? '#fff' : 'rgba(255,255,255,0.82)', margin: '0 0 3px' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', margin: 0 }}>{sub}</p>
      </div>
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.32)',
        cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
        padding: 0, marginBottom: 16,
      }}
    >
      <ArrowLeft size={12} /> Back
    </button>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{children}</p>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: '0 0 4px', lineHeight: 1.5 }}>{children}</p>;
}

function ErrMsg({ text }: { text: string }) {
  return <p style={{ fontSize: 12, color: '#f87171', textAlign: 'center', margin: '0 0 12px' }}>{text}</p>;
}
