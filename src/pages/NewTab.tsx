import React, { useRef, useEffect, useState } from 'react';
import { Search, Shield, Cpu, Network, Globe, Clock, Wallet, TrendingUp } from 'lucide-react';
import { useSettings } from '../store/settings';
import { useTabsStore } from '../store/tabs';
import { useWalletStore } from '../store/wallet';
import { useRuntimeStore } from '../store/runtime';

interface NewTabProps {
  onNavigate: (url: string) => void;
}

const QUICK_ACCESS = [
  { name: 'Uniswap',    url: 'https://app.uniswap.org',     icon: '🦄' },
  { name: 'OpenSea',    url: 'https://opensea.io',           icon: '🌊' },
  { name: 'ENS App',    url: 'https://app.ens.domains',      icon: '🔷' },
  { name: 'Etherscan',  url: 'https://etherscan.io',         icon: '🔍' },
  { name: 'IPFS',       url: 'https://ipfs.io',              icon: '📦' },
  { name: 'Radicle',    url: 'https://app.radicle.xyz',      icon: '🌱' },
  { name: 'Aave',       url: 'https://app.aave.com',         icon: '👻' },
  { name: 'Mirror',     url: 'https://mirror.xyz',           icon: '🪞' },
];

export default function NewTab({ onNavigate }: NewTabProps) {
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const { theme } = useSettings();
  const { tabs } = useTabsStore();
  const { status: walletStatus, addresses } = useWalletStore();
  const { nodes } = useRuntimeStore();

  const isDark  = theme === 'dark';
  const bg      = isDark ? 'bg-[#0f0f0f]'        : 'bg-[#f5f5f5]';
  const card    = isDark ? 'bg-[#1a1a1a]'         : 'bg-white';
  const border  = isDark ? 'border-white/[0.07]'  : 'border-black/[0.07]';
  const textHi  = isDark ? 'text-white/75'         : 'text-black/75';
  const textMid = isDark ? 'text-white/40'         : 'text-black/40';
  const textLow = isDark ? 'text-white/22'         : 'text-black/22';

  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) onNavigate(search.trim());
  };

  // Recent browsed tabs (exclude new tab entries, take last 4 unique URLs)
  const recentTabs = tabs
    .filter(t => t.url !== 'orivon://newtab' && t.url !== 'orivon://settings')
    .slice(-4)
    .reverse();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={`h-full overflow-y-auto ${bg} flex flex-col`}>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12 max-w-2xl mx-auto w-full">

        {/* Greeting */}
        <div className="text-center space-y-1">
          <p className={`text-[12px] font-medium ${textLow} uppercase tracking-widest`}>{greeting()}</p>
          <h1 className={`text-[28px] font-bold tracking-tight ${textHi}`}>
            {walletStatus === 'unlocked' && addresses
              ? `${addresses.eth.slice(0, 6)}…${addresses.eth.slice(-4)}`
              : 'Orivon Browser'
            }
          </h1>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <Search size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMid} pointer-events-none`} />
            <input
              ref={ref}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search or enter URL · .eth domains · ipfs://"
              className={`w-full h-12 ${card} border ${border} ${isDark ? 'hover:border-white/15 focus:border-white/25' : 'hover:border-black/15 focus:border-black/25'} rounded-xl pl-11 pr-4 text-[13px] ${textHi} placeholder:${textLow} focus:outline-none transition-all shadow-sm`}
            />
          </div>
        </form>

        {/* Quick access grid */}
        <div className="w-full space-y-3">
          <p className={`text-[10px] font-semibold ${textLow} uppercase tracking-widest`}>Quick Access</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {QUICK_ACCESS.map(site => (
              <button
                key={site.name}
                onClick={() => onNavigate(site.url)}
                className={`flex flex-col items-center gap-2 py-3 px-1 rounded-xl ${card} hover:${isDark ? 'bg-[#202020]' : 'bg-[#f0f0f0]'} border ${border} ${isDark ? 'hover:border-white/12' : 'hover:border-black/12'} transition-all group`}
              >
                <span className="text-xl leading-none">{site.icon}</span>
                <span className={`text-[9px] ${textMid} group-hover:${isDark ? 'text-white/60' : 'text-black/60'} font-medium leading-none text-center`}>
                  {site.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent tabs */}
        {recentTabs.length > 0 && (
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={11} className={textLow} />
              <p className={`text-[10px] font-semibold ${textLow} uppercase tracking-widest`}>Recent</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {recentTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.url)}
                  className={`flex items-center gap-3 p-3 rounded-xl ${card} border ${border} hover:border-white/12 transition-all text-left group`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tab.type === 'ens' ? 'bg-[#00FF87]/10' :
                    tab.type === 'ipfs' ? 'bg-[#00D1FF]/10' :
                    isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'
                  }`}>
                    <Globe size={14} className={
                      tab.type === 'ens' ? 'text-[#00FF87]' :
                      tab.type === 'ipfs' ? 'text-[#00D1FF]' : textMid
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-medium ${textHi} truncate`}>{tab.title}</p>
                    <p className={`text-[10px] ${textLow} truncate font-mono`}>{tab.displayUrl || tab.url}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status row */}
        <div className={`w-full flex items-center justify-between py-3 px-4 rounded-xl ${card} border ${border}`}>
          <div className="flex items-center gap-4">
            <StatusPill
              icon={Shield}
              label="Runtime"
              active={nodes.find(n => n.id === 'wasm')?.status === 'active'}
              color="text-[#00FF87]"
              isDark={isDark}
            />
            <StatusPill
              icon={Network}
              label="ENS"
              active={nodes.find(n => n.id === 'ens')?.enabled}
              color="text-[#00FF87]"
              isDark={isDark}
            />
            <StatusPill
              icon={Cpu}
              label="IPFS"
              active={nodes.find(n => n.id === 'ipfs')?.enabled}
              color="text-[#00D1FF]"
              isDark={isDark}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Wallet size={12} className={
              walletStatus === 'unlocked' ? 'text-[#00FF87]' :
              walletStatus === 'locked'   ? 'text-yellow-500' : textLow
            } />
            <span className={`text-[10px] ${textLow}`}>
              {walletStatus === 'unlocked' ? 'Connected' :
               walletStatus === 'locked'   ? 'Locked'    : 'No wallet'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  icon: Icon, label, active, color, isDark
}: { icon: React.ElementType; label: string; active?: boolean; color: string; isDark: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={11} className={active ? color : isDark ? 'text-white/20' : 'text-black/20'} />
      <span className={`text-[10px] font-medium ${active ? (isDark ? 'text-white/45' : 'text-black/45') : (isDark ? 'text-white/20' : 'text-black/20')}`}>
        {label}
      </span>
    </div>
  );
}
