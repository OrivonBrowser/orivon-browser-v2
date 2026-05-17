import React, { useRef, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, RotateCcw, Search, Lock, Globe,
  Shield, Wallet, X, Star, User, AlignJustify,
  Plus, Square, History, Bookmark, Download, Trash2,
  Printer, FileSearch, LayoutGrid, HelpCircle, Settings,
  ZoomIn, ZoomOut, Maximize2, ChevronRight, Sun, Moon,
  Monitor
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

function web3Score(url: string) {
  if (!url || url === NEW_TAB) return null;
  if (url.endsWith('.eth') || url.startsWith('ipfs://')) return 97;
  if (url.startsWith('https://')) return 85;
  return 60;
}

interface BrowserProps { onOpenDashboard?: () => void; }

export default function Browser({ onOpenDashboard }: BrowserProps = {}) {
  const { tabs, activeTabId, addTab, closeTab, updateTab, navigateTab, goBack, goForward, setActiveTab } = useTabsStore();
  const { theme, setTheme, rightPanelOpen, setRightPanelOpen, showWeb3Scores } = useSettings();
  const { status: walletStatus, addresses } = useWalletStore();
  const { addLog } = useRuntimeStore();

  const webviewRefs = useRef<Record<string, WebViewHandle | null>>({});
  const addrRef     = useRef<HTMLInputElement>(null);
  const menuRef     = useRef<HTMLDivElement>(null);

  const [addrInput, setAddrInput]     = useState('');
  const [isEditing, setIsEditing]     = useState(false);
  const [walletOpen, setWalletOpen]   = useState(false);
  const [walletModal, setWalletModal] = useState<null | 'create' | 'import' | 'unlock'>(null);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [zoom, setZoom]               = useState(100);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  const isDark    = theme === 'dark';
  const isMac     = window.electronAPI?.platform === 'darwin';
  const isElectron = !!window.electronAPI?.isElectron;
  const score     = activeTab ? web3Score(activeTab.url) : null;

  // Close burger menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isEditing) setAddrInput(activeTab ? resolveDisplay(activeTab.url) : '');
  }, [activeTabId, activeTab?.url, isEditing]);

  // ── Navigate ──────────────────────────────────────────────────────────────
  const navigate = useCallback(async (raw: string, tabId = activeTabId) => {
    const input = raw.trim();
    if (!input) return;
    setIsEditing(false);

    let url = input;
    let type: ReturnType<typeof useTabsStore.getState>['tabs'][0]['type'] = 'https';

    if (window.electronAPI?.resolveURL) {
      const r = await window.electronAPI.resolveURL(input);
      if (r.ok) { url = r.url; type = r.type as typeof type; }
    } else {
      if (input.endsWith('.eth'))                               { url = `https://${input}.limo`; type = 'ens'; }
      else if (input.startsWith('ipfs://'))                    { url = `https://ipfs.io/ipfs/${input.slice(7)}`; type = 'ipfs'; }
      else if (input.startsWith('http://') || input.startsWith('https://')) { url = input; type = input.startsWith('https') ? 'https' : 'http'; }
      else if (input.includes('.') && !input.includes(' '))    { url = `https://${input}`; type = 'https'; }
      else { url = `https://www.google.com/search?q=${encodeURIComponent(input)}`; type = 'search'; }
    }

    navigateTab(tabId, url, input, type);
    setAddrInput(input);
    webviewRefs.current[tabId]?.loadURL(url);
    addLog(`→ ${url}`);
  }, [activeTabId, navigateTab, addLog]);

  const handleBack    = () => { const url = goBack(activeTabId);    if (url) webviewRefs.current[activeTabId]?.goBack(); };
  const handleForward = () => { const url = goForward(activeTabId); if (url) webviewRefs.current[activeTabId]?.goForward(); };
  const handleReload  = () => webviewRefs.current[activeTabId]?.reload();
  const handleAddrSubmit = (e: React.FormEvent) => { e.preventDefault(); navigate(addrInput); };
  const handleTabClose   = (id: string, e: React.MouseEvent) => { e.stopPropagation(); closeTab(id); };

  const canBack    = (activeTab?.historyIndex ?? 0) > 0;
  const canForward = activeTab ? activeTab.historyIndex < activeTab.history.length - 1 : false;

  const makeCallbacks = (tabId: string) => ({
    onDidNavigate: (url: string) => { updateTab(tabId, { url, displayUrl: url, isLoading: false }); if (!isEditing && tabId === activeTabId) setAddrInput(url); },
    onTitleUpdate: (title: string) => updateTab(tabId, { title }),
    onLoadStart:   ()              => updateTab(tabId, { isLoading: true }),
    onLoadStop:    ()              => updateTab(tabId, { isLoading: false }),
    onLoadFail:    (_c: number, _d: string) => updateTab(tabId, { isLoading: false }),
    onNewWindow:   (url: string)   => { const id = addTab(url); setTimeout(() => navigate(url, id), 10); },
  });

  // ── Colors ────────────────────────────────────────────────────────────────
  const toolbarBg = isDark
    ? 'bg-[#1a1a1a] border-white/[0.07]'
    : 'bg-[#f0f0f0] border-black/[0.07]';
  const addrBg = isDark
    ? 'bg-[#111] hover:bg-[#141414] focus-within:bg-[#0d0d0d]'
    : 'bg-white/80 hover:bg-white focus-within:bg-white';
  const btn = isDark
    ? 'text-white/45 hover:text-white/80 hover:bg-white/8'
    : 'text-black/45 hover:text-black/80 hover:bg-black/7';
  const sep = isDark ? 'bg-white/12' : 'bg-black/12';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'bg-[#0f0f0f] text-white' : 'bg-[#e8e8e8] text-black'}`}>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <TabBar
        tabs={tabs}
        activeId={activeTabId}
        onTabClick={setActiveTab}
        onTabClose={handleTabClose}
        onNewTab={() => addTab()}
        isDark={isDark}
        // Pass window controls for non-macOS
        windowControls={!isMac && isElectron ? {
          onMinimize: () => window.electronAPI?.window.minimize(),
          onMaximize: () => window.electronAPI?.window.maximize(),
          onClose:    () => window.electronAPI?.window.close(),
        } : undefined}
      />

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className={`h-10 flex items-center gap-1 px-2 border-b ${toolbarBg} shrink-0`}>

        {/* Back / Forward / Reload */}
        <NavBtn onClick={handleBack}   disabled={!canBack}    isDark={isDark}><ArrowLeft  size={14} /></NavBtn>
        <NavBtn onClick={handleForward} disabled={!canForward} isDark={isDark}><ArrowRight size={14} /></NavBtn>
        <NavBtn onClick={activeTab?.isLoading ? () => webviewRefs.current[activeTabId]?.stop() : handleReload} isDark={isDark}>
          <RotateCcw size={13} className={activeTab?.isLoading ? 'animate-spin' : ''} />
        </NavBtn>

        {/* Address bar */}
        <form onSubmit={handleAddrSubmit} className="flex-1 mx-2 no-drag">
          <div className={`relative flex items-center h-8 rounded-2xl transition-all ${addrBg}`}>
            <div className="absolute left-3 pointer-events-none">
              {!activeTab || activeTab.url === NEW_TAB
                ? <Shield size={13} color="#FB5B22" />
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
              className="w-full h-full bg-transparent pl-8 pr-10 text-[12.5px] font-mono focus:outline-none placeholder:text-current placeholder:opacity-20"
            />
            {activeTab?.type === 'ens'                               && !isEditing && <span className="absolute right-3 text-[9px] font-bold text-[#00FF87]/60 tracking-widest pointer-events-none">ENS</span>}
            {(activeTab?.type === 'ipfs' || activeTab?.type === 'ipns') && !isEditing && <span className="absolute right-3 text-[9px] font-bold text-[#00D1FF]/60 tracking-widest pointer-events-none">IPFS</span>}
          </div>
        </form>

        {/* ── Right icons ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 shrink-0 no-drag">

          {/* Bookmark */}
          <NavBtn isDark={isDark} title="Bookmark"><Star size={15} /></NavBtn>

          {/* Separator */}
          <div className={`w-px h-5 ${sep} mx-1`} />

          {/* Wallet */}
          <div className="relative">
            <button
              onClick={() => setWalletOpen(p => !p)}
              title="Orivon Wallet"
              className={`no-drag flex items-center justify-center h-8 w-9 rounded-lg transition-all ${
                walletOpen
                  ? isDark ? 'bg-white/12 text-white/90' : 'bg-black/8 text-black/80'
                  : btn
              }`}
            >
              <Wallet size={15} />
            </button>
            <AnimatePresence>
              {walletOpen && (
                <WalletPanel
                  onClose={() => setWalletOpen(false)}
                  onOpenWalletModal={mode => { setWalletModal(mode); setWalletOpen(false); }}
                  onOpenDashboard={onOpenDashboard ? () => { setWalletOpen(false); onOpenDashboard(); } : undefined}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Orivon score (shield) */}
          {showWeb3Scores && score !== null && (
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              title={`Web3 Score: ${score}`}
              className={`no-drag flex items-center gap-1 h-8 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                rightPanelOpen ? 'bg-[#00FF87]/12 text-[#00FF87]' : btn
              }`}
            >
              <Shield size={14} />
              <span style={{ color: score >= 90 ? '#00FF87' : score >= 70 ? '#facc15' : '#f87171' }}>{score}</span>
            </button>
          )}

          {/* Profile circle */}
          <button
            onClick={() => onOpenDashboard?.()}
            title="Dashboard"
            className={`no-drag w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
              isDark
                ? 'border-white/20 text-white/50 hover:text-white/80 hover:bg-white/8'
                : 'border-black/20 text-black/50 hover:text-black/80 hover:bg-black/6'
            }`}
          >
            <User size={14} />
          </button>

          {/* Burger menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(p => !p)}
              title="Menu"
              className={`no-drag w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                menuOpen
                  ? isDark ? 'bg-white/10 text-white' : 'bg-black/8 text-black'
                  : btn
              }`}
            >
              <AlignJustify size={16} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <BurgerMenu
                  isDark={isDark}
                  zoom={zoom}
                  onZoomIn={() => setZoom(z => Math.min(z + 10, 200))}
                  onZoomOut={() => setZoom(z => Math.max(z - 10, 25))}
                  onNewTab={() => { addTab(); setMenuOpen(false); }}
                  onDashboard={() => { onOpenDashboard?.(); setMenuOpen(false); }}
                  onWallet={() => { setWalletOpen(true); setMenuOpen(false); }}
                  onTheme={() => { setTheme(isDark ? 'light' : 'dark'); setMenuOpen(false); }}
                  isDarkMode={isDark}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden flex">
        <div className="flex-1 relative">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className="absolute inset-0"
              style={{
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

        {/* Right Web3 panel */}
        <AnimatePresence>
          {rightPanelOpen && showWeb3Scores && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className={`shrink-0 overflow-hidden border-l ${isDark ? 'bg-[#111] border-white/[0.07]' : 'bg-white border-black/[0.07]'}`}
            >
              <Web3Panel score={score} tab={activeTab} isDark={isDark} onClose={() => setRightPanelOpen(false)} />
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

// ─── Burger menu ─────────────────────────────────────────────────────────────

interface BurgerMenuProps {
  isDark: boolean; isDarkMode: boolean; zoom: number;
  onNewTab: () => void; onDashboard: () => void; onWallet: () => void;
  onTheme: () => void; onZoomIn: () => void; onZoomOut: () => void;
  onClose: () => void;
}

function BurgerMenu({ isDark, isDarkMode, zoom, onNewTab, onDashboard, onWallet, onTheme, onZoomIn, onZoomOut, onClose }: BurgerMenuProps) {
  const bg    = isDark ? '#1e1e1e' : '#ffffff';
  const brd   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const txt   = isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.82)';
  const short = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const hover = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';

  const item  = (icon: React.ReactNode, label: string, shortcut: string, action: () => void, chevron?: boolean) => (
    <button
      key={label}
      onClick={action}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '9px 16px', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left', color: txt, fontSize: 13,
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = hover; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
    >
      <span style={{ width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {shortcut && <span style={{ fontSize: 11, color: short }}>{shortcut}</span>}
      {chevron && <ChevronRight size={13} style={{ color: short }} />}
    </button>
  );

  const divider = () => <div style={{ height: 1, background: brd, margin: '4px 0' }} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute', top: 40, right: 0, width: 320, zIndex: 200,
        background: bg, borderRadius: 14,
        border: `1px solid ${brd}`,
        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        overflow: 'hidden', paddingBottom: 4,
      }}
    >
      {/* Section 1 — New windows */}
      <div style={{ paddingTop: 4 }}>
        {item(<Plus size={16} />,         'New Tab',            '⌘T',  onNewTab)}
        {item(<Square size={15} />,        'New Window',         '⌘N',  () => onClose())}
        {item(<Lock size={14} />,          'New Private Window', '⇧⌘N', () => onClose())}
      </div>
      {divider()}

      {/* Section 2 — Orivon features */}
      {item(<LayoutGrid size={15} />, 'Dashboard', '', onDashboard)}
      {item(<Wallet size={15} />,     'Orivon Wallet', '', onWallet)}
      {item(isDarkMode ? <Sun size={15} /> : <Moon size={15} />, isDarkMode ? 'Light mode' : 'Dark mode', '', onTheme)}
      {divider()}

      {/* Section 3 — Browser tools */}
      {item(<History size={15} />,  'History',             '⌘Y',  () => onClose(), true)}
      {item(<Bookmark size={15} />, 'Bookmarks',           '',    () => onClose(), true)}
      {item(<Download size={15} />, 'Downloads',           '⌥⌘L', () => onClose())}
      {item(<Trash2  size={14} />,  'Delete Browsing Data…','⇧⌘⌫', () => onClose())}
      {divider()}

      {/* Zoom row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px', gap: 12 }}>
        <ZoomIn size={16} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
        <span style={{ flex: 1, fontSize: 13, color: txt }}>Zoom</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: `1px solid ${brd}`, borderRadius: 8, overflow: 'hidden' }}>
          {[
            { icon: <ZoomOut size={13} />, action: onZoomOut },
            { icon: <span style={{ fontSize: 12, padding: '0 10px', minWidth: 52, textAlign: 'center' }}>{zoom}%</span>, action: () => {} },
            { icon: <ZoomIn  size={13} />, action: onZoomIn  },
            { icon: <Maximize2 size={12} />, action: () => {} },
          ].map((b, i) => (
            <button key={i} onClick={b.action} style={{ padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', color: txt, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.1s', borderLeft: i > 0 ? `1px solid ${brd}` : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = hover; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              {b.icon}
            </button>
          ))}
        </div>
      </div>
      {divider()}

      {/* Section 4 — Print / Find */}
      {item(<Printer    size={15} />, 'Print…',       '⌘P', () => onClose())}
      {item(<FileSearch size={15} />, 'Find in page', '⌘F', () => onClose())}
      {divider()}

      {/* Section 5 — Help / Settings */}
      {item(<HelpCircle size={15} />, 'Help',     '', () => onClose(), true)}
      {item(<Settings   size={15} />, 'Settings', '⌘,', () => onClose())}
    </motion.div>
  );
}

// ─── NavBtn ───────────────────────────────────────────────────────────────────

function NavBtn({ children, onClick, disabled, isDark, title }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  isDark: boolean; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`no-drag w-8 h-8 rounded-lg flex items-center justify-center transition-all
        ${isDark ? 'text-white/45 hover:text-white/80 hover:bg-white/8' : 'text-black/45 hover:text-black/80 hover:bg-black/7'}
        disabled:opacity-20 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// ─── Web3 Panel ───────────────────────────────────────────────────────────────

