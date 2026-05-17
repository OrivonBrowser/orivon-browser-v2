import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe } from 'lucide-react';
import { useSettings } from '../store/settings';
import { useTabsStore } from '../store/tabs';

const DAPPS = [
  { name: 'Uniswap',   url: 'https://app.uniswap.org',   icon: '🦄', label: 'DEX' },
  { name: 'OpenSea',   url: 'https://opensea.io',         icon: '🌊', label: 'NFT' },
  { name: 'Aave',      url: 'https://app.aave.com',       icon: '👻', label: 'DeFi' },
  { name: 'ENS App',   url: 'https://app.ens.domains',    icon: '🔷', label: 'ENS' },
  { name: 'Etherscan', url: 'https://etherscan.io',       icon: '🔍', label: 'Explorer' },
  { name: 'Mirror',    url: 'https://mirror.xyz',         icon: '🪞', label: 'Publish' },
  { name: 'Radicle',   url: 'https://app.radicle.xyz',    icon: '🌱', label: 'Git' },
  { name: 'IPFS',      url: 'https://ipfs.io',            icon: '📦', label: 'Storage' },
];

interface NewTabProps {
  onNavigate: (url: string) => void;
}

export default function NewTab({ onNavigate }: NewTabProps) {
  const { theme } = useSettings();
  const { tabs } = useTabsStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) onNavigate(q);
  };

  // Recent browsed sites (last 4, unique, excluding new tab)
  const recent = [...new Map(
    tabs
      .filter(t => t.url !== 'orivon://newtab' && t.url !== 'orivon://settings')
      .map(t => [t.url, t])
  ).values()].slice(-4).reverse();

  const bg = isDark ? 'bg-[#0f0f0f]' : 'bg-[#f0f0f0]';
  const inputBg = isDark ? 'bg-[#1a1a1a] border-white/[0.08] text-white/80 placeholder:text-white/25 focus:border-white/20' : 'bg-white border-black/[0.08] text-black/80 placeholder:text-black/25 focus:border-black/20';
  const cardBg  = isDark ? 'bg-[#141414] border-white/[0.06] hover:border-white/12 hover:bg-[#1a1a1a]' : 'bg-white border-black/[0.06] hover:border-black/12';
  const muted   = isDark ? 'text-white/30' : 'text-black/30';

  return (
    <div className={`h-full ${bg} flex flex-col items-center justify-center gap-10 p-8 overflow-auto`}>
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 -mt-8">
        <div className="w-10 h-10 rounded-[10px] bg-[#00FF87] flex items-center justify-center mb-1">
          <Globe size={20} className="text-black" strokeWidth={2.5} />
        </div>
        <h1 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white/70' : 'text-black/70'}`}>Orivon</h1>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-[560px]">
        <div className={`relative flex items-center rounded-2xl border ${inputBg} transition-all shadow-sm`}>
          <Search size={16} className={`absolute left-4 ${muted} pointer-events-none`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search or enter address · try app.eth · ipfs://"
            className="w-full h-12 bg-transparent pl-11 pr-4 text-[14px] focus:outline-none"
          />
        </div>
      </form>

      {/* dApp shortcuts grid */}
      <div className="w-full max-w-[560px] space-y-3">
        <p className={`text-[11px] font-semibold uppercase tracking-widest ${muted}`}>Web3 Apps</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {DAPPS.map(dapp => (
            <button
              key={dapp.name}
              onClick={() => onNavigate(dapp.url)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all group ${cardBg}`}
            >
              <span className="text-2xl leading-none">{dapp.icon}</span>
              <span className={`text-[10px] font-medium leading-none text-center ${isDark ? 'text-white/45 group-hover:text-white/70' : 'text-black/45 group-hover:text-black/70'}`}>
                {dapp.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent tabs */}
      {recent.length > 0 && (
        <div className="w-full max-w-[560px] space-y-3">
          <p className={`text-[11px] font-semibold uppercase tracking-widest ${muted}`}>Recent</p>
          <div className="grid grid-cols-2 gap-2">
            {recent.map(tab => (
              <button
                key={tab.id + tab.url}
                onClick={() => onNavigate(tab.url)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${cardBg}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  tab.type === 'ens'  ? 'bg-[#00FF87]/12' :
                  tab.type === 'ipfs' ? 'bg-[#00D1FF]/12' :
                  isDark ? 'bg-white/[0.05]' : 'bg-black/[0.04]'
                }`}>
                  <Globe size={12} className={
                    tab.type === 'ens'  ? 'text-[#00FF87]' :
                    tab.type === 'ipfs' ? 'text-[#00D1FF]' : muted
                  } />
                </div>
                <div className="min-w-0">
                  <p className={`text-[12px] font-medium truncate ${isDark ? 'text-white/75' : 'text-black/75'}`}>{tab.title}</p>
                  <p className={`text-[10px] font-mono truncate ${muted}`}>{tab.displayUrl || tab.url}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
