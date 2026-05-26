import React from 'react';
import { Search, MessageSquare, Layers, Box, Store, SearchCode, Bitcoin, Settings, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import logo from '@/assets/logo.png';
import { CompactWalletCard } from '../components/WalletComponents';
import { DASHBOARD_URL } from '../constants';

interface NewTabProps {
  onNavigate: (url: string) => void;
}

const QUICK_LAUNCH = [
  { name: 'Web3 Social', icon: <MessageSquare size={20} />, url: 'https://lenster.xyz' },
  { name: 'DeFi', icon: <Layers size={20} />, url: 'https://app.uniswap.org' },
  { name: 'IPFS Browser', icon: <Box size={20} />, url: 'https://ipfs.io' },
  { name: 'App Store', icon: <Store size={20} />, url: 'orivon://apps' },
  { name: 'ENS Lookup', icon: <SearchCode size={20} />, url: 'https://ens.domains' },
  { name: 'Bitcoin', icon: <Bitcoin size={20} />, url: 'https://bitcoin.org' },
  { name: 'Settings', icon: <Settings size={20} />, url: 'orivon://settings' },
  { name: 'Dashboard', icon: <LayoutGrid size={20} />, url: DASHBOARD_URL },
];

const BG_COUNT = 7;
function pickBg() {
  return Math.floor(Math.random() * BG_COUNT) + 1;
}

export default function NewTab({ onNavigate }: NewTabProps) {
  const [bgIndex] = React.useState(pickBg);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get('search') as string).trim();
    if (!query) return;

    if (query.includes('.') && !query.includes(' ')) {
      onNavigate(query.startsWith('http') ? query : `https://${query}`);
    } else {
      onNavigate(`https://www.web3compass.net/search?q=${encodeURIComponent(query)}`);
    }
  };

  const openDashboardView = (view?: string) => {
    onNavigate(`${DASHBOARD_URL}?view=${view || 'full'}`);
  };

  return (
    <div
      className="h-full w-full text-[#f8fafc] flex flex-col items-center pt-24 px-4 overflow-hidden font-inter animate-fade relative"
      style={{ backgroundColor: '#0d0e14' }}
    >
      {/* Shuffled background image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(/image-${bgIndex}.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
        }}
      />
      {/* Dark gradient overlay so content stays legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,14,20,0.55) 0%, rgba(13,14,20,0.82) 60%, #0d0e14 100%)',
        }}
      />
      {/* Content layer — sits above bg image */}
      <div className="relative z-10 w-full flex flex-col items-center">

      {/* Centered Logo */}
      <div className="mb-12 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-1">
           <img src={logo} alt="Orivon" className="h-6 object-contain brightness-[1.2]" />
           <span className="text-[18px] font-bold tracking-[0.12em] text-[#f8fafc]">ORIVON</span>
        </div>
        <span className="text-[11px] text-[#6366f1] uppercase tracking-[0.08em] font-medium">The Web3 Browser</span>
      </div>

      {/* Web3 Compass Search Bar */}
      <div className="w-full max-w-[560px] mb-14">
        <form onSubmit={handleSearch}>
          <div className="relative flex items-center group">
            <Search
              className="absolute left-4 text-[#475569]"
              size={18}
            />
            <input
              name="search"
              autoFocus
              placeholder="Search Web3 or type a .eth address"
              className="w-full h-[44px] rounded-[10px] bg-[#111218] border border-[#1e2030] pl-11 pr-32 text-[14px] text-[#f8fafc] outline-none transition-all duration-120 focus:border-[#6366f1] placeholder:text-[#475569]"
            />
            <div className="absolute right-4 flex items-center gap-2 pointer-events-none">
                <span className="text-[11px] font-medium text-[#64748b] uppercase tracking-wider">Web3 Compass</span>
            </div>
          </div>
        </form>
      </div>

      {/* Quick Launch Icons */}
      <div className="flex gap-4 justify-center flex-wrap mb-14 max-w-[700px]">
        {QUICK_LAUNCH.map(app => (
          <button
            key={app.name}
            onClick={() => onNavigate(app.url)}
            className="flex flex-col items-center gap-2 w-[72px] group transition-all duration-120"
          >
            <div className="w-12 h-12 rounded-[10px] bg-[#111218] flex items-center justify-center border border-[#1e2030] transition-all duration-120 group-hover:border-[#6366f1] group-hover:text-[#818cf8] text-white">
              {app.icon}
            </div>
            <span className="text-[11px] font-medium text-[#64748b] text-center leading-tight group-hover:text-[#94a3b8]">{app.name}</span>
          </button>
        ))}
      </div>

      {/* Compact Wallet Overview */}
      <div className="w-full max-w-[560px]">
        <CompactWalletCard
          onSend={() => (window as any).requestSecurityCheck(() => openDashboardView('send'))}
          onReceive={() => (window as any).requestSecurityCheck(() => openDashboardView('receive'))}
          onBuy={() => (window as any).requestSecurityCheck(() => openDashboardView('buy'))}
          onSwap={() => (window as any).requestSecurityCheck(() => openDashboardView('swap'))}
          onImport={() => (window as any).requestSecurityCheck(() => openDashboardView('import'))}
          isNewTab={true}
        />
      </div>

      </div>{/* end content layer */}
    </div>
  );
}
