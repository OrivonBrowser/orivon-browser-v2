/**
 * NewTab — full-page new tab with rotating background images.
 * Images cycle through /tap1.jpg … /tap10.jpg, never repeating the same
 * image twice in a row. The image is picked once per component mount.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Search, Shield, Globe, Settings, Cpu } from 'lucide-react';
import { useSettings } from '../store/settings';
import { useTabsStore } from '../store/tabs';
import { useRuntimeStore } from '../store/runtime';

// ─── Image rotation ────────────────────────────────────────────────────────────
const TOTAL_IMAGES = 10;
let _lastImageIndex = -1;

function pickNextImage(): number {
  const choices = Array.from({ length: TOTAL_IMAGES }, (_, i) => i)
    .filter(i => i !== _lastImageIndex);
  const picked = choices[Math.floor(Math.random() * choices.length)];
  _lastImageIndex = picked;
  return picked;
}

// ─── dApp shortcuts ────────────────────────────────────────────────────────────
const DAPPS = [
  { name: 'Uniswap',   url: 'https://app.uniswap.org',   icon: '🦄' },
  { name: 'OpenSea',   url: 'https://opensea.io',         icon: '🌊' },
  { name: 'Aave',      url: 'https://app.aave.com',       icon: '👻' },
  { name: 'ENS App',   url: 'https://app.ens.domains',    icon: '🔷' },
  { name: 'Etherscan', url: 'https://etherscan.io',       icon: '🔍' },
  { name: 'Mirror',    url: 'https://mirror.xyz',         icon: '🪞' },
  { name: 'Radicle',   url: 'https://app.radicle.xyz',    icon: '🌱' },
  { name: 'IPFS',      url: 'https://ipfs.io',            icon: '📦' },
];

interface NewTabProps {
  onNavigate: (url: string) => void;
}

export default function NewTab({ onNavigate }: NewTabProps) {
  const { tabs } = useTabsStore();
  const { nodes } = useRuntimeStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Pick background image once on mount — never same as previous tab
  const [bgIndex] = useState(() => pickNextImage());
  const bgUrl = `/tap${bgIndex + 1}.jpg`;

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) onNavigate(q);
  };

  const trackerNodes = nodes.filter(n => n.enabled);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>

      {/* Background image */}
      <img
        src={bgUrl}
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
          transition: 'opacity 0.4s ease',
        }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />

      {/* Dark overlay for readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 1 }} />

      {/* Settings gear - top right */}
      <button
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,0,0,0.35)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(4px)', transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; }}
      >
        <Settings size={16} />
      </button>

      {/* Centered content */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>

        {/* Search bar — Brave style, dark pill */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 520, marginBottom: 40 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(20,20,30,0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: 9999, padding: '12px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: '#00FF87', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={14} color="#000" strokeWidth={2.5} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search or enter address · .eth · ipfs://"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 15, color: 'rgba(255,255,255,0.85)',
                fontFamily: 'inherit',
              }}
              // @ts-ignore — placeholder color via CSS
              className="newtab-input"
            />
          </div>
        </form>

        {/* dApp grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 64px)', gap: 12, marginBottom: 48 }}>
          {DAPPS.map(app => (
            <button
              key={app.name}
              onClick={() => onNavigate(app.url)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: 'rgba(20,20,30,0.6)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '10px 4px',
                cursor: 'pointer', transition: 'background 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(40,40,60,0.8)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,20,30,0.6)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{app.icon}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom stats — Brave-style */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, zIndex: 5,
        display: 'flex', gap: 0, padding: 0,
      }}>
        <StatPanel
          label="STATS"
          items={[
            { value: '12', unit: '', desc: 'Trackers & ads blocked', color: '#fff' },
            { value: `${trackerNodes.length}`, unit: ' KB', desc: 'ENS resolutions', color: '#00D1FF' },
            { value: '0', unit: ' Seconds', desc: 'Time saved', color: '#fff' },
          ]}
        />
      </div>

      {/* Placeholder CSS for input placeholder color */}
      <style>{`.newtab-input::placeholder { color: rgba(255,255,255,0.35); }`}</style>
    </div>
  );
}

function StatPanel({ label, items }: {
  label: string;
  items: { value: string; unit: string; desc: string; color: string }[];
}) {
  return (
    <div style={{
      background: 'rgba(20,20,30,0.75)', backdropFilter: 'blur(20px)',
      borderTopRightRadius: 16, padding: '16px 24px',
      minWidth: 380,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>{label}</p>
      <div style={{ display: 'flex', gap: 32 }}>
        {items.map((item, i) => (
          <div key={i}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: item.color, letterSpacing: '-0.5px' }}>
              {item.value}<span style={{ fontSize: 14, fontWeight: 400, color: item.color }}>{item.unit}</span>
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
