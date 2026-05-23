import React from 'react';
import { Search, MessageSquare, Layers, Box, Store } from 'lucide-react';
import logo from '@/assets/logo.png';
import { CompactWalletCard } from '../components/WalletComponents';
import { DASHBOARD_URL } from '../components/Browser';

interface NewTabProps {
  onNavigate: (url: string) => void;
}

const QUICK_LAUNCH = [
  { name: 'Social', icon: <MessageSquare size={22} />, url: 'orivon.eth' },
  { name: 'DeFi', icon: <Layers size={22} />, url: 'app.uniswap.org' },
  { name: 'IPFS', icon: <Box size={22} />, url: 'ipfs.io' },
  { name: 'App Store', icon: <Store size={22} />, url: 'orivon://apps' },
];

export default function NewTab({ onNavigate }: NewTabProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query) onNavigate(query);
  };

  const openDashboardView = (view?: string) => {
    onNavigate(`${DASHBOARD_URL}?view=${view || 'full'}`);
  };

  return (
    <div className="h-full w-full bg-[#0a0a0f] text-white flex flex-col items-center pt-6 px-4 overflow-hidden font-inter">
      {/* Centered Logo */}
      <div className="mb-6 flex flex-col items-center">
        <img
          src={logo}
          alt="Orivon"
          className="w-12 h-12 rounded-xl"
        />
      </div>

      {/* Web3 Compass Search Bar */}
      <div className="w-full max-w-[640px] mb-8">
        <form onSubmit={handleSearch}>
          <div className="relative flex items-center group">
            <Search
              className="absolute left-5 text-gray-500 transition-colors group-focus-within:text-indigo-500"
              size={20}
            />
            <input
              name="search"
              autoFocus
              placeholder="Search Web3 or type a .eth address"
              className="w-full h-14 rounded-full bg-white/5 border border-white/10 pl-14 pr-12 text-base text-white outline-none transition-all duration-200 focus:bg-white/[0.08] focus:border-indigo-500/50 shadow-2xl placeholder:text-gray-600"
            />
          </div>
        </form>
      </div>

      {/* Quick Launch Icons */}
      <div className="flex gap-10 justify-center flex-wrap mb-10">
        {QUICK_LAUNCH.map(app => (
          <button
            key={app.name}
            onClick={() => onNavigate(app.url)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 transition-all duration-200 group-hover:bg-white/10 group-hover:border-white/20 group-hover:-translate-y-1">
              <span className="text-gray-400 transition-colors group-hover:text-white">
                {app.icon}
              </span>
            </div>
            <span className="text-[13px] font-medium text-gray-500 transition-colors group-hover:text-white">{app.name}</span>
          </button>
        ))}
      </div>

      {/* Compact Wallet Overview */}
      <div className="w-full flex justify-center">
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
