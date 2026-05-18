/**
 * WalletModal — fullscreen onboarding-style flow triggered from the browser.
 * Covers: choose → before-we-begin → supported-networks → create flow
 *                                                        → import flow
 * Also handles the unlock flow.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Eye, EyeOff, Copy, CheckCircle,
  Globe, Lock, X,
} from 'lucide-react';
import { useWalletStore } from '../../store/wallet';

interface WalletModalProps {
  mode: 'create' | 'import' | 'unlock';
  onClose:   () => void;
  onSuccess?: () => void;
}

type ModalStep =
  | 'choose'
  | 'before-we-begin'
  | 'supported-networks'
  | 'create-password'
  | 'encrypting'
  | 'create-phrase'
  | 'verify-phrase'
  | 'import'
  | 'unlock'
  | 'success';

const SLIDE = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

const SUPPORTED_NETWORKS = [
  { name: 'Ethereum',  sub: 'ETH · EVM Chains · Base · Optimism', color: '#627EEA', icon: 'Ξ' },
  { name: 'Solana',    sub: 'SOL · Solana Mainnet',                color: '#9945FF', icon: '◎' },
  { name: 'Bitcoin',   sub: 'BTC · Bitcoin Mainnet',               color: '#F7931A', icon: '₿' },
  { name: 'Polygon',   sub: 'MATIC · Polygon Mainnet',             color: '#8247E5', icon: 'M' },
  { name: 'BNB Chain', sub: 'BNB · BNB Smart Chain',               color: '#F3BA2F', icon: 'B' },
  { name: 'Filecoin',  sub: 'FIL · Filecoin Mainnet',              color: '#0090FF', icon: 'F' },
];

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

function pickVerifyIndices(): number[] {
  const all = Array.from({ length: 12 }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, 3).sort((a, b) => a - b);
}

export default function WalletModal({ mode, onClose, onSuccess }: WalletModalProps) {
  const { generateMnemonic, createWallet, importWallet, unlock } = useWalletStore();

  const [step, setStep]     = useState<ModalStep>(mode === 'unlock' ? 'unlock' : 'choose');
  const [mnemonic]          = useState(() => generateMnemonic());
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phraseShown, setPhraseShown] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [progress, setProgress]       = useState(0);
  const [error, setError]             = useState('');
  const [checked1, setChecked1]       = useState(false);
  const [checked2, setChecked2]       = useState(false);
  const [unlockFailed, setUnlockFailed] = useState(false);

  // Import word-grid state
  const [importWordCount, setImportWordCount] = useState<12 | 24>(12);
  const [importWords, setImportWords]         = useState<string[]>(Array(12).fill(''));
  const [showImportWords, setShowImportWords] = useState(false);

  // Verify step
  const [verifyIndices]   = useState(() => pickVerifyIndices());
  const [verifyStep, setVerifyStep]   = useState(0);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const words    = mnemonic.split(' ');
  const strength = pwStrength(password);
  const canContinue = password.length >= 6 && password === confirmPw;
  const allImportWordsFilled = importWords.length > 0 && importWords.every(w => w.trim().length > 0);
  const bothChecked = checked1 && checked2;

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
    const phrase = importWords.join(' ').trim();
    const wc = phrase.split(/\s+/).length;
    if (wc !== 12 && wc !== 24) { setError('Enter a valid 12 or 24 word recovery phrase'); return; }
    if (password.length < 6)    { setError('Password must be at least 6 characters'); return; }
    setError(''); setStep('encrypting');
    try {
      await importWallet(phrase, password, setProgress);
      setStep('success');
    } catch (e) { setStep('import'); setError(String(e)); }
  }, [importWords, password, importWallet]);

  const handleUnlock = useCallback(async () => {
    setUnlockFailed(false);
    const ok = await unlock(password);
    if (ok) { onSuccess?.(); onClose(); }
    else    { setUnlockFailed(true); }
  }, [password, unlock, onSuccess, onClose]);

  const handleVerify = () => {
    const expected = words[verifyIndices[verifyStep]].toLowerCase().trim();
    if (verifyInput.toLowerCase().trim() !== expected) {
      setVerifyError('Incorrect. Check your phrase and try again.');
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
  };

  const handleWordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const pasted = text.trim().split(/\s+/);
    if (pasted.length > 1) {
      e.preventDefault();
      const next = Array(importWordCount).fill('');
      pasted.slice(0, importWordCount).forEach((w, i) => { next[i] = w; });
      setImportWords(next);
    }
  };

  const toggleImportWordCount = () => {
    const newCount = importWordCount === 12 ? 24 : 12;
    const next = newCount === 24
      ? [...importWords, ...Array(12).fill('')]
      : importWords.slice(0, 12);
    setImportWordCount(newCount as 12 | 24);
    setImportWords(next);
  };

  // Shared inline styles
  const titleSt: React.CSSProperties = { fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 12px' };
  const subSt:   React.CSSProperties = { fontSize: 15, color: '#6B7280', lineHeight: 1.6, margin: '0 0 28px' };
  const inputSt: React.CSSProperties = { width: '100%', height: 52, borderRadius: 12, padding: '0 48px 0 18px', fontSize: 15, color: '#111827', background: '#F9FAFB', border: '1px solid #E5E7EB', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', display: 'block', marginBottom: 8 };
  const backBtn: React.CSSProperties = { width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #C7D2FE', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4F46E5', marginBottom: 20, transition: 'background 0.12s' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: '#F5F6FA', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '18px 40px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.jpg" alt="Orivon" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>Orivon Wallet</span>
        </div>
        <button
          onClick={onClose}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280', transition: 'background 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Step content ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ── CHOOSE ────────────────────────────────────────────────────── */}
        {step === 'choose' && (
          <motion.div key="choose" {...SLIDE} style={{ flex: 1 }}>
            <div style={{ maxWidth: 820, margin: '32px auto', padding: '0 28px 40px' }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111827', marginBottom: 12, lineHeight: 1.15 }}>
                Browser-native. Self-custody.<br />And multi-chain.
              </h1>
              <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.65, marginBottom: 40, maxWidth: 620 }}>
                Take control of your crypto and NFTs. Orivon Wallet supports Ethereum, EVM chains, Solana, Filecoin, Bitcoin, and more.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Create card */}
                <div
                  onClick={() => setStep('before-we-begin')}
                  style={{ background: '#fff', borderRadius: 18, padding: 32, cursor: 'pointer', border: '1.5px solid #E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#4F46E5'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(79,70,229,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.06)'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 24, color: '#4F46E5', fontWeight: 700 }}>
                    +
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Need a new wallet?</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.55 }}>Get started with Orivon Wallet in minutes.</p>
                </div>

                {/* Import card */}
                <div
                  onClick={() => setStep('import')}
                  style={{ background: '#fff', borderRadius: 18, padding: 32, cursor: 'pointer', border: '1.5px solid #E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#4F46E5'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(79,70,229,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.06)'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 22 }}>
                    ↓
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Already have a wallet?</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 18px', lineHeight: 1.55 }}>Import using your existing seed phrase.</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['🦁', '🟣', '🦊', '🔵', '🔒', '🔳'].map((icon, i) => (
                      <span key={i} style={{ fontSize: 20 }}>{icon}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BEFORE WE BEGIN ───────────────────────────────────────────── */}
        {step === 'before-we-begin' && (
          <motion.div key="before-we-begin" {...SLIDE}>
            <Card>
              <button style={backBtn} onClick={() => setStep('choose')} onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <ArrowLeft size={18} />
              </button>

              <h1 style={{ ...titleSt, textAlign: 'center' }}>Before we begin</h1>
              <p style={{ ...subSt, textAlign: 'center' }}>We require that you acknowledge the items below</p>

              <label style={{ display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 24 }}>
                <input type="checkbox" checked={checked1} onChange={e => setChecked1(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: '#4F46E5', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>
                  I understand that this is a self-custody wallet, and that I am solely responsible for any associated funds, assets, or accounts, and for taking any appropriate action to secure, protect, and back up my wallet. I understand that Orivon cannot access my wallet or reverse transactions on my behalf, and that my recovery phrase is the ONLY way to regain access in the event of a lost password, stolen device, or similar circumstance.
                </span>
              </label>

              <label style={{ display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', marginBottom: 40 }}>
                <input type="checkbox" checked={checked2} onChange={e => setChecked2(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#4F46E5', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#374151' }}>
                  I have read and agree to the{' '}
                  <a href="#" onClick={e => e.preventDefault()} style={{ color: '#4F46E5', textDecoration: 'none' }}>Terms of use</a>.
                </span>
              </label>

              <CenterBtn onClick={() => { setChecked1(false); setChecked2(false); setStep('supported-networks'); }} disabled={!bothChecked}>
                Continue
              </CenterBtn>
            </Card>
          </motion.div>
        )}

        {/* ── SUPPORTED NETWORKS ────────────────────────────────────────── */}
        {step === 'supported-networks' && (
          <motion.div key="supported-networks" {...SLIDE}>
            <Card>
              <button style={backBtn} onClick={() => setStep('before-we-begin')} onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <ArrowLeft size={18} />
              </button>

              <h1 style={{ ...titleSt, textAlign: 'center' }}>Supported Networks</h1>
              <p style={{ ...subSt, textAlign: 'center' }}>Orivon Wallet supports the following networks out of the box.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
                {SUPPORTED_NETWORKS.map(net => (
                  <div key={net.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: net.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                      {net.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{net.name}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{net.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <CenterBtn onClick={() => setStep('create-password')}>
                Continue with {SUPPORTED_NETWORKS.length} Networks
              </CenterBtn>
            </Card>
          </motion.div>
        )}

        {/* ── CREATE PASSWORD ───────────────────────────────────────────── */}
        {step === 'create-password' && (
          <motion.div key="create-password" {...SLIDE}>
            <Card>
              <button style={backBtn} onClick={() => setStep('supported-networks')} onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <ArrowLeft size={18} />
              </button>

              <h1 style={{ ...titleSt, textAlign: 'center' }}>Create a new password</h1>
              <p style={{ ...subSt, textAlign: 'center' }}>You will use this password each time you access your wallet.</p>

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
            </Card>
          </motion.div>
        )}

        {/* ── ENCRYPTING ────────────────────────────────────────────────── */}
        {step === 'encrypting' && (
          <motion.div key="encrypting" {...SLIDE}>
            <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 460 }}>
              <div style={{ width: 52, height: 52, marginBottom: 22 }}>
                <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: 'modalSpin 1s linear infinite' }}>
                  <style>{`@keyframes modalSpin { to { transform: rotate(360deg); } }`}</style>
                  <circle cx="26" cy="26" r="22" stroke="#E0E7FF" strokeWidth="3" fill="none" />
                  <circle cx="26" cy="26" r="22" stroke="#4F46E5" strokeWidth="3" fill="none" strokeDasharray="110" strokeDashoffset="80" strokeLinecap="round" />
                </svg>
              </div>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 }}>Creating Wallet…</p>
            </Card>
          </motion.div>
        )}

        {/* ── RECOVERY PHRASE ───────────────────────────────────────────── */}
        {step === 'create-phrase' && (
          <motion.div key="create-phrase" {...SLIDE}>
            <Card>
              <h1 style={{ ...titleSt, textAlign: 'center' }}>Save your recovery phrase</h1>
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.65, marginBottom: 16 }}>
                The 12-word recovery phrase is a private key you can use to regain access to your wallet in case you lose a connected device. Store it someplace safe, and in the exact order it appears below.
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.5, marginBottom: 28 }}>
                Keep it in a secure place that is not accessible to others and avoid sharing it with anyone.
              </p>

              <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14, position: 'relative', cursor: 'default' }}>
                {!phraseShown && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 11, background: 'rgba(249,250,251,0.05)', pointerEvents: 'none' }}>
                    <EyeOff size={22} color="#9CA3AF" />
                  </div>
                )}
                {words.map((word, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #F3F4F6', filter: phraseShown ? 'blur(0)' : 'blur(6px)', transition: 'filter 0.3s ease', userSelect: phraseShown ? 'text' : 'none' }}>
                    <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>#{i + 1}.</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{word}</span>
                  </div>
                ))}
              </div>

              {!phraseShown ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => setPhraseShown(true)} style={{ width: '62%', height: 50, borderRadius: 9999, background: '#4F46E5', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 14px rgba(79,70,229,0.35)', transition: 'filter 0.15s' }} onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }} onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}>
                    Show my recovery phrase
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={copyAll} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', height: 46, borderRadius: 9999, marginBottom: 14, background: 'transparent', border: `1.5px solid ${copied ? '#4F46E5' : '#D1D5DB'}`, color: copied ? '#4F46E5' : '#6B7280', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}>
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Click to copy'}
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => setStep('verify-phrase')} style={{ width: '55%', height: 50, borderRadius: 9999, background: '#4F46E5', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 14px rgba(79,70,229,0.3)', transition: 'filter 0.15s' }} onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }} onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}>
                      Continue
                    </button>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}

        {/* ── VERIFY PHRASE ─────────────────────────────────────────────── */}
        {step === 'verify-phrase' && (
          <motion.div key={`verify-${verifyStep}`} {...SLIDE}>
            <Card style={{ minHeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 60 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>Let's check</h1>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ height: 8, width: i === verifyStep ? 22 : 8, borderRadius: 4, background: i < verifyStep ? '#4F46E5' : i === verifyStep ? '#4F46E5' : '#D1D5DB', opacity: i < verifyStep ? 0.4 : 1, transition: 'all 0.3s ease' }} />
                  ))}
                </div>
              </div>

              <p style={{ fontSize: 15, color: '#374151', textAlign: 'center', marginBottom: 20 }}>
                Enter the word in position <strong>{verifyIndices[verifyStep] + 1}</strong> from your recovery phrase.
              </p>

              <input key={verifyStep} type="text" value={verifyInput} onChange={e => { setVerifyInput(e.target.value); setVerifyError(''); }} onKeyDown={e => e.key === 'Enter' && verifyInput && handleVerify()} autoFocus style={{ width: '100%', height: 52, borderRadius: 12, padding: '0 18px', fontSize: 16, background: '#F3F4F6', border: verifyError ? '1.5px solid #EF4444' : verifyInput ? '1.5px solid #4F46E5' : '1.5px solid transparent', outline: 'none', fontFamily: 'inherit', color: '#111827', boxSizing: 'border-box', transition: 'border-color 0.15s', marginBottom: verifyError ? 8 : 32 }} />
              {verifyError && <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 24 }}>{verifyError}</p>}

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                <button onClick={() => { setStep('create-phrase'); setPhraseShown(true); setVerifyError(''); setVerifyInput(''); }} style={{ width: '75%', height: 46, borderRadius: 9999, background: '#F3F4F6', border: 'none', color: '#4F46E5', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Forgot to save? Go back
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={handleVerify} disabled={!verifyInput.trim()} style={{ width: '55%', height: 50, borderRadius: 9999, background: verifyInput.trim() ? '#4F46E5' : '#E5E7EB', color: verifyInput.trim() ? '#fff' : '#9CA3AF', fontSize: 15, fontWeight: 600, border: 'none', cursor: verifyInput.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
                  Continue
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── IMPORT ────────────────────────────────────────────────────── */}
        {step === 'import' && (
          <motion.div key="import" {...SLIDE}>
            <Card>
              <button style={backBtn} onClick={() => setStep('choose')} onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <ArrowLeft size={18} />
              </button>

              <h1 style={{ ...titleSt, textAlign: 'center' }}>Import an existing wallet</h1>
              <p style={{ ...subSt, textAlign: 'center', marginBottom: 24 }}>
                You can paste your entire recovery phrase into any field.
              </p>

              {/* Word grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                {importWords.map((word, i) => (
                  <input
                    key={i}
                    type={showImportWords ? 'text' : 'password'}
                    value={word}
                    placeholder={`Word #${i + 1}`}
                    onChange={e => handleWordChange(i, e.target.value)}
                    onPaste={handleWordPaste}
                    style={{ height: 46, borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#111827', background: '#F3F4F6', border: '1.5px solid transparent', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%', transition: 'border-color 0.15s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#C7D2FE'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; }}
                  />
                ))}
              </div>

              {/* Eye toggle */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={() => setShowImportWords(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', display: 'flex', alignItems: 'center', padding: 4 }}>
                  {showImportWords ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Word count toggle */}
              <button
                onClick={toggleImportWordCount}
                style={{ width: '100%', padding: '14px 0', borderRadius: 9999, background: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#4F46E5', fontSize: 14, fontWeight: 600, marginBottom: 28, transition: 'background 0.12s' }}
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
            </Card>
          </motion.div>
        )}

        {/* ── UNLOCK ────────────────────────────────────────────────────── */}
        {step === 'unlock' && (
          <motion.div key="unlock" {...SLIDE}>
            <Card>
              <h1 style={{ ...titleSt, textAlign: 'center' }}>Unlock your wallet</h1>
              <p style={{ ...subSt, textAlign: 'center' }}>Enter your wallet password to continue.</p>

              <div style={{ position: 'relative', marginBottom: 28 }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setUnlockFailed(false); }} placeholder="Your wallet password" autoFocus style={inputSt} onKeyDown={e => e.key === 'Enter' && handleUnlock()} />
                <EyeBtn show={showPw} toggle={() => setShowPw(p => !p)} />
              </div>
              {unlockFailed && <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 14 }}>Incorrect password. Try again.</p>}
              <CenterBtn onClick={handleUnlock} disabled={password.length < 1}>Unlock</CenterBtn>
            </Card>
          </motion.div>
        )}

        {/* ── SUCCESS ───────────────────────────────────────────────────── */}
        {step === 'success' && (
          <motion.div key="success" {...SLIDE}>
            <Card style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 180, height: 160, margin: '0 auto 28px' }}>
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -30%)', width: 120, height: 80, borderRadius: 16, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(79,70,229,0.35)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={20} color="#fff" strokeWidth={2} />
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 8, right: 16, width: 36, height: 36, borderRadius: '50%', background: '#627EEA', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(98,126,234,0.4)' }}>
                  <span style={{ fontSize: 16, color: '#fff' }}>Ξ</span>
                </div>
                <div style={{ position: 'absolute', top: 22, left: 12, width: 30, height: 30, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  <span style={{ fontSize: 13, color: '#F7931A' }}>₿</span>
                </div>
                <div style={{ position: 'absolute', top: 70, right: 8, width: 24, height: 24, borderRadius: '50%', background: '#9945FF', boxShadow: '0 3px 8px rgba(153,69,255,0.4)' }} />
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>You're all set!</h1>
              <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 36px' }}>Your Orivon Wallet is now set up and ready for Web3.</p>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => { onSuccess?.(); onClose(); }}
                  style={{ width: '62%', height: 50, borderRadius: 9999, background: '#4F46E5', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,70,229,0.35)', transition: 'filter 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                >
                  Enter the world of Orivon
                </button>
              </div>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>

      <div style={{ height: 40, flexShrink: 0 }} />
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 28px 24px' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '36px 56px 48px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', ...style }}>
        {children}
      </div>
    </div>
  );
}

function CenterBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ width: '55%', height: 50, borderRadius: 9999, background: disabled ? '#E5E7EB' : '#4F46E5', color: disabled ? '#9CA3AF' : '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s, filter 0.15s' }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
      >
        {children}
      </button>
    </div>
  );
}

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button onClick={toggle} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{children}</label>;
}

function Required() {
  return <span style={{ color: '#EF4444' }}> *</span>;
}
