import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, User, Compass, ShoppingCart, Send, RefreshCw,
  Link as LinkIcon, Download, Globe, MoreVertical, Plus,
  Search, Lock, Shield, Settings, HelpCircle,
  Copy, CheckCircle, ChevronDown,
  X, Monitor, Sparkles, Filter, ListFilter, MoreHorizontal, Eye
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';

type Section = 'portfolio' | 'accounts' | 'explore' | 'buy' | 'send' | 'swap' | 'bridge' | 'deposit';
type PortfolioTab = 'assets' | 'nfts' | 'activity';

interface DashboardProps { onOpenBrowser: () => void; }

// ─── Static market data ────────────────────────────────────────────────────────
const MARKET = [
  { name: 'Bitcoin',    sym: 'BTC',  price: '$43,250.00', change:  2.1, cap: '$848.3B', vol: '$28.4B',  color: '#F7931A', l: '₿' },
  { name: 'Ethereum',   sym: 'ETH',  price: '$2,345.80',  change:  1.8, cap: '$282.1B', vol: '$12.1B',  color: '#627EEA', l: 'Ξ' },
  { name: 'Tether',     sym: 'USDT', price: '$0.9998',    change:  0.0, cap: '$95.2B',  vol: '$45.1B',  color: '#26A17B', l: '₮' },
  { name: 'BNB',        sym: 'BNB',  price: '$323.40',    change:  0.8, cap: '$47.0B',  vol: '$1.2B',   color: '#F3BA2F', l: 'B' },
  { name: 'Solana',     sym: 'SOL',  price: '$98.20',     change: -1.2, cap: '$43.0B',  vol: '$2.8B',   color: '#9945FF', l: '◎' },
  { name: 'XRP',        sym: 'XRP',  price: '$0.5840',    change:  0.3, cap: '$32.1B',  vol: '$1.5B',   color: '#00AAE4', l: 'X' },
  { name: 'USDC',       sym: 'USDC', price: '$1.0001',    change:  0.0, cap: '$25.4B',  vol: '$8.2B',   color: '#2775CA', l: '$' },
  { name: 'Avalanche',  sym: 'AVAX', price: '$34.10',     change: -0.5, cap: '$14.0B',  vol: '$0.9B',   color: '#E84142', l: 'A' },
  { name: 'Dogecoin',   sym: 'DOGE', price: '$0.1234',    change:  3.4, cap: '$17.2B',  vol: '$1.8B',   color: '#C2A633', l: 'D' },
  { name: 'Cardano',    sym: 'ADA',  price: '$0.4521',    change: -0.8, cap: '$16.0B',  vol: '$0.7B',   color: '#0033AD', l: 'A' },
];

const DEPOSIT_ASSETS = [
  { name: 'Ethereum', sub: 'ETH on Ethereum Mainnet', color: '#627EEA', l: 'Ξ' },
  { name: 'Ether',    sub: 'ETH on Base',             color: '#0052FF', l: 'Ξ' },
  { name: 'MATIC',    sub: 'MATIC on Polygon Mainnet',color: '#8247E5', l: 'M' },
  { name: 'BNB',      sub: 'BNB on BNB Smart Chain',  color: '#F3BA2F', l: 'B' },
  { name: 'Solana',   sub: 'SOL on Solana Mainnet',   color: '#9945FF', l: '◎' },
  { name: 'Bitcoin',  sub: 'BTC on Bitcoin Mainnet',  color: '#F7931A', l: '₿' },
];

// ─── Simple QR Code SVG (visual placeholder) ──────────────────────────────────
function QRCodeSVG({ value }: { value: string }) {
  // Deterministic pattern from value hash
  const cells = 21;
  const pattern: boolean[][] = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      const h = (value.charCodeAt((r * cells + c) % value.length) + r * 7 + c * 13) % 3 === 0;
      // Finder patterns (corners)
      if ((r < 7 && c < 7) || (r < 7 && c > cells - 8) || (r > cells - 8 && c < 7)) return true;
      return h;
    })
  );
  const sz = 180;
  const cell = sz / cells;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ display: 'block' }}>
      <rect width={sz} height={sz} fill="white" />
      {pattern.map((row, r) =>
        row.map((on, c) => on ? (
          <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="black" />
        ) : null)
      )}
    </svg>
  );
}

