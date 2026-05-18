import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, User, Compass, ShoppingCart, Send, RefreshCw,
  Link as LinkIcon, Download, MoreVertical, Plus,
  ArrowLeftRight, Search, Lock, Shield,
  Settings, HelpCircle, Copy, CheckCircle, ChevronDown,
  Sparkles, Filter, ListFilter, MoreHorizontal, Eye, EyeOff,
  ShoppingBag, TrendingUp, Activity, ArrowUpDown, HelpCircle as HelpIcon
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';

type Section = 'portfolio' | 'accounts' | 'explore' | 'buy' | 'send' | 'swap' | 'bridge' | 'deposit';
type PortfolioTab = 'assets' | 'nfts' | 'activity';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DashboardProps { onOpenBrowser?: () => void; }

const MARKET = [
  { name: 'Bitcoin',   sym: 'BTC',  price: '$78,224.00', change:  0.47, cap: '$1,567.7B', vol: '$18.9B', color: '#F7931A', icon: '₿', bg: '#FFF8F0' },
  { name: 'Ethereum',  sym: 'ETH',  price: '$2,191.68',  change:  0.71, cap: '$264.6B',   vol: '$7.5B',  color: '#627EEA', icon: 'Ξ',  bg: '#F0F3FF' },
  { name: 'Tether',    sym: 'USDT', price: '$0.9995',    change:  0.0,  cap: '$189.8B',   vol: '$31.3B', color: '#26A17B', icon: '₮',  bg: '#F0FDF8' },
  { name: 'BNB',       sym: 'BNB',  price: '$653.72',    change:  0.15, cap: '$88.1B',    vol: '$584.2M',color: '#F3BA2F', icon: 'B',  bg: '#FFFBF0' },
  { name: 'XRP',       sym: 'XRP',  price: '$1.42',      change:  0.32, cap: '$87.8B',    vol: '$1.2B',  color: '#00AAE4', icon: 'X',  bg: '#F0FAFF' },
  { name: 'USDC',      sym: 'USDC', price: '$0.9998',    change: -0.0,  cap: '$77.0B',    vol: '$5.0B',  color: '#2775CA', icon: '$',  bg: '#F0F5FF' },
  { name: 'Solana',    sym: 'SOL',  price: '$86.48',     change:  0.28, cap: '$50.0B',    vol: '$1.7B',  color: '#9945FF', icon: '◎',  bg: '#F8F0FF' },
  { name: 'TRON',      sym: 'TRX',  price: '$0.3565',    change:  1.55, cap: '$33.8B',    vol: '$430.3M',color: '#EF0027', icon: 'T',  bg: '#FFF0F2' },
  { name: 'Dogecoin',  sym: 'DOGE', price: '$0.1234',    change:  3.4,  cap: '$17.2B',    vol: '$1.8B',  color: '#C2A633', icon: 'D',  bg: '#FFFCF0' },
  { name: 'Cardano',   sym: 'ADA',  price: '$0.4521',    change: -0.8,  cap: '$16.0B',    vol: '$0.7B',  color: '#0033AD', icon: 'A',  bg: '#F0F4FF' },
];

const PORTFOLIO_ASSETS = [
  { name: 'Position',              sym: 'POSI',  sub: 'POSI on BNB Smart Chain',   color: '#1DB954', icon: 'P',  bg: '#F0FDF4', bal: '0.0001',  usd: '$0.0000001559' },
  { name: 'Ethereum',              sym: 'ETH',   sub: 'ETH on Ethereum Mainnet',    color: '#627EEA', icon: 'Ξ',  bg: '#F0F3FF', bal: '0',        usd: '$0.00' },
  { name: 'Basic Attention Token', sym: 'BAT',   sub: 'BAT on Ethereum Mainnet',    color: '#FF5000', icon: 'B',  bg: '#FFF3EE', bal: '0',        usd: '$0.00' },
  { name: 'Ether',                 sym: 'ETH',   sub: 'ETH on Base',                color: '#0052FF', icon: 'Ξ',  bg: '#F0F5FF', bal: '0',        usd: '$0.00' },
  { name: 'MATIC',                 sym: 'MATIC', sub: 'MATIC on Polygon Mainnet',   color: '#8247E5', icon: 'M',  bg: '#F5F0FF', bal: '0',        usd: '$0.00' },
  { name: 'BNB',                   sym: 'BNB',   sub: 'BNB on BNB Smart Chain',     color: '#F3BA2F', icon: 'B',  bg: '#FFFBF0', bal: '0',        usd: '$0.00' },
];

