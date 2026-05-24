import React from 'react';
import { Search, MessageSquare, Layers, Box, Store, SearchCode, Bitcoin, Settings, LayoutGrid } from 'lucide-react';
import logo from '@/assets/logo.png';
import { CompactWalletCard } from '../components/WalletComponents';
import { DASHBOARD_URL } from '../constants';

interface NewTabProps {
  onNavigate: (url: string) => void;
}

const QUICK_LAUNCH = [
  { name: 'Web3 Social', icon: <MessageSquare size={24} />, url: 'https://lenster.xyz' },
  { name: 'DeFi', icon: <Layers size={24} />, url: 'https://app.uniswap.org' },
  { name: 'IPFS Browser', icon: <Box size={24} />, url: 'https://ipfs.io' },
  { name: 'App Store', icon: <Store size={24} />, url: 'orivon://apps' },
  { name: 'ENS Lookup', icon: <SearchCode size={24} />, url: 'https://ens.domains' },
  { name: 'Bitcoin', icon: <Bitcoin size={24} />, url: 'https://bitcoin.org' },
  { name: 'Settings', icon: <Settings size={24} />, url: 'orivon://settings' },
  { name: 'Dashboard', icon: <LayoutGrid size={24} />, url: DASHBOARD_URL },
];

export default function NewTab({ onNavigate }: NewTabProps) {
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
    <div className="h-full w-full bg-[#13141a] text-white flex flex-col items-center pt-20 px-4 overflow-hidden font-inter">
      {/* Centered Logo */}
      <div className="mb-8 flex flex-col items-center">
        <img
          src={logo}
          alt="Orivon"
          className="h-8 object-contain mb-1"
        />
        <span className="text-[10px] text-[#9a9ba5] uppercase tracking-widest font-bold">The Web3 Browser</span>
      </div>

      {/* Web3 Compass Search Bar */}
      <div className="w-full max-w-[600px] mb-12">
        <form onSubmit={handleSearch}>
          <div className="relative flex items-center">
            <Search
              className="absolute left-4 text-[#9a9ba5]"
              size={18}
            />
            <input
              name="search"
              autoFocus
              placeholder="Search Web3 or type a .eth address"
              className="w-full h-12 rounded-full bg-[#2b2c31] border border-[#3b3c42] pl-11 pr-12 text-[15px] text-white outline-none transition-all duration-200 focus:border-[#4f46e5]/50 placeholder:text-[#9a9ba5]"
            />
            <div className="absolute right-4 flex items-center gap-2 pointer-events-none">
                <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-tighter">Web3 Compass</span>
            </div>
          </div>
        </form>
      </div>

      {/* Quick Launch Icons */}
      <div className="flex gap-4 justify-center flex-wrap mb-12 max-w-[800px]">
        {QUICK_LAUNCH.map(app => (
          <button
            key={app.name}
            onClick={() => onNavigate(app.url)}
            className="flex flex-col items-center gap-2 w-[80px] group"
          >
            <div className="w-14 h-14 rounded-full bg-[#1e1f24] flex items-center justify-center border border-[#2b2c31] transition-all duration-200 group-hover:bg-[#2b2c31] group-hover:scale-105 active:scale-95 shadow-lg">
              <span className="text-[#e6e7e8]">
                {app.icon}
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#9a9ba5] text-center leading-tight">{app.name}</span>
          </button>
        ))}
      </div>

      {/* Compact Wallet Overview */}
      <div className="w-full max-w-[600px]">
        <CompactWalletCard
          onSend={() => openDashboardView('send')}
          onReceive={() => openDashboardView('receive')}
          onBuy={() => {}}
          onSwap={() => {}}
          onImport={() => openDashboardView('import')}
        />
      </div>
    </div>
  );
}
