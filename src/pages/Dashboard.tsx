import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, User, Compass, ShoppingCart, Send, RefreshCw,
  Link as LinkIcon, Download, MoreVertical, Plus,
  Search, Lock, Shield,
  Settings, HelpCircle, Copy, CheckCircle, ChevronDown,
  Sparkles, Filter, ListFilter, MoreHorizontal,
  ShoppingBag, ArrowUpDown, Globe, ExternalLink,
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';

type Section = 'portfolio' | 'accounts' | 'explore' | 'buy' | 'send' | 'swap' | 'bridge' | 'deposit';
type PortfolioTab = 'assets' | 'dapps' | 'nfts' | 'activity';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DashboardProps { onOpenBrowser?: (url?: string) => void; }

// ─── Data ─────────────────────────────────────────────────────────────────────

const MARKET = [
  { name: 'Bitcoin',  sym: 'BTC',  price: '$78,224.00', change:  0.47, cap: '$1,567.7B', vol: '$18.9B',  color: '#F7931A', icon: '₿', bg: '#FFF8F0' },
  { name: 'Ethereum', sym: 'ETH',  price: '$2,191.68',  change:  0.71, cap: '$264.6B',   vol: '$7.5B',   color: '#627EEA', icon: 'Ξ', bg: '#F0F3FF' },
  { name: 'Tether',   sym: 'USDT', price: '$0.9995',    change:  0.00, cap: '$189.8B',   vol: '$31.3B',  color: '#26A17B', icon: '₮', bg: '#F0FDF8' },
  { name: 'BNB',      sym: 'BNB',  price: '$653.72',    change:  0.15, cap: '$88.1B',    vol: '$584.2M', color: '#F3BA2F', icon: 'B', bg: '#FFFBF0' },
  { name: 'XRP',      sym: 'XRP',  price: '$1.42',      change:  0.32, cap: '$87.8B',    vol: '$1.2B',   color: '#00AAE4', icon: 'X', bg: '#F0FAFF' },
  { name: 'USDC',     sym: 'USDC', price: '$0.9998',    change:  0.00, cap: '$77.0B',    vol: '$5.0B',   color: '#2775CA', icon: '$', bg: '#F0F5FF' },
  { name: 'Solana',   sym: 'SOL',  price: '$86.48',     change:  0.28, cap: '$50.0B',    vol: '$1.7B',   color: '#9945FF', icon: '◎', bg: '#F8F0FF' },
  { name: 'TRON',     sym: 'TRX',  price: '$0.3565',    change:  1.55, cap: '$33.8B',    vol: '$430.3M', color: '#EF0027', icon: 'T', bg: '#FFF0F2' },
  { name: 'Dogecoin', sym: 'DOGE', price: '$0.1234',    change:  3.40, cap: '$17.2B',    vol: '$1.8B',   color: '#C2A633', icon: 'D', bg: '#FFFCF0' },
  { name: 'Cardano',  sym: 'ADA',  price: '$0.4521',    change: -0.80, cap: '$16.0B',    vol: '$0.7B',   color: '#0033AD', icon: 'A', bg: '#F0F4FF' },
];

const PORTFOLIO_ASSETS = [
  { name: 'Orivon',              sym: 'Ori',  sub: 'Ori on BNB Smart Chain',    color: '#1DB954', icon: 'O', bg: '#F0FDF4', bal: '0.0001', usd: '$0.0000001559' },
  { name: 'Ethereum',              sym: 'ETH',   sub: 'ETH on Ethereum Mainnet',     color: '#627EEA', icon: 'Ξ', bg: '#F0F3FF', bal: '0',      usd: '$0.00' },
  { name: 'Basic Attention Token', sym: 'BAT',   sub: 'BAT on Ethereum Mainnet',     color: '#FF5000', icon: 'B', bg: '#FFF3EE', bal: '0',      usd: '$0.00' },
  { name: 'Ether',                 sym: 'ETH',   sub: 'ETH on Base',                 color: '#0052FF', icon: 'Ξ', bg: '#F0F5FF', bal: '0',      usd: '$0.00' },
  { name: 'MATIC',                 sym: 'MATIC', sub: 'MATIC on Polygon Mainnet',    color: '#8247E5', icon: 'M', bg: '#F5F0FF', bal: '0',      usd: '$0.00' },
  { name: 'BNB',                   sym: 'BNB',   sub: 'BNB on BNB Smart Chain',      color: '#F3BA2F', icon: 'B', bg: '#FFFBF0', bal: '0',      usd: '$0.00' },
  { name: 'Ether',                 sym: 'ETH',   sub: 'ETH on Optimism',             color: '#FF0420', icon: 'Ξ', bg: '#FFF0F2', bal: '0',      usd: '$0.00' },
  { name: 'Avalanche',             sym: 'AVAX',  sub: 'AVAX on Avalanche C-Chain',   color: '#E84142', icon: 'A', bg: '#FFF0F0', bal: '0',      usd: '$0.00' },
  { name: 'Filecoin',              sym: 'FIL',   sub: 'FIL on Filecoin EVM Mainnet', color: '#0090FF', icon: 'F', bg: '#F0F8FF', bal: '0',      usd: '$0.00' },
  { name: 'Neon',                  sym: 'NEON',  sub: 'NEON on Neon EVM',            color: '#9945FF', icon: 'N', bg: '#F5F0FF', bal: '0',      usd: '$0.00' },
  { name: 'Solana',                sym: 'SOL',   sub: 'SOL on Solana Mainnet Beta',   color: '#000000', icon: '◎', bg: '#F3F4F6', bal: '0',      usd: '$0.00' },
  { name: 'Filecoin',              sym: 'FIL',   sub: 'FIL on Filecoin Mainnet',     color: '#0090FF', icon: 'F', bg: '#F0F8FF', bal: '0',      usd: '$0.00' },
  { name: 'Bitcoin',               sym: 'BTC',   sub: 'BTC on Bitcoin Mainnet',      color: '#F7931A', icon: '₿', bg: '#FFF8F0', bal: '0',      usd: '$0.00' },
  { name: 'Zcash',                 sym: 'ZEC',   sub: 'ZEC on Zcash Mainnet',        color: '#ECB244', icon: 'Z', bg: '#FFFDF0', bal: '0',      usd: '$0.00' },
  { name: 'Cardano',               sym: 'ADA',   sub: 'ADA on Cardano Mainnet',      color: '#0033AD', icon: 'A', bg: '#F0F4FF', bal: '0',      usd: '$0.00' },
];