function Web3Panel({ score, tab, isDark, onClose }: {
  score: number | null;
  tab?: ReturnType<typeof useTabsStore.getState>['tabs'][0];
  isDark: boolean;
  onClose: () => void;
}) {
  const muted = isDark ? 'text-white/35' : 'text-black/35';
  const scores = [
    { label: 'Trust',    value: score ?? 0, color: '#00FF87' },
    { label: 'Security', value: score ? Math.round(score * 0.97) : 0, color: '#00D1FF' },
    { label: 'Privacy',  value: 96,         color: '#a78bfa' },
  ];
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${muted}`}>Web3 Score</span>
        <button onClick={onClose} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'hover:bg-white/8 text-white/35' : 'hover:bg-black/6 text-black/35'}`}>
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
              <div className="h-full rounded-full" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
            </div>
          </div>
        ))}
      </div>
      {tab && tab.url !== NEW_TAB && (
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/[0.07]' : 'border-black/[0.07]'} space-y-2`}>
          {[
            ['Protocol', tab.type === 'ens' ? 'ENS/IPFS' : 'HTTPS'],
            ['Trackers', 'Blocked (12)'],
            ['Cookies', 'Managed'],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-[11px]">
              <span className={muted}>{l}</span>
              <span className={isDark ? 'text-white/60' : 'text-black/60'}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
