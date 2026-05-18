import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useWalletStore } from '../store/wallet';

interface UnlockWalletProps {
  onRestore: () => void; // navigate back to onboarding to re-import
}

export default function UnlockWallet({ onRestore }: UnlockWalletProps) {
  const { unlock, addresses } = useWalletStore();
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleUnlock = async () => {
    if (!password.trim() || loading) return;
    setError('');
    setLoading(true);
    const ok = await unlock(password);
    setLoading(false);
    if (!ok) {
      setError('Incorrect password. Please try again.');
      setPassword('');
      inputRef.current?.focus();
    }
    // On success, App.tsx re-renders automatically because walletStatus → 'unlocked'
  };

  return (
    <div style={{
      height: '100vh', width: '100vw',
      background: '#F0F2F9',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    }}>
      {/* Top-left brand header */}
      <div style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <img
          src="/logo.png" alt="Orivon"
          style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E' }}>Orivon Wallet</span>
      </div>

      {/* Centered card */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px 40px',
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '52px 60px 48px',
          maxWidth: 480, width: '100%',
          textAlign: 'center',
          boxShadow: '0 2px 24px rgba(0,0,0,0.07)',
        }}>

          {/* Lock illustration */}
          <div style={{ marginBottom: 28 }}>
            <LockIllustration />
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
            Unlock Wallet
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', margin: '0 0 32px' }}>
            Enter password to unlock wallet
          </p>

          {/* Password field */}
          <div style={{ textAlign: 'left', marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter your password"
                style={{
                  width: '100%', height: 52,
                  borderRadius: 12,
                  border: `1.5px solid ${focused ? '#4F46E5' : error ? '#EF4444' : '#E5E7EB'}`,
                  background: '#fff',
                  padding: '0 48px 0 16px',
                  fontSize: 15, color: '#111827',
                  outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                  boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                }}
              />
              <button
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#9CA3AF', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p style={{ fontSize: 12, color: '#EF4444', margin: '6px 0 0', textAlign: 'left' }}>{error}</p>
            )}
          </div>

          {/* Unlock button */}
          <button
            onClick={handleUnlock}
            disabled={!password.trim() || loading}
            style={{
              width: '100%', height: 52,
              borderRadius: 9999,
              background: password.trim() && !loading ? '#4F46E5' : '#E5E7EB',
              color: password.trim() && !loading ? '#ffffff' : '#9CA3AF',
              fontSize: 16, fontWeight: 600,
              border: 'none', cursor: password.trim() && !loading ? 'pointer' : 'not-allowed',
              marginBottom: 14,
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {loading ? 'Unlocking…' : 'Unlock'}
          </button>

          {/* Restore link */}
          <button
            onClick={onRestore}
            style={{
              background: 'none', border: '1px solid #E5E7EB',
              borderRadius: 9999, padding: '10px 28px',
              fontSize: 14, fontWeight: 500, color: '#4F46E5',
              cursor: 'pointer', transition: 'background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F3FF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lock illustration ────────────────────────────────────────────────────────

function LockIllustration() {
  return (
    <svg
      width="96" height="92"
      viewBox="0 0 96 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* Signal arcs — top to bottom, lightest to darkest */}
      <path d="M 20 38 A 28 28 0 0 1 76 38"
        stroke="#C7D2FE" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M 28 44 A 20 20 0 0 1 68 44"
        stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M 36 50 A 12 12 0 0 1 60 50"
        stroke="#818CF8" strokeWidth="3" strokeLinecap="round" fill="none"/>

      {/* Shackle */}
      <path d="M 36 63 L 36 54 Q 36 42 48 42 Q 60 42 60 54 L 60 63"
        stroke="#6366F1" strokeWidth="5.5" strokeLinecap="round" fill="none"/>

      {/* Lock body */}
      <rect x="28" y="62" width="40" height="30" rx="7" fill="#4F46E5"/>

      {/* Keyhole */}
      <circle cx="48" cy="75" r="5" fill="rgba(255,255,255,0.45)"/>
      <rect x="45.5" y="75" width="5" height="8" rx="2.5" fill="rgba(255,255,255,0.45)"/>
    </svg>
  );
}
