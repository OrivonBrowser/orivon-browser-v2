import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, X, Eye, EyeOff, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import { useSettings } from '../../store/settings';

interface WalletModalProps {
  mode: 'create' | 'import' | 'unlock';
  onClose:   () => void;
  onSuccess?: () => void;
}

export default function WalletModal({ mode, onClose, onSuccess }: WalletModalProps) {
  const { theme } = useSettings();
  const { generateMnemonic, createWallet, importWallet, unlock } = useWalletStore();

  const [step, setStep]           = useState<'phrase' | 'password' | 'encrypting' | 'done'>(
    mode === 'unlock' ? 'password' : mode === 'create' ? 'phrase' : 'password'
  );
  const [mnemonic, setMnemonic]   = useState(() => mode === 'create' ? generateMnemonic() : '');
  const [importPhrase, setImport] = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [copied, setCopied]       = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');
  const [unlockFailed, setUnlockFailed] = useState(false);

  const isDark  = theme === 'dark';
  const overlay = 'fixed inset-0 z-[200] flex items-center justify-center p-6';
  const card    = isDark
    ? 'bg-[#1a1a1a] border border-white/10 shadow-2xl'
    : 'bg-white border border-black/10 shadow-2xl';

  const words = mnemonic.split(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = useCallback(async () => {
    if (password.length < 4)      { setError('Password must be at least 4 characters'); return; }
    if (password !== confirm)     { setError('Passwords do not match'); return; }
    setError('');
    setStep('encrypting');
    try {
      await createWallet(mnemonic, password, setProgress);
      setStep('done');
    } catch (e) {
      setStep('password');
      setError(String(e));
    }
  }, [password, confirm, mnemonic, createWallet]);

  const handleImport = useCallback(async () => {
    const phrase = importPhrase.trim();
    const wordCount = phrase.split(/\s+/).length;
    if (wordCount !== 12 && wordCount !== 24) { setError('Must be 12 or 24 words'); return; }
    if (password.length < 4)                  { setError('Password must be at least 4 characters'); return; }
    setError('');
    setStep('encrypting');
    try {
      await importWallet(phrase, password, setProgress);
      setStep('done');
    } catch (e) {
      setStep('password');
      setError(String(e));
    }
  }, [importPhrase, password, importWallet]);

  const handleUnlock = useCallback(async () => {
    setUnlockFailed(false);
    const ok = await unlock(password);
    if (ok) { onSuccess?.(); onClose(); }
    else    { setUnlockFailed(true); }
  }, [password, unlock, onSuccess, onClose]);

  const textHi  = isDark ? 'text-white/80'  : 'text-black/80';
  const textMid = isDark ? 'text-white/45'  : 'text-black/45';
  const textLow = isDark ? 'text-white/25'  : 'text-black/25';
  const inputCls = `w-full h-10 border rounded-xl px-4 text-[13px] font-mono focus:outline-none transition-all ${
    isDark
      ? 'bg-black/40 border-white/10 text-white/75 focus:border-white/25 placeholder:text-white/20'
      : 'bg-white border-black/10 text-black/75 focus:border-black/25 placeholder:text-black/20'
  }`;

  return (
    <div className={overlay}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.95,    y: 12 }}
        className={`relative w-full max-w-md rounded-2xl ${card} overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/8' : 'border-black/8'}`}>
          <div className="flex items-center gap-3">
            {mode === 'create'  && <Shield size={16} className="text-[#00FF87]" />}
            {mode === 'import'  && <Key    size={16} className="text-[#00D1FF]" />}
            {mode === 'unlock'  && <Shield size={16} className="text-yellow-500" />}
            <span className={`text-[14px] font-semibold ${textHi}`}>
              {mode === 'create' ? 'Create Wallet' : mode === 'import' ? 'Import Wallet' : 'Unlock Wallet'}
            </span>
          </div>
          <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${textLow} ${isDark ? 'hover:bg-white/8' : 'hover:bg-black/6'} transition-all`}>
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Create: show seed phrase ────────────────────────────────────── */}
          {mode === 'create' && step === 'phrase' && (
            <>
              <div>
                <p className={`text-[13px] font-semibold ${textHi} mb-1`}>Your Recovery Phrase</p>
                <p className={`text-[11px] ${textLow}`}>Write these 12 words down in order. Never share them with anyone.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {words.map((word, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-black/30' : 'bg-[#f0f0f0]'} border ${isDark ? 'border-white/6' : 'border-black/6'}`}>
                    <span className={`text-[9px] font-bold ${textLow} w-4 shrink-0`}>{i + 1}</span>
                    <span className={`text-[11px] font-mono font-bold ${textHi}`}>{word}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 w-full h-9 rounded-xl justify-center text-[11px] font-medium transition-all ${
                  copied
                    ? 'bg-[#00FF87]/15 text-[#00FF87]'
                    : `${isDark ? 'bg-white/[0.04] text-white/45 hover:bg-white/8' : 'bg-black/[0.04] text-black/45 hover:bg-black/6'}`
                } border ${isDark ? 'border-white/8' : 'border-black/8'}`}
              >
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
              <button
                onClick={() => setStep('password')}
                className="w-full h-10 rounded-xl bg-[#00FF87] text-black text-[13px] font-semibold hover:brightness-105 active:scale-[0.98] transition-all"
              >
                I've saved my phrase →
              </button>
            </>
          )}

          {/* ── Import: enter phrase ────────────────────────────────────────── */}
          {mode === 'import' && step === 'password' && (
            <>
              <div>
                <p className={`text-[13px] font-semibold ${textHi} mb-1`}>Recovery Phrase</p>
                <p className={`text-[11px] ${textLow}`}>Enter your 12 or 24-word BIP-39 mnemonic phrase.</p>
              </div>
              <textarea
                value={importPhrase}
                onChange={e => setImport(e.target.value)}
                placeholder="word1 word2 word3..."
                rows={3}
                className={`w-full border rounded-xl px-4 py-3 text-[12px] font-mono focus:outline-none transition-all resize-none ${
                  isDark
                    ? 'bg-black/40 border-white/10 text-white/75 focus:border-white/25 placeholder:text-white/20'
                    : 'bg-white border-black/10 text-black/75 focus:border-black/25 placeholder:text-black/20'
                }`}
              />
              <div className="space-y-2">
                <p className={`text-[11px] font-semibold ${textMid}`}>New password</p>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 4 characters" className={inputCls} />
              </div>
              {error && <ErrorMessage text={error} />}
              <button
                onClick={handleImport}
                disabled={!importPhrase.trim() || password.length < 4}
                className="w-full h-10 rounded-xl bg-[#00FF87] text-black text-[13px] font-semibold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Import Wallet
              </button>
            </>
          )}

          {/* ── Password step (create flow) ─────────────────────────────────── */}
          {mode === 'create' && step === 'password' && (
            <>
              <div>
                <p className={`text-[13px] font-semibold ${textHi} mb-1`}>Set Wallet Password</p>
                <p className={`text-[11px] ${textLow}`}>This encrypts your wallet locally. You'll need it to unlock.</p>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password (min 4 chars)"
                    className={inputCls}
                    autoFocus
                  />
                  <button onClick={() => setShowPw(p => !p)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textLow}`}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className={inputCls}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
              </div>
              {error && <ErrorMessage text={error} />}
              <button
                onClick={handleCreate}
                disabled={password.length < 4 || password !== confirm}
                className="w-full h-10 rounded-xl bg-[#00FF87] text-black text-[13px] font-semibold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Wallet
              </button>
            </>
          )}

          {/* ── Unlock ──────────────────────────────────────────────────────── */}
          {mode === 'unlock' && step === 'password' && (
            <>
              <p className={`text-[11px] ${textLow}`}>Enter your wallet password to unlock.</p>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setUnlockFailed(false); }}
                  placeholder="Your wallet password"
                  className={inputCls}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                />
                <button onClick={() => setShowPw(p => !p)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textLow}`}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {unlockFailed && <ErrorMessage text="Incorrect password. Try again." />}
              <button
                onClick={handleUnlock}
                disabled={password.length < 1}
                className="w-full h-10 rounded-xl bg-[#00FF87] text-black text-[13px] font-semibold hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                Unlock
              </button>
            </>
          )}

          {/* ── Encrypting progress ──────────────────────────────────────────── */}
          {step === 'encrypting' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-10 h-10 border-2 border-[#00FF87]/25 border-t-[#00FF87] rounded-full animate-spin mx-auto" />
              <p className={`text-[13px] font-medium ${textHi}`}>Encrypting wallet…</p>
              <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/8' : 'bg-black/8'}`}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-[#00FF87] rounded-full transition-all"
                />
              </div>
              <p className={`text-[11px] font-mono ${textLow}`}>{Math.round(progress)}%</p>
            </div>
          )}

          {/* ── Done ─────────────────────────────────────────────────────────── */}
          {step === 'done' && (
            <div className="py-4 space-y-4 text-center">
              <CheckCircle size={36} className="text-[#00FF87] mx-auto" />
              <div>
                <p className={`text-[15px] font-semibold ${textHi}`}>Wallet Ready</p>
                <p className={`text-[11px] ${textLow} mt-1`}>Your wallet is encrypted and stored locally.</p>
              </div>
              <button
                onClick={() => { onSuccess?.(); onClose(); }}
                className="w-full h-10 rounded-xl bg-[#00FF87] text-black text-[13px] font-semibold hover:brightness-105 transition-all"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ErrorMessage({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
      <AlertTriangle size={12} className="text-red-400 shrink-0" />
      <p className="text-[11px] text-red-400">{text}</p>
    </div>
  );
}
