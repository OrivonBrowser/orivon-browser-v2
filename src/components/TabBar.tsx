import React from 'react';
import { Plus, X, Globe } from 'lucide-react';
import { TabEntry, NEW_TAB } from '../store/tabs';

interface WindowControls {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?:    () => void;
}

interface TabBarProps {
  tabs: TabEntry[];
  activeId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  isDark: boolean;
  windowControls?: WindowControls; // only set on non-macOS Electron
}

export default function TabBar({
  tabs, activeId, onTabClick, onTabClose, onNewTab, isDark, windowControls
}: TabBarProps) {
  const isMac = window.electronAPI?.platform === 'darwin' ||
    (typeof navigator !== 'undefined' && /Mac/.test(navigator.platform));

  const tabBg = isDark ? 'bg-[#141416]' : 'bg-[#e4e4eb]';     // distinctly darker than toolbar
  const activeTabBg = isDark ? '#1c1c1e' : '#f2f2f7';         // matches toolbar bg — gives tab "lift"

  return (
    <div className={`h-9 flex items-end shrink-0 drag ${tabBg}`}>

      {/* macOS: leave 80px for native traffic lights (trafficLightPosition x:14 y:12) */}
      {isMac && <div className="shrink-0 h-full" style={{ width: 82 }} />}

      {/* Tabs */}
      <div className="flex items-end flex-1 min-w-0 overflow-hidden gap-px pl-0.5">
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeId}
            isDark={isDark}
            activeTabBg={activeTabBg}
            onClick={() => onTabClick(tab.id)}
            onClose={e => onTabClose(tab.id, e)}
          />
        ))}

        {/* New tab button */}
        <button
          onClick={onNewTab}
          className={`no-drag w-8 h-8 mb-0.5 ml-0.5 rounded-full flex items-center justify-center shrink-0 transition-all ${
            isDark
              ? 'text-white/30 hover:text-white/65 hover:bg-white/8'
              : 'text-black/30 hover:text-black/65 hover:bg-black/8'
          }`}
          title="New tab"
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Windows / Linux window controls — right-aligned in tab bar */}
      {windowControls && (
        <div className="flex items-center shrink-0 self-center mr-1 gap-0.5 no-drag">
          {/* Minimize */}
          <WinCtrlBtn
            onClick={windowControls.onMinimize}
            hoverColor="rgba(255,255,255,0.1)"
            isDark={isDark}
          >
            <span style={{ fontSize: 14, lineHeight: 1, display: 'block', marginBottom: 3 }}>─</span>
          </WinCtrlBtn>
          {/* Maximize */}
          <WinCtrlBtn
            onClick={windowControls.onMaximize}
            hoverColor="rgba(255,255,255,0.1)"
            isDark={isDark}
          >
            <span style={{ fontSize: 11, lineHeight: 1, display: 'block', border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'}`, width: 10, height: 10 }} />
          </WinCtrlBtn>
          {/* Close */}
          <WinCtrlBtn
            onClick={windowControls.onClose}
            hoverColor="rgba(220,50,50,0.85)"
            hoverTextColor="#fff"
            isDark={isDark}
          >
            <X size={13} strokeWidth={2.5} />
          </WinCtrlBtn>
        </div>
      )}
    </div>
  );
}

function WinCtrlBtn({ children, onClick, hoverColor, hoverTextColor, isDark }: {
  children: React.ReactNode;
  onClick?: () => void;
  hoverColor: string;
  hoverTextColor?: string;
  isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="no-drag w-10 h-8 flex items-center justify-center transition-all"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hoverColor;
        if (hoverTextColor) e.currentTarget.style.color = hoverTextColor;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
      }}
    >
      {children}
    </button>
  );
}

function Tab({ tab, isActive, isDark, activeTabBg, onClick, onClose }: {
  tab: TabEntry; isActive: boolean; isDark: boolean;
  activeTabBg: string;
  onClick: () => void; onClose: (e: React.MouseEvent) => void;
  key?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        no-drag group relative flex items-center gap-2 h-9 px-3 cursor-pointer
        rounded-tl-lg rounded-tr-lg flex-1 min-w-[44px] max-w-[220px] transition-all select-none overflow-hidden
      `}
      style={{
        background: isActive
          ? activeTabBg
          : 'transparent',
        color: isActive
          ? isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.82)'
          : isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)',
        zIndex: isActive ? 10 : 0,
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.background = isDark ? '#202024' : '#d0d0d8';
          (e.currentTarget as HTMLDivElement).style.color = isDark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.72)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          (e.currentTarget as HTMLDivElement).style.color = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)';
        }
      }}
    >
      {/* Bottom bridge — seamless connection with toolbar */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: activeTabBg }} />
      )}

      {/* Favicon */}
      <div className="w-4 h-4 shrink-0 flex items-center justify-center">
        {tab.isLoading ? (
          <div className={`w-3 h-3 border rounded-full border-t-transparent animate-spin ${isDark ? 'border-white/30' : 'border-black/30'}`} />
        ) : tab.type === 'ens' ? (
          <div className="w-2.5 h-2.5 rounded-full bg-[#00FF87]/30 ring-1 ring-[#00FF87]/70" />
        ) : tab.type === 'ipfs' || tab.type === 'ipns' ? (
          <div className="w-2.5 h-2.5 rounded-full bg-[#00D1FF]/30 ring-1 ring-[#00D1FF]/70" />
        ) : tab.url === NEW_TAB ? (
          <Globe size={12} strokeWidth={1.8} className={isDark ? 'text-white/55' : 'text-black/50'} />
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
          isDark
            ? 'opacity-0 group-hover:opacity-100 hover:bg-white/15 text-white/60'
            : 'opacity-0 group-hover:opacity-100 hover:bg-black/10 text-black/50'
        }`}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </div>
  );
}