const DEPOSIT_ASSETS = [
  { name: 'Ethereum', sub: 'ETH on Ethereum Mainnet',  color: '#627EEA', icon: 'Ξ',  bg: '#F0F3FF', addrKey: 'eth' },
  { name: 'Ether',    sub: 'ETH on Base',              color: '#0052FF', icon: 'Ξ',  bg: '#F0F5FF', addrKey: 'eth' },
  { name: 'MATIC',    sub: 'MATIC on Polygon Mainnet', color: '#8247E5', icon: 'M',  bg: '#F5F0FF', addrKey: 'eth' },
  { name: 'BNB',      sub: 'BNB on BNB Smart Chain',   color: '#F3BA2F', icon: 'B',  bg: '#FFFBF0', addrKey: 'eth' },
  { name: 'Ether',    sub: 'ETH on Optimism',          color: '#FF0420', icon: 'Ξ',  bg: '#FFF0F2', addrKey: 'eth' },
  { name: 'Avalanche',sub: 'AVAX on Avalanche C-Chain',color: '#E84142', icon: 'A',  bg: '#FFF0F0', addrKey: 'eth' },
];

const ACCOUNTS = [
  { name: 'Account 1',         sub: 'Ethereum + EVM Chains', color: '#627EEA', icon: 'Ξ',  bg: '#F0F3FF', addrKey: 'eth', bal: '$0.0000001559' },
  { name: 'Filecoin Account 1',sub: 'Filecoin',               color: '#0090FF', icon: 'F',  bg: '#F0F8FF', addrKey: 'eth', bal: '$0.00' },
  { name: 'Solana Account 1',  sub: 'Solana + SVM Chains',    color: '#9945FF', icon: '◎',  bg: '#F8F0FF', addrKey: 'sol', bal: '$0.00' },
  { name: 'Bitcoin Account 1', sub: 'Bitcoin Mainnet',        color: '#F7931A', icon: '₿',  bg: '#FFF8F0', addrKey: 'btc', bal: '$0.00' },
  { name: 'Zcash Account 1',   sub: 'Zcash Mainnet',          color: '#ECB244', icon: 'Z',  bg: '#FFFDF0', addrKey: 'eth', bal: '$0.00' },
  { name: 'Cardano Account 1', sub: 'Cardano Mainnet',        color: '#0033AD', icon: 'A',  bg: '#F0F4FF', addrKey: 'eth', bal: '$0.00' },
];

/** Deterministic pixel-art style avatar (coloured squares) */
function PixelAvatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const grid = 5;
  const cell = size / grid;
  // generate a colour palette from seed
  const hash = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const h1 = Math.abs(hash(seed)) % 360;
  const h2 = (h1 + 40) % 360;
  const colors = [
    `hsl(${h1},70%,55%)`,
    `hsl(${h2},80%,45%)`,
    `hsl(${h1},50%,75%)`,
    '#ffffff',
    `hsl(${h2},60%,35%)`,
  ];
  // build symmetric grid
  const cells: { x: number; y: number; color: string }[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < Math.ceil(grid / 2); c++) {
      const idx = Math.abs(hash(seed + r + c)) % colors.length;
      const col = colors[idx];
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
  const cells = 25;
  const hash = (s: string, r: number, c: number) =>
    (s.charCodeAt((r * cells + c) % s.length) + r * 7 + c * 13) % 3 === 0;
  const sz = 220; const cell = sz / cells;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ display: 'block' }}>
      <rect width={sz} height={sz} fill="white" rx="4" />
      {Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) => {
          const inFinder = (r < 7 && c < 7) || (r < 7 && c > cells - 8) || (r > cells - 8 && c < 7);
          const on = inFinder || hash(value, r, c);
          return on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#111827" /> : null;
        })
      )}
    </svg>
  );
}

