import React, { useRef, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, RotateCcw, Search, Lock, Globe,
  Shield, Sun, Moon, MoreHorizontal, Wallet, X
} from 'lucide-react';

import TabBar          from './TabBar';
import WebView, { WebViewHandle } from './WebView';
import WalletPanel     from './WalletPanel';
import NewTab          from '../pages/NewTab';
import WalletModal     from './modals/WalletModal';

import { useTabsStore, NEW_TAB }  from '../store/tabs';
import { useSettings }            from '../store/settings';
import { useWalletStore }         from '../store/wallet';
import { useRuntimeStore }        from '../store/runtime';

const SETTINGS_URL = 'orivon://settings';

function resolveDisplay(url: string): string {
  if (!url || url === NEW_TAB || url === SETTINGS_URL) return '';
  return url;
}

function isSecureURL(url: string) {
  return url.startsWith('https://') || url.endsWith('.eth') ||
    url.startsWith('ipfs://') || url.startsWith('ipns://') ||
    url.startsWith('orivon://');
}

function Web3ScoreBadge({ url, isDark }: { url: string; isDark: boolean }) {
  const isEns  = url.endsWith('.eth');
  const isIpfs = url.startsWith('ipfs://') || url.startsWith('ipns://');
  const score  = isEns ? 97 : isIpfs ? 95 : url.startsWith('https://') ? 85 : 60;
  const color  = score >= 90 ? '#00FF87' : score >= 70 ? '#facc15' : '#f87171';
  return (
    <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>{score}</span>
  );
}

interface BrowserProps {
  onOpenDashboard?: () => void;
}

