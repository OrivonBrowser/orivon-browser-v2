import React, { useState, useEffect } from 'react';
import {
  Search, Wallet, Send, Download, Globe,
  Cpu, Activity, History, ExternalLink,
  MessageSquare, Layers, Box, Store,
  ChevronRight, Circle, MoreHorizontal,
  Copy, Check, ArrowRight, Shield, Settings,
  Moon, Sun, Eye, EyeOff, AlertTriangle, ArrowLeft,
  ShoppingCart, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWalletStore } from '../store/wallet';
import { useSettings } from '../store/settings';
import logo from '@/assets/logo.png';

interface DashboardProps {
  onOpenBrowser?: (url: string) => void;
  isMinimal?: boolean;
}

const QUICK_LAUNCH = [
  { name: 'Social', icon: <MessageSquare size={20} />, url: 'orivon.eth' },
  { name: 'DeFi', icon: <Layers size={20} />, url: 'app.uniswap.org' },
  { name: 'IPFS', icon: <Box size={20} />, url: 'ipfs.io' },
  { name: 'App Store', icon: <Store size={20} />, url: 'orivon://apps' },
];

const FEATURED_SITES = [
  { name: 'Mirror', icon: '🪞', url: 'mirror.xyz' },
  { name: 'Lens', icon: '🌿', url: 'lens.xyz' },
  { name: 'Farcaster', icon: '🟣', url: 'farcaster.xyz' },
  { name: 'Snapshot', icon: '⚡', url: 'snapshot.org' },
];

