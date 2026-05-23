import React from 'react';
import { motion } from 'motion/react';
import { X, Shield, Search, Wallet, ChevronDown, Globe } from 'lucide-react';
import { useSettings } from '../store/settings';

interface IntroOverlayProps {
  onClose: () => void;
  onCustomAccount?: () => void;
}

export default function IntroOverlay({ onClose, onCustomAccount }: IntroOverlayProps) {
  const {
    searchEngine, setSearchEngine,
    web3ScoreProvider, setWeb3ScoreProvider,
    setHasSeenIntro
  } = useSettings();

  const handleStart = () => {
    setHasSeenIntro(true);
    onClose();
  };

  const overlayBg = "rgba(0, 0, 0, 0.4)";
  const cardBg = "#ffffff";
  const accentColor = "#4f46e5";

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1000,
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: cardBg,
          borderRadius: 28,
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
          color: '#111827',
        }}
      >
        <button
          onClick={handleStart}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: 8,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: '#eef2ff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', color: accentColor
          }}>
            <Shield size={36} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>Welcome to Orivon</h2>
          <p style={{ color: '#4b5563', lineHeight: 1.6, fontSize: 15 }}>
            Your Web3 browser is ready. A mnemonic wallet has already been created for you automatically.
          </p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Web3 Score Provider
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={web3ScoreProvider}
                onChange={(e) => setWeb3ScoreProvider(e.target.value)}
                style={{
                  width: '100%', height: 52, borderRadius: 14, padding: '0 16px',
                  appearance: 'none', border: '1px solid #e5e7eb', background: '#f9fafb',
                  fontSize: 14, color: '#111827', outline: 'none', cursor: 'pointer',
                  fontWeight: 500, transition: 'border-color 0.2s'
                }}
              >
                <option value="Orivon Native">Orivon Native</option>
                <option value="Chainlink">Chainlink</option>
                <option value="Spectral">Spectral</option>
              </select>
              <ChevronDown size={18} color="#9ca3af" style={{ position: 'absolute', right: 16, top: 17, pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Default Search Engine
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value as any)}
                style={{
                  width: '100%', height: 52, borderRadius: 14, padding: '0 16px',
                  appearance: 'none', border: '1px solid #e5e7eb', background: '#f9fafb',
                  fontSize: 14, color: '#111827', outline: 'none', cursor: 'pointer',
                  fontWeight: 500, transition: 'border-color 0.2s'
                }}
              >
                <option value="web3compass">Web3 Compass (Default)</option>
                <option value="google">Google</option>
                <option value="duckduckgo">DuckDuckGo</option>
                <option value="brave">Brave Search</option>
              </select>
              <ChevronDown size={18} color="#9ca3af" style={{ position: 'absolute', right: 16, top: 17, pointerEvents: 'none' }} />
            </div>
          </div>

          <button
            onClick={onCustomAccount}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px', borderRadius: 16, border: '1px solid #e5e7eb',
              background: '#fff', cursor: 'pointer', transition: 'all 0.2s',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.background = '#f5f3ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#fff';
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#eef2ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor,
              flexShrink: 0
            }}>
              <Wallet size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>Set up a custom account instead</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Import or create a different wallet</p>
            </div>
          </button>
        </div>

        <button
          onClick={handleStart}
          style={{
            width: '100%', height: 60, borderRadius: 18, background: accentColor,
            color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(79,70,229,0.4)', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
        >
          Start using Orivon
        </button>
      </motion.div>
    </div>
  );
}