export default function Dashboard({ onOpenBrowser }: DashboardProps) {
  const { addresses, lock } = useWalletStore();
  const [section, setSection] = useState<Section>('portfolio');
  const [tab, setTab] = useState<PortfolioTab>('assets');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [showGraph, setShowGraph] = useState(false);
  const [showNFTs, setShowNFTs] = useState(true);
  const [depositAsset, setDepositAsset] = useState<typeof DEPOSIT_ASSETS[0] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [searchExplore, setSearchExplore] = useState('');
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

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: 14, overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 236, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M28.483 15.143L23.473 11.233L21.758 4.298L16.002 9.533L10.245 4.298L8.53 11.233L3.52 15.143L8.607 19.34L8.747 26.697L16.002 23.363L23.257 26.697L23.396 19.34L28.483 15.143Z" fill="#fb542b"/>
          </svg>
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
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Three-dot menu */}
        <div ref={menuRef} style={{ position: 'absolute', top: 16, right: 20, zIndex: 50 }}>
          <button onClick={() => setMenuOpen(p => !p)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af' }}>
            <MoreVertical size={20} />
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', top: 40, right: 0, width: 240, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.13)', border: '1px solid #E5E7EB', overflow: 'hidden', zIndex: 100 }}>
              {[
                { Icon: Lock,    label: 'Lock wallet',    action: () => { lock(); setMenuOpen(false); } },
                { Icon: Shield,  label: 'Backup wallet',  action: () => setMenuOpen(false) },
                { Icon: Settings,label: 'Settings',        action: () => setMenuOpen(false) },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={menuItemStyle}>
                  <item.Icon size={15} color="#374151" /> {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid #F3F4F6', padding: '8px 16px 4px' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>Portfolio Settings</p>
              </div>
              <ToggleRow label="Balances" value={showBalances} onChange={setShowBalances} />
              <ToggleRow label="Graph"    value={showGraph}    onChange={setShowGraph}    />
              <ToggleRow label="NFTs tab" value={showNFTs}     onChange={setShowNFTs}     />
              <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 4 }}>
                <button style={menuItemStyle} onClick={() => setMenuOpen(false)}>
                  <HelpCircle size={15} color="#374151" /> Help center
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', minHeight: 'calc(100vh - 48px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 820, marginLeft: 'auto', marginRight: 'auto' }}>

            {/* ── PORTFOLIO ── */}
            {section === 'portfolio' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Portfolio</h2>
                  <button style={circleIconBtn}><Plus size={17} color="#4f46e5" /></button>
                </div>

                {/* Balance + Actions row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
                  <div>
                    {showBalances
                      ? <p style={{ fontSize: 36, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-1px' }}>$0.0000001559</p>
                      : <p style={{ fontSize: 36, fontWeight: 700, color: '#111827', margin: 0 }}>••••••</p>
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
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <btn.Icon size={20} color="#fff" strokeWidth={2} />
                        </div>
                        <span style={{ fontSize: 12, color: '#111827', fontWeight: 500 }}>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Portfolio chart */}
                <PortfolioChart />

                {/* Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                  <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 9999, padding: 4, gap: 2 }}>
                    {(['assets', ...(showNFTs ? ['nfts'] : []), 'activity'] as PortfolioTab[]).map(t => (
                      <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 28px', borderRadius: 9999, background: tab === t ? '#fff' : 'transparent', border: tab === t ? '1.5px solid #e5e7eb' : '1.5px solid transparent', color: tab === t ? '#4f46e5' : '#6b7280', fontWeight: tab === t ? 700 : 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.12s' }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {tab === 'assets' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Assets</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9999, padding: '7px 14px', width: 180 }}>
                          <Search size={13} color="#9ca3af" />
                          <input placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#111827', background: 'transparent', width: '100%' }} />
                        </div>
                        <button style={circleIconBtn}><ListFilter size={15} color="#4f46e5" /></button>
                        <button style={circleIconBtn}><Filter size={15} color="#4f46e5" /></button>
                      </div>
                    </div>
                    <div>
                      {PORTFOLIO_ASSETS.map((a, i) => (
                        <div key={a.sym + a.sub} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: i < PORTFOLIO_ASSETS.length - 1 ? '1px solid #f3f4f6' : 'none', gap: 12 }}>
                          <CoinAvatar color={a.color} bg={a.bg} icon={a.icon} size={38} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{a.sub}</p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 13 }}>{showBalances ? `${a.bal} ${a.sym}` : '•••'}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{showBalances ? a.usd : '•••'}</p>
                          </div>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', flexShrink: 0 }}><MoreVertical size={15} /></button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {tab === 'nfts' && <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>No NFTs found</div>}
                {tab === 'activity' && <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>No recent activity</div>}
              </>
            )}

            {/* ── ACCOUNTS ── */}
            {section === 'accounts' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Accounts</h2>
                  <button style={circleIconBtn}><Plus size={15} color="#6b7280" /></button>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accounts</p>
                </div>

                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                  {ACCOUNTS.map((acc, i) => (
                    <div key={acc.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: '#fff', borderBottom: i < ACCOUNTS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      {/* Pixel avatar like Brave */}
                      <PixelAvatar seed={acc.name + acc.sub} size={42} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 14 }}>{acc.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>
                          {getAddr(acc.addrKey).slice(0, 8)}***{getAddr(acc.addrKey).slice(-4)}
                        </p>
                        <p style={{ margin: '1px 0 0', fontSize: 11, color: '#D1D5DB' }}>{acc.sub}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        {/* small chain icon */}
                        <CoinAvatar color={acc.color} bg={acc.bg} icon={acc.icon} size={22} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', minWidth: 60, textAlign: 'right' }}>{acc.bal}</span>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}><MoreVertical size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── EXPLORE ── */}
            {section === 'explore' && (
              <>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 20px' }}>Explore</h2>

                {/* Controls row — "All Assets" left, search right (matches screenshot) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1px solid #E5E7EB', borderRadius: 9999, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                    All Assets <ChevronDown size={14} />
                  </button>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 9999, padding: '9px 16px', background: '#fff' }}>
                    <Search size={14} color="#9CA3AF" />
                    <input value={searchExplore} onChange={e => setSearchExplore(e.target.value)} placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', flex: 1 }} />
                  </div>
                </div>

                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        {['Assets', 'Price', '24hr', 'Cap', 'Volume', 'Buy/Deposit'].map((h, i) => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: i === 5 ? 'center' : 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>
                            {h}{(h === 'Cap') && <span style={{ marginLeft: 4, color: '#9CA3AF' }}>⇅</span>}
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

            {/* ── BUY ── */}
            {section === 'buy' && (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 28px' }}>Buy ETH</h2>
                <div style={{ maxWidth: 680 }}>
                  {/* Top controls */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 6 }}>
                    {/* Asset */}
                    <div>
                      <label style={formLabelStyle}>Asset</label>
                      <button style={{ ...selectBtnStyle, gap: 8, minWidth: 100 }}>
                        <CoinAvatar color="#627EEA" bg="#F0F3FF" icon="Ξ" size={22} />
                        <span style={{ fontWeight: 600 }}>ETH</span>
                        <ChevronDown size={13} color="#6b7280" />
                      </button>
                    </div>
                    {/* Account */}
                    <div style={{ flex: 1 }}>
                      <label style={formLabelStyle}>Account</label>
                      <button style={{ ...selectBtnStyle, gap: 8, width: '100%' }}>
                        <PixelAvatar seed="Account 1Ethereum + EVM Chains" size={22} />
                        <span style={{ fontWeight: 500, flex: 1, textAlign: 'left' }}>Account 1</span>
                        <ChevronDown size={13} color="#6b7280" />
                      </button>
                    </div>
                    {/* Amount */}
                    <div>
                      <label style={formLabelStyle}>Amount</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>100</span>
                        <button style={{ ...selectBtnStyle, padding: '6px 10px', gap: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>USD</span>
                          <ChevronDown size={12} color="#6b7280" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', margin: '8px 0 20px' }}>{eth}</p>

                  <div style={{ height: 1, background: '#F3F4F6', marginBottom: 20 }} />

                  {/* Provider search / filters */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 14px', background: '#fff' }}>
                      <Search size={14} color="#9CA3AF" />
                      <input placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', flex: 1 }} />
                    </div>
                    <button style={{ ...selectBtnStyle, gap: 6 }}>United States <ChevronDown size={13} /></button>
                    <button style={{ ...selectBtnStyle, gap: 6 }}>Credit &amp; Debit Card <ChevronDown size={13} /></button>
                  </div>

                  {/* Loading spinner */}
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ width: 36, height: 36, margin: '0 auto 12px' }}>
                      <svg width="36" height="36" viewBox="0 0 36 36" style={{ animation: 'spin 1s linear infinite' }}>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <circle cx="18" cy="18" r="14" stroke="#E0E7FF" strokeWidth="2.5" fill="none" />
                        <circle cx="18" cy="18" r="14" stroke="#4F46E5" strokeWidth="2.5" fill="none" strokeDasharray="70" strokeDashoffset="50" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Getting best prices…</p>
                  </div>
                </div>
              </>
            )}

            {/* ── SEND ── */}
            {section === 'send' && <SendSwapBridge mode="send" />}

            {/* ── SWAP ── */}
            {section === 'swap' && <SendSwapBridge mode="swap" />}

            {/* ── BRIDGE ── */}
            {section === 'bridge' && <SendSwapBridge mode="bridge" />}

            {/* ── DEPOSIT list ── */}
            {section === 'deposit' && !depositAsset && (
              <>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 24px' }}>Deposit</h2>
                <div style={{ maxWidth: 680 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 14px', background: '#fff' }}>
                      <Search size={14} color="#9CA3AF" />
                      <input placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', flex: 1 }} />
                    </div>
                    <button style={{ ...selectBtnStyle, gap: 6, whiteSpace: 'nowrap' }}>All Networks <ChevronDown size={13} /></button>
                  </div>

                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                    {DEPOSIT_ASSETS.map((a, i) => (
                      <div
                        key={a.name + a.sub}
                        onClick={() => setDepositAsset(a)}
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
                    <button style={{ padding: '12px 48px', borderRadius: 9999, background: '#E5E7EB', color: '#9CA3AF', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'not-allowed' }}>
                      Select an asset
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── DEPOSIT address + QR ── */}
            {section === 'deposit' && depositAsset && (
              <>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 28px' }}>Deposit</h2>
                <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Deposit {depositAsset.name}</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
                    Only send tokens to this address on {depositAsset.sub.split(' on ')[1] ?? 'this network'}
                  </p>

                  {/* Account row */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 9999, padding: '6px 14px 6px 8px', marginBottom: 20 }}>
                    <PixelAvatar seed="Account 1Ethereum + EVM Chains" size={28} />
                    <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>Account 1</span>
                    <ChevronDown size={14} color="#9ca3af" />
                  </div>

                  {/* Address */}
                  <p style={{ fontWeight: 700, color: '#111827', marginBottom: 6, fontSize: 13 }}>Address:</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#374151', wordBreak: 'break-all' }}>
                      {getAddr(depositAsset.addrKey)}
                    </span>
                    <button
                      onClick={() => copy(getAddr(depositAsset.addrKey), 'dep')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'dep' ? '#10B981' : '#6B7280', flexShrink: 0 }}
                    >
                      {copied === 'dep' ? <CheckCircle size={15} /> : <Copy size={15} />}
                    </button>
                  </div>

                  <div style={{ display: 'inline-block', border: '2px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#fff' }}>
                    <QRCodeSVG value={getAddr(depositAsset.addrKey)} />
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <button onClick={() => setDepositAsset(null)} style={{ padding: '10px 28px', borderRadius: 9999, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      ← Back
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Floating Request Feature */}
      <button
        style={{ position: 'fixed', bottom: 22, right: 22, zIndex: 100, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 9999, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
      >
        <Sparkles size={16} fill="#fff" />
        <span style={{ fontSize: 13, fontWeight: 700 }}>Request feature</span>
      </button>
    </div>
  );
}

// ─── Send / Swap / Bridge shared layout ──────────────────────────────────────
function SendSwapBridge({ mode }: { mode: 'send' | 'swap' | 'bridge' }) {
  const isSwapOrBridge = mode !== 'send';
  const toLabel = mode === 'send' ? 'To' : 'Receive (est.)';
  const toBtn = mode === 'send' ? 'Choose recipient' : 'Choose Asset';
  const actionLabel = mode === 'send' ? 'Review send' : mode === 'swap' ? 'Review swap' : 'Review bridge';

  return (
    <div style={{ maxWidth: 660 }}>
      {/* FROM card */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px 22px', background: '#fff', marginBottom: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: 17, fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            Choose Asset <span style={{ fontSize: 16 }}>›</span>
          </button>
          <span style={{ fontSize: 28, color: '#D1D5DB', fontWeight: 300 }}>0.0</span>
        </div>
      </div>

      {/* Swap/Bridge arrow */}
      {isSwapOrBridge && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <button style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#374151' }}>
            <ArrowUpDown size={15} />
          </button>
          {/* Brave logo watermark on right side like screenshots */}
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#FF5722', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M28.483 15.143L23.473 11.233L21.758 4.298L16.002 9.533L10.245 4.298L8.53 11.233L3.52 15.143L8.607 19.34L8.747 26.697L16.002 23.363L23.257 26.697L23.396 19.34L28.483 15.143Z" fill="#fff"/>
            </svg>
          </div>
        </div>
      )}

      {/* TO card */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px 22px', background: '#EEF2FF', marginTop: isSwapOrBridge ? 0 : 2 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{toLabel}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ background: 'none', border: 'none', color: '#374151', fontSize: 17, fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            {toBtn} <span style={{ fontSize: 16 }}>›</span>
          </button>
          <span style={{ fontSize: 28, color: '#D1D5DB', fontWeight: 300 }}>0.0</span>
        </div>
      </div>

      {/* Action button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <button style={{ padding: '14px 0', width: '100%', maxWidth: 380, borderRadius: 9999, background: '#E5E7EB', color: '#9CA3AF', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'not-allowed' }}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 16px' }}>
      <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{ width: 36, height: 20, borderRadius: 10, border: 'none', background: value ? '#4F46E5' : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background 0.15s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: value ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

// ─── Style constants ──────────────────────────────────────────────────────────
const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
  padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, color: '#374151', textAlign: 'left',
};
const circleIconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #e5e7eb',
  background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
};
const outlinePillBtn: React.CSSProperties = {
  padding: '5px 14px', borderRadius: 9999, border: '1px solid #E5E7EB',
  background: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#374151',
};
const selectBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px',
  border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff',
  fontSize: 13, color: '#374151', cursor: 'pointer', fontFamily: 'inherit',
};
const formLabelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: '#9CA3AF', display: 'block', marginBottom: 6,
};

// ─── Portfolio chart ──────────────────────────────────────────────────────────

function PortfolioChart() {
  const [timeframe, setTimeframe] = useState('1 Hour');
  const timeframes = ['1 Hour', '1 Day', '1 Week', '1 Month', '1 Year', 'All'];

  // Fake chart data — slightly varied to look like real portfolio activity
  const DATA = [
    0.28, 0.30, 0.34, 0.40, 0.52, 0.61, 0.68, 0.64, 0.59,
    0.55, 0.51, 0.48, 0.44, 0.42, 0.40, 0.38, 0.36, 0.35,
    0.34, 0.33, 0.32, 0.31, 0.31, 0.30, 0.30, 0.30, 0.30,
    0.30, 0.30, 0.30,
  ];

  const W = 660, H = 110;
  const minV = Math.min(...DATA), maxV = Math.max(...DATA);
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
  const isFlat = maxV - minV < 0.01;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Change indicators + time selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 500 }}>-$0.00</span>
          <span style={{ fontSize: 12, background: '#FEE2E2', color: '#EF4444', fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>-0.11%</span>
        </div>
        {/* Time selector */}
        <div style={{ position: 'relative' }}>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer' }}
            onClick={() => {
              const idx = timeframes.indexOf(timeframe);
              setTimeframe(timeframes[(idx + 1) % timeframes.length]);
            }}
          >
            {timeframe} <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* SVG chart */}
      <div style={{ width: '100%', overflow: 'hidden', borderRadius: 8 }}>
        <svg
          width="100%" viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={isFlat ? 0.04 : 0.12} />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#portfolioGrad)" />
          <path d={line} stroke="#4F46E5" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}