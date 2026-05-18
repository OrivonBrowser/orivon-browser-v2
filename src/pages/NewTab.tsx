/**
 * NewTab — two-screen snap-scroll new tab.
 * Screen 1: hero + search + glass widget/dApp grid
 * Screen 2: crypto news feed (fully dark, internal scroll only)
 */
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Settings } from 'lucide-react';
import { useSettings } from '../store/settings';

// ─── Image rotation ────────────────────────────────────────────────────────────
const TOTAL_IMAGES = 10;
let _lastImageIndex = -1;
function pickNextImage(): number {
  const choices = Array.from({ length: TOTAL_IMAGES }, (_, i) => i).filter(i => i !== _lastImageIndex);
  const picked = choices[Math.floor(Math.random() * choices.length)];
  _lastImageIndex = picked;
  return picked;
}

// ─── dApp shortcuts ────────────────────────────────────────────────────────────
const DAPPS = [
  { name: 'Uniswap',   url: 'https://app.uniswap.org',   icon: '🦄', accent: '#FF007A' },
  { name: 'OpenSea',   url: 'https://opensea.io',         icon: '🌊', accent: '#2081E2' },
  { name: 'Aave',      url: 'https://app.aave.com',       icon: '👻', accent: '#B6509E' },
  { name: 'ENS App',   url: 'https://app.ens.domains',    icon: '🔷', accent: '#5298FF' },
  { name: 'Etherscan', url: 'https://etherscan.io',       icon: '🔍', accent: '#21325B' },
  { name: 'Mirror',    url: 'https://mirror.xyz',         icon: '🪞', accent: '#6E56CF' },
  { name: 'Radicle',   url: 'https://app.radicle.xyz',    icon: '🌱', accent: '#2BB673' },
  { name: 'IPFS',      url: 'https://ipfs.io',            icon: '📦', accent: '#469EA2' },
];

// ─── Crypto news ───────────────────────────────────────────────────────────────
const CRYPTO_NEWS = [
  { id: 1,  source: 'CoinDesk',      cat: 'Bitcoin',    catColor: '#F7931A', time: '1h ago',  title: 'Bitcoin Surpasses $72,000 as Spot ETF Inflows Reach Record $1.2B in a Single Day',                    heroGrad: 'linear-gradient(135deg,#F7931A,#FFC107)', heroEmoji: '₿',  hasThumb: false },
  { id: 2,  source: 'The Block',     cat: 'Ethereum',   catColor: '#627EEA', time: '3h ago',  title: "Ethereum's Pectra Upgrade Set for Mainnet Launch, Bringing Major Staking Improvements",               heroGrad: '',                                       heroEmoji: '',   hasThumb: false },
  { id: 3,  source: 'Decrypt',       cat: 'DeFi',       catColor: '#10B981', time: '4h ago',  title: 'Uniswap v4 Launches with Hook Architecture, Driving $800M in First-Day Volume',                        heroGrad: 'linear-gradient(135deg,#FF007A,#FF6B6B)', heroEmoji: '🔄', hasThumb: true  },
  { id: 4,  source: 'CryptoSlate',   cat: 'Solana',     catColor: '#9945FF', time: '6h ago',  title: 'Solana DEX Volume Surpasses Ethereum for Third Consecutive Week as Meme Coins Surge',                  heroGrad: 'linear-gradient(135deg,#9945FF,#14F195)', heroEmoji: '◎',  hasThumb: true  },
  { id: 5,  source: 'Blockworks',    cat: 'NFT',        catColor: '#EC4899', time: '8h ago',  title: 'OpenSea 2.0 Officially Launches With Zero Fees and Enhanced Creator Royalty Framework',                heroGrad: '',                                       heroEmoji: '',   hasThumb: false },
  { id: 6,  source: 'The Defiant',   cat: 'DeFi',       catColor: '#10B981', time: '10h ago', title: 'Arbitrum DAO Votes to Deploy $45M Treasury Into Blue-Chip DeFi Yield Strategies',                      heroGrad: '',                                       heroEmoji: '',   hasThumb: false },
  { id: 7,  source: 'CoinTelegraph', cat: 'Bitcoin',    catColor: '#F7931A', time: '12h ago', title: 'MicroStrategy Acquires 5,000 More BTC — Total Holdings Now Exceed 220,000 Coins',                      heroGrad: 'linear-gradient(135deg,#F7931A,#FF8C42)', heroEmoji: '₿',  hasThumb: true  },
  { id: 8,  source: 'Messari',       cat: 'Regulation', catColor: '#6366F1', time: '14h ago', title: 'SEC Greenlights Spot Ethereum ETF Options Trading — Market Responds With 8% Rally',                    heroGrad: '',                                       heroEmoji: '',   hasThumb: false },
  { id: 9,  source: 'CoinGecko',    cat: 'Web3',        catColor: '#06B6D4', time: '16h ago', title: 'Layer 2 Networks Collectively Process Over 50 Million Transactions in a Single Week',                  heroGrad: 'linear-gradient(135deg,#6366F1,#8B5CF6)', heroEmoji: '🌐', hasThumb: true  },
  { id: 10, source: 'DeFi Pulse',   cat: 'DeFi',        catColor: '#10B981', time: '18h ago', title: 'Total Value Locked in DeFi Protocols Reaches $200 Billion Milestone for the First Time',               heroGrad: '',                                       heroEmoji: '',   hasThumb: false },
  { id: 11, source: 'Nansen',       cat: 'Ethereum',    catColor: '#627EEA', time: '20h ago', title: 'Ethereum Validators Set Record — Network Now Secured by Over 1 Million Active Validators',             heroGrad: '',                                       heroEmoji: '',   hasThumb: false },
  { id: 12, source: 'Dune',         cat: 'Web3',        catColor: '#06B6D4', time: '22h ago', title: 'On-Chain Data Shows Retail Wallets Accumulating at Fastest Pace Since 2020 Bull Run',                  heroGrad: '',                                       heroEmoji: '',   hasThumb: false },
];

