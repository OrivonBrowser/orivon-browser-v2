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

      {/* Background image — edge to edge */}
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

      {/* Bottom gradient — darkens only the lower portion for bottom bar readability */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.70) 100%)',
      }} />

      {/* Settings gear — top right, minimal */}
      <button
        style={{
          position: 'absolute', top: 18, right: 20, zIndex: 10,
          background: 'none', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.80)',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; }}
      >
        <Settings size={18} />
      </button>

      {/* Centered content */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>

        {/* Search bar — white pill, Brave style */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 580, marginBottom: 40 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.93)',
            backdropFilter: 'blur(20px)',
            borderRadius: 9999, padding: '12px 22px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.20)',
          }}>
            <Shield size={20} color="#FB5B22" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask anything, find anything..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 15, color: '#1a1a2e',
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

      {/* Bottom bar — three panels flush to bottom edge */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'stretch',
      }}>

        {/* STATS panel */}
        <div style={{
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(18px)',
          padding: '14px 28px 18px',
          flex: '0 0 auto',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.42)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>STATS</p>
          <div style={{ display: 'flex', gap: 36 }}>
            <StatCol value="12" unit="" desc="Trackers & ads blocked" />
            <StatCol value={`${trackerNodes.length}`} unit=" KB" desc="Bandwidth saved" />
            <StatCol value="0" unit=" Seconds" desc="Time saved" />
          </div>
        </div>

        {/* NEWS panel */}
        <div style={{
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(18px)',
          padding: '14px 24px 18px',
          flex: 1,
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.42)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>NEWS</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Thumbnail */}
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(255,255,255,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 20 }}>📰</span>
            </div>
            {/* Headline */}
            <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.45 }}>
              Turn on Brave News, and<br />never miss a story
            </p>
            {/* CTA */}
            <button style={{
              padding: '8px 18px', borderRadius: 9999, flexShrink: 0,
              background: 'rgba(255,255,255,0.14)', border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
            >
              Turn on Brave News
            </button>
          </div>
        </div>

        {/* BRAVE VPN panel */}
        <div style={{
          background: 'rgba(18,18,18,0.60)', backdropFilter: 'blur(18px)',
          padding: '14px 24px 18px',
          minWidth: 370,
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Shield size={15} color="#FB5B22" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>BRAVE VPN</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginLeft: 4 }}>Powered by Guardian</span>
          </div>
          {/* Body row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1 }}>
              {[
                'Extra privacy & security online',
                'Hide your IP & change your location',
                'Protect every app on your device',
              ].map((item, i) => (
                <p key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.52)', margin: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 13, height: 13, borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.28)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, flexShrink: 0,
                  }}>✓</span>
                  {item}
                </p>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <button style={{
                padding: '8px 18px', borderRadius: 9999,
                background: '#fff', border: 'none',
                color: '#111', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                Start free trial
              </button>
              <button style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: 11, color: 'rgba(255,255,255,0.38)',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.70)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
              >
                Already purchased?
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Placeholder color for white search bar */}
      <style>{`.newtab-input::placeholder { color: rgba(0,0,0,0.38); }`}</style>
    </div>
  );
}

function StatCol({ value, unit, desc }: { value: string; unit: string; desc: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#6366F1', letterSpacing: '-0.5px' }}>
        {value}<span style={{ fontSize: 13, fontWeight: 500, color: '#6366F1' }}>{unit}</span>
      </p>
      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
    </div>
  );
}