export default function Dashboard({ onOpenBrowser, isMinimal = false }: DashboardProps) {
  const { addresses, getBalance, isBackedUp, setBackedUp, _wallet } = useWalletStore();
  const { searchEngine, setSearchEngine, web3ScoreProvider, setWeb3ScoreProvider, theme, setTheme } = useSettings();
  const [balance, setBalance] = useState('0');
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'activity'>('tokens');
  const [view, setView] = useState<'main' | 'backup' | 'send' | 'receive'>('main');
  const [copied, setCopied] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  useEffect(() => {
    getBalance().then(setBalance);
  }, [getBalance]);

  const [nodes, setNodes] = useState({
    ipfs: 'Online',
    bittorrent: 'Offline',
    bitcoin: 'Starting'
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query && onOpenBrowser) onOpenBrowser(query);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Online') return '#00c76a';
    if (status === 'Starting') return '#f59e0b';
    return '#6b7280';
  };

  if (view === 'backup') return <BackupView onBack={() => setView('main')} />;
  if (view === 'send') return <SendView onBack={() => setView('main')} onGoToBackup={() => setView('backup')} />;
  if (view === 'receive') return <ReceiveView onBack={() => setView('main')} address={addresses?.eth || ''} />;

  return (
    <div style={{
      backgroundColor: '#0a0a0f',
      color: '#fff',
      minHeight: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px 80px',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflowY: 'auto'
    }}>
      {/* Search Section */}
      <div style={{ width: '100%', maxWidth: '640px', marginBottom: '48px', textAlign: 'center' }}>
        <img src={logo} alt="Orivon" style={{ width: '48px', height: '48px', borderRadius: '12px', marginBottom: '24px' }} />
        <form onSubmit={handleSearch}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search style={{ position: 'absolute', left: '20px', color: '#6b7280' }} size={20} />
            <input
              name="search"
              placeholder="Search Web3 or type a .eth address"
              style={{
                width: '100%',
                height: '56px',
                borderRadius: '28px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0 32px 0 60px',
                fontSize: '16px',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            />
          </div>
        </form>
      </div>

      <div style={{ width: '100%', maxWidth: '900px' }}>
        {/* Wallet Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(15, 15, 25, 0.5) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '32px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#9ca3af', marginBottom: '4px' }}>Orivon Wallet 1</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {addresses?.eth ? `${addresses.eth.slice(0, 6)}...${addresses.eth.slice(-4)}` : '0x000...0000'}
                </span>
                <button
                  onClick={() => handleCopy(addresses?.eth || '')}
                  style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {copied ? <Check size={14} color="#00c76a" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MoreHorizontal size={20} />
              </button>

              <AnimatePresence>
                {walletMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute', top: '44px', right: 0, width: '220px',
                      background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px', padding: '8px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                  >
                    {[
                      { label: 'View Seed Phrase', icon: <Eye size={16}/>, onClick: () => { setView('backup'); setWalletMenuOpen(false); } },
                      { label: 'Copy Wallet Address', icon: <Copy size={16}/>, onClick: () => { handleCopy(addresses?.eth || ''); setWalletMenuOpen(false); } },
                      { label: 'Rename Account', icon: <ExternalLink size={16}/>, onClick: () => setWalletMenuOpen(false) },
                      { label: 'Add New Account', icon: <ExternalLink size={16}/>, onClick: () => setWalletMenuOpen(false) },
                      { label: 'Import Account', icon: <ExternalLink size={16}/>, onClick: () => setWalletMenuOpen(false) },
                      { label: 'Remove Account', icon: <ExternalLink size={16}/>, onClick: () => setWalletMenuOpen(false) },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        style={{
                          width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px',
                          background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer',
                          borderRadius: '8px', textAlign: 'left'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ca3af'; }}
                      >
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-1px' }}>
              ${(parseFloat(balance) * 2450.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>{balance} ETH</div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Send', icon: <Send size={18}/>, onClick: () => setView('send'), primary: true },
              { label: 'Receive', icon: <Download size={18}/>, onClick: () => setView('receive') },
              { label: 'Buy', icon: <ShoppingCart size={18}/>, onClick: () => {} },
              { label: 'Swap', icon: <RefreshCw size={18}/>, onClick: () => {} },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                style={{
                  flex: 1, height: '48px', borderRadius: '14px',
                  background: btn.primary ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                  color: '#fff', border: btn.primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
              {(['tokens', 'nfts', 'activity'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0 4px 12px', background: 'none', border: 'none',
                    color: activeTab === tab ? '#4f46e5' : '#6b7280',
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '2px', background: '#4f46e5' }} />
                  )}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px 0', textAlign: 'center', color: '#6b7280' }}>
              {activeTab === 'tokens' && (
                <div>
                  {balance === '0' ? (
                    <p style={{ fontSize: '14px' }}>No tokens yet. Start by receiving crypto.</p>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#627eea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>Ξ</div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: '600', color: '#fff' }}>Ethereum</div>
                          <div style={{ fontSize: '12px' }}>ETH</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: '#fff' }}>{balance} ETH</div>
                        <div style={{ fontSize: '12px' }}>${(parseFloat(balance) * 2450.50).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'nfts' && <p style={{ fontSize: '14px' }}>No NFTs yet.</p>}
              {activeTab === 'activity' && <p style={{ fontSize: '14px' }}>No transactions yet.</p>}
            </div>
          </div>
        </div>

        {/* Nodes Widget */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px', padding: '24px', marginBottom: '32px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={20} color="#4f46e5" /> Web3 Nodes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'ipfs', name: 'IPFS Node' },
              { id: 'bittorrent', name: 'BitTorrent Node' },
              { id: 'bitcoin', name: 'Bitcoin Node (Pruned)', sub: 'Uses a pre-synced snapshot. Quick sync.' }
            ].map(node => (
              <div key={node.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500' }}>{node.name}</div>
                  {node.sub && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{node.sub}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(nodes[node.id as keyof typeof nodes]) }} />
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{nodes[node.id as keyof typeof nodes]}</span>
                  </div>
                </div>
                <button
                  onClick={() => setNodes(prev => ({ ...prev, [node.id]: prev[node.id as keyof typeof nodes] === 'Online' ? 'Offline' : 'Online' }))}
                  style={{
                    padding: '8px 16px', borderRadius: '10px',
                    background: nodes[node.id as keyof typeof nodes] === 'Online' ? 'rgba(0, 199, 106, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: nodes[node.id as keyof typeof nodes] === 'Online' ? '#00c76a' : '#9ca3af',
                    border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  {nodes[node.id as keyof typeof nodes] === 'Online' ? 'Stop' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Featured Web3 Sites */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Explore Web3</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {FEATURED_SITES.map(site => (
                <button key={site.name} onClick={() => onOpenBrowser?.(site.url)} style={{
                  padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: '24px' }}>{site.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{site.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Network Status */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Network</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'ENS Resolver', active: true },
                { name: 'IPFS Gateway', active: true },
                { name: 'Search Engine', val: 'Web3 Compass', active: true },
                { name: 'Web3 Score', val: web3ScoreProvider, active: true },
              ].map(item => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.val && <span style={{ fontSize: '12px', fontWeight: '500' }}>{item.val}</span>}
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.active ? '#00c76a' : '#6b7280' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sites */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Recent Sites</div>
            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '13px', textAlign: 'center' }}>
              Your visited Web3 sites will appear here
            </div>
          </div>

          {/* Quick Settings */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quick Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Search Engine</div>
                  <select
                    value={searchEngine}
                    onChange={(e) => setSearchEngine(e.target.value as any)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#fff', outline: 'none' }}
                  >
                    <option value="web3compass">Web3 Compass</option>
                    <option value="google">Google</option>
                    <option value="duckduckgo">DuckDuckGo</option>
                  </select>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px' }}>Dark Mode</span>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    style={{ width: '40px', height: '20px', borderRadius: '10px', background: theme === 'dark' ? '#4f46e5' : '#374151', border: 'none', position: 'relative', cursor: 'pointer' }}
                  >
                    <div style={{ position: 'absolute', top: '2px', left: theme === 'dark' ? '22px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
                  </button>
               </div>
               <button style={{ color: '#4f46e5', background: 'none', border: 'none', padding: 0, fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>More settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackupView({ onBack }: { onBack: () => void }) {
  const { _wallet, setBackedUp } = useWalletStore();
  const [revealed, setRevealed] = useState(false);
  const mnemonic = _wallet?.mnemonic?.phrase || '';
  const words = mnemonic.split(' ');

  return (
    <div style={{ backgroundColor: '#0a0a0f', color: '#fff', minHeight: '100%', width: '100%', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', marginBottom: '32px' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '20px', marginBottom: '32px', display: 'flex', gap: '16px' }}>
          <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>Never share your seed phrase!</div>
            <div style={{ fontSize: '14px', color: '#ef4444', lineHeight: '1.5' }}>Anyone who has your 12-word seed phrase has full access to your wallet and funds. Orivon will never ask for this.</div>
          </div>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Backup your wallet</h1>
        <p style={{ color: '#9ca3af', marginBottom: '40px', lineHeight: '1.6' }}>Write down these 12 words in order and keep them somewhere safe offline.</p>

        <div style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', marginBottom: '32px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
            filter: revealed ? 'none' : 'blur(8px)', transition: 'filter 0.3s'
          }}>
            {words.map((word, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', width: '16px' }}>{i + 1}</span>
                <span style={{ fontWeight: '600' }}>{word}</span>
              </div>
            ))}
          </div>

          {!revealed && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <button
                onClick={() => setRevealed(true)}
                style={{ padding: '12px 24px', borderRadius: '12px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)' }}
              >
                Reveal Seed Phrase
              </button>
            </div>
          )}
        </div>

        {revealed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => { navigator.clipboard.writeText(mnemonic); }}
              style={{ width: '100%', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => { setBackedUp(true); onBack(); }}
              style={{ width: '100%', height: '56px', borderRadius: '16px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SendView({ onBack, onGoToBackup }: { onBack: () => void, onGoToBackup: () => void }) {
  const { isBackedUp } = useWalletStore();
  const [step, setStep] = useState(isBackedUp ? 'form' : 'warning');

  if (step === 'warning') {
    return (
      <div style={{ backgroundColor: '#0a0a0f', color: '#fff', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <AlertTriangle size={40} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Back up your wallet first</h1>
          <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '40px' }}>
            Before you send funds, make sure your wallet is backed up. If you lose access to this device without a backup you will lose your funds permanently.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={onGoToBackup}
              style={{ height: '56px', borderRadius: '16px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            >
              Back Up Now
            </button>
            <button
              onClick={() => setStep('form')}
              style={{ height: '56px', borderRadius: '16px', background: 'none', border: 'none', color: '#6b7280', fontWeight: '600', cursor: 'pointer' }}
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0f', color: '#fff', minHeight: '100%', width: '100%', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', marginBottom: '32px' }}>
          <ArrowLeft size={20} /> Back
        </button>

        {!isBackedUp && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '500' }}>Wallet not backed up. Risk of permanent fund loss.</span>
          </div>
        )}

        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px' }}>Send Crypto</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Network</label>
            <div style={{ height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#627eea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' }}>Ξ</div>
              <span style={{ flex: 1, fontWeight: '500' }}>Ethereum Mainnet</span>
              <ChevronRight size={18} color="#6b7280" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Recipient Address</label>
            <input
              placeholder="0x... or .eth name"
              style={{ width: '100%', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 16px', color: '#fff', fontSize: '15px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Amount</label>
            <div style={{ position: 'relative' }}>
              <input
                placeholder="0.0"
                style={{ width: '100%', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 80px 0 16px', color: '#fff', fontSize: '18px', fontWeight: '600', outline: 'none' }}
              />
              <div style={{ position: 'absolute', right: '16px', top: '14px', fontWeight: '700', color: '#4f46e5' }}>ETH</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
              <span>Balance: 0 ETH</span>
              <span>≈ $0.00</span>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>Network Fee</span>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>0.00042 ETH ($1.03)</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>Destination Score</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00c76a' }} />
                   <span style={{ fontSize: '13px', fontWeight: '600', color: '#00c76a' }}>Trustless</span>
                </div>
             </div>
          </div>

          <button style={{ height: '60px', borderRadius: '18px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginTop: '12px' }}>
            Confirm Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiveView({ onBack, address }: { onBack: () => void, address: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0f', color: '#fff', minHeight: '100%', width: '100%', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', marginBottom: '32px' }}>
          <ArrowLeft size={20} /> Back
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Receive Crypto</h1>
        <p style={{ color: '#9ca3af', marginBottom: '40px' }}>Your Ethereum wallet address</p>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', display: 'inline-block', marginBottom: '32px' }}>
          {/* Simple mock QR code */}
          <div style={{ width: '200px', height: '200px', background: '#000', display: 'flex', flexWrap: 'wrap', padding: '4px' }}>
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} style={{ width: '10px', height: '10px', background: Math.random() > 0.5 ? '#fff' : '#000' }} />
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
           <span style={{ flex: 1, fontSize: '13px', color: '#fff', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>{address}</span>
           <button onClick={handleCopy} style={{ background: '#4f46e5', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
             {copied ? 'Copied' : 'Copy'}
           </button>
        </div>

        <div style={{ background: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start', textAlign: 'left' }}>
           <AlertTriangle size={18} color="#4f46e5" style={{ flexShrink: 0 }} />
           <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: '1.5' }}>Only send compatible tokens to this address. Sending unsupported tokens may result in permanent loss.</p>
        </div>
      </div>
    </div>
  );
}
