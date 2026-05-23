import React from 'react';
import { Search, MessageSquare, Layers, Box, Store } from 'lucide-react';
import logo from '@/assets/logo.png';

interface NewTabProps {
  onNavigate: (url: string) => void;
}

const QUICK_LAUNCH = [
  { name: 'Social', icon: <MessageSquare size={24} />, url: 'orivon.eth' },
  { name: 'DeFi', icon: <Layers size={24} />, url: 'app.uniswap.org' },
  { name: 'IPFS', icon: <Box size={24} />, url: 'ipfs.io' },
  { name: 'App Store', icon: <Store size={24} />, url: 'orivon://apps' },
];

export default function NewTab({ onNavigate }: NewTabProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query) onNavigate(query);
  };

  return (
    <div style={{
      height: '100%',
      width: '100%',
      backgroundColor: '#0a0a0f',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '15vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Centered Logo */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <img
          src={logo}
          alt="Orivon"
          style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 16 }}
        />
      </div>

      {/* Web3 Compass Search Bar */}
      <div style={{ width: '100%', maxWidth: 640, padding: '0 20px', marginBottom: 48 }}>
        <form onSubmit={handleSearch}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              style={{ position: 'absolute', left: 24, color: '#6b7280' }}
              size={22}
            />
            <input
              name="search"
              autoFocus
              placeholder="Search Web3 or type a .eth address"
              style={{
                width: '100%',
                height: 64,
                borderRadius: 32,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0 32px 0 64px',
                fontSize: 18,
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
        gap: 40,
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {QUICK_LAUNCH.map(app => (
          <button
            key={app.name}
            onClick={() => onNavigate(app.url)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              transition: 'all 0.2s',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              const iconBox = e.currentTarget.children[0] as HTMLElement;
              iconBox.style.background = 'rgba(255, 255, 255, 0.1)';
              iconBox.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              const iconBox = e.currentTarget.children[0] as HTMLElement;
              iconBox.style.background = 'rgba(255, 255, 255, 0.05)';
              iconBox.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s'
            }}>
              {app.icon}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