export default function Browser({ onOpenDashboard }: BrowserProps = {}) {
  const { tabs, activeTabId, addTab, closeTab, updateTab, navigateTab, goBack, goForward, setActiveTab } = useTabsStore();
  const { theme, setTheme, rightPanelOpen, setRightPanelOpen, showWeb3Scores } = useSettings();
  const { status: walletStatus, addresses } = useWalletStore();
  const { addLog } = useRuntimeStore();

  const webviewRefs = useRef<Record<string, WebViewHandle | null>>({});
  const addrRef     = useRef<HTMLInputElement>(null);

  const [addrInput, setAddrInput]     = useState('');
  const [isEditing, setIsEditing]     = useState(false);
  const [walletOpen, setWalletOpen]   = useState(false);
  const [walletModal, setWalletModal] = useState<null | 'create' | 'import' | 'unlock'>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  const isDark    = theme === 'dark';
  const isMac     = window.electronAPI?.platform === 'darwin';

  // Sync address bar with active tab
  useEffect(() => {
    if (!isEditing) setAddrInput(activeTab ? resolveDisplay(activeTab.url) : '');
  }, [activeTabId, activeTab?.url, isEditing]);

  // ── Navigate ──────────────────────────────────────────────────────────────

  const navigate = useCallback(async (raw: string, tabId = activeTabId) => {
    const input = raw.trim();
    if (!input) return;
    setIsEditing(false);

    // Resolve URL
    let url = input;
    let type: ReturnType<typeof useTabsStore.getState>['tabs'][0]['type'] = 'https';

    if (window.electronAPI?.resolveURL) {
      const r = await window.electronAPI.resolveURL(input);
      if (r.ok) { url = r.url; type = r.type as typeof type; }
    } else {
      if (input.endsWith('.eth'))                         { url = `https://${input}.limo`; type = 'ens'; }
      else if (input.startsWith('ipfs://'))               { url = `https://ipfs.io/ipfs/${input.slice(7)}`; type = 'ipfs'; }
      else if (input.startsWith('ipns://'))               { url = `https://ipfs.io/ipns/${input.slice(7)}`; type = 'ipns'; }
      else if (input.startsWith('http://') || input.startsWith('https://')) { url = input; type = input.startsWith('https') ? 'https' : 'http'; }
      else if (input.includes('.') && !input.includes(' ')) { url = `https://${input}`; type = 'https'; }
      else { url = `https://www.google.com/search?q=${encodeURIComponent(input)}`; type = 'search'; }
    }

    navigateTab(tabId, url, input, type);
    setAddrInput(input);
    webviewRefs.current[tabId]?.loadURL(url);
    addLog(`→ ${url}`);
  }, [activeTabId, navigateTab, addLog]);

  const handleBack    = () => { const url = goBack(activeTabId);    if (url) { webviewRefs.current[activeTabId]?.goBack();    } };
  const handleForward = () => { const url = goForward(activeTabId); if (url) { webviewRefs.current[activeTabId]?.goForward(); } };
  const handleReload  = () => webviewRefs.current[activeTabId]?.reload();

  const handleAddrSubmit = (e: React.FormEvent) => { e.preventDefault(); navigate(addrInput); };

  const handleTabClose = (id: string, e: React.MouseEvent) => { e.stopPropagation(); closeTab(id); };

  const canBack    = (activeTab?.historyIndex ?? 0) > 0;
  const canForward = activeTab ? activeTab.historyIndex < activeTab.history.length - 1 : false;

  // Webview event wiring
  const makeCallbacks = (tabId: string) => ({
    onDidNavigate: (url: string) => { updateTab(tabId, { url, displayUrl: url, isLoading: false }); if (!isEditing && tabId === activeTabId) setAddrInput(url); },
    onTitleUpdate: (title: string) => updateTab(tabId, { title }),
    onLoadStart:   ()              => updateTab(tabId, { isLoading: true }),
    onLoadStop:    ()              => updateTab(tabId, { isLoading: false }),
    onLoadFail:    (_c: number, _d: string) => updateTab(tabId, { isLoading: false }),
    onNewWindow:   (url: string)   => { const id = addTab(url); setTimeout(() => navigate(url, id), 10); },
  });

  // ── Colors ────────────────────────────────────────────────────────────────
  const tabBarBg   = isDark ? 'bg-[#0f0f0f]' : 'bg-[#d8d8d8]';
  const toolbarBg  = isDark ? 'bg-[#1a1a1a] border-white/[0.07]' : 'bg-[#f5f5f5] border-black/[0.07]';
  const addrBarBg  = isDark ? 'bg-[#111] hover:bg-[#141414] focus-within:bg-[#0d0d0d]' : 'bg-white/70 hover:bg-white focus-within:bg-white';
  const btnBase    = isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/8' : 'text-black/40 hover:text-black/70 hover:bg-black/7';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-black'}`}>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <TabBar
        tabs={tabs}
        activeId={activeTabId}
        onTabClick={setActiveTab}
        onTabClose={handleTabClose}
        onNewTab={() => addTab()}
        isDark={isDark}
      />

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className={`h-11 flex items-center gap-1.5 px-2 border-b ${toolbarBg} shrink-0`}>

        {/* Nav controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <NavBtn onClick={handleBack}   disabled={!canBack}    isDark={isDark}><ArrowLeft  size={15} /></NavBtn>
          <NavBtn onClick={handleForward} disabled={!canForward} isDark={isDark}><ArrowRight size={15} /></NavBtn>
          <NavBtn onClick={activeTab?.isLoading ? () => webviewRefs.current[activeTabId]?.stop() : handleReload} isDark={isDark}>
            <RotateCcw size={13} className={activeTab?.isLoading ? 'animate-spin' : ''} />
          </NavBtn>
        </div>

        {/* Address bar */}
        <form onSubmit={handleAddrSubmit} className="flex-1 mx-1.5 no-drag">
          <div className={`relative flex items-center h-8 rounded-xl transition-all ${addrBarBg}`}>
            <div className="absolute left-3 pointer-events-none">
              {!activeTab || activeTab.url === NEW_TAB
                ? <Search size={12} className={isDark ? 'text-white/25' : 'text-black/25'} />
                : isSecureURL(activeTab.url)
                  ? <Lock size={11} className="text-[#00FF87]/70" />
                  : <Globe size={12} className={isDark ? 'text-white/25' : 'text-black/25'} />
              }
            </div>
            <input
              ref={addrRef}
              type="text"
              value={isEditing ? addrInput : (activeTab ? resolveDisplay(activeTab.url) : '')}
              onChange={e => setAddrInput(e.target.value)}
              onFocus={() => { setIsEditing(true); setAddrInput(activeTab ? resolveDisplay(activeTab.url) : ''); setTimeout(() => addrRef.current?.select(), 20); }}
              onBlur={() => setIsEditing(false)}
              placeholder="Search or enter URL · .eth · ipfs://"
              className="w-full h-full bg-transparent pl-8 pr-12 text-[12.5px] font-mono focus:outline-none placeholder:text-current placeholder:opacity-25"
            />
            {/* ENS/IPFS badge */}
            {activeTab?.type === 'ens'  && !isEditing && <span className="absolute right-3 text-[9px] font-bold text-[#00FF87]/60 tracking-widest pointer-events-none">ENS</span>}
            {(activeTab?.type === 'ipfs' || activeTab?.type === 'ipns') && !isEditing && <span className="absolute right-3 text-[9px] font-bold text-[#00D1FF]/60 tracking-widest pointer-events-none">IPFS</span>}
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-0.5 shrink-0 relative no-drag">

          {/* Web3 score */}
          {showWeb3Scores && activeTab && activeTab.url !== NEW_TAB && (
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className={`no-drag flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11px] font-medium transition-all ${
                rightPanelOpen ? 'bg-[#00FF87]/12 text-[#00FF87]' : btnBase
              }`}
              title="Web3 security panel"
            >
              <Shield size={13} />
              <Web3ScoreBadge url={activeTab.url} isDark={isDark} />
            </button>
          )}

          {/* Theme */}
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`no-drag w-8 h-8 rounded-lg flex items-center justify-center transition-all ${btnBase}`} title="Toggle theme">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Wallet */}
          <div className="relative">
            <button
              onClick={() => setWalletOpen(p => !p)}
              className={`no-drag flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium transition-all ${
                walletStatus === 'unlocked'
                  ? 'text-[#00FF87] bg-[#00FF87]/10 hover:bg-[#00FF87]/18'
                  : btnBase
              }`}
              title="Wallet"
            >
              <Wallet size={14} />
              {walletStatus === 'unlocked' && addresses
                ? <span className="font-mono">{addresses.eth.slice(0, 6)}…</span>
                : walletStatus === 'locked'
                  ? <Lock size={11} />
                  : <span className="text-[11px]">Connect</span>
              }
            </button>
            <AnimatePresence>
              {walletOpen && (
                <WalletPanel
                  onClose={() => setWalletOpen(false)}
                  onOpenWalletModal={(mode) => { setWalletModal(mode); setWalletOpen(false); }}
                  onOpenDashboard={onOpenDashboard ? () => { setWalletOpen(false); onOpenDashboard(); } : undefined}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Three-dot */}
          <button className={`no-drag w-8 h-8 rounded-lg flex items-center justify-center transition-all ${btnBase}`}>
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Main webview area */}
        <div className="flex-1 relative">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className="absolute inset-0"
              style={{
                // Keep ALL tabs rendered — never use visibility:hidden or display:none
                // on a tab that has a WebView. Chromium will pause media (e.g. YouTube)
                // if the element is hidden. z-index + pointer-events is the correct approach.
                zIndex: tab.id === activeTabId ? 1 : 0,
                pointerEvents: tab.id === activeTabId ? 'auto' : 'none',
              }}
            >
              {tab.url === NEW_TAB ? (
                <NewTab onNavigate={url => navigate(url, tab.id)} />
              ) : (
                <WebView
                  ref={el => { webviewRefs.current[tab.id] = el; }}
                  src={tab.url}
                  {...makeCallbacks(tab.id)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Web3 score right panel */}
        <AnimatePresence>
          {rightPanelOpen && showWeb3Scores && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={`shrink-0 overflow-hidden border-l ${isDark ? 'bg-[#111] border-white/[0.07]' : 'bg-white border-black/[0.07]'}`}
            >
              <Web3ScorePanel tab={activeTab} isDark={isDark} onClose={() => setRightPanelOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wallet modals */}
      <AnimatePresence>
        {walletModal && (
          <WalletModal
            mode={walletModal}
            onClose={() => setWalletModal(null)}
            onSuccess={() => setWalletModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function NavBtn({ children, onClick, disabled, isDark }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`no-drag w-8 h-8 rounded-lg flex items-center justify-center transition-all
        ${isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/8' : 'text-black/40 hover:text-black/70 hover:bg-black/7'}
        disabled:opacity-25 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Web3ScorePanel({ tab, isDark, onClose }: { tab?: ReturnType<typeof useTabsStore.getState>['tabs'][0]; isDark: boolean; onClose: () => void }) {
  const isEns  = tab?.type === 'ens';
  const isIpfs = tab?.type === 'ipfs' || tab?.type === 'ipns';
  const scores = [
    { label: 'Trust',    value: isEns ? 97 : isIpfs ? 95 : 85, color: '#00FF87' },
    { label: 'Security', value: isEns ? 94 : isIpfs ? 92 : 80, color: '#00D1FF' },
    { label: 'Privacy',  value: isEns ? 92 : isIpfs ? 90 : 76, color: '#a78bfa' },
  ];
  const muted = isDark ? 'text-white/35' : 'text-black/35';

  return (
    <div className="p-4 h-full overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${muted}`}>Web3 Score</span>
        <button onClick={onClose} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'hover:bg-white/8 text-white/35' : 'hover:bg-black/6 text-black/35'} transition-all`}>
          <X size={12} />
        </button>
      </div>
      <div className="space-y-3.5">
        {scores.map(s => (
          <div key={s.label} className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className={muted}>{s.label}</span>
              <span className="font-semibold" style={{ color: s.color }}>{s.value}</span>
            </div>
            <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
            </div>
          </div>
        ))}
      </div>
      {tab && tab.url !== NEW_TAB && (
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/[0.07]' : 'border-black/[0.07]'} space-y-2`}>
          <InfoRow label="Protocol" value={isEns ? 'ENS/IPFS' : tab.url.startsWith('https') ? 'HTTPS' : 'HTTP'} isDark={isDark} />
          <InfoRow label="Tracking" value="Blocked (12)" isDark={isDark} />
          {isEns && <InfoRow label="Censorship" value="Resistant" isDark={isDark} color="#00FF87" />}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, isDark, color }: { label: string; value: string; isDark: boolean; color?: string }) {
  const muted = isDark ? 'text-white/35' : 'text-black/35';
  return (
    <div className="flex justify-between text-[11px]">
      <span className={muted}>{label}</span>
      <span className={`font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`} style={color ? { color } : {}}>{value}</span>
    </div>
  );
}
