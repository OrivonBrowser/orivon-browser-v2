import React from 'react';
import { Search, MessageSquare, Layers, Box, Store, Bitcoin, Settings, LayoutGrid, Server } from 'lucide-react';
import logo from '@/assets/logo.png';
import { CompactWalletCard } from '../components/WalletComponents';
import { DASHBOARD_URL, SETTINGS_URL, NODEMANAGER_URL } from '../constants';

interface NewTabProps {
  onNavigate: (url: string) => void;
}

const QUICK_LAUNCH = [
  { name: 'Dashboard',    icon: <LayoutGrid size={20} />,    url: DASHBOARD_URL },
  { name: 'App Store',    icon: <Store size={20} />,         url: 'apps.orivon.eth' },
  { name: 'Uniswap',      icon: <Layers size={20} />,        url: 'uniswap.eth' },
  { name: 'Mastodon',     icon: <MessageSquare size={20} />, url: 'mastodon.eth' },
  { name: 'Bitcoin Node', icon: <Bitcoin size={20} />,       url: 'btcnode.eth' },
  { name: 'OpenSea',      icon: <Box size={20} />,           url: 'opensea.eth' },
  { name: 'Node Manager', icon: <Server size={20} />,        url: NODEMANAGER_URL },
  { name: 'Settings',     icon: <Settings size={20} />,      url: SETTINGS_URL },
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
      style={{
        backgroundImage: `url(/image-${bgIndex}.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay — transparent enough to let the image show through */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(13,14,20,0.58)' }}
      />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* Logo */}
        <div className="mb-12 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1">
            <img src={logo} alt="Orivon" className="h-6 object-contain brightness-[1.2]" />
            <span className="text-[18px] font-bold tracking-[0.12em] text-[#f8fafc]">ORIVON</span>
          </div>
          <span className="text-[11px] text-[#6366f1] uppercase tracking-[0.08em] font-medium">The Web3 Browser</span>
        </div>

        {/* Search */}
        <div className="w-full max-w-[560px] mb-14">
          <form onSubmit={handleSearch}>
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-[#475569]" size={18} />
              <input
                name="search"
                autoFocus
                placeholder="Search Web3 or type a .eth address"
                className="w-full h-[44px] rounded-[10px] pl-11 pr-32 text-[14px] text-[#f8fafc] outline-none transition-all duration-120 focus:border-[#6366f1] placeholder:text-[#475569]"
                style={{ background: 'rgba(17,18,24,0.85)', border: '1px solid #1e2030' }}
              />
              <div className="absolute right-4 flex items-center gap-2 pointer-events-none">
                <span className="text-[11px] font-medium text-[#64748b] uppercase tracking-wider">Web3 Compass</span>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Launch */}
        <div className="flex gap-4 justify-center flex-wrap mb-14 max-w-[700px]">
          {QUICK_LAUNCH.map(app => (
            <button
              key={app.name}
              onClick={() => onNavigate(app.url)}
              className="flex flex-col items-center gap-2 w-[72px] group transition-all duration-120"
            >
              <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center border transition-all duration-120 group-hover:border-[#6366f1] group-hover:text-[#818cf8] text-white"
                style={{ background: 'rgba(17,18,24,0.82)', border: '1px solid #1e2030' }}
              >
                {app.icon}
              </div>
              <span className="text-[11px] font-medium text-[#94a3b8] text-center leading-tight group-hover:text-white">
                {app.name}
              </span>
            </button>
          ))}
        </div>

        {/* Compact Wallet */}
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

      </div>
    </div>
  );
}
