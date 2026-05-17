import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Globe, Plus, X, Pin, Settings, Download, Wallet,
  Star, Clock, ChevronDown, MoreHorizontal
} from 'lucide-react';
import { useTabsStore, TabEntry, NEW_TAB } from '../store/tabs';
import { useSettings } from '../store/settings';
import { useWalletStore } from '../store/wallet';

interface SidebarProps {
  onNavigate:   (url: string) => void;
  onOpenSettings: () => void;
}

const QUICK_ACCESS = [
  { name: 'Uniswap',   url: 'https://app.uniswap.org',   icon: '🦄', isWeb3: true  },
  { name: 'OpenSea',   url: 'https://opensea.io',         icon: '🌊', isWeb3: true  },
  { name: 'ENS App',   url: 'https://app.ens.domains',    icon: '🔷', isWeb3: true  },
  { name: 'Etherscan', url: 'https://etherscan.io',       icon: '🔍', isWeb3: true  },
  { name: 'IPFS',      url: 'https://ipfs.io',            icon: '📦', isWeb3: true  },
  { name: 'Radicle',   url: 'https://app.radicle.xyz',    icon: '🌱', isWeb3: true  },
  { name: 'GitHub',    url: 'https://github.com',         icon: '🐙', isWeb3: false },
  { name: 'YouTube',   url: 'https://youtube.com',        icon: '▶️', isWeb3: false },
];