const DAPPS = [
  { name: 'Uniswap',       cat: 'DEX',         chain: 'Ethereum · Polygon · Base',      color: '#FF007A', bg: '#FFF0F6', icon: '🦄', desc: 'The leading decentralised exchange. Swap any ERC-20 token with deep liquidity pools.',               url: 'https://app.uniswap.org' },
  { name: 'Aave',          cat: 'Lending',      chain: 'Ethereum · Avalanche · Polygon', color: '#B6509E', bg: '#F9F0FF', icon: '👻', desc: 'Non-custodial liquidity protocol for earning interest and borrowing crypto assets.',                 url: 'https://app.aave.com' },
  { name: 'Compound',      cat: 'Lending',      chain: 'Ethereum · Base',                color: '#00D395', bg: '#F0FFF9', icon: '⚗️', desc: 'Algorithmic, autonomous interest rate protocol built for developers.',                               url: 'https://app.compound.finance' },
  { name: 'OpenSea',       cat: 'NFT Market',   chain: 'Ethereum · Solana · Polygon',    color: '#2081E2', bg: '#F0F6FF', icon: '🌊', desc: "The world's largest NFT marketplace. Buy, sell and discover rare digital items.",                    url: 'https://opensea.io' },
  { name: 'Lido',          cat: 'Staking',      chain: 'Ethereum · Solana · Polygon',    color: '#00A3FF', bg: '#F0FAFF', icon: '🔷', desc: 'Liquid staking solution for ETH. Stake any amount and receive stETH rewards daily.',                url: 'https://lido.fi' },
  { name: '1inch',         cat: 'Aggregator',   chain: 'Ethereum · BNB · Polygon',       color: '#1B314F', bg: '#F0F3F8', icon: '🔀', desc: 'DEX aggregator sourcing the best swap rates across 300+ liquidity sources.',                        url: 'https://app.1inch.io' },
  { name: 'Curve Finance', cat: 'DEX',          chain: 'Ethereum · Arbitrum · Base',     color: '#D04000', bg: '#FFF4F0', icon: '📈', desc: 'AMM optimised for stablecoin and pegged-asset swaps with ultra-low slippage.',                      url: 'https://curve.fi' },
  { name: 'GMX',           cat: 'Perps',        chain: 'Arbitrum · Avalanche',           color: '#03D1CF', bg: '#F0FFFE', icon: '📊', desc: 'Decentralised perpetual exchange. Trade BTC, ETH and more with up to 50× leverage.',                url: 'https://app.gmx.io' },
  { name: 'MakerDAO',      cat: 'Stablecoin',   chain: 'Ethereum',                       color: '#1AAB9B', bg: '#F0FDF9', icon: '🏛️', desc: 'Mint DAI, the decentralised stablecoin, by locking crypto collateral in Maker Vaults.',             url: 'https://makerdao.com' },
  { name: 'Blur',          cat: 'NFT Market',   chain: 'Ethereum',                       color: '#FF8700', bg: '#FFF6EE', icon: '💨', desc: 'The NFT marketplace built for pro traders. Zero platform fees on most collections.',                url: 'https://blur.io' },
  { name: 'dYdX',          cat: 'Perps',        chain: 'dYdX Chain',                     color: '#6966FF', bg: '#F3F2FF', icon: '⚡', desc: 'Non-custodial perpetuals trading with an on-chain order book and deep liquidity.',                   url: 'https://dydx.exchange' },
  { name: 'Yearn Finance', cat: 'Yield',        chain: 'Ethereum · Fantom',              color: '#0657F9', bg: '#F0F4FF', icon: '🏦', desc: 'Automated yield optimiser that moves funds to the highest-returning DeFi strategies.',               url: 'https://yearn.fi' },
];

const DEPOSIT_ASSETS = [
  { name: 'Ethereum',  sub: 'ETH on Ethereum Mainnet',   color: '#627EEA', icon: 'Ξ', bg: '#F0F3FF', addrKey: 'eth' },
  { name: 'Ether',     sub: 'ETH on Base',               color: '#0052FF', icon: 'Ξ', bg: '#F0F5FF', addrKey: 'eth' },
  { name: 'MATIC',     sub: 'MATIC on Polygon Mainnet',  color: '#8247E5', icon: 'M', bg: '#F5F0FF', addrKey: 'eth' },
  { name: 'BNB',       sub: 'BNB on BNB Smart Chain',    color: '#F3BA2F', icon: 'B', bg: '#FFFBF0', addrKey: 'eth' },
  { name: 'Ether',     sub: 'ETH on Optimism',           color: '#FF0420', icon: 'Ξ', bg: '#FFF0F2', addrKey: 'eth' },
  { name: 'Avalanche', sub: 'AVAX on Avalanche C-Chain', color: '#E84142', icon: 'A', bg: '#FFF0F0', addrKey: 'eth' },
];