const SIDEBAR_MAIN  = ['For You', 'Following'];
const SIDEBAR_CH    = ['Top Sources', 'Crypto News', 'Bitcoin', 'Ethereum', 'DeFi', 'NFTs', 'Web3', 'Regulation'];

interface NewTabProps { onNavigate: (url: string) => void; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewTab({ onNavigate }: NewTabProps) {
  useSettings();
  const [query, setQuery]               = useState('');
  const [activeChannel, setActiveChannel] = useState('For You');
  const inputRef = useRef<HTMLInputElement>(null);
  const [bgIndex] = useState(() => pickNextImage());
  const bgUrl = `/tap${bgIndex + 1}.jpg`;

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) onNavigate(q);
  };

  /* ── glass box shared style ── */
  const glass: React.CSSProperties = {
    background: 'rgba(0,0,0,0.52)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    border: '1px solid rgba(255,255,255,0.11)',
    borderRadius: 18,
  };

  /* ── Screen 2 dark bg ── */
  const DARK = '#0d0d16';

  return (
    <div style={{
      width: '100%', height: '100%',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    }}>

      {/* ══════════════════════════════════════════════════════════════════════
          SCREEN 1 — hero + search + grid
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        height: '100%',
        scrollSnapAlign: 'start',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Background image */}
        <img
          src={bgUrl} alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        {/* Gradient — light at top, dark at bottom so grid is readable */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.82) 100%)' }} />

        {/* Settings gear */}
        <button
          style={{ position: 'absolute', top: 14, right: 18, zIndex: 10, width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.80)', transition: 'background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.58)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; }}
        >
          <Settings size={15} />
        </button>

        {/* ── Search bar ── */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'center', paddingTop: 24, flexShrink: 0 }}>
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 600, padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderRadius: 9999, padding: '13px 22px', boxShadow: '0 6px 32px rgba(0,0,0,0.25)' }}>
              <Shield size={20} color="#FB5B22" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask anything, find anything..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#111', fontFamily: 'inherit' }}
                className="newtab-input"
              />
            </div>
          </form>
        </div>

        {/* Spacer — pushes grid to bottom */}
        <div style={{ flex: 1 }} />

        {/* ── Widget + dApp grid ── */}
        <div style={{ position: 'relative', zIndex: 5, padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>

            {/* STATS */}
            <div style={{ ...glass, padding: '14px 18px' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.36)', textTransform: 'uppercase', margin: '0 0 10px' }}>Stats</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                {[
                  { n: '7',      unit: '',    sub: 'Trackers blocked'  },
                  { n: '465',    unit: ' KB', sub: 'Bandwidth saved'   },
                  { n: '0',      unit: ' sec',sub: 'Time saved'        },
                ].map((s, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#818CF8', margin: '0 0 3px', letterSpacing: '-0.5px', lineHeight: 1 }}>
                      {s.n}<span style={{ fontSize: 11, fontWeight: 500 }}>{s.unit}</span>
                    </p>
                    <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.40)', margin: 0, lineHeight: 1.3 }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* NEWS */}
            <div style={{ ...glass, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.36)', textTransform: 'uppercase', margin: '0 0 10px' }}>News</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📰</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: '0 0 3px', lineHeight: 1.35 }}>Crypto & world news</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', margin: 0 }}>Scroll down to read ↓</p>
                </div>
              </div>
            </div>

            {/* VPN */}
            <div style={{ ...glass, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <Shield size={11} color="#FB5B22" />
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.36)', textTransform: 'uppercase', margin: 0 }}>Orivon VPN</p>
              </div>
              {['Extra privacy online', 'Hide your IP & location', 'Protect all your apps'].map((b, i) => (
                <p key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '3px 0', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1 }}>
                  <span style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, flexShrink: 0 }}>✓</span>
                  {b}
                </p>
              ))}
            </div>

            {/* dApp shortcut boxes */}
            {DAPPS.map(app => (
              <div
                key={app.name}
                onClick={() => onNavigate(app.url)}
                style={{ ...glass, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '18px 10px', cursor: 'pointer', transition: 'background 0.15s, transform 0.12s, border-color 0.15s' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = 'rgba(255,255,255,0.13)';
                  el.style.transform = 'translateY(-2px) scale(1.02)';
                  el.style.borderColor = 'rgba(255,255,255,0.22)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.background = 'rgba(0,0,0,0.52)';
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.borderColor = 'rgba(255,255,255,0.11)';
                }}
              >
                {/* Icon container with subtle accent glow */}
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${app.accent}22`, border: `1.5px solid ${app.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: `0 4px 16px ${app.accent}33` }}>
                  {app.icon}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)', letterSpacing: '0.01em' }}>{app.name}</span>
              </div>
            ))}

          </div>
        </div>

        <div style={{ height: 12 }} />
        <style>{`.newtab-input::placeholder { color: rgba(0,0,0,0.36); }`}</style>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCREEN 2 — crypto news feed (dark, internal scroll only)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        height: '100%',
        scrollSnapAlign: 'start',
        display: 'flex',
        overflow: 'hidden',
        background: DARK,
      }}>

        {/* ── Left sidebar ── */}
        <div style={{ width: 210, flexShrink: 0, background: DARK, borderRight: '1px solid rgba(255,255,255,0.06)', padding: '22px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'hidden' }}>
          {SIDEBAR_MAIN.map(cat => (
            <button key={cat} onClick={() => setActiveChannel(cat)}
              style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: 'none', background: activeChannel === cat ? 'rgba(99,102,241,0.20)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 600, color: activeChannel === cat ? '#A5B4FC' : 'rgba(255,255,255,0.55)', transition: 'all 0.12s' }}
              onMouseEnter={e => { if (activeChannel !== cat) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (activeChannel !== cat) e.currentTarget.style.background = 'transparent'; }}
            >{cat}</button>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px 6px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Channels</span>
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)', cursor: 'pointer', lineHeight: 1 }}>+</span>
          </div>

          {SIDEBAR_CH.map(ch => (
            <button key={ch} onClick={() => setActiveChannel(ch)}
              style={{ width: '100%', padding: '7px 14px', borderRadius: 8, border: 'none', background: activeChannel === ch ? 'rgba(99,102,241,0.20)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 500, color: activeChannel === ch ? '#A5B4FC' : 'rgba(255,255,255,0.45)', transition: 'all 0.12s' }}
              onMouseEnter={e => { if (activeChannel !== ch) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeChannel !== ch) e.currentTarget.style.background = 'transparent'; }}
            >{ch}</button>
          ))}
        </div>

        {/* ── News feed — only this area scrolls ── */}
        <div style={{ flex: 1, background: DARK, overflowY: 'auto', padding: '22px 28px 32px' }}>

          {/* Hero image — first article */}
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 14, height: 210, background: CRYPTO_NEWS[0].heroGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
            <span style={{ fontSize: 80, filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.35))' }}>{CRYPTO_NEWS[0].heroEmoji}</span>
          </div>

          {/* First article meta + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>{CRYPTO_NEWS[0].source}</span>
            <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 10 }}>•</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: `${CRYPTO_NEWS[0].catColor}28`, color: CRYPTO_NEWS[0].catColor }}>{CRYPTO_NEWS[0].cat}</span>
            <span style={{ color: 'rgba(255,255,255,0.20)', fontSize: 10 }}>•</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{CRYPTO_NEWS[0].time}</span>
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: '0 0 4px', lineHeight: 1.45, cursor: 'pointer' }}>{CRYPTO_NEWS[0].title}</p>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '18px 0' }} />

          {/* Remaining articles */}
          {CRYPTO_NEWS.slice(1).map(item => (
            <div key={item.id}
              style={{ display: 'flex', gap: 14, padding: '13px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 2, transition: 'background 0.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.50)' }}>{item.source}</span>
                  <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10 }}>•</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: `${item.catColor}28`, color: item.catColor }}>{item.cat}</span>
                  <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10 }}>•</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)' }}>{item.time}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>{item.title}</p>
              </div>

              {item.hasThumb && item.heroGrad && (
                <div style={{ width: 76, height: 64, borderRadius: 10, background: item.heroGrad, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  {item.heroEmoji}
                </div>
              )}

              <button style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', flexShrink: 0, alignSelf: 'flex-start', fontSize: 16, letterSpacing: 1 }}>···</button>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
