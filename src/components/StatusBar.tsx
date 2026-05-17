import React from 'react';
import { useSettings } from '../store/settings';
import { useRuntimeStore } from '../store/runtime';
import { useWalletStore } from '../store/wallet';
import { useTabsStore } from '../store/tabs';

export default function StatusBar() {
  const { theme } = useSettings();
  const { nodes }   = useRuntimeStore();
  const { status: walletStatus } = useWalletStore();
  const { tabs, activeTabId } = useTabsStore();

  const activeTab = tabs.find(t => t.id === activeTabId);
  const isDark    = theme === 'dark';

  const wasm = nodes.find(n => n.id === 'wasm');
  const ens  = nodes.find(n => n.id === 'ens');
  const ipfs = nodes.find(n => n.id === 'ipfs');

  const borderColor = isDark ? 'border-white/[0.07]' : 'border-black/[0.07]';
  const bg          = isDark ? 'bg-[#141414]'          : 'bg-[#e8e8e8]';
  const textColor   = isDark ? 'text-white/22'          : 'text-black/22';

  return (
    <div className={`h-6 flex items-center gap-3 px-4 ${bg} border-t ${borderColor} shrink-0 overflow-hidden`}>
      {/* Runtime dot */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className={`w-1.5 h-1.5 rounded-full ${
          wasm?.status === 'active' ? 'bg-[#00FF87] animate-pulse' : 'bg-white/20'
        }`} />
        <span className={`text-[10px] font-medium ${textColor}`}>Runtime</span>
      </div>

      <span className={`${textColor} text-[10px]`}>·</span>

      {/* ENS */}
      <div className="flex items-center gap-1 shrink-0">
        <div className={`w-1 h-1 rounded-full ${ens?.enabled ? 'bg-[#00FF87]' : 'bg-white/20'}`} />
        <span className={`text-[10px] ${textColor}`}>ENS</span>
      </div>

      <span className={`${textColor} text-[10px]`}>·</span>

      {/* IPFS */}
      <div className="flex items-center gap-1 shrink-0">
        <div className={`w-1 h-1 rounded-full ${ipfs?.enabled ? 'bg-[#00D1FF]' : 'bg-white/20'}`} />
        <span className={`text-[10px] ${textColor}`}>IPFS</span>
      </div>

      <span className={`${textColor} text-[10px]`}>·</span>

      {/* Wallet */}
      <span className={`text-[10px] ${textColor} shrink-0`}>
        {walletStatus === 'unlocked' ? 'Wallet connected' :
         walletStatus === 'locked'   ? 'Wallet locked'    : 'No wallet'}
      </span>

      <div className="flex-1" />

      {/* Loading indicator */}
      {activeTab?.isLoading && (
        <span className={`text-[10px] font-mono ${textColor} animate-pulse shrink-0`}>
          Loading…
        </span>
      )}

      {/* Current URL (truncated) */}
      {activeTab && activeTab.url !== 'orivon://newtab' && !activeTab.isLoading && (
        <span className={`text-[10px] font-mono ${textColor} truncate max-w-xs`}>
          {activeTab.displayUrl || activeTab.url}
        </span>
      )}

      <span className={`${textColor} text-[10px] shrink-0`}>·</span>
      <span className={`text-[10px] font-mono ${textColor} shrink-0`}>Orivon v0.94</span>
    </div>
  );
}