const ACCOUNTS = [
  { name: 'Account 1',          sub: 'Ethereum + EVM Chains', color: '#627EEA', icon: 'Ξ', bg: '#F0F3FF', addrKey: 'eth', bal: '$0.0000001559' },
  { name: 'Filecoin Account 1', sub: 'Filecoin',              color: '#0090FF', icon: 'F', bg: '#F0F8FF', addrKey: 'eth', bal: '$0.00' },
  { name: 'Solana Account 1',   sub: 'Solana + SVM Chains',   color: '#9945FF', icon: '◎', bg: '#F8F0FF', addrKey: 'sol', bal: '$0.00' },
  { name: 'Bitcoin Account 1',  sub: 'Bitcoin Mainnet',       color: '#F7931A', icon: '₿', bg: '#FFF8F0', addrKey: 'btc', bal: '$0.00' },
  { name: 'Zcash Account 1',    sub: 'Zcash Mainnet',         color: '#ECB244', icon: 'Z', bg: '#FFFDF0', addrKey: 'eth', bal: '$0.00' },
  { name: 'Cardano Account 1',  sub: 'Cardano Mainnet',       color: '#0033AD', icon: 'A', bg: '#F0F4FF', addrKey: 'eth', bal: '$0.00' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function PixelAvatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const grid = 5; const cell = size / grid;
  const hash = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const h1 = Math.abs(hash(seed)) % 360;
  const h2 = (h1 + 40) % 360;
  const colors = [`hsl(${h1},70%,55%)`, `hsl(${h2},80%,45%)`, `hsl(${h1},50%,75%)`, '#ffffff', `hsl(${h2},60%,35%)`];
  const cells: { x: number; y: number; color: string }[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < Math.ceil(grid / 2); c++) {
      const col = colors[Math.abs(hash(seed + r + c)) % colors.length];
      cells.push({ x: c * cell, y: r * cell, color: col });
      if (c !== grid - 1 - c) cells.push({ x: (grid - 1 - c) * cell, y: r * cell, color: col });
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', flexShrink: 0, borderRadius: 6 }}>
      <rect width={size} height={size} fill={`hsl(${h1},40%,92%)`} />
      {cells.map((ce, i) => <rect key={i} x={ce.x} y={ce.y} width={cell} height={cell} fill={ce.color} />)}
    </svg>
  );
}

function CoinAvatar({ color, bg, icon, size = 36 }: { color: string; bg?: string; icon: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg ?? color + '22', border: `1.5px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: size * 0.4, fontWeight: 800, flexShrink: 0, userSelect: 'none' }}>
      {icon}
    </div>
  );
}

function QRCodeSVG({ value }: { value: string }) {
  const cells = 25; const sz = 220; const cell = sz / cells;
  const hash = (s: string, r: number, c: number) => (s.charCodeAt((r * cells + c) % s.length) + r * 7 + c * 13) % 3 === 0;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ display: 'block' }}>
      <rect width={sz} height={sz} fill="white" rx="4" />
      {Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) => {
          const on = (r < 7 && c < 7) || (r < 7 && c > cells - 8) || (r > cells - 8 && c < 7) || hash(value, r, c);
          return on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#111827" /> : null;
        })
      )}
    </svg>
  );
}

function ToggleRow({ label, icon, value, onChange }: { label: string; icon?: React.ReactNode; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && <span style={{ color: '#9CA3AF' }}>{icon}</span>}
        <span style={{ fontSize: 14, color: '#E5E7EB' }}>{label}</span>
      </div>
      <button onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, border: 'none', background: value ? '#4F46E5' : '#4B5563', cursor: 'pointer', position: 'relative', transition: 'background 0.15s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: value ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  );
}

// ─── Portfolio Chart ───────────────────────────────────────────────────────────

function PortfolioChart() {
  const [timeframe, setTimeframe] = useState('1 Hour');
  const [tfOpen, setTfOpen] = useState(false);
  const timeframes = ['1 Hour', '1 Day', '1 Week', '1 Month', '1 Year', 'All'];

  const DATA = [
    0.62, 0.60, 0.58, 0.55, 0.50, 0.45, 0.42, 0.44, 0.40,
    0.36, 0.32, 0.30, 0.28, 0.26, 0.30, 0.34, 0.50, 0.68,
    0.72, 0.65, 0.58, 0.50, 0.44, 0.38, 0.34, 0.32, 0.30,
    0.29, 0.28, 0.30,
  ];

  const W = 700; const H = 120;
  const minV = Math.min(...DATA); const maxV = Math.max(...DATA);
  const range = maxV - minV || 1;

  const pts = DATA.map((v, i) => ({
    x: (i / (DATA.length - 1)) * W,
    y: 8 + (1 - (v - minV) / range) * (H - 16),
  }));

  const line = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return acc + ` C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }, '');

  const area = `${line} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 500 }}>-$0.00</span>
          <span style={{ fontSize: 12, background: '#FEE2E2', color: '#EF4444', fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>-0.26%</span>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setTfOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {timeframe} <ChevronDown size={12} />
          </button>
          {tfOpen && (
            <div style={{ position: 'absolute', top: 34, right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 20 }}>
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => { setTimeframe(tf); setTfOpen(false); }}
                  style={{ display: 'block', width: '100%', padding: '8px 20px', background: tf === timeframe ? '#F0F3FF' : 'none', border: 'none', textAlign: 'left', fontSize: 13, color: tf === timeframe ? '#4F46E5' : '#374151', cursor: 'pointer', fontWeight: tf === timeframe ? 600 : 400, fontFamily: 'inherit' }}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ width: '100%', overflow: 'hidden', borderRadius: 4 }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', height: 120 }}>
          <defs>
            <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#pgGrad)" />
          <path d={line} stroke="#4F46E5" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ─── Buy providers ─────────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    name: 'Kryptonim', tag: 'Best Option',
    sub: '$100.00 = ~0.046008 ETH',
    rate: '≈ 2,173.53 USD / ETH', price: '≈ 96.63 USD', fees: '3.37 USD', total: '$100.00 USD',
    color: '#111827', letter: 'K',
  },
  {
    name: 'Topper', tag: '',
    sub: '$100.00 = ~0.045533 ETH',
    rate: '≈ 2,196.23 USD / ETH', price: '≈ 100.00 USD', fees: '0.00 USD', total: '$100.00 USD',
    color: '#16A34A', letter: 'T',
  },
];

// ─── DApp Card ─────────────────────────────────────────────────────────────────

function DAppCard({ dapp, onOpenBrowser }: { dapp: typeof DAPPS[0]; onOpenBrowser?: (url?: string) => void; key?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onOpenBrowser ? onOpenBrowser(dapp.url) : window.open(dapp.url, '_blank', 'noopener,noreferrer')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1.5px solid ${hovered ? '#a5b4fc' : '#E5E7EB'}`,
        borderRadius: 14,
        padding: '16px',
        background: '#fff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        boxShadow: hovered ? '0 4px 20px rgba(79,70,229,0.10)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: dapp.bg,
          border: `1.5px solid ${dapp.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {dapp.icon}
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: dapp.color,
          background: dapp.bg,
          border: `1px solid ${dapp.color}44`,
          borderRadius: 6,
          padding: '3px 8px',
          whiteSpace: 'nowrap',
          marginTop: 2,
          letterSpacing: '0.03em',
        }}>
          {dapp.cat}
        </span>
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 14 }}>{dapp.name}</p>
        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9ca3af', lineHeight: 1.4 }}>{dapp.chain}</p>
      </div>
      <p style={{
        margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.55,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1,
      }}>
        {dapp.desc}
      </p>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        paddingTop: 8, borderTop: '1px solid #f3f4f6', marginTop: 2,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: hovered ? '#4f46e5' : '#6b7280',
          display: 'flex', alignItems: 'center', gap: 4,
          transition: 'color 0.15s',
        }}>
          Open app <ExternalLink size={11} />
        </span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard({ onOpenBrowser }: DashboardProps) {
  const { addresses, lock } = useWalletStore();
  const [section, setSection] = useState<Section>('portfolio');
  const [tab, setTab] = useState<PortfolioTab>('assets');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [showGraph, setShowGraph] = useState(true);
  const [showNFTs, setShowNFTs] = useState(true);
  const [depositAsset, setDepositAsset] = useState<typeof DEPOSIT_ASSETS[0] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [searchExplore, setSearchExplore] = useState('');
  const [searchDapps, setSearchDapps] = useState('');
  const [dappFilter, setDappFilter] = useState('All');
  const [expandedProvider, setExpandedProvider] = useState<string | null>('Kryptonim');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const eth = addresses?.eth ?? '0x10c553826F812b766ab1fD4d9539A1ff9eCb3BC4';
  const btc = addresses?.btc ?? 'bc1q0000000000000000000000000000000000000';
  const sol = addresses?.sol ?? '4NZN000000000000000000000000000000Qbmm';
  const getAddr = (key: string) => key === 'btc' ? btc : key === 'sol' ? sol : eth;

  const filteredMarket = MARKET.filter(
    c => c.name.toLowerCase().includes(searchExplore.toLowerCase()) ||
         c.sym.toLowerCase().includes(searchExplore.toLowerCase())
  );

  const dappCategories = ['All', ...Array.from(new Set(DAPPS.map(d => d.cat)))];
  const filteredDapps = DAPPS.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchDapps.toLowerCase()) ||
                          d.cat.toLowerCase().includes(searchDapps.toLowerCase());
    const matchesCat = dappFilter === 'All' || d.cat === dappFilter;
    return matchesSearch && matchesCat;
  });

  const NAV = [
    { id: 'portfolio' as Section, label: 'Portfolio', Icon: BarChart3 },
    { id: 'accounts'  as Section, label: 'Accounts',  Icon: User },
    { id: 'explore'   as Section, label: 'Explore',   Icon: Compass },
    { id: 'buy'       as Section, label: 'Buy',        Icon: ShoppingCart, dividerBefore: true },
    { id: 'send'      as Section, label: 'Send',       Icon: Send },
    { id: 'swap'      as Section, label: 'Swap',       Icon: RefreshCw },
    { id: 'bridge'    as Section, label: 'Bridge',     Icon: LinkIcon },
    { id: 'deposit'   as Section, label: 'Deposit',    Icon: Download },
  ];

  const bareSection = section === 'send' || section === 'swap' || section === 'bridge';

  // Portfolio tabs
  const portfolioTabs: PortfolioTab[] = ['assets', 'dapps', ...(showNFTs ? ['nfts' as PortfolioTab] : []), 'activity'];

  // ── Pinned header content for each section ──────────────────────────────────
  const renderPinnedHeader = () => {
    if (section === 'portfolio') {
      return (
        <div style={{ padding: '28px 36px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Portfolio</h2>
            <button style={circleIconBtn}><Plus size={16} color="#6b7280" /></button>
          </div>
        </div>
      );
    }
    if (section === 'accounts') {
      return (
        <div style={{ padding: '28px 36px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Accounts</h2>
            <button style={circleIconBtn}><Plus size={15} color="#6b7280" /></button>
          </div>
        </div>
      );
    }
    if (section === 'explore') {
      return (
        <div style={{ padding: '28px 36px 0', flexShrink: 0 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Explore</h2>
        </div>
      );
    }
    if (section === 'buy') {
      return (
        <div style={{ padding: '28px 36px 0', flexShrink: 0 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Buy ETH</h2>
        </div>
      );
    }
    if (section === 'deposit') {
      return (
        <div style={{ padding: '28px 36px 0', flexShrink: 0 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Deposit</h2>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: 14, overflow: 'hidden' }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={{ width: 236, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/logo.jpg"
            alt="Orivon"
            style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>wallet</span>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {NAV.map(({ id, label, Icon, dividerBefore }) => {
            const active = section === id;
            return (
              <React.Fragment key={id}>
                {dividerBefore && <div style={{ height: 1, background: '#f3f4f6', margin: '6px 0' }} />}
                <div
                  onClick={() => { setSection(id); setDepositAsset(null); }}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', cursor: 'pointer', color: active ? '#4f46e5' : '#374151', fontWeight: active ? 600 : 400, userSelect: 'none' }}
                >
                  {active && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#4f46e5', borderRadius: '0 2px 2px 0' }} />}
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} color={active ? '#4f46e5' : '#6b7280'} />
                  <span>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid #f3f4f6' }}>
          <div onClick={onOpenBrowser} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', cursor: 'pointer', color: '#374151', userSelect: 'none' }}>
            <Globe size={17} strokeWidth={1.8} color="#6b7280" />
            <span>Go to browser</span>
          </div>
        </div>
      </aside>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* ── 3-dot menu ── */}
        <div ref={menuRef} style={{ position: 'absolute', top: 16, right: 20, zIndex: 200 }}>
          <button
            onClick={() => setMenuOpen(p => !p)}
            style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: menuOpen ? 'rgba(255,255,255,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <div style={{ position: 'absolute', top: 44, right: 0, width: 280, background: '#1F2937', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.4)', overflow: 'hidden', zIndex: 300 }}>
              {[
                { Icon: Lock,     label: 'Lock wallet',     action: () => { lock(); setMenuOpen(false); } },
                { Icon: Shield,   label: 'Backup wallet',   action: () => setMenuOpen(false) },
                { Icon: LinkIcon, label: 'Connected sites', action: () => setMenuOpen(false) },
                { Icon: Settings, label: 'Settings',        action: () => setMenuOpen(false) },
              ].map((item, i) => (
                <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#E5E7EB', textAlign: 'left', fontFamily: 'inherit', borderBottom: i < 3 ? '1px solid #374151' : 'none' }}>
                  <item.Icon size={17} color="#9CA3AF" />
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid #374151', padding: '8px 0 4px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '4px 18px 4px' }}>Portfolio Settings</p>
              </div>
              <ToggleRow label="Balances" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>} value={showBalances} onChange={setShowBalances} />
              <ToggleRow label="Graph"    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} value={showGraph}    onChange={setShowGraph} />
              <ToggleRow label="NFTs tab" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>} value={showNFTs}     onChange={setShowNFTs} />
              <div style={{ borderTop: '1px solid #374151', margin: '4px 0 0' }}>
                <button onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#E5E7EB', textAlign: 'left', fontFamily: 'inherit' }}>
                  <HelpCircle size={17} color="#9CA3AF" />
                  Help center
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Content area ── */}
        {bareSection ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
            <SendSwapBridge mode={section as 'send' | 'swap' | 'bridge'} />
          </div>
        ) : (
          /*
           * Outer gray gutter — scrollable so the card can be taller than the
           * viewport on very long sections, but naturally short on short ones.
           * The card uses height: auto + maxHeight so it shrinks to content and
           * only grows to a capped maximum before the inner body starts scrolling.
           */
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 32px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>

            {/*
             * White card:
             *   height: auto  → shrinks to content; never stretches past content
             *   maxHeight: calc(100vh - 96px)  → caps growth at near-full viewport
             *   display: flex / flexDirection: column
             *   pinned header (flexShrink: 0) + scrollable body (flex: 1, overflowY: auto)
             *
             * When content is short (Accounts, Buy, Deposit list) the card is
             * only as tall as it needs to be and gray space shows naturally below.
             *
             * When content is long (Portfolio assets, Explore table) the card
             * hits maxHeight and the inner div scrolls instead.
             */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 820,
              height: 'auto',
              maxHeight: 'calc(100vh - 96px)',
              display: 'flex',
              flexDirection: 'column',
              background: '#fff',
              borderRadius: 18,
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
              overflow: 'hidden',
            }}>

              {/* ── Pinned header — never scrolls ── */}
              {renderPinnedHeader()}

              {/* ── Scrollable body ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 36px 36px', minHeight: 0 }}>

                {/* ══ PORTFOLIO ══════════════════════════════════════════════ */}
                {section === 'portfolio' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        {showBalances
                          ? <p style={{ fontSize: 34, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-1px' }}>$0.0000001559</p>
                          : <p style={{ fontSize: 34, fontWeight: 700, color: '#111827', margin: 0 }}>••••••</p>
                        }
                      </div>
                      <div style={{ display: 'flex', gap: 20 }}>
                        {[
                          { Icon: ShoppingBag,    label: 'Buy',  action: () => setSection('buy') },
                          { Icon: Send,           label: 'Send', action: () => setSection('send') },
                          { Icon: RefreshCw,      label: 'Swap', action: () => setSection('swap') },
                          { Icon: MoreHorizontal, label: 'More', action: () => {} },
                        ].map(btn => (
                          <button key={btn.label} onClick={btn.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <btn.Icon size={20} color="#fff" strokeWidth={2} />
                            </div>
                            <span style={{ fontSize: 12, color: '#111827', fontWeight: 500 }}>{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {showGraph && <PortfolioChart />}

                    {/* Tabs */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 9999, padding: 4, gap: 2 }}>
                        {portfolioTabs.map(t => (
                          <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                              padding: '9px 26px', borderRadius: 9999,
                              background: tab === t ? '#fff' : 'transparent',
                              border: tab === t ? '1.5px solid #c7d2fe' : '1.5px solid transparent',
                              color: tab === t ? '#4f46e5' : '#6b7280',
                              fontWeight: tab === t ? 700 : 500,
                              fontSize: 14, cursor: 'pointer',
                              transition: 'all 0.12s', fontFamily: 'inherit',
                            }}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Assets tab ── */}
                    {tab === 'assets' && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Assets</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9999, padding: '7px 14px', width: 190 }}>
                              <Search size={13} color="#9ca3af" />
                              <input placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#111827', background: 'transparent', width: '100%', fontFamily: 'inherit' }} />
                            </div>
                            <button style={circleIconBtn}><ListFilter size={15} color="#4f46e5" /></button>
                            <button style={circleIconBtn}><Filter size={15} color="#4f46e5" /></button>
                          </div>
                        </div>
                        <div>
                          {PORTFOLIO_ASSETS.map((a, i) => (
                            <div key={a.sym + a.sub + i} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i < PORTFOLIO_ASSETS.length - 1 ? '1px solid #f3f4f6' : 'none', gap: 14 }}>
                              <CoinAvatar color={a.color} bg={a.bg} icon={a.icon} size={40} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</p>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{a.sub}</p>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 13 }}>{showBalances ? `${a.bal} ${a.sym}` : '•••'}</p>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{showBalances ? a.usd : '•••'}</p>
                              </div>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', color: '#9ca3af', flexShrink: 0 }}>
                                <MoreVertical size={15} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* ── DApps tab ── */}
                    {tab === 'dapps' && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>DApps</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', background: '#f3f4f6', borderRadius: 9999, padding: '2px 8px' }}>{filteredDapps.length}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9999, padding: '7px 14px', width: 180 }}>
                            <Search size={13} color="#9ca3af" />
                            <input
                              placeholder="Search dapps"
                              value={searchDapps}
                              onChange={e => setSearchDapps(e.target.value)}
                              style={{ border: 'none', outline: 'none', fontSize: 13, color: '#111827', background: 'transparent', width: '100%', fontFamily: 'inherit' }}
                            />
                          </div>
                        </div>

                        {/* Category filter pills */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                          {dappCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setDappFilter(cat)}
                              style={{
                                padding: '5px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                                background: dappFilter === cat ? '#4f46e5' : '#f3f4f6',
                                color: dappFilter === cat ? '#fff' : '#6b7280',
                                transition: 'all 0.12s',
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* DApp grid */}
                        {filteredDapps.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
                            {filteredDapps.map(dapp => (
                              <DAppCard key={dapp.name} dapp={dapp} onOpenBrowser={onOpenBrowser} />
                            ))}
                          </div>
                        ) : (
                          <EmptyState text="No dApps match your search" />
                        )}
                      </>
                    )}

                    {tab === 'nfts'     && <EmptyState text="No NFTs found" />}
                    {tab === 'activity' && <EmptyState text="No recent activity" />}
                  </>
                )}

                {/* ══ ACCOUNTS ═══════════════════════════════════════════════ */}
                {section === 'accounts' && (
                  <>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accounts</p>
                    <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                      {ACCOUNTS.map((acc, i) => (
                        <div key={acc.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: '#fff', borderBottom: i < ACCOUNTS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <PixelAvatar seed={acc.name + acc.sub} size={44} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 14 }}>{acc.name}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{getAddr(acc.addrKey).slice(0, 8)}***{getAddr(acc.addrKey).slice(-4)}</p>
                            <p style={{ margin: '1px 0 0', fontSize: 11, color: '#D1D5DB' }}>{acc.sub}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <CoinAvatar color={acc.color} bg={acc.bg} icon={acc.icon} size={22} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', minWidth: 70, textAlign: 'right' }}>{acc.bal}</span>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}><MoreVertical size={15} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ══ EXPLORE ════════════════════════════════════════════════ */}
                {section === 'explore' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <button style={{ ...selectBtnStyle, gap: 6, whiteSpace: 'nowrap' }}>All Assets <ChevronDown size={14} /></button>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 9999, padding: '9px 16px', background: '#fff' }}>
                        <Search size={14} color="#9CA3AF" />
                        <input value={searchExplore} onChange={e => setSearchExplore(e.target.value)} placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', flex: 1, fontFamily: 'inherit' }} />
                      </div>
                    </div>
                    <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            {['Assets', 'Price', '24hr', 'Cap', 'Volume', 'Buy/Deposit'].map((h, i) => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: i === 5 ? 'center' : 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>
                                {h}{h === 'Cap' && <span style={{ marginLeft: 4, color: '#9CA3AF', fontSize: 10 }}>⇅</span>}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMarket.map((c, i) => (
                            <tr key={c.sym} style={{ borderTop: i === 0 ? 'none' : '1px solid #F3F4F6' }}>
                              <td style={{ padding: '11px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <CoinAvatar color={c.color} bg={c.bg} icon={c.icon} size={32} />
                                  <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 13 }}>{c.name}</p>
                                    <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF' }}>{c.sym}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '11px 14px', fontSize: 13, color: '#111827', fontWeight: 500 }}>{c.price}</td>
                              <td style={{ padding: '11px 14px', fontSize: 12, color: c.change >= 0 ? '#10B981' : '#EF4444', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {c.change >= 0 ? '▲' : '▼'} {Math.abs(c.change).toFixed(2)}%
                              </td>
                              <td style={{ padding: '11px 14px', fontSize: 12, color: '#374151' }}>{c.cap}</td>
                              <td style={{ padding: '11px 14px', fontSize: 12, color: '#374151' }}>{c.vol}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                  <button onClick={() => setSection('buy')} style={outlinePillBtn}>Buy</button>
                                  <button onClick={() => setSection('deposit')} style={outlinePillBtn}>Deposit</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* ══ BUY ════════════════════════════════════════════════════ */}
                {section === 'buy' && (
                  <div style={{ maxWidth: 700 }}>
                    <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', marginBottom: 4, borderBottom: '1px solid #F3F4F6', paddingBottom: 16 }}>
                      <div style={{ marginRight: 28 }}>
                        <label style={formLabelStyle}>Asset</label>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                          <CoinAvatar color="#627EEA" bg="#F0F3FF" icon="Ξ" size={26} />
                          <span style={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>ETH</span>
                          <ChevronDown size={14} color="#6b7280" />
                        </button>
                      </div>
                      <div style={{ flex: 1, marginRight: 28 }}>
                        <label style={formLabelStyle}>Account</label>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                          <PixelAvatar seed="Account 1Ethereum + EVM Chains" size={26} />
                          <span style={{ fontWeight: 600, fontSize: 16, color: '#111827' }}>Account 1</span>
                          <ChevronDown size={14} color="#6b7280" />
                        </button>
                      </div>
                      <div>
                        <label style={formLabelStyle}>Amount</label>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                          <span style={{ fontWeight: 700, fontSize: 22, color: '#111827' }}>100 USD</span>
                          <ChevronDown size={14} color="#6b7280" />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', margin: '6px 0 20px' }}>{eth}</p>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 14px', background: '#fff' }}>
                        <Search size={14} color="#9CA3AF" />
                        <input placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', flex: 1, fontFamily: 'inherit' }} />
                      </div>
                      <button style={{ ...selectBtnStyle, gap: 6 }}>United States <ChevronDown size={13} /></button>
                      <button style={{ ...selectBtnStyle, gap: 6, whiteSpace: 'nowrap' }}>Credit &amp; Debit Card <ChevronDown size={13} /></button>
                    </div>
                    {PROVIDERS.map(prov => (
                      <div key={prov.name} style={{ border: `1.5px solid ${expandedProvider === prov.name ? '#4F46E5' : '#E5E7EB'}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpandedProvider(expandedProvider === prov.name ? null : prov.name)}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: prov.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{prov.letter}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{prov.name}</span>
                              {prov.tag && (
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 6, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  🏆 {prov.tag}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 12, color: '#6B7280' }}>{prov.sub}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <button style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                            </button>
                            <button style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                            </button>
                            <button style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <ChevronDown size={14} color="#6B7280" style={{ transform: expandedProvider === prov.name ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                          </div>
                        </div>
                        {expandedProvider === prov.name && (
                          <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>
                            <div style={{ paddingTop: 14 }}>
                              {[
                                { label: 'Exchange rate with fees', value: prov.rate },
                                { label: 'Price USD',               value: prov.price },
                                { label: 'Fees',                    value: prov.fees },
                              ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                  <span style={{ fontSize: 13, color: '#6B7280' }}>{row.label}</span>
                                  <span style={{ fontSize: 13, color: '#374151' }}>{row.value}</span>
                                </div>
                              ))}
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Total</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{prov.total}</span>
                              </div>
                              <button style={{ width: '100%', padding: '13px', borderRadius: 10, background: '#1E293B', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
                                Buy with {prov.name}
                                <ExternalLink size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ══ DEPOSIT list ════════════════════════════════════════════ */}
                {section === 'deposit' && !depositAsset && (
                  <div style={{ maxWidth: 680 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 14px', background: '#fff' }}>
                        <Search size={14} color="#9CA3AF" />
                        <input placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', flex: 1, fontFamily: 'inherit' }} />
                      </div>
                      <button style={{ ...selectBtnStyle, gap: 6, whiteSpace: 'nowrap' }}>All Networks <ChevronDown size={13} /></button>
                    </div>
                    <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                      {DEPOSIT_ASSETS.map((a, i) => (
                        <div key={a.name + a.sub} onClick={() => setDepositAsset(a)}
                          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < DEPOSIT_ASSETS.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', background: '#fff', transition: 'background 0.1s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                        >
                          <CoinAvatar color={a.color} bg={a.bg} icon={a.icon} size={40} />
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 14 }}>{a.name}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{a.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                      <button style={{ padding: '12px 48px', borderRadius: 9999, background: '#E5E7EB', color: '#9CA3AF', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'not-allowed', fontFamily: 'inherit' }}>Select an asset</button>
                    </div>
                  </div>
                )}

                {/* ══ DEPOSIT QR ══════════════════════════════════════════════ */}
                {section === 'deposit' && depositAsset && (
                  <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8, marginTop: 0 }}>Deposit {depositAsset.name}</h3>
                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Only send tokens to this address on {depositAsset.sub.split(' on ')[1] ?? 'this network'}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 9999, padding: '6px 14px 6px 8px', marginBottom: 20 }}>
                      <PixelAvatar seed="Account 1Ethereum + EVM Chains" size={28} />
                      <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>Account 1</span>
                      <ChevronDown size={14} color="#9ca3af" />
                    </div>
                    <p style={{ fontWeight: 700, color: '#111827', marginBottom: 6, fontSize: 13 }}>Address:</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#374151', wordBreak: 'break-all' }}>{getAddr(depositAsset.addrKey)}</span>
                      <button onClick={() => copy(getAddr(depositAsset.addrKey), 'dep')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'dep' ? '#10B981' : '#6B7280', flexShrink: 0 }}>
                        {copied === 'dep' ? <CheckCircle size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                    <div style={{ display: 'inline-block', border: '2px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#fff' }}>
                      <QRCodeSVG value={getAddr(depositAsset.addrKey)} />
                    </div>
                    <div style={{ marginTop: 24 }}>
                      <button onClick={() => setDepositAsset(null)} style={{ padding: '10px 28px', borderRadius: 9999, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                    </div>
                  </div>
                )}

              </div>{/* end scrollable body */}
            </div>{/* end white card */}
          </div>
        )}
      </div>

      {/* Floating Request Feature */}
      <button
        style={{ position: 'fixed', bottom: 22, right: 22, zIndex: 200, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 9999, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.4)', transition: 'all 0.15s', fontFamily: 'inherit' }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
      >
        <Sparkles size={16} fill="#fff" />
        <span style={{ fontSize: 13, fontWeight: 700 }}>Request feature</span>
      </button>
    </div>
  );
}

// ─── Send / Swap / Bridge ──────────────────────────────────────────────────────

function SendSwapBridge({ mode }: { mode: 'send' | 'swap' | 'bridge' }) {
  const isSwapOrBridge = mode !== 'send';
  const toLabel     = mode === 'send' ? 'To'               : 'Receive (est.)';
  const toBtn       = mode === 'send' ? 'Choose recipient'  : 'Choose Asset';
  const actionLabel = mode === 'send' ? 'Review send'       : mode === 'swap' ? 'Review swap' : 'Review bridge';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: '22px 24px', background: '#fff', marginBottom: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', margin: '0 0 12px', letterSpacing: '0.02em' }}>From</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: 18, fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            Choose Asset <span style={{ fontSize: 18 }}>›</span>
          </button>
          <span style={{ fontSize: 32, color: '#D1D5DB', fontWeight: 300 }}>0.0</span>
        </div>
      </div>

      {isSwapOrBridge && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <button style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#374151' }}>
            <ArrowUpDown size={16} />
          </button>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(255,87,34,0.4)' }}>
            <img src="/logo.jpg" alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
              onError={e => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.parentElement as HTMLElement).innerHTML = `<svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M28.483 15.143L23.473 11.233L21.758 4.298L16.002 9.533L10.245 4.298L8.53 11.233L3.52 15.143L8.607 19.34L8.747 26.697L16.002 23.363L23.257 26.697L23.396 19.34L28.483 15.143Z" fill="#fff"/></svg>`;
              }}
            />
          </div>
        </div>
      )}

      <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: '22px 24px', background: '#EEF2FF', marginTop: isSwapOrBridge ? 0 : 4 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', margin: '0 0 12px', letterSpacing: '0.02em' }}>{toLabel}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'none', border: 'none', color: '#374151', fontSize: 18, fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            {toBtn} <span style={{ fontSize: 18 }}>›</span>
          </button>
          <span style={{ fontSize: 32, color: '#D1D5DB', fontWeight: 300 }}>0.0</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <button style={{ padding: '14px 0', width: '100%', maxWidth: 440, borderRadius: 9999, background: '#E5E7EB', color: '#9CA3AF', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'not-allowed', fontFamily: 'inherit' }}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Tiny helpers ──────────────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: 14 }}>{text}</div>;
}

// ─── Style constants ───────────────────────────────────────────────────────────

const circleIconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #e5e7eb',
  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
};
const outlinePillBtn: React.CSSProperties = {
  padding: '5px 14px', borderRadius: 9999, border: '1px solid #E5E7EB',
  background: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  color: '#374151', fontFamily: 'inherit',
};
const selectBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px',
  border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff',
  fontSize: 13, color: '#374151', cursor: 'pointer', fontFamily: 'inherit',
};
const formLabelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: '#9CA3AF', display: 'block', marginBottom: 6,
};