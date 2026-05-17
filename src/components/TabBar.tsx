import React from 'react';
import { Plus, X, Globe } from 'lucide-react';
import { TabEntry, NEW_TAB } from '../store/tabs';

interface TabBarProps {
  tabs: TabEntry[];
  activeId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  isDark: boolean;
}

export default function TabBar({ tabs, activeId, onTabClick, onTabClose, onNewTab, isDark }: TabBarProps) {
  const isMac = window.electronAPI?.platform === 'darwin';

  return (
    <div
      className={`h-10 flex items-end drag shrink-0 ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#d8d8d8]'}`}
    >
      {/* Space for macOS traffic lights */}
      {isMac && <div className="w-[80px] shrink-0 h-full" />}

      {/* Tab strip */}
      <div className="flex items-end flex-1 min-w-0 overflow-hidden pl-0.5 gap-px">
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeId}
            isDark={isDark}
            onClick={() => onTabClick(tab.id)}
            onClose={e => onTabClose(tab.id, e)}
          />
        ))}

        {/* New tab button */}
        <button
          onClick={onNewTab}
          className={`no-drag w-8 h-8 mb-0.5 ml-0.5 rounded-full flex items-center justify-center shrink-0 transition-all ${
            isDark
              ? 'text-white/30 hover:text-white/60 hover:bg-white/8'
              : 'text-black/30 hover:text-black/60 hover:bg-black/8'
          }`}
          title="New tab (⌘T)"
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function Tab({ tab, isActive, isDark, onClick, onClose }: {
  tab: TabEntry; isActive: boolean; isDark: boolean;
  onClick: () => void; onClose: (e: React.MouseEvent) => void;
  key?: string; // React key – exists at call site, not in props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        no-drag group relative flex items-center gap-2 h-9 px-3 cursor-pointer
        rounded-tl-lg rounded-tr-lg flex-1 min-w-0 max-w-[220px] transition-all select-none
        ${isActive
          ? isDark
            ? 'bg-[#1a1a1a] text-white/90 z-10'
            : 'bg-[#f5f5f5] text-black/90 z-10'
          : isDark
            ? 'bg-transparent text-white/40 hover:bg-[#131313] hover:text-white/65'
            : 'bg-transparent text-black/40 hover:bg-[#c8c8c8] hover:text-black/65'
        }
      `}
    >
      {/* Active tab bottom "bridge" to toolbar */}
      {isActive && (
        <div className={`absolute bottom-0 left-0 right-0 h-px ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f5]'}`} />
      )}

      {/* Favicon */}
      <div className="w-4 h-4 shrink-0 flex items-center justify-center">
        {tab.isLoading ? (
          <div className={`w-3 h-3 border rounded-full border-t-transparent animate-spin ${
            isDark ? 'border-white/30' : 'border-black/30'
          }`} />
        ) : tab.type === 'ens' ? (
          <div className="w-3 h-3 rounded-full bg-[#00FF87]/30 ring-1 ring-[#00FF87]/70" />
        ) : tab.type === 'ipfs' || tab.type === 'ipns' ? (
          <div className="w-3 h-3 rounded-full bg-[#00D1FF]/30 ring-1 ring-[#00D1FF]/70" />
        ) : (
          <Globe size={12} strokeWidth={1.8} />
        )}
      </div>

      {/* Title */}
      <span className="text-[12px] font-medium leading-none truncate flex-1 min-w-0">
        {tab.title || 'New Tab'}
      </span>

      {/* Close */}
      <button
        onClick={e => { e.stopPropagation(); onClose(e); }}
        className={`shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all ${
          isActive || true
            ? isDark
              ? 'opacity-0 group-hover:opacity-100 hover:bg-white/15 text-white/60'
              : 'opacity-0 group-hover:opacity-100 hover:bg-black/10 text-black/50'
            : 'hidden'
        }`}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </div>
  );
}
