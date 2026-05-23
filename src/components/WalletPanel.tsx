/**
 * WalletPanel — wallet popup with Portfolio / Connections / Accounts / Explore tabs.
 * When no wallet exists, shows a Brave-style splash with wallet.png.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Lock, Copy, CheckCircle, Shield, X,
  ArrowLeft, MoreVertical, ChevronDown,
  Layers, Link2, Users, Compass,
  ShoppingCart, Send, RefreshCw, MoreHorizontal,
  Search, SlidersHorizontal, ArrowUpDown,
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import { useSettings } from '../store/settings';
import { useRuntimeStore } from '../store/runtime';

interface WalletPanelProps {
  onClose: () => void;
  onOpenWalletModal: (mode: 'create' | 'import' | 'unlock') => void;
  onOpenDashboard?: () => void;
}

type BottomTab = 'portfolio' | 'connections' | 'accounts' | 'explore';
type AssetTab  = 'assets' | 'nfts' | 'activity';

const BOTTOM_NAV = [
  { id: 'portfolio'   as BottomTab, Icon: Layers,  label: 'Portfolio'    },
  { id: 'connections' as BottomTab, Icon: Link2,   label: 'Connections'  },
  { id: 'accounts'    as BottomTab, Icon: Users,   label: 'Accounts'     },
  { id: 'explore'     as BottomTab, Icon: Compass, label: 'Explore'      },
];

const TAB_TITLE: Record<BottomTab, string> = {
  portfolio:   'Portfolio',
  connections: 'Connections',
  accounts:    'Accounts',
  explore:     'Explore',
};

const EXPLORE_ASSETS = [
  { symbol: 'BTC',  name: 'Bitcoin',  price: '$67,420.00', change: '0.47%', up: true,  color: '#F7931A', icon: '₿'  },
  { symbol: 'ETH',  name: 'Ethereum', price: '$2,191.68',  change: '0.71%', up: true,  color: '#627EEA', icon: 'Ξ'  },
  { symbol: 'SOL',  name: 'Solana',   price: '$142.50',    change: '1.23%', up: true,  color: '#9945FF', icon: '◎'  },
  { symbol: 'USDT', name: 'Tether',   price: '$0.9995',    change: '0.00%', up: true,  color: '#26A17B', icon: '₮'  },
  { symbol: 'BNB',  name: 'BNB',      price: '$653.72',    change: '0.15%', up: true,  color: '#F0B90B', icon: 'B'  },
  { symbol: 'XRP',  name: 'XRP',      price: '$1.42',      change: '0.32%', up: true,  color: '#00AAE4', icon: 'X'  },
  { symbol: 'USDC', name: 'USD Coin', price: '$0.9998',    change: '0.00%', up: false, color: '#2775CA', icon: '$'  },
];

// Floating coin decorations for the no-wallet splash
const FLOATING_COINS = [
  { top: 22,  left: 44,  size: 36, bg: '#F7931A', icon: '₿', color: '#fff' },
  { top: 14,  left: 148, size: 40, bg: '#627EEA', icon: 'Ξ', color: '#fff' },
  { top: 18,  left: 256, size: 36, bg: '#9945FF', icon: '◎', color: '#fff' },
  { top: 76,  left: 20,  size: 22, bg: 'transparent', icon: '×', color: '#A5B4FC', border: '2px solid #C7D2FE', fontSize: 14 },
  { top: 68,  left: 308, size: 18, bg: 'transparent', icon: '○', color: '#34D399', border: '2px solid #A7F3D0', fontSize: 12 },
  { top: 118, left: 36,  size: 34, bg: '#F3BA2F', icon: 'B', color: '#fff' },
  { top: 108, left: 296, size: 32, bg: '#0090FF', icon: 'F', color: '#fff' },
];

export default function WalletPanel({ onClose, onOpenWalletModal, onOpenDashboard }: WalletPanelProps) {
  const { status, addresses, lock, unlock, getBalance } = useWalletStore();
  // Unlock panel state
  const [unlockPw,   setUnlockPw]   = useState('');
  const [unlockShow, setUnlockShow] = useState(false);
  const [unlockErr,  setUnlockErr]  = useState('');
  const [unlockBusy, setUnlockBusy] = useState(false);
  const handlePanelUnlock = async () => {
    if (!unlockPw || unlockBusy) return;
    setUnlockErr(''); setUnlockBusy(true);
    const ok = await unlock(unlockPw);
    setUnlockBusy(false);
    if (!ok) { setUnlockErr('Incorrect password. Try again.'); setUnlockPw(''); }
    // on success status flips → panel re-renders with full UI
  };
  const { theme } = useSettings();
  const { nodes }  = useRuntimeStore();

  const [bottomTab, setBottomTab] = useState<BottomTab>('portfolio');
  const [assetTab,  setAssetTab]  = useState<AssetTab>('assets');
  const [copied,    setCopied]    = useState<string | null>(null);
  const [balance,   setBalance]   = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unlocked') {
      getBalance().then(b => {
        const n = parseFloat(b);
        if (!isNaN(n)) setBalance(n.toFixed(10));
      });
    }
  }, [status, getBalance]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CHAIN_ASSETS = addresses ? [
    { key: 'eth', symbol: 'ETH', name: 'Ethereum', chain: 'ETH on Ethereum Mainnet', amount: '0 ETH', usd: '$0.00', color: '#627EEA', icon: 'Ξ',  addr: addresses.eth },
    { key: 'sol', symbol: 'SOL', name: 'Solana',   chain: 'SOL on Solana Mainnet',   amount: '0 SOL', usd: '$0.00', color: '#9945FF', icon: '◎',  addr: addresses.sol },
    { key: 'btc', symbol: 'BTC', name: 'Bitcoin',  chain: 'BTC on Bitcoin Mainnet',  amount: '0 BTC', usd: '$0.00', color: '#F7931A', icon: '₿',  addr: addresses.btc },
  ] : [];

  const ACCOUNTS = addresses ? [
    { name: 'Account 1',         addr: addresses.eth, chain: 'Ethereum + EVM Chains',  grad: 'linear-gradient(135deg,#FF6B6B,#4ECDC4)', usd: '$0.00' },
    { name: 'Solana Account 1',  addr: addresses.sol, chain: 'Solana + SVM Chains',    grad: 'linear-gradient(135deg,#9945FF,#14F195)', usd: '$0.00' },
    { name: 'Bitcoin Account 1', addr: addresses.btc, chain: 'Bitcoin Mainnet',         grad: 'linear-gradient(135deg,#F7931A,#FFCB05)', usd: '$0.00' },
  ] : [];

  const s = {
    divider: { height: 1, background: '#F0F0F0', margin: 0 } as React.CSSProperties,
    row: { display: 'flex', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.12s' } as React.CSSProperties,
    iconBtn: { width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'background 0.12s' } as React.CSSProperties,
    smallBtn: { width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E7EB', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' } as React.CSSProperties,
  };

  // Detect whether a wallet exists
  const hasWallet = (status === 'unlocked' && !!addresses) || status === 'locked';

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={  { opacity: 0, y: -8,  scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
        width: 364, height: 580,
        background: '#fff', borderRadius: 16,
        boxShadow: '0 12px 48px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.08)',
        zIndex: 200, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(0,0,0,0.07)',
      }}
    >

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <button style={s.iconBtn}
          onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
          {hasWallet ? TAB_TITLE[bottomTab] : 'Orivon Wallet'}
        </span>
        <button style={s.iconBtn}
          onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* ── No-wallet splash ──────────────────────────────────────────────── */}
      {!hasWallet && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Illustration area */}
          <div style={{
            background: '#EEF2FF', position: 'relative',
            height: 230, flexShrink: 0, overflow: 'hidden',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}>
            {/* Floating coin circles */}
            {FLOATING_COINS.map((c, i) => (
              <div key={i} style={{
                position: 'absolute', top: c.top, left: c.left,
                width: c.size, height: c.size, borderRadius: '50%',
                background: c.bg, border: (c as any).border,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: c.color, fontSize: (c as any).fontSize ?? Math.round(c.size * 0.44),
                fontWeight: 700, userSelect: 'none',
              }}>
                {c.icon}
              </div>
            ))}
            {/* wallet.png */}
            <img
              src="/wallet.png"
              alt="Orivon Wallet"
              style={{ width: 180, height: 148, objectFit: 'contain', position: 'relative', zIndex: 2 }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* Text + button */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 24px 32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>
              Orivon Wallet
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65, margin: '0 0 32px', maxWidth: 260 }}>
              Use this panel to securely access Web3 and all your crypto assets.
            </p>
            <button
              onClick={() => { onOpenWalletModal('create'); onClose(); }}
              style={{
                width: '78%', height: 48, borderRadius: 9999,
                background: '#4F46E5', color: '#fff',
                fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              Learn more
            </button>
          </div>
        </div>
      )}

      {/* ── Normal wallet content (has wallet) ────────────────────────────── */}
      {hasWallet && (
        <>
          <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* ══ PORTFOLIO ══════════════════════════════════════════════════ */}
            {bottomTab === 'portfolio' && (
              <>
                {status === 'unlocked' && addresses ? (
                  <>
                    {/* Balance + actions */}
                    <div style={{ padding: '20px 20px 18px', textAlign: 'center', borderBottom: '1px solid #F5F5F5' }}>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 4px', fontWeight: 500 }}>Total Balance</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 20px', letterSpacing: '-0.5px' }}>
                        ${balance ?? '0.0000000000'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                        {[
                          { Icon: ShoppingCart, label: 'Buy'  },
                          { Icon: Send,         label: 'Send' },
                          { Icon: RefreshCw,    label: 'Swap' },
                          { Icon: MoreHorizontal, label: 'More' },
                        ].map(({ Icon, label }) => (
                          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'filter 0.15s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.12)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1)'; }}
                            >
                              <Icon size={18} />
                            </div>
                            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Asset sub-tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0 16px', flexShrink: 0 }}>
                      {(['assets', 'nfts', 'activity'] as AssetTab[]).map(t => (
                        <button key={t} onClick={() => setAssetTab(t)} style={{ flex: 1, padding: '11px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: assetTab === t ? '#4F46E5' : '#9CA3AF', borderBottom: assetTab === t ? '2px solid #4F46E5' : '2px solid transparent', marginBottom: -1, transition: 'color 0.15s' }}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>

                    {assetTab === 'assets' && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px 6px' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Assets</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {([Search, SlidersHorizontal, ArrowUpDown] as React.ElementType[]).map((Icon, i) => (
                              <button key={i} style={s.smallBtn}><Icon size={13} /></button>
                            ))}
                          </div>
                        </div>
                        {CHAIN_ASSETS.map(asset => (
                          <div key={asset.key} style={{ ...s.row, gap: 12 }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                          >
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: asset.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{asset.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{asset.name}</p>
                              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.chain}</p>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{asset.amount}</p>
                              <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{asset.usd}</p>
                            </div>
                            <button style={{ ...s.iconBtn, flexShrink: 0 }} onClick={() => copy(asset.addr, asset.key)}>
                              {copied === asset.key ? <CheckCircle size={13} color="#10B981" /> : <MoreVertical size={13} />}
                            </button>
                          </div>
                        ))}
                        <div style={s.divider} />
                        <div style={{ padding: '12px 16px' }}>
                          <button onClick={onOpenDashboard} style={{ width: '100%', height: 36, borderRadius: 9999, border: '1px solid #E5E7EB', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#4F46E5' }}>
                            Open Dashboard
                          </button>
                        </div>
                        <div style={{ padding: '0 16px 12px' }}>
                          <button onClick={() => { lock(); onClose(); }} style={{ width: '100%', height: 36, borderRadius: 9999, border: '1px solid #FEE2E2', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <Lock size={13} /> Lock wallet
                          </button>
                        </div>
                      </>
                    )}
                    {assetTab === 'nfts' && (
                      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                        <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>No NFTs found</p>
                      </div>
                    )}
                    {assetTab === 'activity' && (
                      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                        <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>No recent activity</p>
                      </div>
                    )}
                  </>
                ) : status === 'locked' ? (
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',padding:'0 20px 20px',textAlign:'center' }}>
                    <svg width="70" height="66" viewBox="0 0 80 76" fill="none" style={{ display:'block',margin:'0 auto 16px' }}>
                      <path d="M 16 32 A 24 24 0 0 1 64 32" stroke="#C7D2FE" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                      <path d="M 22 38 A 18 18 0 0 1 58 38" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                      <path d="M 29 44 A 11 11 0 0 1 51 44" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                      <path d="M 30 53 L 30 46 Q 30 36 40 36 Q 50 36 50 46 L 50 53" stroke="#6366F1" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
                      <rect x="23" y="52" width="34" height="24" rx="6" fill="#4F46E5"/>
                      <circle cx="40" cy="63" r="4.5" fill="rgba(255,255,255,0.45)"/>
                      <rect x="37.5" y="63" width="5" height="7" rx="2.5" fill="rgba(255,255,255,0.45)"/>
                    </svg>
                    <p style={{ fontSize:18,fontWeight:700,color:'#111827',margin:'0 0 4px' }}>Unlock Wallet</p>
                    <p style={{ fontSize:12,color:'#6B7280',margin:'0 0 18px' }}>Enter password to unlock wallet</p>
                    <div style={{ width:'100%',textAlign:'left',marginBottom:12 }}>
                      <p style={{ fontSize:11,fontWeight:600,color:'#374151',margin:'0 0 5px' }}>Password</p>
                      <div style={{ position:'relative' }}>
                        <input type={unlockShow ? 'text' : 'password'} value={unlockPw} autoFocus
                          onChange={e => { setUnlockPw(e.target.value); setUnlockErr(''); }}
                          onKeyDown={e => e.key === 'Enter' && handlePanelUnlock()}
                          placeholder="Enter your password"
                          style={{ width:'100%',height:44,borderRadius:10,border:'1.5px solid #4F46E5',background:'#F9FAFB',padding:'0 40px 0 12px',fontSize:14,color:'#111827',outline:'none',fontFamily:'inherit',boxSizing:'border-box' as any }}
                        />
                        <button onClick={() => setUnlockShow(p => !p)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9CA3AF',padding:0,display:'flex',alignItems:'center' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </div>
                      {unlockErr && <p style={{ fontSize:10,color:'#EF4444',margin:'3px 0 0' }}>{unlockErr}</p>}
                    </div>
                    <button onClick={handlePanelUnlock} disabled={!unlockPw || unlockBusy}
                      style={{ width:'100%',height:44,borderRadius:9999,border:'none',background:unlockPw&&!unlockBusy?'#4F46E5':'#E5E7EB',color:unlockPw&&!unlockBusy?'#fff':'#9CA3AF',fontSize:14,fontWeight:600,cursor:unlockPw&&!unlockBusy?'pointer':'not-allowed',marginBottom:8,transition:'background 0.2s' }}>
                      {unlockBusy ? 'Unlocking…' : 'Unlock'}
                    </button>
                    <button onClick={onClose} style={{ background:'none',border:'1px solid #E5E7EB',borderRadius:9999,padding:'7px 22px',fontSize:12,fontWeight:500,color:'#4F46E5',cursor:'pointer' }}>
                      Restore
                    </button>
                  </div>
                ) : null}
              </>
            )}

            {/* ══ CONNECTIONS ════════════════════════════════════════════════ */}
            {bottomTab === 'connections' && (
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 22px', gap: 8 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FB5B22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={28} color="#fff" />
                  </div>
                  <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>orivon://newtab</p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={9} color="#fff" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Not Connected</span>
                  </div>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: '1px solid #F0F0F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#FF6B6B,#4ECDC4)', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Account 1</p>
                          <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, fontFamily: 'monospace' }}>
                            {addresses ? `${addresses.eth.slice(0, 6)}***${addresses.eth.slice(-4)}` : '0x000***0000'}
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={15} color="#9CA3AF" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#627EEA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>Ξ</div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>Ethereum Mainnet</span>
                      </div>
                      <ChevronDown size={15} color="#9CA3AF" />
                    </div>
                  </div>
                  <button style={{ width: '100%', height: 44, borderRadius: 9999, background: '#F3F4F6', border: 'none', cursor: 'not-allowed', fontSize: 14, fontWeight: 600, color: '#9CA3AF' }}>
                    Connect
                  </button>
                </div>
              </div>
            )}

            {/* ══ ACCOUNTS ═══════════════════════════════════════════════════ */}
            {bottomTab === 'accounts' && (
              <div>
                <div style={{ padding: '12px 16px 6px' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Accounts</p>
                </div>
                {ACCOUNTS.length > 0 ? ACCOUNTS.map((acc, i) => (
                  <div key={i} style={{ ...s.row, gap: 12 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: acc.grad, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{acc.name}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 1px', fontFamily: 'monospace' }}>{acc.addr.slice(0, 6)}***{acc.addr.slice(-4)}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{acc.chain}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{acc.usd}</span>
                      <button style={s.iconBtn}><MoreVertical size={14} /></button>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>No accounts found</p>
                  </div>
                )}
              </div>
            )}

            {/* ══ EXPLORE ════════════════════════════════════════════════════ */}
            {bottomTab === 'explore' && (
              <div>
                <div style={{ display: 'flex', gap: 10, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 36, borderRadius: 9999, border: '1px solid #E5E7EB', flex: 1, cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1 }}>All Assets</span>
                    <ChevronDown size={14} color="#9CA3AF" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 36, borderRadius: 9999, border: '1px solid #E5E7EB', flex: 1 }}>
                    <Search size={13} color="#9CA3AF" />
                    <span style={{ fontSize: 13, color: '#9CA3AF' }}>Search</span>
                  </div>
                </div>
                <div style={{ display: 'flex', padding: '4px 16px 8px', borderBottom: '1px solid #F0F0F0' }}>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#9CA3AF' }}>Assets</span>
                  <span style={{ width: 84, fontSize: 12, fontWeight: 600, color: '#9CA3AF', textAlign: 'right' }}>Price</span>
                  <span style={{ width: 62, fontSize: 12, fontWeight: 600, color: '#9CA3AF', textAlign: 'right' }}>24hr</span>
                </div>
                {EXPLORE_ASSETS.map(asset => (
                  <div key={asset.symbol} style={{ ...s.row, gap: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: asset.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{asset.icon}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{asset.name}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{asset.symbol}</p>
                      </div>
                    </div>
                    <span style={{ width: 84, fontSize: 13, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{asset.price}</span>
                    <span style={{ width: 62, fontSize: 12, fontWeight: 600, color: asset.up ? '#10B981' : '#EF4444', textAlign: 'right' }}>
                      {asset.up ? '↑' : '↓'} {asset.change}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* ── Bottom nav ──────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', borderTop: '1px solid #F0F0F0', background: '#fff', flexShrink: 0 }}>
            {BOTTOM_NAV.map(({ id, Icon, label }) => (
              <button
                key={id}
                onClick={() => setBottomTab(id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '10px 0 8px', border: 'none', background: 'none', cursor: 'pointer',
                  color: bottomTab === id ? '#4F46E5' : '#9CA3AF',
                  borderTop: bottomTab === id ? '2px solid #4F46E5' : '2px solid transparent',
                  marginTop: -1,
                  transition: 'color 0.15s',
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}

    </motion.div>
  );
}