// ─── Coin avatar ──────────────────────────────────────────────────────────────
function CoinAvatar({ color, letter, size = 36 }: { color: string; letter: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.44, fontWeight: 700, flexShrink: 0 }}>
      {letter}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ onOpenBrowser }: DashboardProps) {
  const { addresses, lock, clearWallet } = useWalletStore();
  const [section, setSection] = useState<Section>('portfolio');
  const [tab, setTab] = useState<PortfolioTab>('assets');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
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

  const eth = addresses?.eth ?? '0x0000000000000000000000000000000000000000';
  const btc = addresses?.btc ?? 'bc1q0000000000000000000000000000000000000';
  const sol = addresses?.sol ?? 'SOL000000000000000000000000000000000';

  const assets = [
    { name: 'Ethereum', sym: 'ETH',   sub: 'ETH on Ethereum Mainnet', color: '#627EEA', l: 'Ξ',  bal: '0',  usd: '$0.00', addr: eth },
    { name: 'Bitcoin',  sym: 'BTC',   sub: 'BTC on Bitcoin Mainnet',  color: '#F7931A', l: '₿',  bal: '0',  usd: '$0.00', addr: btc },
    { name: 'Solana',   sym: 'SOL',   sub: 'SOL on Solana Mainnet',   color: '#9945FF', l: '◎',  bal: '0',  usd: '$0.00', addr: sol },
  ];

  const accounts = [
    { name: 'Account 1',          sub: 'Ethereum + EVM Chains', sym: 'ETH', color: '#627EEA', l: 'Ξ', addr: eth, bal: '$0.00' },
    { name: 'Bitcoin Account 1',  sub: 'Bitcoin Mainnet',       sym: 'BTC', color: '#F7931A', l: '₿', addr: btc, bal: '$0.00' },
    { name: 'Solana Account 1',   sub: 'Solana + SVM Chains',   sym: 'SOL', color: '#9945FF', l: '◎', addr: sol, bal: '$0.00' },
  ];

  const filteredMarket = MARKET.filter(
    c => c.name.toLowerCase().includes(searchExplore.toLowerCase()) ||
         c.sym.toLowerCase().includes(searchExplore.toLowerCase())
  );

  const NAV: { id: Section; label: string; Icon: React.ElementType }[] = [
    { id: 'portfolio', label: 'Portfolio',  Icon: BarChart3   },
    { id: 'accounts',  label: 'Accounts',   Icon: User         },
    { id: 'explore',   label: 'Explore',    Icon: Compass      },
    { id: 'buy',       label: 'Buy',        Icon: ShoppingCart },
    { id: 'send',      label: 'Send',       Icon: Send         },
    { id: 'swap',      label: 'Swap',       Icon: RefreshCw    },
    { id: 'bridge',    label: 'Bridge',     Icon: LinkIcon     },
    { id: 'deposit',   label: 'Deposit',    Icon: Download     },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', overflow: 'hidden', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: 14 }}>

      {/* ── Left Sidebar ───────────────────────────────────────────────────── */}
      <aside style={{ width: 240, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Brand */}
        <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28.483 15.143L23.473 11.233L21.758 4.298L16.002 9.533L10.245 4.298L8.53 11.233L3.52 15.143L8.607 19.34L8.747 26.697L16.002 23.363L23.257 26.697L23.396 19.34L28.483 15.143Z" fill="#fb542b"/>
          </svg>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>wallet</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {NAV.map(({ id, label, Icon }, index) => {
            const active = section === id;
            return (
              <React.Fragment key={id}>
                {index === 3 && <div style={{ height: 1, background: '#f3f4f6', margin: '8px 24px' }} />}
                <div
                  onClick={() => { setSection(id); setDepositAsset(null); }}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 24px', cursor: 'pointer',
                    color: active ? '#4f46e5' : '#4b5563',
                    fontWeight: active ? 600 : 500,
                    transition: 'all 0.12s',
                  }}
                >
                  {/* Active indicator bar */}
                  {active && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#4f46e5' }} />}
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span style={{ fontSize: 14 }}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Go to browser */}
        <div style={{ padding: '16px 0', borderTop: '1px solid #f3f4f6' }}>
          <div
            onClick={onOpenBrowser}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 24px', cursor: 'pointer',
              color: '#4b5563',
              fontWeight: 500,
              transition: 'all 0.12s',
            }}
          >
            <Globe size={18} strokeWidth={2} />
            <span style={{ fontSize: 14 }}>Go to browser</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 24px', position: 'relative' }}>

        {/* Three-dot menu */}
        <div ref={menuRef} style={{ position: 'absolute', top: 20, right: 24, zIndex: 50 }}>
          <button
            onClick={() => setMenuOpen(p => !p)}
            style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af' }}
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 44, right: 0, width: 240,
              background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #E5E7EB', overflow: 'hidden', zIndex: 100,
            }}>
              {[
                { icon: Lock,   label: 'Lock dashboard',  action: () => { lock(); setMenuOpen(false); } },
                { icon: Shield, label: 'Backup phrase',    action: () => setMenuOpen(false) },
                { icon: Settings,label: 'Settings',        action: () => setMenuOpen(false) },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={menuItemStyle}>
                  <item.icon size={16} style={{ color: '#374151' }} /> {item.label}
                </button>
              ))}

              <div style={{ borderTop: '1px solid #F3F4F6', padding: '8px 16px 4px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Dashboard Settings</p>
              </div>
              <ToggleRow label="Balances" value={showBalances} onChange={setShowBalances} />
              <ToggleRow label="NFTs tab" value={showNFTs} onChange={setShowNFTs} />

              <div style={{ borderTop: '1px solid #F3F4F6', marginTop: 4 }}>
                <button style={menuItemStyle} onClick={() => setMenuOpen(false)}>
                  <HelpCircle size={16} style={{ color: '#374151' }} /> Help & support
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Card ──────────────────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '40px', minHeight: 'calc(100vh - 48px)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>

          {/* ── PORTFOLIO ─────────────────────────────────────────────────── */}
          {section === 'portfolio' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Portfolio</h2>
                <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4f46e5' }}>
                  <Plus size={18} />
                </button>
              </div>

              {/* Balance + actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
                <div>
                  {showBalances
                    ? <p style={{ fontSize: 42, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-1px' }}>$0.0000001559</p>
                    : <p style={{ fontSize: 42, fontWeight: 700, color: '#111827', margin: 0 }}>••••••</p>
                  }
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { icon: Eye, label: 'Buy',  action: () => setSection('buy') },
                    { icon: Send,         label: 'Send', action: () => setSection('send') },
                    { icon: RefreshCw,    label: 'Swap', action: () => setSection('swap') },
                    { icon: MoreHorizontal, label: 'More', action: () => {} },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <btn.icon size={20} color="#fff" strokeWidth={2} />
                      </div>
                      <span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
                <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 9999, padding: 4, width: 'fit-content' }}>
                  {(['assets', showNFTs ? 'nfts' : null, 'activity'] as (PortfolioTab | null)[]).filter(Boolean).map(t => (
                    <button
                      key={t!}
                      onClick={() => setTab(t!)}
                      style={{
                        padding: '8px 28px', borderRadius: 9999,
                        background: tab === t ? '#fff' : 'transparent',
                        border: tab === t ? '1.5px solid #4f46e5' : '1.5px solid transparent',
                        color: tab === t ? '#4f46e5' : '#6b7280',
                        fontWeight: 600, fontSize: 14, cursor: 'pointer',
                        transition: 'all 0.12s',
                      }}
                    >
                      {t!.charAt(0).toUpperCase() + t!.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assets list */}
              {tab === 'assets' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Assets</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f3f4f6', borderRadius: 10, padding: '8px 14px', width: 220 }}>
                        <Search size={16} color="#9ca3af" />
                        <input placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 14, color: '#111827', background: 'transparent', width: '100%' }} />
                      </div>
                      <button style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4f46e5' }}>
                        <ListFilter size={18} />
                      </button>
                      <button style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4f46e5' }}>
                        <Filter size={18} />
                      </button>
                    </div>
                  </div>
                  <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                    {assets.map(a => (
                      <div key={a.sym} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f3f4f6', gap: 16 }}>
                        <CoinAvatar color={a.color} letter={a.l} size={40} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 15 }}>{a.name}</p>
                          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{a.sub}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 15 }}>{showBalances ? a.bal : '•••'} {a.sym}</p>
                          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{showBalances ? a.usd : '•••'}</p>
                        </div>
                        <button style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {tab === 'nfts' && (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
                  <p style={{ fontSize: 15 }}>No NFTs found</p>
                </div>
              )}
              {tab === 'activity' && (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
                  <p style={{ fontSize: 15 }}>No recent activity</p>
                </div>
              )}
            </>
          )}

          {/* ── ACCOUNTS ──────────────────────────────────────────────────── */}
          {section === 'accounts' && (
            <>
              <CardHeader title="Accounts" />
              <div style={{ marginTop: 24 }}>
                <p style={{ fontWeight: 600, color: '#111827', marginBottom: 12 }}>Accounts</p>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
                  {accounts.map((acc, i) => (
                    <div key={acc.sym} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: '#fff', borderBottom: i < accounts.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <CoinAvatar color={acc.color} letter={acc.l} size={40} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 14 }}>{acc.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' }}>{acc.addr.slice(0, 12)}***{acc.addr.slice(-4)}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#D1D5DB', marginTop: 1 }}>{acc.sub}</p>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{acc.bal}</span>
                      <button style={iconBtnStyle}><MoreVertical size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── EXPLORE ───────────────────────────────────────────────────── */}
          {section === 'explore' && (
            <>
              <CardHeader title="Explore" />
              <div style={{ display: 'flex', gap: 12, margin: '20px 0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 9999, padding: '8px 14px', background: '#fff', flex: 1 }}>
                  <Search size={14} color="#9CA3AF" />
                  <input value={searchExplore} onChange={e => setSearchExplore(e.target.value)} placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', flex: 1 }} />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 9999, background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                  All Assets <ChevronDown size={14} />
                </button>
              </div>

              {/* Table */}
              <div style={{ border: '1px solid #F3F4F6', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Assets', 'Price', '24hr', 'Cap', 'Volume', 'Buy/Deposit'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', border: 'none' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarket.map((c, i) => (
                      <tr key={c.sym} style={{ borderTop: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CoinAvatar color={c.color} letter={c.l} size={32} />
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 13 }}>{c.name}</p>
                              <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{c.sym}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#111827', fontWeight: 500 }}>{c.price}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: c.change >= 0 ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                          {c.change >= 0 ? '▲' : '▼'} {Math.abs(c.change).toFixed(2)}%
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{c.cap}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{c.vol}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setSection('buy')} style={pillBtnStyle}>Buy</button>
                            <button onClick={() => setSection('deposit')} style={pillBtnStyle}>Deposit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── BUY ───────────────────────────────────────────────────────── */}
          {section === 'buy' && (
            <>
              <CardHeader title="Buy ETH" />
              <div style={{ maxWidth: 680, marginTop: 24 }}>
                <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <label style={formLabelStyle}>Asset</label>
                    <button style={selectBtnStyle}><CoinAvatar color="#627EEA" letter="Ξ" size={22} /> ETH <ChevronDown size={14} /></button>
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={formLabelStyle}>Account</label>
                    <button style={selectBtnStyle}>
                      <CoinAvatar color="#627EEA" letter="Ξ" size={22} /> Account 1 <ChevronDown size={14} />
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={formLabelStyle}>Amount</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>100</span>
                      <button style={{ ...selectBtnStyle, padding: '4px 10px' }}>USD <ChevronDown size={14} /></button>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', marginBottom: 24 }}>{eth}</p>
                <div style={{ height: 1, background: '#F3F4F6', marginBottom: 24 }} />
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 9999, padding: '8px 14px' }}>
                    <Search size={14} color="#9CA3AF" /><span style={{ color: '#9CA3AF', fontSize: 13 }}>Search</span>
                  </div>
                  <button style={{ ...selectBtnStyle, flex: 1 }}>United States <ChevronDown size={14} /></button>
                  <button style={{ ...selectBtnStyle, flex: 1 }}>Credit & Debit Card <ChevronDown size={14} /></button>
                </div>
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: 36, height: 36, margin: '0 auto 12px' }}>
                    <svg width="36" height="36" viewBox="0 0 36 36" style={{ animation: 'spin 1s linear infinite' }}>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <circle cx="18" cy="18" r="14" stroke="#E0E7FF" strokeWidth="2.5" fill="none" />
                      <circle cx="18" cy="18" r="14" stroke="#4F46E5" strokeWidth="2.5" fill="none" strokeDasharray="70" strokeDashoffset="50" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p style={{ color: '#6B7280', fontSize: 14 }}>Getting best prices…</p>
                </div>
              </div>
            </>
          )}

          {/* ── SEND ──────────────────────────────────────────────────────── */}
          {section === 'send' && (
            <AssetActionPage
              title="Send"
              fromLabel="From"
              fromBtn="Choose Asset"
              toLabel="To"
              toBtn="Choose recipient"
              actionBtn="Review send"
            />
          )}

          {/* ── SWAP ──────────────────────────────────────────────────────── */}
          {section === 'swap' && (
            <AssetActionPage
              title="Swap"
              fromLabel="From"
              fromBtn="Choose Asset"
              toLabel="Receive (est.)"
              toBtn="Choose Asset"
              actionBtn="Review swap"
              showSwapIcon
            />
          )}

          {/* ── BRIDGE ────────────────────────────────────────────────────── */}
          {section === 'bridge' && (
            <AssetActionPage
              title="Bridge"
              fromLabel="From"
              fromBtn="Choose Asset"
              toLabel="Receive (est.)"
              toBtn="Choose Asset"
              actionBtn="Review bridge"
              showSwapIcon
            />
          )}

          {/* ── DEPOSIT ───────────────────────────────────────────────────── */}
          {section === 'deposit' && !depositAsset && (
            <>
              <CardHeader title="Deposit" />
              <div style={{ maxWidth: 680, marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 9999, padding: '8px 14px' }}>
                    <Search size={14} color="#9CA3AF" /><input placeholder="Search" style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', flex: 1 }} />
                  </div>
                  <button style={{ ...selectBtnStyle }}>All Networks <ChevronDown size={14} /></button>
                </div>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
                  {DEPOSIT_ASSETS.map((a, i) => (
                    <div
                      key={a.name + a.sub}
                      onClick={() => setDepositAsset(a)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < DEPOSIT_ASSETS.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', background: '#fff', transition: 'background 0.1s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                    >
                      <CoinAvatar color={a.color} letter={a.l} size={38} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 14 }}>{a.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{a.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                  <button style={{ padding: '12px 40px', borderRadius: 9999, background: '#E5E7EB', color: '#9CA3AF', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'not-allowed' }}>
                    Select an asset
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Deposit → Address + QR */}
          {section === 'deposit' && depositAsset && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button onClick={() => setDepositAsset(null)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #C7D2FE', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4F46E5' }}>
                  ←
                </button>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Deposit</h2>
              </div>

              <div style={{ maxWidth: 560, textAlign: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                  Deposit {depositAsset.name}
                </h3>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
                  Only send tokens to this address on {depositAsset.sub.split(' on ')[1] ?? 'this network'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                  <CoinAvatar color={depositAsset.color} letter={depositAsset.l} size={28} />
                  <span style={{ fontWeight: 600, color: '#111827' }}>Account 1</span>
                </div>

                <p style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>Address:</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#374151', wordBreak: 'break-all' }}>
                    {depositAsset.l === 'Ξ' ? eth : depositAsset.l === '₿' ? btc : sol}
                  </span>
                  <button
                    onClick={() => copy(depositAsset.l === 'Ξ' ? eth : depositAsset.l === '₿' ? btc : sol, 'dep')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'dep' ? '#10B981' : '#6B7280' }}
                  >
                    {copied === 'dep' ? <CheckCircle size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <div style={{ display: 'inline-block', border: '1px solid #E5E7EB', borderRadius: 12, padding: 12, background: '#fff' }}>
                  <QRCodeSVG value={depositAsset.l === 'Ξ' ? eth : depositAsset.l === '₿' ? btc : sol} />
                </div>
              </div>
            </>
          )}

        </div>
      </main>

      {/* Floating Request Feature Button */}
      <button
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 9999,
          background: '#4f46e5', color: '#fff',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <Sparkles size={18} fill="#fff" />
        <span style={{ fontSize: 14, fontWeight: 700 }}>Request feature</span>
      </button>
    </div>
  );
}

// ─── Reused layout pieces ─────────────────────────────────────────────────────

function CardHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
      <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}>
        <Plus size={16} />
      </button>
    </div>
  );
}

function AssetActionPage({ title, fromLabel, fromBtn, toLabel, toBtn, actionBtn, showSwapIcon }: {
  title: string; fromLabel: string; fromBtn: string;
  toLabel: string; toBtn: string; actionBtn: string; showSwapIcon?: boolean;
}) {
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>{title}</h2>
      <div style={{ maxWidth: 680 }}>
        {/* From */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 20px', marginBottom: 2, background: '#fff' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 8px' }}>{fromLabel}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {fromBtn} <span style={{ fontSize: 14, color: '#4F46E5' }}>›</span>
            </button>
            <span style={{ fontSize: 22, color: '#D1D5DB', fontWeight: 300 }}>0.0</span>
          </div>
        </div>

        {/* Swap icon row */}
        {showSwapIcon && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 0', gap: 8 }}>
            <button style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        )}

        {/* To */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 20px', background: '#EEF2FF', marginBottom: 2 }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 8px' }}>{toLabel}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button style={{ background: 'none', border: 'none', color: '#374151', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {toBtn} <span style={{ fontSize: 14 }}>›</span>
            </button>
            <span style={{ fontSize: 22, color: '#D1D5DB', fontWeight: 300 }}>0.0</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button style={{ padding: '13px 48px', borderRadius: 9999, background: '#E5E7EB', color: '#9CA3AF', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'not-allowed' }}>
            {actionBtn}
          </button>
        </div>
      </div>
    </>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px' }}>
      <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{ width: 38, height: 22, borderRadius: 11, border: 'none', background: value ? '#4F46E5' : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background 0.15s' }}>
        <div style={{ position: 'absolute', top: 3, left: value ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

// ─── Style constants ──────────────────────────────────────────────────────────
const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
  padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 13, color: '#374151', textAlign: 'left', transition: 'background 0.1s',
};
const iconBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'none',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF',
};
const pillBtnStyle: React.CSSProperties = {
  padding: '4px 14px', borderRadius: 9999, border: '1px solid #E5E7EB',
  background: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#374151',
  transition: 'border-color 0.1s',
};
const selectBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff',
  fontSize: 13, color: '#374151', cursor: 'pointer',
};
const formLabelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: '#9CA3AF', display: 'block', marginBottom: 6,
};