export default function Sidebar({ onNavigate, onOpenSettings }: SidebarProps) {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab, pinTab } = useTabsStore();
  const { theme } = useSettings();
  const { status: walletStatus, addresses } = useWalletStore();
  const [quickOpen, setQuickOpen] = useState(true);
  const [contextTab, setContextTab] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bg       = isDark ? 'bg-[#181818]'  : 'bg-[#f0f0f0]';
  const border   = isDark ? 'border-white/[0.07]' : 'border-black/[0.07]';
  const textMid  = isDark ? 'text-white/40'  : 'text-black/40';
  const textLow  = isDark ? 'text-white/22'  : 'text-black/22';
  const hoverBg  = isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-black/[0.04]';
  const activeBg = isDark ? 'bg-white/10'   : 'bg-black/10';

  const pinnedTabs = tabs.filter(t => t.pinned);
  const openTabs   = tabs.filter(t => !t.pinned);

  return (
    <aside className={`h-full ${bg} border-r ${border} flex flex-col overflow-hidden shrink-0 select-none`}>
      {/* Brand */}
      <div className={`h-10 flex items-center gap-2.5 px-4 border-b ${border} shrink-0`}>
        <div className="w-5 h-5 rounded-md bg-[#00FF87] flex items-center justify-center">
          <Globe size={11} className="text-black font-bold" />
        </div>
        <span className={`text-[13px] font-semibold ${isDark ? 'text-white/60' : 'text-black/60'}`}>
          Orivon
        </span>
        <div className="flex-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" title="Runtime active" />
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-0">

        {/* Pinned tabs */}
        {pinnedTabs.length > 0 && (
          <div className="px-2 pt-1 pb-2">
            <p className={`px-2 py-1 text-[10px] font-semibold ${textLow} uppercase tracking-widest`}>Pinned</p>
            <div className="flex flex-wrap gap-1 px-1">
              {pinnedTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.title}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    tab.id === activeTabId ? activeBg : hoverBg
                  }`}
                >
                  <TabFavicon tab={tab} size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Open tabs */}
        <div className="px-2">
          <p className={`px-2 py-1.5 text-[10px] font-semibold ${textLow} uppercase tracking-widest`}>Tabs</p>
          <div className="space-y-0.5">
            {openTabs.map(tab => (
              <div
                key={tab.id}
                onContextMenu={() => setContextTab(contextTab === tab.id ? null : tab.id)}
                className="relative"
              >
                <div
                  onClick={() => { setActiveTab(tab.id); setContextTab(null); }}
                  className={`group flex items-center gap-2 h-9 px-2 rounded-lg cursor-pointer transition-all ${
                    tab.id === activeTabId
                      ? `${activeBg} ${isDark ? 'text-white' : 'text-black'}`
                      : `${textMid} ${hoverBg} ${isDark ? 'hover:text-white/70' : 'hover:text-black/70'}`
                  }`}
                >
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <TabFavicon tab={tab} size={13} loading={tab.isLoading} />
                  </div>
                  <span className="flex-1 text-[12px] font-medium truncate leading-none">
                    {tab.title || tab.displayUrl || 'New Tab'}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                    className={`w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 ${
                      isDark ? 'hover:bg-white/15' : 'hover:bg-black/10'
                    } transition-all shrink-0`}
                  >
                    <X size={10} />
                  </button>
                </div>

                {/* Context menu */}
                {contextTab === tab.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute left-2 top-full z-50 mt-0.5 rounded-lg border shadow-xl overflow-hidden ${
                      isDark ? 'bg-[#222] border-white/10' : 'bg-white border-black/10'
                    }`}
                    style={{ width: 180 }}
                  >
                    {[
                      { label: 'Pin tab', icon: Pin, action: () => { pinTab(tab.id); setContextTab(null); } },
                      { label: 'Close tab', icon: X, action: () => { closeTab(tab.id); setContextTab(null); } },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 text-[12px] font-medium transition-all ${
                          isDark ? 'hover:bg-white/8 text-white/60 hover:text-white' : 'hover:bg-black/5 text-black/60 hover:text-black'
                        }`}
                      >
                        <item.icon size={12} />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}

            {/* New tab button */}
            <button
              onClick={() => addTab()}
              className={`flex items-center gap-2 h-9 px-2 w-full rounded-lg ${textLow} ${hoverBg} ${
                isDark ? 'hover:text-white/55' : 'hover:text-black/55'
              } transition-all`}
            >
              <Plus size={13} />
              <span className="text-[12px] font-medium">New Tab</span>
            </button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="px-2 pt-2">
          <button
            onClick={() => setQuickOpen(p => !p)}
            className={`flex items-center gap-1.5 px-2 py-1.5 w-full rounded-md ${textLow} ${hoverBg} transition-all`}
          >
            <Star size={10} />
            <span className="text-[10px] font-semibold uppercase tracking-widest flex-1 text-left">Quick Access</span>
            <ChevronDown size={10} className={`transition-transform ${quickOpen ? '' : '-rotate-90'}`} />
          </button>
          {quickOpen && (
            <div className="mt-1 space-y-0.5">
              {QUICK_ACCESS.map(site => (
                <button
                  key={site.name}
                  onClick={() => onNavigate(site.url)}
                  className={`flex items-center gap-2.5 h-8 px-2 w-full rounded-lg ${textMid} ${hoverBg} ${
                    isDark ? 'hover:text-white/65' : 'hover:text-black/65'
                  } transition-all group`}
                >
                  <span className="text-[13px] leading-none">{site.icon}</span>
                  <span className="text-[12px] font-medium flex-1 text-left">{site.name}</span>
                  {site.isWeb3 && (
                    <span className="text-[8px] font-bold text-[#00FF87]/40 uppercase tracking-widest opacity-0 group-hover:opacity-100">
                      Web3
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className={`border-t ${border} px-2 py-2 space-y-0.5`}>
        {/* Wallet status */}
        <div className={`flex items-center gap-2 h-9 px-2 rounded-lg ${textMid}`}>
          <Wallet size={14} />
          <span className="text-[12px] font-medium flex-1">
            {walletStatus === 'unlocked'
              ? `${addresses?.eth.slice(0, 6)}…${addresses?.eth.slice(-4)}`
              : walletStatus === 'locked' ? 'Wallet locked'
              : 'No wallet'}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${
            walletStatus === 'unlocked' ? 'bg-[#00FF87]' :
            walletStatus === 'locked'   ? 'bg-yellow-500' : 'bg-white/20'
          }`} />
        </div>

        <div className="flex gap-1">
          <button
            title="Downloads"
            className={`flex-1 h-8 rounded-lg flex items-center justify-center ${textLow} ${hoverBg} ${
              isDark ? 'hover:text-white/60' : 'hover:text-black/60'
            } transition-all`}
          >
            <Download size={14} />
          </button>
          <button
            title="Settings"
            onClick={onOpenSettings}
            className={`flex-1 h-8 rounded-lg flex items-center justify-center ${textLow} ${hoverBg} ${
              isDark ? 'hover:text-white/60' : 'hover:text-black/60'
            } transition-all`}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Tab favicon helper ──────────────────────────────────────────────────────────

function TabFavicon({ tab, size, loading }: { tab: TabEntry; size: number; loading?: boolean }) {
  if (loading) {
    return <div className="w-3 h-3 border border-[#00FF87] border-t-transparent rounded-full animate-spin" />;
  }
  if (tab.type === 'ens') {
    return <div className="w-2.5 h-2.5 rounded-full bg-[#00FF87]/25 ring-1 ring-[#00FF87]/60" />;
  }
  if (tab.type === 'ipfs' || tab.type === 'ipns') {
    return <div className="w-2.5 h-2.5 rounded-full bg-[#00D1FF]/25 ring-1 ring-[#00D1FF]/60" />;
  }
  if (tab.url === NEW_TAB || tab.type === 'newtab') {
    return <Globe size={size} />;
  }
  if (tab.favicon) {
    return <img src={tab.favicon} alt="" width={size} height={size} className="rounded-sm" onError={() => {}} />;
  }
  return <Globe size={size} />;
}
