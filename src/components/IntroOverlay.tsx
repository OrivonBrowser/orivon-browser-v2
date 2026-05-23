import React from 'react';
import { motion } from 'motion/react';
import { X, Shield, Search, Wallet, ChevronDown } from 'lucide-react';
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
      backdropFilter: 'blur(1px)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: cardBg,
          borderRadius: 24,
          padding: '40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          position: 'relative',
          color: '#111827',
        }}
      >
        <button
          onClick={handleStart}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
          }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: '#eef2ff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: accentColor
          }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Welcome to Orivon</h2>
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
            Your mnemonic wallet is already set up and ready to go. You can start exploring Web3 immediately.
          </p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Web3 Score Provider
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={web3ScoreProvider}
                onChange={(e) => setWeb3ScoreProvider(e.target.value)}
                style={{
                  width: '100%', height: 48, borderRadius: 12, padding: '0 16px',
                  appearance: 'none', border: '1px solid #e5e7eb', background: '#f9fafb',
                  fontSize: 14, color: '#111827', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="Orivon Native">Orivon Native</option>
                <option value="Chainlink">Chainlink</option>
                <option value="Spectral">Spectral</option>
              </select>
              <ChevronDown size={16} color="#9ca3af" style={{ position: 'absolute', right: 16, top: 16, pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Default Search Engine
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value as any)}
                style={{
                  width: '100%', height: 48, borderRadius: 12, padding: '0 16px',
                  appearance: 'none', border: '1px solid #e5e7eb', background: '#f9fafb',
                  fontSize: 14, color: '#111827', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="google">Google</option>
                <option value="duckduckgo">DuckDuckGo</option>
                <option value="brave">Brave Search</option>
              </select>
              <ChevronDown size={16} color="#9ca3af" style={{ position: 'absolute', right: 16, top: 16, pointerEvents: 'none' }} />
            </div>
          </div>

          <button
            onClick={onCustomAccount}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e7eb',
              background: '#fff', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = accentColor}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: '#f5f3ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor
            }}>
              <Wallet size={16} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Set up custom account</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Import or create a different wallet</p>
            </div>
          </button>
        </div>

        <button
          onClick={handleStart}
          style={{
            width: '100%', height: 56, borderRadius: 16, background: accentColor,
            color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79,70,229,0.4)', transition: 'all 0.2s'
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
