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
  isFullscreen?: boolean;
  isMaximized?: boolean;
  windowControls?: WindowControls; // only set on non-macOS Electron
}

export default function TabBar({
  tabs, activeId, onTabClick, onTabClose, onNewTab, isDark, 
  isFullscreen = false, isMaximized = false, windowControls
}: TabBarProps) {
  const isMac = window.electronAPI?.platform === 'darwin' ||
    (typeof navigator !== 'undefined' && /Mac/.test(navigator.platform));

  const tabBg = isDark ? 'bg-[#1e1f24]' : 'bg-[#e4e4eb]';
  const activeTabBg = isDark ? '#2b2c31' : '#f2f2f7';

  return (
    <div className={`h-[36px] flex items-end shrink-0 drag ${tabBg} relative`}>

      {/* macOS: traffic lights area */}
      {isMac && (
        <div 
          className="shrink-0 h-full transition-all duration-200 ease-in-out" 
          style={{ width: isFullscreen ? 0 : 80 }} 
        />
      )}

      {/* Tabs Container */}
      <div className="flex items-end flex-1 min-w-0 overflow-hidden px-1 h-full pt-1">
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
        <div className="flex items-center h-full pb-1 px-1">
          <button
            onClick={onNewTab}
            className={`no-drag w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all ${
              isDark
                ? 'text-[#9a9ba5] hover:text-[#e6e7e8] hover:bg-[#3b3c42]'
                : 'text-black/40 hover:text-black/80 hover:bg-black/10'
            }`}
            title="New tab"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Windows / Linux window controls */}
      {windowControls && (
        <div className="flex items-center shrink-0 self-start no-drag h-[32px]">
          <WinCtrlBtn
            onClick={windowControls.onMinimize}
            hoverColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
            isDark={isDark}
          >
             <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
                <rect width="10" height="1" fill="currentColor"/>
             </svg>
          </WinCtrlBtn>
          <button
            onClick={windowControls.onMaximize}
            className="w-[46px] h-[32px] flex items-center justify-center transition-colors"
            style={{ color: isDark ? '#e6e7e8' : 'black' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 0V1H1V8H8V6H9V9H0V0H3Z" fill="currentColor"/>
                <path d="M10 1H2V10H10V1ZM9 9H3V2H9V9Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M0 0V10H10V0H0ZM9 9H1V1H9V9Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          <WinCtrlBtn
            onClick={windowControls.onClose}
            hoverColor="#e81123"
            hoverTextColor="#fff"
            isDark={isDark}
          >
            <X size={16} strokeWidth={1.5} />
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
      className="w-[46px] h-[32px] flex items-center justify-center transition-colors"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isDark ? 'white' : 'black' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hoverColor;
        if (hoverTextColor) e.currentTarget.style.color = hoverTextColor;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = isDark ? 'white' : 'black';
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
        no-drag group relative flex items-center h-[28px] px-3 cursor-pointer
        rounded-t-lg flex-1 min-w-[44px] max-w-[240px] transition-all select-none overflow-hidden
        mb-px mx-[1px]
      `}
      style={{
        background: isActive ? activeTabBg : 'transparent',
        color: isActive
          ? isDark ? '#e6e7e8' : 'rgba(0,0,0,0.85)'
          : isDark ? '#9a9ba5' : 'rgba(0,0,0,0.50)',
        zIndex: isActive ? 10 : 0,
      }}
    >
      {/* Favicon */}
      <div className="w-4 h-4 shrink-0 flex items-center justify-center mr-2">
        {tab.isLoading ? (
          <div className={`w-3 h-3 border-2 rounded-full border-t-transparent animate-spin ${isDark ? 'border-white/30' : 'border-black/30'}`} />
        ) : tab.url === NEW_TAB ? (
          <div className="w-4 h-4 flex items-center justify-center">
             <div className="w-3.5 h-3.5 rounded-sm bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">O</div>
          </div>
        ) : (
          <Globe size={14} strokeWidth={2} />
        )}
      </div>

      {/* Title */}
      <span className="text-[12px] font-medium leading-none truncate flex-1 min-w-0 pr-4">
        {tab.title || 'New Tab'}
      </span>

      {/* Close Button */}
      <button
        onClick={e => { e.stopPropagation(); onClose(e); }}
        className={`absolute right-1.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
          isDark
            ? 'opacity-0 group-hover:opacity-100 hover:bg-[#3b3c42] text-[#9a9ba5] hover:text-[#e6e7e8]'
            : 'opacity-0 group-hover:opacity-100 hover:bg-black/10 text-black/50'
        } ${isActive ? 'opacity-100' : ''}`}
      >
        <X size={12} strokeWidth={2.5} />
      </button>

      {/* Active Tab Indicator Line - Subtle bottom bridge */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 opacity-0" />
      )}
    </div>
  );
}
