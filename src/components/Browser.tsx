/**
 * Browser — the full desktop browser shell.
 * Composes: toolbar, sidebar, webview area, right panel, status bar.
 * All tab state lives in useTabsStore (Zustand + localStorage).
 */
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, RotateCcw, Plus, Search,
  Lock, Globe, Shield, Wallet, MoreHorizontal,
  ChevronLeft, ChevronRight, Sun, Moon, X
} from 'lucide-react';

import WebView, { WebViewHandle } from './WebView';
import Sidebar      from './Sidebar';
import Web3Panel    from './Web3Panel';
import StatusBar    from './StatusBar';
import NewTab       from '../pages/NewTab';
import SettingsPage from '../pages/Settings';
import WalletModal  from './modals/WalletModal';

import { useTabsStore, NEW_TAB }  from '../store/tabs';
import { useSettings }             from '../store/settings';
import { useWalletStore }          from '../store/wallet';
import { useRuntimeStore }         from '../store/runtime';

const SETTINGS_URL = 'orivon://settings';

// ─── Address bar display helpers ──────────────────────────────────────────────

function isSecure(url: string) {
  return url.startsWith('https://') || url.startsWith('orivon://') ||
    url.endsWith('.eth') || url.startsWith('ipfs://') || url.startsWith('ipns://');
}

