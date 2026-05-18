import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Eye, EyeOff, Copy, CheckCircle,
  CircleHelp, Settings, Lock
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step =
  | 'welcome' | 'choose'
  | 'before-we-begin' | 'import-type' | 'supported-networks'
  | 'create-password' | 'encrypting'
  | 'create-phrase' | 'verify-phrase'
  | 'import' | 'success';

interface OnboardingProps { onDone: (hasWallet: boolean) => void; }

const SLIDE = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.16, ease: 'easeIn' } },
};

function pwStrength(pw: string) {
  if (!pw) return { score: 0, label: '', color: '#E5E7EB' };
  let s = 0;
  if (pw.length >= 8) s++; if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: 'Weak',   color: '#EF4444' };
  if (s <= 3) return { score: 2, label: 'Medium', color: '#F59E0B' };
  return             { score: 3, label: 'Strong', color: '#10B981' };
}

// Pick 3 unique random indices from 0-11
function pickVerifyIndices(): number[] {
  const all = Array.from({ length: 12 }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, 3).sort((a, b) => a - b);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Onboarding({ onDone }: OnboardingProps) {
  const { generateMnemonic, createWallet, importWallet } = useWalletStore();

  const [step, setStep]           = useState<Step>('welcome');
  const [mode, setMode]           = useState<'create' | 'import'>('create'); // which flow we're in
  const [mnemonic]                = useState(() => generateMnemonic());
  const [importPhrase, setImport] = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phraseShown, setPhraseShown] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');
  // Before-we-begin checkboxes
  const [checked1, setChecked1]   = useState(false);
  const [checked2, setChecked2]   = useState(false);
  // Import word-grid state
  const [importWordCount, setImportWordCount] = useState<12 | 24>(12);
  const [importWords, setImportWords]         = useState<string[]>(Array(12).fill(''));
  const [showImportWords, setShowImportWords] = useState(false);

  // Verify step
  const [verifyIndices]           = useState(() => pickVerifyIndices());
  const [verifyStep, setVerifyStep] = useState(0);  // 0,1,2
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const words   = mnemonic.split(' ');
  const strength = pwStrength(password);
  const canContinue = password.length >= 6 && password === confirmPw;
  const allImportWordsFilled = importWords.length > 0 && importWords.every(w => w.trim().length > 0);

  const copyAll = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreate = useCallback(async () => {
    if (password.length < 6)    { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPw) { setError('Passwords do not match'); return; }
    setError(''); setStep('encrypting');
    try {
      await createWallet(mnemonic, password, setProgress);
      setStep('create-phrase');
    } catch (e) { setStep('create-password'); setError(String(e)); }
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
    } catch (e) { setStep('import'); setError(String(e)); }
  }, [importPhrase, password, importWallet]);

  const handleVerify = () => {
    const expected = words[verifyIndices[verifyStep]].toLowerCase().trim();
    if (verifyInput.toLowerCase().trim() !== expected) {
      setVerifyError(`Incorrect. Check your phrase and try again.`);
      return;
    }
    setVerifyError(''); setVerifyInput('');
    if (verifyStep < 2) { setVerifyStep(v => v + 1); }
    else { setStep('success'); }
  };

  const handleWordChange = (idx: number, val: string) => {
    const next = [...importWords];
    next[idx] = val;
    setImportWords(next);
    setImport(next.join(' '));
  };

  const handleWordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const pasted = text.trim().split(/\s+/);
    if (pasted.length > 1) {
      e.preventDefault();
      const next = Array(importWordCount).fill('');
      pasted.slice(0, importWordCount).forEach((w, i) => { next[i] = w; });
      setImportWords(next);
      setImport(next.join(' '));
    }
  };

  const toggleImportWordCount = () => {
    const newCount = importWordCount === 12 ? 24 : 12;
    const next = newCount === 24
      ? [...importWords, ...Array(12).fill('')]
      : importWords.slice(0, 12);
    setImportWordCount(newCount as 12 | 24);
    setImportWords(next);
    setImport(next.join(' '));
  };

  const isGradientStep = step === 'welcome' || step === 'choose';
  const bothChecked = checked1 && checked2;

  // ── LIGHT THEME (inner steps) ─────────────────────────────────────────────
  if (!isGradientStep) {
    return (
      <div style={{ height: '100vh', background: '#F5F6FA', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 40px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <img src="/logo.png" alt="Orivon" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>Orivon Wallet</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0 44px' }}>
            <AnimatePresence mode="wait">

          {/* ── Before we begin ──────────────────────────────────────── */}
          {step === 'before-we-begin' && (
            <motion.div key="before-we-begin" {...SLIDE}>
              <LightCard>
                <button
                  onClick={() => setStep('choose')}
                  style={backBtnInCard}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <ArrowLeft size={18} />
                </button>

                <h1 style={{ ...titleStyle, textAlign: 'center' }}>Before we begin</h1>
                <p style={{ ...subStyle, textAlign: 'center', marginBottom: 32 }}>
                  We require that you acknowledge the items below
                </p>

                {/* Checkbox 1 — self-custody disclaimer */}
                <label style={{ display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 24 }}>
                  <input
                    type="checkbox"
                    checked={checked1}
                    onChange={e => setChecked1(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: '#4F46E5', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>
                    I understand that this is a self-custody wallet, and that I am solely responsible for any associated funds, assets, or accounts, and for taking any appropriate action to secure, protect, and back up my wallet. I understand that Orivon cannot access my wallet or reverse transactions on my behalf, and that my recovery phrase is the ONLY way to regain access in the event of a lost password, stolen device, or similar circumstance.
                  </span>
                </label>

                {/* Checkbox 2 — terms of use */}
                <label style={{ display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', marginBottom: 40 }}>
                  <input
                    type="checkbox"
                    checked={checked2}
                    onChange={e => setChecked2(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#4F46E5', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 14, color: '#374151' }}>
                    I have read and agree to the{' '}
                    <a href="#" onClick={e => e.preventDefault()} style={{ color: '#4F46E5', textDecoration: 'none' }}>
                      Terms of use
                    </a>.
                  </span>
                </label>

                <CenterBtn
                  onClick={() => {
                    setChecked1(false); setChecked2(false);
                    setStep(mode === 'create' ? 'supported-networks' : 'import-type');
                  }}
                  disabled={!bothChecked}
                >
                  Continue
                </CenterBtn>
              </LightCard>
            </motion.div>
          )}

          {/* ── Import type ───────────────────────────────────────────── */}
          {step === 'import-type' && (
            <motion.div key="import-type" {...SLIDE}>
              <LightCard>
                <button
                  onClick={() => setStep('before-we-begin')}
                  style={backBtnInCard}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <ArrowLeft size={18} />
                </button>

                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 36px', lineHeight: 1.3 }}>
                  Which type of wallet would you like to import?
                </h1>

                {/* Option 1 — Ethereum/Solana/Filecoin wallet */}
                <div
                  onClick={() => setStep('import')}
                  style={importOptionRow}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                      Ethereum/Solana/Filecoin wallet
                    </p>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px' }}>
                      Import your seed phrase from an existing wallet
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {['🦁','🟣','🦊','🔵'].map((icon, i) => (
                        <span key={i} style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight size={20} color="#4F46E5" style={{ flexShrink: 0 }} />
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#F3F4F6' }} />

                {/* Option 2 — Hardware wallet */}
                <div
                  style={{ ...importOptionRow, cursor: 'default', opacity: 0.55 }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                      Hardware wallet
                    </p>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px' }}>
                      Connect your hardware wallet with Orivon
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 20 }}>🔒</span>
                      <span style={{ fontSize: 20 }}>🔳</span>
                    </div>
                  </div>
                  <ArrowRight size={20} color="#4F46E5" style={{ flexShrink: 0 }} />
                </div>
              </LightCard>
            </motion.div>
          )}

          {/* ── Supported networks ───────────────────────────────────── */}
          {step === 'supported-networks' && (
            <motion.div key="supported-networks" {...SLIDE} style={{ width: '100%' }}>
              <SupportedNetworksCard
                selectedNets={selectedNets}
                toggleNet={toggleNet}
                networkSearch={networkSearch}
                setNetworkSearch={setNetworkSearch}
                showTestnets={showTestnets}
                setShowTestnets={setShowTestnets}
                onBack={() => setStep('before-we-begin')}
                onContinue={() => setStep('create-password')}
              />
            </motion.div>
          )}

          {/* ── Create password ──────────────────────────────────────── */}
          {step === 'create-password' && (
            <motion.div key="create-pw" {...SLIDE}>
              <LightCard>
                {/* Back arrow inside the card — top left */}
                <button
                  onClick={() => setStep('supported-networks')}
                  style={backBtnInCard}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <ArrowLeft size={18} />
                </button>

                <h1 style={{ ...titleStyle, textAlign: 'center' }}>Create a new password</h1>
                <p style={{ ...subStyle, textAlign: 'center' }}>You will use this password each time you access your wallet.</p>

                <FieldLabel>Enter new password <Required /></FieldLabel>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password" autoFocus style={inputSt} />
                  <EyeBtn show={showPw} toggle={() => setShowPw(p => !p)} />
                </div>
                {password.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                      {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: strength.score >= i ? strength.color : '#E5E7EB', transition: 'background 0.2s' }} />)}
                    </div>
                    <span style={{ fontSize: 12, color: strength.color, fontWeight: 500 }}>{strength.label}</span>
                  </div>
                )}
                {!password && <div style={{ marginBottom: 20 }} />}

                <FieldLabel>Re-enter password <Required /></FieldLabel>
                <div style={{ position: 'relative', marginBottom: confirmPw && confirmPw !== password ? 6 : 28 }}>
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" onKeyDown={e => e.key === 'Enter' && canContinue && handleCreate()} style={{ ...inputSt, borderColor: confirmPw && confirmPw !== password ? '#EF4444' : '#E5E7EB' }} />
                  <EyeBtn show={showConfirm} toggle={() => setShowConfirm(p => !p)} />
                </div>
                {confirmPw && confirmPw !== password && <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 20 }}>Passwords do not match</p>}

                {/* Auto-lock */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#EEF2FF', borderRadius: 12, marginBottom: 32 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={15} color="#4F46E5" />
                  </div>
                  <span style={{ fontSize: 14, color: '#374151', flex: 1 }}>Orivon will auto-lock after</span>
                  <select style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                    <option>5 Minutes</option><option>15 Minutes</option><option>1 Hour</option><option>Never</option>
                  </select>
                </div>

                {error && <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 14 }}>{error}</p>}
                <CenterBtn onClick={handleCreate} disabled={!canContinue}>Continue</CenterBtn>
              </LightCard>
            </motion.div>
          )}

          {/* ── Encrypting ───────────────────────────────────────────── */}
          {step === 'encrypting' && (
            <motion.div key="encrypting" {...SLIDE}>
              <LightCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 520 }}>
                <div style={{ width: 52, height: 52, marginBottom: 22 }}>
                  <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: 'spin 1s linear infinite' }}>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <circle cx="26" cy="26" r="22" stroke="#E0E7FF" strokeWidth="3" fill="none" />
                    <circle cx="26" cy="26" r="22" stroke="#4F46E5" strokeWidth="3" fill="none" strokeDasharray="110" strokeDashoffset="80" strokeLinecap="round" />
                  </svg>
                </div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 }}>Creating Wallet…</p>
              </LightCard>
            </motion.div>
          )}

          {/* ── Recovery phrase ──────────────────────────────────────── */}
          {step === 'create-phrase' && (
            <motion.div key="phrase" {...SLIDE} style={{ width: '100%' }}>
              <LightCard>
                <button
                  onClick={() => setStep('create-password')}
                  style={backBtnInCard}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <ArrowLeft size={18} />
                </button>
                <h1 style={{ ...titleStyle, textAlign: 'center' }}>Save your recovery phrase</h1>
                <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.65, marginBottom: 16 }}>
                  The 12-word recovery phrase is a private key you can use to regain access to your wallet in case you lose a connected device. Store it someplace safe, and in the exact order it appears below.
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.5, marginBottom: 28 }}>
                  Keep it in a secure place that is not accessible to others and avoid sharing it with anyone.
                </p>

                {/* Phrase grid */}
                <div
                  style={{
                    border: '1px solid #E5E7EB', borderRadius: 12,
                    padding: '20px 20px',
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
                    marginBottom: 14, position: 'relative', cursor: 'default',
                  }}
                  onMouseEnter={() => phraseShown && undefined}
                >
                  {/* Blur overlay when not shown */}
                  {!phraseShown && (
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 5,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 11, background: 'rgba(249,250,251,0.05)',
                      pointerEvents: 'none',
                    }}>
                      <EyeOff size={22} color="#9CA3AF" />
                    </div>
                  )}

                  {words.map((word, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 8,
                      background: '#F9FAFB', border: '1px solid #F3F4F6',
                      filter: phraseShown ? 'blur(0)' : 'blur(6px)',
                      transition: 'filter 0.3s ease',
                      userSelect: phraseShown ? 'text' : 'none',
                    }}>
                      <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>#{i + 1}.</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{word}</span>
                    </div>
                  ))}
                </div>

                {/* Show / Copy / Continue */}
                {!phraseShown ? (
                  <>
                    {/* "Show my recovery phrase" */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                      <button
                        onClick={() => setPhraseShown(true)}
                        style={{
                          width: '62%', height: 50, borderRadius: 9999,
                          background: '#4F46E5', color: '#fff', fontSize: 15, fontWeight: 600,
                          border: 'none', cursor: 'pointer',
                          boxShadow: '0 2px 14px rgba(79,70,229,0.35)',
                          transition: 'filter 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                      >
                        Show my recovery phrase
                      </button>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => onDone(true)} style={skipBtnStyle} onMouseEnter={e => (e.currentTarget.style.color = '#374151')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>Skip</button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Click to copy — outlined pill */}
                    <button
                      onClick={copyAll}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        width: '100%', height: 46, borderRadius: 9999, marginBottom: 14,
                        background: 'transparent',
                        border: `1.5px solid ${copied ? '#4F46E5' : '#D1D5DB'}`,
                        color: copied ? '#4F46E5' : '#6B7280',
                        fontSize: 14, fontWeight: 500, cursor: 'pointer',
                        transition: 'border-color 0.15s, color 0.15s',
                      }}
                    >
                      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Click to copy'}
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      <button
                        onClick={() => setStep('verify-phrase')}
                        style={{
                          width: '55%', height: 50, borderRadius: 9999,
                          background: '#4F46E5', color: '#fff', fontSize: 15, fontWeight: 600,
                          border: 'none', cursor: 'pointer',
                          boxShadow: '0 2px 14px rgba(79,70,229,0.3)',
                          transition: 'filter 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                      >
                        Continue
                      </button>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => onDone(true)} style={skipBtnStyle} onMouseEnter={e => (e.currentTarget.style.color = '#374151')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>Skip</button>
                    </div>
                  </>
                )}
              </LightCard>
            </motion.div>
          )}

          {/* ── Verify phrase (3 checks) ─────────────────────────────── */}
          {step === 'verify-phrase' && (
            <motion.div key={`verify-${verifyStep}`} {...SLIDE}>
              {/* No back button on verify — going back would require re-showing phrase */}
              <LightCard style={{ minHeight: 560 }}>
                {/* Title + progress dots */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 60 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>Let's check</h1>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        height: 8,
                        width: i === verifyStep ? 22 : 8,
                        borderRadius: 4,
                        background: i < verifyStep ? '#4F46E5' : i === verifyStep ? '#4F46E5' : '#D1D5DB',
                        opacity: i < verifyStep ? 0.4 : 1,
                        transition: 'all 0.3s ease',
                      }} />
                    ))}
                  </div>
                </div>

                {/* Question */}
                <p style={{ fontSize: 15, color: '#374151', textAlign: 'center', marginBottom: 20 }}>
                  Enter the word in position <strong>{verifyIndices[verifyStep] + 1}</strong> from your recovery phrase.
                </p>

                {/* Input */}
                <input
                  key={verifyStep}
                  type="text"
                  value={verifyInput}
                  onChange={e => { setVerifyInput(e.target.value); setVerifyError(''); }}
                  onKeyDown={e => e.key === 'Enter' && verifyInput && handleVerify()}
                  autoFocus
                  placeholder=""
                  style={{
                    width: '100%', height: 52, borderRadius: 12,
                    padding: '0 18px', fontSize: 16,
                    background: '#F3F4F6',
                    border: verifyError ? '1.5px solid #EF4444' : verifyInput ? '1.5px solid #4F46E5' : '1.5px solid transparent',
                    outline: 'none', fontFamily: 'inherit',
                    color: '#111827', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                    marginBottom: verifyError ? 8 : 32,
                  }}
                />
                {verifyError && <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 24 }}>{verifyError}</p>}

                {/* Forgot to save */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                  <button
                    onClick={() => { setStep('create-phrase'); setPhraseShown(true); setVerifyError(''); setVerifyInput(''); }}
                    style={{
                      width: '75%', height: 46, borderRadius: 9999,
                      background: '#F3F4F6', border: 'none',
                      color: '#4F46E5', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Forgot to save? Go back
                  </button>
                </div>

                {/* Continue */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <button
                    onClick={handleVerify}
                    disabled={!verifyInput.trim()}
                    style={{
                      width: '55%', height: 50, borderRadius: 9999,
                      background: verifyInput.trim() ? '#4F46E5' : '#E5E7EB',
                      color: verifyInput.trim() ? '#fff' : '#9CA3AF',
                      fontSize: 15, fontWeight: 600, border: 'none',
                      cursor: verifyInput.trim() ? 'pointer' : 'not-allowed',
                      transition: 'background 0.2s',
                    }}
                  >
                    Continue
                  </button>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => onDone(true)} style={skipBtnStyle} onMouseEnter={e => (e.currentTarget.style.color = '#374151')} onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}>Skip</button>
                </div>
              </LightCard>
            </motion.div>
          )}

          {/* ── Import ───────────────────────────────────────────────── */}
          {step === 'import' && (
            <motion.div key="import" {...SLIDE}>
              <LightCard>
                {/* Back arrow */}
                <button
                  onClick={() => setStep('import-type')}
                  style={backBtnInCard}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <ArrowLeft size={18} />
                </button>

                <h1 style={{ ...titleStyle, textAlign: 'center' }}>Import an existing wallet</h1>
                <p style={{ ...subStyle, textAlign: 'center', marginBottom: 24 }}>
                  You can paste your entire recovery phrase into any field.
                </p>

                {/* Recovery phrase grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                  {importWords.map((word, i) => (
                    <input
                      key={i}
                      type={showImportWords ? 'text' : 'password'}
                      value={word}
                      placeholder={`Word #${i + 1}`}
                      onChange={e => handleWordChange(i, e.target.value)}
                      onPaste={handleWordPaste}
                      style={{
                        height: 46, borderRadius: 10, padding: '0 14px',
                        fontSize: 14, color: '#111827',
                        background: '#F3F4F6', border: '1.5px solid transparent',
                        outline: 'none', fontFamily: 'inherit',
                        boxSizing: 'border-box', width: '100%',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#C7D2FE'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; }}
                    />
                  ))}
                </div>

                {/* Eye toggle — right-aligned below grid */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <button
                    onClick={() => setShowImportWords(p => !p)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', display: 'flex', alignItems: 'center', padding: 4 }}
                  >
                    {showImportWords ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Word count toggle */}
                <button
                  onClick={toggleImportWordCount}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 9999,
                    background: '#F3F4F6', border: 'none', cursor: 'pointer',
                    color: '#4F46E5', fontSize: 14, fontWeight: 600,
                    marginBottom: 28, transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; }}
                >
                  {importWordCount === 12 ? 'I have a 24-word recovery phrase' : 'I have a 12-word recovery phrase'}
                </button>

                <FieldLabel>New password <Required /></FieldLabel>
                <div style={{ position: 'relative', marginBottom: 32 }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Set a new password" onKeyDown={e => e.key === 'Enter' && handleImport()} style={inputSt} />
                  <EyeBtn show={showPw} toggle={() => setShowPw(p => !p)} />
                </div>

                {error && <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 14 }}>{error}</p>}
                <CenterBtn onClick={handleImport} disabled={!allImportWordsFilled || password.length < 6}>Continue</CenterBtn>
              </LightCard>
            </motion.div>
          )}

          {/* ── You're all set ───────────────────────────────────────── */}
          {step === 'success' && (
            <motion.div key="success" {...SLIDE}>
              <LightCard style={{ textAlign: 'center' }}>
                {/* Wallet illustration + floating coins */}
                <div style={{ position: 'relative', width: 240, height: 210, margin: '0 auto 36px' }}>

                  {/* Soft glow beneath wallet */}
                  <div style={{
                    position: 'absolute', bottom: 12, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 140, height: 22,
                    background: 'rgba(79,70,229,0.18)',
                    borderRadius: '50%',
                    filter: 'blur(12px)',
                  }} />

                  {/* wallet.png — centered, medium-large */}
                  <img
                    src="/wallet.png"
                    alt="Wallet"
                    style={{
                      position: 'absolute',
                      left: '50%', top: '52%',
                      transform: 'translate(-50%, -50%)',
                      width: 148, height: 'auto',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 8px 20px rgba(79,70,229,0.28))',
                    }}
                  />

                  {/* Solana coin — upper left of wallet */}
                  <div style={{
                    position: 'absolute', top: 14, left: 22,
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                  }}>
                    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                      <rect x="0" y="0" width="24" height="4" rx="2" fill="url(#sol-top)" />
                      <rect x="2" y="7" width="22" height="4" rx="2" fill="url(#sol-mid)" />
                      <rect x="0" y="14" width="24" height="4" rx="2" fill="url(#sol-bot)" />
                      <defs>
                        <linearGradient id="sol-top" x1="0" y1="0" x2="24" y2="0">
                          <stop stopColor="#9945FF" /><stop offset="1" stopColor="#00FFA3" />
                        </linearGradient>
                        <linearGradient id="sol-mid" x1="0" y1="0" x2="24" y2="0">
                          <stop stopColor="#9945FF" /><stop offset="1" stopColor="#03E1FF" />
                        </linearGradient>
                        <linearGradient id="sol-bot" x1="0" y1="0" x2="24" y2="0">
                          <stop stopColor="#9945FF" /><stop offset="1" stopColor="#00FFA3" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Ethereum coin — upper right of wallet */}
                  <div style={{
                    position: 'absolute', top: 10, right: 22,
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#627EEA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(98,126,234,0.5)',
                  }}>
                    <svg width="16" height="26" viewBox="0 0 16 26" fill="none">
                      <path d="M8 0L0.5 13.3L8 17.5L15.5 13.3L8 0Z" fill="white" fillOpacity="0.95" />
                      <path d="M8 19.2L0.5 14.9L8 26L15.5 14.9L8 19.2Z" fill="white" fillOpacity="0.72" />
                    </svg>
                  </div>

                  {/* Filecoin coin — right side */}
                  <div style={{
                    position: 'absolute', top: 68, right: 10,
                    width: 34, height: 34, borderRadius: '50%',
                    background: '#0090FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(0,144,255,0.45)',
                  }}>
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                      <path d="M8 2C5.2 2 3 4.2 3 7C3 9.8 5.2 12 8 12C10.8 12 13 9.8 13 7C13 4.2 10.8 2 8 2Z" stroke="white" strokeWidth="1.8" fill="none"/>
                      <line x1="1" y1="7" x2="15" y2="7" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                      <line x1="8" y1="0" x2="8" y2="20" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {/* Decorative dot — gold, lower left */}
                  <div style={{ position: 'absolute', top: 118, left: 20, width: 11, height: 11, borderRadius: '50%', background: '#F59E0B', opacity: 0.85 }} />
                  {/* Decorative dot — pink, upper mid-left */}
                  <div style={{ position: 'absolute', top: 56, left: 64, width: 7, height: 7, borderRadius: '50%', background: '#F472B6', opacity: 0.78 }} />
                  {/* Decorative dot — yellow, lower right */}
                  <div style={{ position: 'absolute', top: 122, right: 24, width: 9, height: 9, borderRadius: '50%', background: '#FBBF24', opacity: 0.82 }} />

                  {/* Star sparkle — pink, left */}
                  <svg style={{ position: 'absolute', top: 48, left: 44 }} width="11" height="11" viewBox="0 0 10 10">
                    <path d="M5 0L5.9 4.1L10 5L5.9 5.9L5 10L4.1 5.9L0 5L4.1 4.1Z" fill="#F472B6" opacity="0.82" />
                  </svg>
                  {/* Star sparkle — gold, right */}
                  <svg style={{ position: 'absolute', top: 108, right: 50 }} width="9" height="9" viewBox="0 0 10 10">
                    <path d="M5 0L5.9 4.1L10 5L5.9 5.9L5 10L4.1 5.9L0 5L4.1 4.1Z" fill="#F59E0B" opacity="0.72" />
                  </svg>
                </div>

                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>You're all set!</h1>
                <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 36px' }}>
                  Your Orivon Wallet is now set up and ready for use.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => onDone(true)}
                    style={{
                      width: '62%', height: 50, borderRadius: 9999,
                      background: '#4F46E5', color: '#fff',
                      fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                      transition: 'filter 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  >
                    Go to portfolio
                  </button>
                </div>
              </LightCard>
            </motion.div>
          )}

        </AnimatePresence>

        </div>
        </div>
      </div>
    );
  }

  // ── GRADIENT LAYOUT (welcome + choose) ───────────────────────────────────────
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/background.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 20, display: 'flex', gap: 20 }}>
        <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><CircleHelp size={20} /></button>
        <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><Settings size={20} /></button>
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <AnimatePresence mode="wait">

          {step === 'welcome' && (
            <motion.div key="welcome" {...SLIDE} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{ position: 'relative', zIndex: 2, marginBottom: -58 }}>
                <img
                  src="/logo.jpg" alt="Orivon"
                  style={{ width: 116, height: 116, borderRadius: 28, objectFit: 'contain', boxShadow: '0 12px 40px rgba(0,255,135,0.30),0 4px 12px rgba(0,0,0,0.5)' }}
                  onError={e => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const fb = document.createElement('div');
                    fb.style.cssText = 'width:116px;height:116px;border-radius:28px;background:linear-gradient(145deg,#00FF87,#00E87A);display:flex;align-items:center;justify-content:center;box-shadow:0 12px 40px rgba(0,255,135,0.40)';
                    el.parentNode?.appendChild(fb);
                  }}
                />
              </div>
              <GradCard>
                <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.8px', lineHeight: 1.15 }}>Where Web3 Feels Natural.</h1>
                <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: '0 0 44px' }}>
                  Wallets, decentralized apps, ENS domains, and <br />
                  secure identity built directly into your browser.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                  <GradBtn onClick={() => setStep('choose')}>Create Wallet</GradBtn>
                  <PlainBtn onClick={() => onDone(false)}>Explore First</PlainBtn>
                </div>
              </GradCard>
            </motion.div>
          )}

          {step === 'choose' && (
            <motion.div key="choose" {...SLIDE} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {/* No back button on choose step — user requested removal */}
              <div style={{ position: 'relative', zIndex: 2, marginBottom: -58 }}>
                <img
                  src="/logo.jpg" alt="Orivon"
                  style={{ width: 116, height: 116, borderRadius: 28, objectFit: 'contain', boxShadow: '0 12px 40px rgba(0,255,135,0.30),0 4px 12px rgba(0,0,0,0.5)' }}
                  onError={e => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const fb = document.createElement('div');
                    fb.style.cssText = 'width:116px;height:116px;border-radius:28px;background:linear-gradient(145deg,#00FF87,#00E87A);display:flex;align-items:center;justify-content:center;box-shadow:0 12px 40px rgba(0,255,135,0.40)';
                    el.parentNode?.appendChild(fb);
                  }}
                />
              </div>
              <GradCard>
                <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', margin: '0 0 18px', letterSpacing: '-0.7px', lineHeight: 1.18 }}>Create Your Secure Wallet.</h1>
                <p style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: '0 0 14px', lineHeight: 1.5 }}>Your identity, assets, and Web3 access start here.</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, margin: '0 0 40px' }}>
                  Create a new wallet or restore an existing one in seconds. Your keys stay encrypted and stored only on your device.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  <GradBtn onClick={() => { setMode('create'); setStep('before-we-begin'); }}>Create Wallet</GradBtn>
                  <PlainBtn onClick={() => { setMode('import'); setStep('before-we-begin'); }}>Import Existing Wallet</PlainBtn>
                </div>
              </GradCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Shared components & styles ───────────────────────────────────────────────

function LightCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 28px 24px' }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        padding: '36px 56px 48px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        ...style,
      }}>
        {children}
      </div>
    </div>
  );
}

// Shared style for back button inside a LightCard
const backBtnInCard: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  border: '1.5px solid #C7D2FE', background: 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#4F46E5', marginBottom: 20,
  transition: 'background 0.12s',
};

// Import option row style
const importOptionRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 16,
  padding: '20px 0', cursor: 'pointer',
  transition: 'background 0.1s', borderRadius: 8, margin: '0 -8px', paddingLeft: 8, paddingRight: 8,
};

// Simple SVG arrow-right (used on import-type screen)
function ArrowRight({ size = 20, color = '#4F46E5', style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function GradCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', maxWidth: 680, borderRadius: 24, padding: '94px 64px 52px', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', textAlign: 'center', position: 'relative', zIndex: 1, boxShadow: '0 20px 60px rgba(0,0,0,0.30)' }}>
      {children}
    </div>
  );
}

function BackCircle({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '8px 40px 16px' }}>
      <button
        onClick={onClick}
        style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #C7D2FE', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4F46E5' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <ArrowLeft size={18} />
      </button>
    </div>
  );
}

function GradBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '68%', height: 56, borderRadius: 9999, background: '#4F46E5', color: '#fff', fontSize: 17, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(79,70,229,0.45)', transition: 'filter 0.15s' }} onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.14)'; }} onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}>
      {children}
    </button>
  );
}
function PlainBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.60)', fontSize: 16, cursor: 'pointer', padding: '4px 0', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.90)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.60)')}>
      {children}
    </button>
  );
}
function CenterBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button onClick={onClick} disabled={disabled} style={{ width: '55%', height: 50, borderRadius: 9999, background: disabled ? '#E5E7EB' : '#4F46E5', color: disabled ? '#9CA3AF' : '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s, filter 0.15s' }} onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }} onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}>
        {children}
      </button>
    </div>
  );
}
function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return <button onClick={toggle} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>;
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{children}</label>;
}
function Required() { return <span style={{ color: '#EF4444' }}> *</span>; }

const titleStyle: React.CSSProperties = { fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 12px' };
const subStyle:   React.CSSProperties = { fontSize: 15, color: '#6B7280', lineHeight: 1.6, margin: '0 0 28px' };
const inputSt:    React.CSSProperties = { width: '100%', height: 52, borderRadius: 12, padding: '0 48px 0 18px', fontSize: 15, color: '#111827', background: '#F9FAFB', border: '1px solid #E5E7EB', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', display: 'block', marginBottom: 8 };
const skipBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#9CA3AF', fontSize: 15, cursor: 'pointer', padding: '4px 0', transition: 'color 0.15s' };

