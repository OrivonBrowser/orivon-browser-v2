import React, { useState } from 'react';
import {
  Search, Wallet, Send, Download, Globe,
  Cpu, Activity, History, ExternalLink,
  MessageSquare, Layers, Box, Store,
  ChevronRight, Circle
} from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import { useTabsStore } from '../store/tabs';
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
  const { addresses, getBalance } = useWalletStore();
  const [balance, setBalance] = useState('0');

  React.useEffect(() => {
    getBalance().then(setBalance);
  }, [getBalance]);
  const [nodes, setNodes] = useState({
    ipfs: 'Online',
    bittorrent: 'Offline',
    bitcoin: 'Starting'
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query && onOpenBrowser) onOpenBrowser(query);
  };

  const bgStyle: React.CSSProperties = {
    backgroundColor: '#0a0a0f',
    color: '#fff',
    minHeight: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflowY: 'auto'
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '24px',
    backdropFilter: 'blur(10px)'
  };

  const getStatusColor = (status: string) => {
    if (status === 'Online') return '#00c76a';
    if (status === 'Starting') return '#f59e0b';
    return '#6b7280';
  };

  return (
    <div style={bgStyle}>
      {/* Top Logo */}
      <div style={{ marginBottom: '40px' }}>
        <img src={logo} alt="Orivon" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
      </div>

      {/* Web3 Compass Search Bar */}
      <div style={{ width: '100%', maxWidth: '640px', marginBottom: '48px' }}>
        <form onSubmit={handleSearch}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search style={{ position: 'absolute', left: '20px', color: '#6b7280' }} size={20} />
            <input
              name="search"
              placeholder="Search Web3 or type a .eth address"
              style={{
                width: '100%',
                height: '64px',
                borderRadius: '32px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0 32px 0 60px',
                fontSize: '18px',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = '#4f46e5';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />
          </div>
        </form>
      </div>

      {/* Quick Launch Icons */}
      <div style={{
        display: 'flex',
        gap: '32px',
        marginBottom: isMinimal ? '0' : '64px',
        justifyContent: 'center'
      }}>
        {QUICK_LAUNCH.map(app => (
          <button
            key={app.name}
            onClick={() => onOpenBrowser?.(app.url)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {app.icon}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{app.name}</span>
          </button>
        ))}
      </div>

      {/* Widget Grid - Only in Full View */}
      {!isMinimal && (
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Wallet Widget */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Wallet size={20} color="#4f46e5" />
                <span style={{ fontWeight: '600' }}>Wallet</span>
              </div>
              <button style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ExternalLink size={16} />
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>Account 1</div>
              <div style={{ fontSize: '28px', fontWeight: '700' }}>
                {balance !== '0'
                  ? `$${(parseFloat(balance) * 2450.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '$0.00'}
              </div>
              {balance !== '0' && (
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                  {balance} ETH
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                flex: 1,
                height: '40px',
                borderRadius: '12px',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <Send size={16} /> Send
              </button>
              <button style={{
                flex: 1,
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <Download size={16} /> Receive
              </button>
            </div>
          </div>

          {/* Nodes Widget */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Cpu size={20} color="#4f46e5" />
              <span style={{ fontWeight: '600' }}>Network Nodes</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(nodes).map(([name, status]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px' }}>
                      {name === 'ipfs' ? 'IPFS Node' : name === 'bittorrent' ? 'BitTorrent Node' : 'Pruned Bitcoin Node'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(status) }} />
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{status}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setNodes(prev => ({ ...prev, [name]: prev[name as keyof typeof nodes] === 'Online' ? 'Offline' : 'Online' }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: nodes[name as keyof typeof nodes] === 'Online' ? 'rgba(0, 199, 106, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: nodes[name as keyof typeof nodes] === 'Online' ? '#00c76a' : '#9ca3af',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {nodes[name as keyof typeof nodes] === 'Online' ? 'Stop' : 'Start'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Web3 Sites */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Globe size={20} color="#4f46e5" />
              <span style={{ fontWeight: '600' }}>Explore Web3</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {FEATURED_SITES.map(site => (
                <button
                  key={site.name}
                  onClick={() => onOpenBrowser?.(site.url)}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{site.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{site.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Network Status */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Activity size={20} color="#4f46e5" />
              <span style={{ fontWeight: '600' }}>Network Status</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { name: 'ENS Resolver', status: 'Active' },
                { name: 'IPFS Gateway', status: 'Active' },
                { name: 'Search Engine', status: 'Google' },
              ].map(item => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#9ca3af' }}>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.status}</span>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00c76a' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sites */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <History size={20} color="#4f46e5" />
              <span style={{ fontWeight: '600' }}>Recent Sites</span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '120px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '13px' }}>Your visited Web3 sites will appear here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
