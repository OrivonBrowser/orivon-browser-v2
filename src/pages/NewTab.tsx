/**
 * NewTab — two-screen snap-scroll new tab.
 * Screen 1: hero background + search bar + widget/dApp grid
 * Screen 2: crypto news feed with sidebar (internal scroll only)
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
  { name: 'Uniswap',   url: 'https://app.uniswap.org',   icon: '🦄' },
  { name: 'OpenSea',   url: 'https://opensea.io',         icon: '🌊' },
  { name: 'Aave',      url: 'https://app.aave.com',       icon: '👻' },
  { name: 'ENS App',   url: 'https://app.ens.domains',    icon: '🔷' },
  { name: 'Etherscan', url: 'https://etherscan.io',       icon: '🔍' },
  { name: 'Mirror',    url: 'https://mirror.xyz',         icon: '🪞' },
  { name: 'Radicle',   url: 'https://app.radicle.xyz',    icon: '🌱' },
  { name: 'IPFS',      url: 'https://ipfs.io',            icon: '📦' },
];

// ─── Crypto news ───────────────────────────────────────────────────────────────
const CRYPTO_NEWS = [
  { id: 1,  source: 'CoinDesk',     category: 'Bitcoin',    catIcon: '₿', time: '1h ago',  title: 'Bitcoin Surpasses $72,000 as Spot ETF Inflows Reach Record $1.2 Billion in a Single Day', bigImage: true,  imgGrad: 'linear-gradient(135deg,#F7931A 0%,#FFC107 100%)', imgEmoji: '₿' },
  { id: 2,  source: 'The Block',    category: 'Ethereum',   catIcon: 'Ξ', time: '3h ago',  title: "Ethereum's Pectra Upgrade Set for Mainnet Launch, Bringing Major Staking Improvements", bigImage: false, imgGrad: '', imgEmoji: '' },
  { id: 3,  source: 'Decrypt',      category: 'DeFi',       catIcon: '🔄', time: '4h ago', title: 'Uniswap v4 Launches with Hook Architecture, Driving $800M in First-Day Trading Volume', bigImage: false, imgGrad: 'linear-gradient(135deg,#FF007A,#FF6B6B)', imgEmoji: '🔄' },
  { id: 4,  source: 'CryptoSlate',  category: 'Solana',     catIcon: '◎', time: '6h ago',  title: 'Solana DEX Volume Surpasses Ethereum for Third Consecutive Week, Meme Coins Drive Surge', bigImage: true,  imgGrad: 'linear-gradient(135deg,#9945FF,#14F195)', imgEmoji: '◎' },
  { id: 5,  source: 'Blockworks',   category: 'NFT',        catIcon: '🎨', time: '8h ago', title: 'OpenSea 2.0 Officially Launches With Zero Fees and Enhanced Creator Royalty Framework', bigImage: false, imgGrad: '', imgEmoji: '' },
  { id: 6,  source: 'The Defiant',  category: 'DeFi',       catIcon: '🔄', time: '10h ago', title: 'Arbitrum DAO Votes to Deploy $45M Treasury Into Blue-Chip DeFi Yield Strategies', bigImage: false, imgGrad: '', imgEmoji: '' },
  { id: 7,  source: 'CoinTelegraph',category: 'Bitcoin',    catIcon: '₿', time: '12h ago', title: 'MicroStrategy Acquires 5,000 More BTC — Total Holdings Now Exceed 220,000 Coins', bigImage: true,  imgGrad: 'linear-gradient(135deg,#F7931A,#FF8C42)', imgEmoji: '₿' },
  { id: 8,  source: 'Messari',      category: 'Regulation', catIcon: '⚖️', time: '14h ago', title: 'SEC Greenlights Spot Ethereum ETF Options Trading — Market Responds With 8% Rally', bigImage: false, imgGrad: '', imgEmoji: '' },
  { id: 9,  source: 'CoinGecko',   category: 'Web3',        catIcon: '🌐', time: '16h ago', title: 'Layer 2 Networks Collectively Process Over 50 Million Transactions in Single Week', bigImage: false, imgGrad: 'linear-gradient(135deg,#6366F1,#8B5CF6)', imgEmoji: '🌐' },
  { id: 10, source: 'DeFi Pulse',  category: 'DeFi',        catIcon: '🔄', time: '18h ago', title: 'Total Value Locked in DeFi Protocols Reaches $200 Billion Milestone for First Time', bigImage: false, imgGrad: '', imgEmoji: '' },
  { id: 11, source: 'Nansen',      category: 'Ethereum',    catIcon: 'Ξ', time: '20h ago',  title: 'Ethereum Validators Set New Record — Network Now Secured by Over 1 Million Validators', bigImage: false, imgGrad: '', imgEmoji: '' },
  { id: 12, source: 'Dune Analytics', category: 'Web3',     catIcon: '🌐', time: '22h ago', title: 'On-Chain Data Shows Retail Wallets Accumulating at Fastest Pace Since 2020 Bull Run', bigImage: false, imgGrad: '', imgEmoji: '' },
];

const SIDEBAR_MAIN  = ['For You', 'Following'];
const SIDEBAR_CHANNELS = ['Top Sources', 'Crypto News', 'Bitcoin', 'Ethereum', 'DeFi', 'NFTs', 'Web3', 'Regulation'];

interface NewTabProps { onNavigate: (url: string) => void; }

export default function NewTab({ onNavigate }: NewTabProps) {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
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

  // shared dark box style for the grid
  const boxBase: React.CSSProperties = {
    background: 'rgba(8,8,20,0.72)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 14,
    padding: '13px 15px',
    display: 'flex',
    flexDirection: 'column',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.13em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)',
    margin: '0 0 8px',
  };

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
        height: '100%', scrollSnapAlign: 'start',
        position: 'relative', display: 'flex',
        flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* BG image */}
        <img
          src={bgUrl} alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {/* Gradient overlay — keeps bottom dark for grid readability */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.68) 72%, rgba(0,0,0,0.88) 100%)' }} />

        {/* Settings gear */}
        <button
          style={{ position: 'absolute', top: 16, right: 20, zIndex: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.78)', transition: 'background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.52)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.30)'; }}
        >
          <Settings size={15} />
        </button>

        {/* Search bar — near top */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'center', paddingTop: 26, flexShrink: 0 }}>
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 580, padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)', borderRadius: 9999, padding: '13px 22px', boxShadow: '0 4px 28px rgba(0,0,0,0.22)' }}>
              <Shield size={20} color="#FB5B22" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask anything, find anything..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#111827', fontFamily: 'inherit' }}
                className="newtab-input"
              />
            </div>
          </form>
        </div>

        {/* Vertical spacer — pushes grid to bottom */}
        <div style={{ flex: 1 }} />

        {/* ── Widget + dApp grid (3 per row) ── */}
        <div style={{ position: 'relative', zIndex: 5, padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>

            {/* 1. STATS */}
            <div style={boxBase}>
              <p style={labelStyle}>Stats</p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[
                  { val: '7',      sub: 'Trackers blocked' },
                  { val: '465 KB', sub: 'Bandwidth saved'  },
                  { val: '0 Sec',  sub: 'Time saved'       },
                ].map((s, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 17, fontWeight: 700, color: '#818CF8', margin: '0 0 2px', letterSpacing: '-0.3px' }}>{s.val}</p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)', margin: 0, lineHeight: 1.35 }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. NEWS */}
            <div style={boxBase}>
              <p style={labelStyle}>News</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>📰</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: '0 0 4px', lineHeight: 1.4 }}>Crypto & world news</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', margin: 0 }}>Scroll down to read →</p>
                </div>
              </div>
            </div>

            {/* 3. VPN */}
            <div style={boxBase}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <Shield size={11} color="#FB5B22" />
                <p style={{ ...labelStyle, margin: 0 }}>Orivon VPN</p>
              </div>
              {['Extra privacy online', 'Hide your IP', 'Protect all apps'].map((b, i) => (
                <p key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.48)', margin: '2px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.22)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, flexShrink: 0 }}>✓</span>
                  {b}
                </p>
              ))}
            </div>

            {/* 4-11. dApp shortcuts */}
            {DAPPS.map(app => (
              <div
                key={app.name}
                onClick={() => onNavigate(app.url)}
                style={{ ...boxBase, alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'background 0.14s, transform 0.12s', minHeight: 82 }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(30,28,55,0.86)'; (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(8,8,20,0.72)'; (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
              >
                <span style={{ fontSize: 26, lineHeight: 1 }}>{app.icon}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', fontWeight: 500, textAlign: 'center' }}>{app.name}</span>
              </div>
            ))}

          </div>
        </div>

        <div style={{ height: 10 }} />
        <style>{`.newtab-input::placeholder { color: rgba(0,0,0,0.36); }`}</style>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCREEN 2 — crypto news feed (internal scroll only)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        height: '100%', scrollSnapAlign: 'start',
        display: 'flex', overflow: 'hidden',
        background: '#0b0b18',
      }}>

        {/* Left sidebar — does NOT scroll */}
        <div style={{ width: 218, flexShrink: 0, padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'hidden' }}>
          {SIDEBAR_MAIN.map(cat => (
            <button key={cat} onClick={() => setActiveChannel(cat)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'background 0.12s, color 0.12s', background: activeChannel === cat ? 'rgba(99,102,241,0.18)' : 'transparent', color: activeChannel === cat ? '#A5B4FC' : 'rgba(255,255,255,0.58)' }}
              onMouseEnter={e => { if (activeChannel !== cat) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (activeChannel !== cat) e.currentTarget.style.background = 'transparent'; }}
            >{cat}</button>
          ))}

          <div style={{ margin: '12px 12px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Channels</span>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.28)', cursor: 'pointer', lineHeight: 1 }}>+</span>
          </div>

          {SIDEBAR_CHANNELS.map(ch => (
            <button key={ch} onClick={() => setActiveChannel(ch)}
              style={{ width: '100%', padding: '7px 12px', borderRadius: 8, border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'background 0.12s, color 0.12s', background: activeChannel === ch ? 'rgba(99,102,241,0.18)' : 'transparent', color: activeChannel === ch ? '#A5B4FC' : 'rgba(255,255,255,0.46)' }}
              onMouseEnter={e => { if (activeChannel !== ch) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeChannel !== ch) e.currentTarget.style.background = 'transparent'; }}
            >{ch}</button>
          ))}
        </div>

        {/* News feed — only this scrolls */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 32px' }}>

          {/* First article — big hero image */}
          {CRYPTO_NEWS[0].bigImage && (
            <>
              <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 12, background: CRYPTO_NEWS[0].imgGrad, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: 72, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' }}>{CRYPTO_NEWS[0].imgEmoji}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.52)', fontWeight: 500 }}>{CRYPTO_NEWS[0].source}</span>
                <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10 }}>•</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)' }}>{CRYPTO_NEWS[0].catIcon} {CRYPTO_NEWS[0].category}</span>
                <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10 }}>•</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)' }}>{CRYPTO_NEWS[0].time}</span>
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.92)', margin: '0 0 6px', lineHeight: 1.45, cursor: 'pointer' }}>{CRYPTO_NEWS[0].title}</p>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '14px 0' }} />
            </>
          )}

          {/* Remaining articles */}
          {CRYPTO_NEWS.slice(1).map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', borderRadius: 4, transition: 'background 0.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.50)', fontWeight: 500 }}>{item.source}</span>
                  <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10 }}>•</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)' }}>{item.catIcon} {item.category}</span>
                  <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10 }}>•</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.36)' }}>{item.time}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.5 }}>{item.title}</p>
              </div>

              {item.bigImage && item.imgGrad && (
                <div style={{ width: 82, height: 68, borderRadius: 10, background: item.imgGrad, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                  {item.imgEmoji}
                </div>
              )}

              <button style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', flexShrink: 0, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>···</button>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
