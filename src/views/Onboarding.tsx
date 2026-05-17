import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Eye, EyeOff, Copy, CheckCircle,
  Globe, CircleHelp, Settings, Lock, EyeOff as EyeOffIcon
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step =
  | 'welcome' | 'choose'
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
  const [mnemonic]                = useState(() => generateMnemonic());
  const [importPhrase, setImport] = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phraseShown, setPhraseShown] = useState(false);   // true after "Show" is clicked
  const [copied, setCopied]       = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');

  // Verify step
  const [verifyIndices]           = useState(() => pickVerifyIndices());
  const [verifyStep, setVerifyStep] = useState(0);  // 0,1,2
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const words   = mnemonic.split(' ');
  const strength = pwStrength(password);
  const canContinue = password.length >= 6 && password === confirmPw;

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

  const isGradientStep = step === 'welcome' || step === 'choose';

  // ── LIGHT THEME (inner steps) ─────────────────────────────────────────────
  if (!isGradientStep) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F6FA', overflowY: 'auto' }}>
        {/* Wallet header — scrolls away */}
        <div style={{ padding: '24px 48px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#00FF87', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={15} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E' }}>Orivon Wallet</span>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Create password ──────────────────────────────────────── */}
          {step === 'create-password' && (
            <motion.div key="create-pw" {...SLIDE}>
              <BackCircle onClick={() => setStep('choose')} />
              <LightCard>
                <h1 style={titleStyle}>Create a new password</h1>
                <p style={subStyle}>You will use this password each time you access your wallet.</p>

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
            <motion.div key="phrase" {...SLIDE}>
              <BackCircle onClick={() => setStep('create-password')} />
              <LightCard>
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
              <BackCircle onClick={() => setStep('choose')} />
              <LightCard>
                <h1 style={titleStyle}>Restore your wallet</h1>
                <p style={{ ...subStyle, marginBottom: 32 }}>Enter your 12 or 24-word recovery phrase to restore access.</p>

                <FieldLabel>Recovery phrase <Required /></FieldLabel>
                <textarea value={importPhrase} onChange={e => setImport(e.target.value)} placeholder="word1 word2 word3..." rows={4} style={{ ...inputSt, resize: 'none', fontFamily: 'monospace', paddingTop: 14, height: 'auto', marginBottom: 20 }} />

                <FieldLabel>New password <Required /></FieldLabel>
                <div style={{ position: 'relative', marginBottom: 32 }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Set a new password" onKeyDown={e => e.key === 'Enter' && handleImport()} style={inputSt} />
                  <EyeBtn show={showPw} toggle={() => setShowPw(p => !p)} />
                </div>

                {error && <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginBottom: 14 }}>{error}</p>}
                <CenterBtn onClick={handleImport} disabled={importPhrase.trim().split(/\s+/).length < 12 || password.length < 6}>Import Wallet</CenterBtn>
              </LightCard>
            </motion.div>
          )}

          {/* ── You're all set ───────────────────────────────────────── */}
          {step === 'success' && (
            <motion.div key="success" {...SLIDE}>
              <LightCard style={{ textAlign: 'center' }}>
                {/* Wallet illustration */}
                <div style={{ position: 'relative', width: 180, height: 160, margin: '0 auto 28px' }}>
                  {/* Main wallet card */}
                  <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translate(-50%, -30%)',
                    width: 120, height: 80, borderRadius: 16,
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={20} color="#fff" strokeWidth={2} />
                    </div>
                  </div>
                  {/* Floating coins */}
                  <div style={{ position: 'absolute', top: 8, right: 16, width: 36, height: 36, borderRadius: '50%', background: '#627EEA', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(98,126,234,0.4)' }}>
                    <span style={{ fontSize: 16 }}>Ξ</span>
                  </div>
                  <div style={{ position: 'absolute', top: 22, left: 12, width: 30, height: 30, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                    <span style={{ fontSize: 13, color: '#F7931A' }}>₿</span>
                  </div>
                  <div style={{ position: 'absolute', top: 70, right: 8, width: 24, height: 24, borderRadius: '50%', background: '#9945FF', boxShadow: '0 3px 8px rgba(153,69,255,0.4)' }} />
                  {/* Stars */}
                  {[{ t: 100, l: 30, s: 10 }, { t: 40, l: 78, s: 7 }, { t: 115, r: 30, s: 8 }].map((p, i) => (
                    <div key={i} style={{ position: 'absolute', top: p.t, left: p.l, right: (p as any).r, width: p.s, height: p.s, borderRadius: '50%', background: i === 0 ? '#F59E0B' : '#EC4899', opacity: 0.7 }} />
                  ))}
                </div>

                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>You're all set!</h1>
                <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 36px' }}>
                  Your Orivon Wallet is now set up and ready for Web3.
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
                    Enter the world of Orivon
                  </button>
                </div>
              </LightCard>
            </motion.div>
          )}

        </AnimatePresence>
        <div style={{ height: 60 }} />
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
                <div style={{ width: 116, height: 116, borderRadius: 28, background: 'linear-gradient(145deg,#00FF87,#00E87A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(0,255,135,0.40),0 4px 12px rgba(0,0,0,0.5)' }}>
                  <Globe size={56} color="#000" strokeWidth={1.8} />
                </div>
              </div>
              <GradCard>
                <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.8px', lineHeight: 1.15 }}>Web3. By Default.</h1>
                <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: '0 0 44px' }}>
                  Browse ENS domains and decentralized apps natively.<br />
                  Your wallet lives inside the browser, not an extension.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                  <GradBtn onClick={() => setStep('choose')}>Create / Import Wallet</GradBtn>
                  <PlainBtn onClick={() => onDone(false)}>Skip</PlainBtn>
                </div>
              </GradCard>
            </motion.div>
          )}

          {step === 'choose' && (
            <motion.div key="choose" {...SLIDE} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {/* Back button above logo */}
              <div style={{ width: '100%', maxWidth: 680, marginBottom: 12, paddingLeft: 4 }}>
                <button
                  onClick={() => setStep('welcome')}
                  style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', backdropFilter: 'blur(8px)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                >
                  <ArrowLeft size={18} />
                </button>
              </div>
              <div style={{ position: 'relative', zIndex: 2, marginBottom: -58 }}>
                <div style={{ width: 116, height: 116, borderRadius: 28, background: 'linear-gradient(145deg,#00FF87,#00E87A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(0,255,135,0.40),0 4px 12px rgba(0,0,0,0.5)' }}>
                  <Globe size={56} color="#000" strokeWidth={1.8} />
                </div>
              </div>
              <GradCard>
                <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', margin: '0 0 18px', letterSpacing: '-0.7px', lineHeight: 1.18 }}>Create or restore<br />your wallet.</h1>
                <p style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: '0 0 14px', lineHeight: 1.5 }}>Your keys. Your crypto. Your browser.</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, margin: '0 0 40px' }}>
                  Generate a new 12-word seed phrase or restore an existing wallet. Your keys are encrypted and stored only on this device.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  <GradBtn onClick={() => setStep('create-password')}>Create Wallet</GradBtn>
                  <PlainBtn onClick={() => setStep('import')}>Import Wallet</PlainBtn>
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
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 40px 0' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '44px 52px 48px', boxShadow: '0 2px 20px rgba(0,0,0,0.07)', ...style }}>
        {children}
      </div>
    </div>
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
