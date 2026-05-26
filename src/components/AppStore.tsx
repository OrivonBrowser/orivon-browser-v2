import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Check, Shield, Filter, Loader2, ArrowRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSessionStore } from '../store/session';
import Spinner from './Spinner';

export interface AppData {
  id: string;
  name: string;
  category: string;
  desc: string;
  score: 'Trustless' | 'Partial' | 'Centralized' | 'High Privacy';
  rating: number;
  downloads: string;
  iconBg: string;
  version: string;
  lastUpdated: string;
  developer: string;
  website: string;
  size: string;
  url?: string;
}

export const APPS: AppData[] = [
  { id: 'monero', name: 'Monero Wallet', category: 'WALLETS', desc: 'XMR privacy wallet with ring signatures', score: 'Trustless', rating: 4.7, downloads: '127k', iconBg: '#ff6600', version: 'v1.4.2', lastUpdated: '2 days ago', developer: 'Monero Project', website: 'getmonero.org', size: '24 MB' },
  { id: 'arweave', name: 'Arweave Module', category: 'DATA GATHERING', desc: 'Permanent decentralized storage integration', score: 'Trustless', rating: 4.8, downloads: '89k', iconBg: '#000000', version: 'v1.0.5', lastUpdated: '1 week ago', developer: 'Arweave Team', website: 'arweave.org', size: '12 MB' },
  { id: 'filecoin', name: 'Filecoin Storage', category: 'STORAGE', desc: 'Store and retrieve files on Filecoin network', score: 'Trustless', rating: 4.6, downloads: '76k', iconBg: '#0090ff', version: 'v2.1.0', lastUpdated: '3 days ago', developer: 'Protocol Labs', website: 'filecoin.io', size: '32 MB' },
  { id: 'bisq', name: 'Bisq DEX', category: 'DEFI', desc: 'Peer-to-peer Bitcoin exchange, no KYC', score: 'Trustless', rating: 4.9, downloads: '62k', iconBg: '#25b45b', version: 'v1.9.8', lastUpdated: '5 days ago', developer: 'Bisq DAO', website: 'bisq.network', size: '18 MB' },
  { id: 'handshake', name: 'Handshake DNS', category: 'DNS RESOLUTION', desc: 'Decentralized TLD namespace on blockchain', score: 'Trustless', rating: 4.5, downloads: '54k', iconBg: '#f6b834', version: 'v0.8.2', lastUpdated: '1 month ago', developer: 'Handshake Devs', website: 'handshake.org', size: '8 MB' },
  { id: 'zcash', name: 'ZCash Wallet', category: 'WALLETS', desc: 'Private transactions with zk-SNARKs', score: 'Trustless', rating: 4.7, downloads: '48k', iconBg: '#f4b940', version: 'v1.2.0', lastUpdated: '2 weeks ago', developer: 'ECC', website: 'z.cash', size: '22 MB' },
  { id: 'uniswap', name: 'Uniswap Module', category: 'DEFI', desc: 'Token swaps on Ethereum, already installed', score: 'Trustless', rating: 4.9, downloads: '284k', iconBg: '#FF007A', version: 'v3.2.0', lastUpdated: 'Yesterday', developer: 'Uniswap Labs', website: 'uniswap.org', size: '14 MB', url: 'uniswap.eth' },
  { id: 'aave', name: 'Aave Protocol', category: 'DEFI', desc: 'Decentralized lending and borrowing', score: 'Partial', rating: 4.4, downloads: '41k', iconBg: '#2ebac6', version: 'v2.0.1', lastUpdated: '1 week ago', developer: 'Aave', website: 'aave.com', size: '16 MB' },
  { id: 'lens', name: 'Lens Protocol', category: 'SOCIAL', desc: 'Decentralized social graph on Polygon', score: 'Partial', rating: 4.3, downloads: '38k', iconBg: '#00501e', version: 'v1.4.0', lastUpdated: '3 days ago', developer: 'Lens Team', website: 'lens.xyz', size: '10 MB' },
  { id: 'farcaster', name: 'Farcaster', category: 'SOCIAL', desc: 'Decentralized social protocol', score: 'Trustless', rating: 4.6, downloads: '35k', iconBg: '#855af2', version: 'v2.1.0', lastUpdated: '2 days ago', developer: 'Farcaster', website: 'farcaster.xyz', size: '12 MB' },
  { id: 'opensea', name: 'OpenSea Module', category: 'NFTS', desc: 'Browse and trade NFTs on OpenSea', score: 'Partial', rating: 4.2, downloads: '91k', iconBg: '#2081e2', version: 'v1.8.0', lastUpdated: '4 days ago', developer: 'OpenSea', website: 'opensea.io', size: '18 MB', url: 'opensea.eth' },
  { id: 'foundation', name: 'Foundation', category: 'NFTS', desc: 'Creator-focused NFT marketplace', score: 'Partial', rating: 4.4, downloads: '28k', iconBg: '#000000', version: 'v1.2.5', lastUpdated: '1 week ago', developer: 'Foundation', website: 'foundation.app', size: '15 MB' },
  { id: 'ethereum', name: 'Ethereum Node', category: 'NODES', desc: 'Full Ethereum light node in browser', score: 'Trustless', rating: 4.8, downloads: '44k', iconBg: '#627EEA', version: 'v0.8.0', lastUpdated: '2 weeks ago', developer: 'Ethereum Foundation', website: 'ethereum.org', size: '120 MB' },
  { id: 'polygon', name: 'Polygon Node', category: 'NODES', desc: 'Polygon network node integration', score: 'Trustless', rating: 4.5, downloads: '31k', iconBg: '#8247E5', version: 'v1.0.2', lastUpdated: '1 month ago', developer: 'Polygon', website: 'polygon.technology', size: '95 MB' },
  { id: 'unstoppable', name: 'Unstoppable Domains', category: 'DNS RESOLUTION', desc: '.crypto .nft .x domain resolution', score: 'Trustless', rating: 4.6, downloads: '67k', iconBg: '#0d67fe', version: 'v2.4.0', lastUpdated: '3 days ago', developer: 'Unstoppable', website: 'unstoppabledomains.com', size: '9 MB' },
  { id: 'brave', name: 'Brave Search', category: 'SEARCH', desc: 'Privacy-focused web search', score: 'Partial', rating: 4.3, downloads: '156k', iconBg: '#ff1f05', version: 'v1.2.0', lastUpdated: '1 week ago', developer: 'Brave Software', website: 'search.brave.com', size: '4 MB' },
  { id: 'presearch', name: 'Presearch', category: 'SEARCH', desc: 'Decentralized search engine with PRE rewards', score: 'Partial', rating: 4.4, downloads: '89k', iconBg: '#0047ff', version: 'v0.9.5', lastUpdated: '2 weeks ago', developer: 'Presearch', website: 'presearch.com', size: '5 MB' },
  { id: 'mirror', name: 'Mirror.xyz', category: 'SOCIAL', desc: 'Decentralized publishing platform', score: 'Trustless', rating: 4.7, downloads: '29k', iconBg: '#007aff', version: 'v1.1.0', lastUpdated: '5 days ago', developer: 'Mirror DAO', website: 'mirror.xyz', size: '11 MB' },
  { id: 'dhedge', name: 'dHEDGE', category: 'DEFI', desc: 'Decentralized asset management', score: 'Partial', rating: 4.1, downloads: '19k', iconBg: '#00e1ff', version: 'v2.3.0', lastUpdated: '1 month ago', developer: 'dHEDGE', website: 'dhedge.org', size: '14 MB' },
  { id: 'gnosis', name: 'Gnosis Safe', category: 'WALLETS', desc: 'Multisig smart contract wallet', score: 'Trustless', rating: 4.8, downloads: '73k', iconBg: '#008c73', version: 'v3.5.0', lastUpdated: '1 week ago', developer: 'Gnosis Safe', website: 'safe.global', size: '20 MB' },
];