function displayAddress(tab: ReturnType<typeof useTabsStore.getState>['tabs'][0]) {
  if (tab.url === NEW_TAB || tab.url === SETTINGS_URL) return '';
  return tab.displayUrl || tab.url;
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Browser() {
  const {
    tabs, activeTabId,
    addTab, closeTab, updateTab, navigateTab, goBack, goForward, setActiveTab,
  } = useTabsStore();

  const {
    theme, setTheme,
    sidebarOpen, setSidebarOpen,
    rightPanelOpen, setRightPanelOpen,
  } = useSettings();

  const { status: walletStatus, addresses } = useWalletStore();
  const { addLog } = useRuntimeStore();

  // Per-tab webview refs
  const webviewRefs = useRef<Record<string, WebViewHandle | null>>({});

  const [addrInput, setAddrInput]       = useState('');
  const [isEditingAddr, setEditingAddr] = useState(false);
  const [walletModal, setWalletModal]   = useState<null | 'create' | 'import' | 'unlock'>(null);
  const addrInputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  const isDark    = theme === 'dark';

  // Sync address bar with active tab
  useEffect(() => {
    if (!isEditingAddr && activeTab) {
      setAddrInput(displayAddress(activeTab));
    }
  }, [activeTabId, activeTab?.url, isEditingAddr]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const navigate = useCallback(async (rawInput: string, tabId = activeTabId) => {
    const input = rawInput.trim();
    if (!input) return;

    setEditingAddr(false);

    // Settings shortcut
    if (input === 'orivon://settings' || input === ':settings') {
      navigateTab(tabId, SETTINGS_URL, 'Settings', 'https');
      return;
    }
    if (input === 'orivon://newtab' || input === ':newtab') {
      navigateTab(tabId, NEW_TAB, 'New Tab', 'newtab');
      return;
    }

    // Use main-process resolver if available, else resolve inline
    let resolvedUrl = input;
    let type: ReturnType<typeof useTabsStore.getState>['tabs'][0]['type'] = 'https';

    if (window.electronAPI?.resolveURL) {
      const result = await window.electronAPI.resolveURL(input);
      if (result.ok) {
        resolvedUrl = result.url;
        type = result.type as typeof type;
      } else {
        addLog(`Resolution failed: ${result.error}`, 'warn');
        type = 'https';
      }
    } else {
      // Fallback resolution (browser dev mode)
      if (input.endsWith('.eth')) {
        resolvedUrl = `https://${input}.limo`;
        type = 'ens';
      } else if (input.startsWith('ipfs://')) {
        resolvedUrl = `https://ipfs.io/ipfs/${input.slice(7)}`;
        type = 'ipfs';
      } else if (input.startsWith('ipns://')) {
        resolvedUrl = `https://ipfs.io/ipns/${input.slice(7)}`;
        type = 'ipns';
      } else if (input.startsWith('http://') || input.startsWith('https://')) {
        resolvedUrl = input;
        type = input.startsWith('https') ? 'https' : 'http';
      } else if (input.includes('.') && !input.includes(' ')) {
        resolvedUrl = `https://${input}`;
        type = 'https';
      } else {
        resolvedUrl = `https://www.google.com/search?q=${encodeURIComponent(input)}`;
        type = 'search';
      }
    }

    navigateTab(tabId, resolvedUrl, input, type);
    setAddrInput(input);

    // Drive the webview
    const wv = webviewRefs.current[tabId];
    if (wv) {
      wv.loadURL(resolvedUrl);
    }

    addLog(`Navigating to: ${resolvedUrl} (${type})`);
  }, [activeTabId, navigateTab, addLog]);

  const handleAddrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(addrInput);
  };

  const handleBack = () => {
    const url = goBack(activeTabId);
    if (url) {
      const wv = webviewRefs.current[activeTabId];
      if (wv) wv.goBack(); else if (url !== NEW_TAB) navigate(url);
    }
  };

  const handleForward = () => {
    const url = goForward(activeTabId);
    if (url) {
      const wv = webviewRefs.current[activeTabId];
      if (wv) wv.goForward(); else if (url !== NEW_TAB) navigate(url);
    }
  };

  const handleReload = () => {
    const wv = webviewRefs.current[activeTabId];
    if (wv) wv.reload();
  };

  const handleNewTab = () => {
    const id = addTab();
    // id is set as activeTabId by the store
  };

  // ── Webview event callbacks ────────────────────────────────────────────────

  const makeWebviewCallbacks = (tabId: string) => ({
    onDidNavigate: (url: string) => {
      updateTab(tabId, { url, displayUrl: url, isLoading: false });
      if (!isEditingAddr && tabId === activeTabId) setAddrInput(url);
      addLog(`Navigated: ${url}`);
    },
    onTitleUpdate: (title: string) => {
      updateTab(tabId, { title });
    },
    onLoadStart: () => updateTab(tabId, { isLoading: true }),
    onLoadStop:  () => updateTab(tabId, { isLoading: false }),
    onLoadFail:  (code: number, desc: string) => {
      updateTab(tabId, { isLoading: false });
      addLog(`Load failed (${code}): ${desc}`, 'warn');
    },
    onNewWindow: (url: string) => {
      const id = addTab(url);
      navigate(url, id);
    },
  });

  // ── Window controls ────────────────────────────────────────────────────────

  const canBack    = (activeTab?.historyIndex ?? 0) > 0;
  const canForward = activeTab
    ? activeTab.historyIndex < (activeTab.history.length - 1)
    : false;

  // ── Layout ─────────────────────────────────────────────────────────────────

  const toolbarBg = isDark ? 'bg-[#1c1c1c] border-white/[0.07]' : 'bg-[#e8e8e8] border-black/[0.07]';
  const textMid   = isDark ? 'text-white/38' : 'text-black/38';
  const textLow   = isDark ? 'text-white/22' : 'text-black/22';
  const btnHover  = isDark ? 'hover:bg-white/8 hover:text-white/70' : 'hover:bg-black/6 hover:text-black/70';

  return (
    <div className={`h-full w-full flex flex-col ${isDark ? 'bg-[#0f0f0f] text-white' : 'bg-[#f5f5f5] text-black'} overflow-hidden`}>

      {/* ── Top Toolbar ──────────────────────────────────────────────────────── */}
      <div className={`h-11 flex items-center gap-1 px-2 border-b ${toolbarBg} shrink-0 drag-region`}>

        {/* macOS / Custom traffic lights area */}
        {window.electronAPI?.platform === 'darwin' && (
          <div className="w-16 shrink-0" /> /* space for native traffic lights */
        )}
        {window.electronAPI?.platform !== 'darwin' && window.electronAPI?.isElectron && (
          <div className="flex items-center gap-1 mr-1">
            <button onClick={() => window.electronAPI?.window.close()}    className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all" />
            <button onClick={() => window.electronAPI?.window.minimize()} className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all" />
            <button onClick={() => window.electronAPI?.window.maximize()} className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all" />
          </div>
        )}

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`w-8 h-8 rounded-md flex items-center justify-center ${textMid} ${btnHover} transition-all`}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>

        <div className={`w-px h-4 ${isDark ? 'bg-white/[0.07]' : 'bg-black/[0.07]'} mx-0.5`} />

        {/* Back / Forward / Reload */}
        <button
          onClick={handleBack} disabled={!canBack}
          className={`w-8 h-8 rounded-md flex items-center justify-center ${textMid} ${btnHover} transition-all disabled:opacity-20 disabled:cursor-not-allowed`}
        >
          <ArrowLeft size={14} />
        </button>
        <button
          onClick={handleForward} disabled={!canForward}
          className={`w-8 h-8 rounded-md flex items-center justify-center ${textMid} ${btnHover} transition-all disabled:opacity-20 disabled:cursor-not-allowed`}
        >
          <ArrowRight size={14} />
        </button>
        <button
          onClick={activeTab?.isLoading
            ? () => webviewRefs.current[activeTabId]?.stop()
            : handleReload
          }
          className={`w-8 h-8 rounded-md flex items-center justify-center ${textMid} ${btnHover} transition-all`}
        >
          <RotateCcw size={13} className={activeTab?.isLoading ? 'animate-spin' : ''} />
        </button>

        {/* Address bar */}
        <form onSubmit={handleAddrSubmit} className="flex-1 mx-2 no-drag">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {!activeTab || activeTab.url === NEW_TAB || activeTab.url === SETTINGS_URL
                ? <Search size={12} className={textLow} />
                : isSecure(activeTab.url)
                  ? <Lock size={11} className="text-[#00FF87]/70" />
                  : <Globe size={12} className={textLow} />
              }
            </div>
            <input
              ref={addrInputRef}
              type="text"
              value={isEditingAddr ? addrInput : (activeTab ? displayAddress(activeTab) : '')}
              onChange={e => setAddrInput(e.target.value)}
              onFocus={() => {
                setEditingAddr(true);
                setAddrInput(activeTab ? displayAddress(activeTab) : '');
                setTimeout(() => addrInputRef.current?.select(), 20);
              }}
              onBlur={() => setEditingAddr(false)}
              placeholder="Search or enter URL · .eth · ipfs://"
              className={`w-full h-8 rounded-lg pl-8 pr-4 text-[12.5px] font-mono focus:outline-none transition-all ${
                isDark
                  ? 'bg-[#111] hover:bg-[#151515] focus:bg-[#0d0d0d] text-white/75 placeholder:text-white/18 focus:border focus:border-white/12'
                  : 'bg-white/70 hover:bg-white focus:bg-white text-black/75 placeholder:text-black/18 focus:border focus:border-black/12'
              } border border-transparent`}
            />
            {activeTab?.type === 'ens' && !isEditingAddr && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#00FF87]/55 tracking-widest pointer-events-none">ENS</span>
            )}
            {(activeTab?.type === 'ipfs' || activeTab?.type === 'ipns') && !isEditingAddr && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#00D1FF]/55 tracking-widest pointer-events-none">IPFS</span>
            )}
          </div>
        </form>

        {/* Right toolbar buttons */}
        <div className="flex items-center gap-0.5 shrink-0">

          {/* Web3 panel toggle */}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            title="Web3 Panel"
            className={`flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all ${
              rightPanelOpen
                ? 'bg-[#00FF87]/15 text-[#00FF87]'
                : `${textMid} ${btnHover}`
            }`}
          >
            <Shield size={13} />
            <span>94</span>
          </button>

          {/* Wallet */}
          <button
            onClick={() => {
              if (walletStatus === 'none')     setWalletModal('create');
              else if (walletStatus === 'locked') setWalletModal('unlock');
            }}
            title={
              walletStatus === 'unlocked' ? `Wallet: ${addresses?.eth.slice(0,6)}…` :
              walletStatus === 'locked'   ? 'Unlock wallet' : 'Connect wallet'
            }
            className={`flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium transition-all ${
              walletStatus === 'unlocked'
                ? 'text-[#00FF87] bg-[#00FF87]/10 hover:bg-[#00FF87]/18'
                : `${textMid} ${btnHover}`
            }`}
          >
            <Wallet size={13} />
            {walletStatus === 'unlocked'
              ? <span>{addresses?.eth.slice(0, 6)}…</span>
              : walletStatus === 'locked'
                ? <Lock size={11} />
                : <span>Connect</span>
            }
          </button>

          {/* Theme */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`w-8 h-8 rounded-md flex items-center justify-center ${textMid} ${btnHover} transition-all`}
            title="Toggle theme"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* New tab */}
          <button
            onClick={handleNewTab}
            className={`w-8 h-8 rounded-md flex items-center justify-center ${textMid} ${btnHover} transition-all`}
            title="New tab"
          >
            <Plus size={15} />
          </button>

          <button className={`w-8 h-8 rounded-md flex items-center justify-center ${textMid} ${btnHover} transition-all`}>
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 224 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="h-full shrink-0 overflow-hidden"
            >
              <Sidebar
                onNavigate={(url) => navigate(url)}
                onOpenSettings={() => navigate(SETTINGS_URL)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content — stack all tabs, show only active */}
        <div className="flex-1 relative overflow-hidden">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`absolute inset-0 ${tab.id === activeTabId ? 'z-10' : 'z-0 pointer-events-none opacity-0'}`}
            >
              {tab.url === NEW_TAB ? (
                <NewTab onNavigate={url => navigate(url, tab.id)} />
              ) : tab.url === SETTINGS_URL ? (
                <SettingsPage onBack={() => navigate(NEW_TAB, tab.id)} />
              ) : (
                <WebView
                  ref={el => { webviewRefs.current[tab.id] = el; }}
                  src={tab.url}
                  {...makeWebviewCallbacks(tab.id)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Right Web3 Panel */}
        <AnimatePresence initial={false}>
          {rightPanelOpen && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 272 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="h-full shrink-0 overflow-hidden"
            >
              <Web3Panel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────────── */}
      <StatusBar />

      {/* ── Wallet modals ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {walletModal && (
          <WalletModal
            mode={walletModal}
            onClose={() => setWalletModal(null)}
            onSuccess={() => {
              addLog('Wallet unlocked');
              setWalletModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
