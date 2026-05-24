import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Star, Download, Check, Shield, 
  Globe, Filter, Store, MoreHorizontal, Loader2,
  ChevronRight, LayoutGrid, Package, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSessionStore } from '../store/session';
import Spinner from './Spinner';

interface AppData {
  id: string;
  name: string;
  category: string;
  desc: string;
  score: 'Trustless' | 'Partial' | 'Centralized' | 'High Privacy';
  rating: number;
  downloads: string;
  iconBg: string;
  topBg?: string;
  version: string;
  lastUpdated: string;
  developer: string;
  website: string;
  size: string;
  url?: string;
}

const APPS: AppData[] = [
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
      list = list.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.desc.toLowerCase().includes(searchQuery.toLowerCase()));
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
      <div className="w-48 flex flex-col gap-1 shrink-0 sticky top-24">
        <div className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-3 px-4">Categories</div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`h-10 px-4 rounded-[10px] text-left text-[13px] font-bold transition-all border-none bg-transparent cursor-pointer flex items-center justify-between group ${
              activeCategory === cat ? 'bg-[#111218] text-[#f8fafc]' : 'text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            {cat}
            {activeCategory === cat && <div className="w-1 h-1 rounded-full bg-[#6366f1]" />}
          </button>
        ))}
        
        <div className="mt-8 px-4 py-6 bg-[#111218] border border-[#1e2030] rounded-xl">
           <div className="text-[11px] font-bold text-[#6366f1] uppercase tracking-widest mb-2">Orivon Verified</div>
           <p className="text-[11px] text-[#475569] leading-relaxed">All modules are sandboxed and verified for privacy.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 1,200+ decentralized modules..."
              className="w-full h-12 bg-[#111218] border border-[#1e2030] rounded-xl pl-12 pr-4 text-[#f8fafc] font-medium outline-none focus:border-[#6366f1] transition-all placeholder:text-[#475569]"
            />
          </div>
          <button className="h-12 px-6 bg-[#111218] border border-[#1e2030] rounded-xl text-[#64748b] hover:text-[#f8fafc] transition-all flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider cursor-pointer">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredApps.map((app, idx) => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => app.url && onOpen?.(app.url)}
              className="group bg-[#111218] border border-[#1e2030] rounded-xl p-5 flex items-center gap-5 hover:border-[#6366f1]/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-[22px] shrink-0 shadow-lg group-hover:scale-105 transition-transform" style={{ backgroundColor: app.iconBg }}>
                {app.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[15px] font-bold text-[#f8fafc] group-hover:text-[#6366f1] transition-colors">{app.name}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${app.score === 'Trustless' ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'}`} />
                </div>
                <p className="text-[13px] text-[#64748b] font-medium truncate leading-relaxed">{app.desc}</p>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1 text-[#f59e0b] text-[11px] font-bold tabular">
                      <Star size={10} fill="currentColor" /> {app.rating}
                   </div>
                   <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">{app.downloads} downloads</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <button 
                   onClick={(e) => handleInstall(app, e)}
                   disabled={installedApps[app.name] || !!installing}
                   className={`h-9 px-5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    installedApps[app.name] 
                    ? 'bg-transparent border border-[#1e2030] text-[#475569]' 
                    : 'bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-lg shadow-[#6366f1]/20 active:scale-95 border-none cursor-pointer'
                   }`}
                 >
                    {installing === app.name ? (
                       <Loader2 size={12} className="animate-spin" />
                    ) : installedApps[app.name] ? (
                       <><Check size={12} strokeWidth={4} /> Installed</>
                    ) : (
                       <><Download size={12} /> Install</>
                    )}
                 </button>
              </div>
              
              <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-6 h-6 rounded-bl-lg bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1]">
                    <ArrowRight size={12} />
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredApps.length === 0 && (
           <div className="py-20 flex flex-col items-center justify-center text-center">
              <Package size={48} className="text-[#1e2030] mb-4" />
              <h3 className="text-[16px] font-bold text-[#64748b]">No modules found</h3>
              <p className="text-[13px] text-[#475569] mt-1">Try adjusting your search or category filter</p>
           </div>
        )}
      </div>
    </div>
  );
}