const CATEGORIES = ['All Apps', 'Featured', 'Wallets', 'DeFi', 'Social', 'Nodes', 'NFTs', 'Privacy', 'Search', 'Storage', 'Installed'];

export default function AppStore({ onOpen, onToast, isDemo = false }: { onOpen?: (url: string) => void, onToast?: (title: string, sub: string) => void, isDemo?: boolean }) {
  const { installedApps, installApp } = useSessionStore();
  const [activeCategory, setActiveCategory] = useState('All Apps');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredApps = useMemo(() => {
    let list = [...APPS];
    if (activeCategory === 'Installed') {
      list = list.filter(a => installedApps[a.name]);
    } else if (activeCategory === 'Featured') {
      list = list.filter(a => ['monero', 'uniswap', 'ethereum', 'farcaster'].includes(a.id));
    } else if (activeCategory !== 'All Apps') {
      list = list.filter(a => a.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    if (searchQuery) {
      list = list.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [activeCategory, searchQuery, installedApps]);

  const handleInstall = (app: AppData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (installedApps[app.name] || installing) return;
    setInstalling(app.name);
    setTimeout(() => {
      installApp(app.name);
      setInstalling(null);
      onToast?.(`${app.name} Installed`, 'Module successfully added to Orivon');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center py-40">
        <Spinner size={32} color="#6366f1" />
      </div>
    );
  }

  return (
    <div className="flex gap-10 items-start">
      {/* Category Sidebar */}
      <div className="w-44 flex flex-col gap-0.5 shrink-0 sticky top-24">
        <div className="text-[10px] font-bold text-[#475569] uppercase tracking-[0.14em] mb-3 px-3">Categories</div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="h-9 px-3 rounded-[10px] text-left text-[13px] font-bold transition-all border-none cursor-pointer flex items-center justify-between"
            style={
              activeCategory === cat
                ? { background: 'rgba(99,102,241,0.12)', color: '#f8fafc' }
                : { background: 'transparent', color: '#64748b' }
            }
          >
            <span>{cat}</span>
            {activeCategory === cat && <div className="w-1 h-1 rounded-full bg-[#6366f1]" />}
          </button>
        ))}

        <div
          className="mt-8 px-4 py-5 rounded-[14px]"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield size={12} className="text-[#6366f1]" />
            <div className="text-[10px] font-bold text-[#6366f1] uppercase tracking-[0.1em]">Verified</div>
          </div>
          <p className="text-[11px] text-[#475569] leading-relaxed">All modules are sandboxed and audited for privacy.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Search + filter row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#f8fafc] transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                <X size={14} />
              </button>
            )}
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search decentralized modules..."
              className="w-full h-11 rounded-[12px] pl-11 pr-10 text-[13px] font-medium outline-none transition-all placeholder:text-[#475569]"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid #1e2030',
                color: '#f8fafc',
              }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = '#6366f1')}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = '#1e2030')}
            />
          </div>
          <button
            className="h-11 px-5 rounded-[12px] text-[#64748b] hover:text-[#f8fafc] transition-all flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider cursor-pointer border-none"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e2030' }}
          >
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Section label */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#6366f1] mb-1">
              {activeCategory === 'All Apps' ? 'All Modules' : activeCategory}
            </div>
            <div className="text-[13px] font-medium text-[#475569]">
              {filteredApps.length} module{filteredApps.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {filteredApps.map((app, idx) => {
              const installed = !!installedApps[app.name];
              const isInstalling = installing === app.name;
              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: idx * 0.015 }}
                  onClick={() => app.url && onOpen?.(app.url)}
                  className="group relative flex items-center gap-4 p-4 rounded-[16px] cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e2030' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.35)';
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.04)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#1e2030';
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  {/* Left accent */}
                  <div
                    className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: app.score === 'Trustless' ? '#6366f1' : '#f59e0b' }}
                  />

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center text-white font-black text-[18px] shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: app.iconBg }}
                  >
                    {app.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-bold text-[#f8fafc] truncate">{app.name}</span>
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: app.score === 'Trustless' ? '#22c55e' : '#f59e0b' }}
                      />
                    </div>
                    <p className="text-[12px] text-[#64748b] font-medium truncate leading-relaxed">{app.desc}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: app.score === 'Trustless' ? '#22c55e' : '#f59e0b' }}
                      >
                        {app.score}
                      </span>
                      <span className="text-[10px] font-bold text-[#2d2e45] uppercase tracking-wider">·</span>
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">{app.downloads} dl</span>
                    </div>
                  </div>

                  {/* Install button */}
                  <button
                    onClick={(e: React.MouseEvent) => handleInstall(app, e)}
                    disabled={installed || !!installing}
                    className="h-8 px-4 rounded-[8px] font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shrink-0 border-none cursor-pointer"
                    style={
                      installed
                        ? { background: 'transparent', border: '1px solid #1e2030', color: '#475569' }
                        : { background: '#6366f1', color: 'white', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }
                    }
                  >
                    {isInstalling ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : installed ? (
                      <><Check size={11} strokeWidth={3} /> Done</>
                    ) : (
                      <>Get</>
                    )}
                  </button>

                  {app.url && (
                    <ArrowRight
                      size={14}
                      className="text-[#2d2e45] group-hover:text-[#6366f1] transition-colors shrink-0"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {filteredApps.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div
              className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-5"
              style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}
            >
              <Search size={24} />
            </div>
            <div className="text-[15px] font-bold text-[#64748b] mb-1">No modules found</div>
            <p className="text-[13px] text-[#475569]">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
