import React, { useRef, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft, ChevronRight, RotateCcw, Lock, Globe,
  Shield, Wallet, X, Star, User, AlignJustify,
  Plus, Square, History, Bookmark, Download, Trash2,
  Printer, FileSearch, LayoutGrid, HelpCircle, Settings,
  ZoomIn, ZoomOut, Maximize2, Sun, Moon, Eye, EyeOff,
} from 'lucide-react';

import TabBar      from './TabBar';
import WebView, { WebViewHandle } from './WebView';
import WalletPanel from './WalletPanel';
import NewTab      from '../pages/NewTab';
import Dashboard   from '../pages/Dashboard';
import WalletModal from './modals/WalletModal';

import { useTabsStore, NEW_TAB } from '../store/tabs';
import { useSettings }           from '../store/settings';
import { useWalletStore }        from '../store/wallet';
import { useRuntimeStore }       from '../store/runtime';

export const DASHBOARD_URL = 'orivon://dashboard';
const SETTINGS_URL         = 'orivon://settings';

function resolveDisplay(url: string): string {
  if (!url || url === NEW_TAB || url === SETTINGS_URL || url === DASHBOARD_URL) return '';
  return url;
}
function isSecureURL(url: string) {
  return url.startsWith('https://') || url.endsWith('.eth') ||
    url.startsWith('ipfs://') || url.startsWith('ipns://') || url.startsWith('orivon://');
}
function web3Score(url: string) {
  if (!url || url === NEW_TAB || url === DASHBOARD_URL) return null;
  if (url.endsWith('.eth') || url.startsWith('ipfs://')) return 97;
  if (url.startsWith('https://')) return 85;
  return 60;
}

function DashboardUnlockInline({ isDark }: { isDark: boolean }) {
  const { unlock } = useWalletStore();
  const [pw, setPw]         = useState('');
  const [show, setShow]     = useState(false);
  const [err, setErr]       = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleUnlock = async () => {
    if (!pw || loading) return;
    setErr(''); setLoading(true);
    const ok = await unlock(pw);
    setLoading(false);
    if (!ok) { setErr('Incorrect password. Please try again.'); setPw(''); inputRef.current?.focus(); }
  };

  return (
    <div style={{ height: '100%', background: isDark ? '#0f0f0f' : '#F0F2F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 56px', maxWidth: 460, width: '90%', textAlign: 'center', boxShadow: '0 2px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          <img src="/logo.png" alt="Orivon" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Orivon Wallet</span>
        </div>
        <LockSVG />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '20px 0 8px' }}>Unlock Wallet</h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 28px' }}>Enter password to unlock wallet</p>
        <div style={{ position: 'relative', marginBottom: err ? 8 : 16 }}>
          <input ref={inputRef} type={show ? 'text' : 'password'} value={pw}
            onChange={e => { setPw(e.target.value); setErr(''); }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="Enter your password"
            style={{ width: '100%', height: 52, borderRadius: 12, boxSizing: 'border-box', border: `1.5px solid ${err ? '#EF4444' : focused ? '#4F46E5' : '#E5E7EB'}`, background: '#F9FAFB', padding: '0 44px 0 16px', fontSize: 15, color: '#111827', outline: 'none', fontFamily: 'inherit', boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.10)' : 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
          />
          <button onClick={() => setShow(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex', alignItems: 'center' }}>
            {show ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>
        {err && <p style={{ fontSize: 12, color: '#EF4444', margin: '0 0 12px' }}>{err}</p>}
        <button onClick={handleUnlock} disabled={!pw || loading}
          style={{ width: '100%', height: 50, borderRadius: 9999, border: 'none', background: pw && !loading ? '#4F46E5' : '#E5E7EB', color: pw && !loading ? '#fff' : '#9CA3AF', fontSize: 15, fontWeight: 600, cursor: pw && !loading ? 'pointer' : 'not-allowed', marginBottom: 12, transition: 'background 0.2s' }}>
          {loading ? 'Unlocking…' : 'Unlock'}
        </button>
        <button style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 9999, padding: '8px 24px', fontSize: 14, fontWeight: 500, color: '#4F46E5', cursor: 'pointer' }}>
          Restore
        </button>
      </div>
    </div>
  );
}

function LockSVG() {
  return (
    <svg width="80" height="76" viewBox="0 0 80 76" fill="none" style={{ display: 'block', margin: '0 auto' }}>
      <path d="M 16 32 A 24 24 0 0 1 64 32" stroke="#C7D2FE" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M 22 38 A 18 18 0 0 1 58 38" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M 29 44 A 11 11 0 0 1 51 44" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M 30 53 L 30 46 Q 30 36 40 36 Q 50 36 50 46 L 50 53" stroke="#6366F1" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <rect x="23" y="52" width="34" height="24" rx="6" fill="#4F46E5"/>
      <circle cx="40" cy="63" r="4.5" fill="rgba(255,255,255,0.45)"/>
      <rect x="37.5" y="63" width="5" height="7" rx="2.5" fill="rgba(255,255,255,0.45)"/>
    </svg>
  );
}

interface BrowserProps {
  onOpenDashboard?:  () => void;
  onOpenOnboarding?: () => void;
}

export default function Browser({ onOpenDashboard, onOpenOnboarding }: BrowserProps = {}) {
  const { tabs, activeTabId, addTab, closeTab, updateTab, navigateTab, goBack, goForward, setActiveTab } = useTabsStore();
  const { theme, setTheme, rightPanelOpen, setRightPanelOpen, showWeb3Scores } = useSettings();
  const { status: walletStatus } = useWalletStore();
  const { addLog } = useRuntimeStore();

  const webviewRefs = useRef<Record<string, WebViewHandle | null>>({});
  const addrRef     = useRef<HTMLInputElement>(null);
  const menuRef     = useRef<HTMLDivElement>(null);

  const [addrInput, setAddrInput]       = useState('');
  const [isEditing, setIsEditing]       = useState(false);
  const [walletOpen, setWalletOpen]     = useState(false);
  const [walletModal, setWalletModal]   = useState<null | 'create' | 'import' | 'unlock'>(null);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [zoom, setZoom]                 = useState(100);
  // tracks reload count per new-tab so we can force a remount
  const [newTabKeys, setNewTabKeys]     = useState<Record<string, number>>({});

  // ── Auto-updater state ─────────────────────────────────────────────────────
  type UpdateState = 'idle' | 'available' | 'downloading' | 'ready';
  const [updateState,   setUpdateState]   = useState<UpdateState>('idle');
  const [updateVersion, setUpdateVersion] = useState('');
  const [updatePct,     setUpdatePct]     = useState(0);

  const activeTab  = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  const isDark     = theme === 'dark';
  const isMac      = window.electronAPI?.platform === 'darwin' || /Mac/.test(navigator.platform);
  const isElectron = !!window.electronAPI?.isElectron;
  const score      = activeTab ? web3Score(activeTab.url) : null;

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

  // ── Register auto-updater IPC listeners (Electron only, once on mount) ─────
  useEffect(() => {
    const api = window.electronAPI?.updater;
    if (!api) return;
    api.onAvailable(v  => { setUpdateVersion(v); setUpdateState('available'); });
    api.onProgress(pct => { setUpdatePct(pct);   setUpdateState('downloading'); });
    api.onDownloaded(v => { setUpdateVersion(v); setUpdateState('ready'); setUpdatePct(100); });
    api.onError(_msg   => { setUpdateState('idle'); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useCallback(async (raw: string, tabId = activeTabId) => {
    const input = raw.trim();
    if (!input) return;
    setIsEditing(false);

    if (input.startsWith('orivon://')) {
      navigateTab(tabId, input, input, 'https');
      // No WebView for internal pages — stop the spinner immediately
      const internalTitle = input === DASHBOARD_URL ? 'Dashboard' : 'New Tab';
      setTimeout(() => updateTab(tabId, { isLoading: false, title: internalTitle }), 0);
      return;
    }

    let url = input;
    let type: ReturnType<typeof useTabsStore.getState>['tabs'][0]['type'] = 'https';

    if (window.electronAPI?.resolveURL) {
      const r = await window.electronAPI.resolveURL(input);
      if (r.ok) { url = r.url; type = r.type as typeof type; }
    } else {
      if (input.endsWith('.eth'))                                                { url = `https://${input}.limo`; type = 'ens'; }
      else if (input.startsWith('ipfs://'))                                      { url = `https://ipfs.io/ipfs/${input.slice(7)}`; type = 'ipfs'; }
      else if (input.startsWith('http://') || input.startsWith('https://'))     { url = input; type = input.startsWith('https') ? 'https' : 'http'; }
      else if (input.includes('.') && !input.includes(' '))                     { url = `https://${input}`; type = 'https'; }
      else                                                                       { url = `https://www.google.com/search?q=${encodeURIComponent(input)}`; type = 'search'; }
    }

    navigateTab(tabId, url, input, type);
    setAddrInput(input);
    webviewRefs.current[tabId]?.loadURL(url);
    addLog(`→ ${url}`);
  }, [activeTabId, navigateTab, addLog]);

  const handleBack    = () => { const url = goBack(activeTabId);    if (url) webviewRefs.current[activeTabId]?.goBack(); };
  const handleForward = () => { const url = goForward(activeTabId); if (url) webviewRefs.current[activeTabId]?.goForward(); };
  const handleReload  = () => {
    if (activeTab?.url === NEW_TAB) {
      setNewTabKeys(prev => ({ ...prev, [activeTabId]: (prev[activeTabId] ?? 0) + 1 }));
    } else if (activeTab?.url === DASHBOARD_URL) {
      // Dashboard is a local React component — nothing to reload, just clear any stale spinner
      updateTab(activeTabId, { isLoading: false });
    } else {
      webviewRefs.current[activeTabId]?.reload();
    }
  };
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

  // ─── Brave-style color tokens ───────────────────────────────────────────────
  const tabBarBg   = isDark ? '#18181a' : '#d9d9e3';
  const toolbarBg  = isDark ? '#1e1e21' : '#f1f1f5';
  const toolbarBdr = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const addrBg     = isDark ? '#28282c' : '#ffffff';
  const addrHover  = isDark ? '#303036' : '#ffffff';
  const sepColor   = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const btnMuted   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  const btnHoverBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const btnActive  = isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.75)';
  const addrTxt    = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.45)';

  // Shared nav button style — matches Brave's compact 28×28 icon buttons
  const navBtnCls = `
    no-drag w-7 h-7 rounded flex items-center justify-center
    transition-colors duration-100 focus:outline-none
    disabled:opacity-25 disabled:cursor-not-allowed
  `;
  const navBtnColors = isDark
    ? 'text-white/38 hover:text-white/80 hover:bg-white/[0.07] active:bg-white/[0.11]'
    : 'text-black/38 hover:text-black/75 hover:bg-black/[0.06] active:bg-black/[0.09]';

  const iconBtnCls = `
    no-drag w-[26px] h-[26px] rounded flex items-center justify-center
    transition-colors duration-100 focus:outline-none
  `;
  const iconBtnColors = isDark
    ? 'text-white/40 hover:text-white/78 hover:bg-white/[0.07]'
    : 'text-black/40 hover:text-black/72 hover:bg-black/[0.06]';

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden select-none ${isDark ? 'text-white' : 'text-black'}`}
      style={{ background: isDark ? '#0f0f0f' : '#e5e5ec' }}
    >
      {/* ── TAB BAR ── */}
      <TabBar
        tabs={tabs}
        activeId={activeTabId}
        onTabClick={setActiveTab}
        onTabClose={handleTabClose}
        onNewTab={() => addTab()}
        isDark={isDark}
        windowControls={
          !isMac && isElectron
            ? {
                onMinimize: () => window.electronAPI?.window.minimize(),
                onMaximize: () => window.electronAPI?.window.maximize(),
                onClose:    () => window.electronAPI?.window.close(),
              }
            : undefined
        }
      />

      {/* ── TOOLBAR ── */}
      <div
        className="shrink-0 flex items-center"
        style={{
          height: 36,
          background: toolbarBg,
          borderBottom: `1px solid ${toolbarBdr}`,
          padding: '0 6px',
          gap: 0,
        }}
      >
        {/* Left: back / forward / reload / separator / bookmark */}
        <div className="flex items-center shrink-0" style={{ gap: 1 }}>
          <NavBtn
            onClick={handleBack}
            disabled={!canBack}
            isDark={isDark}
            title="Back"
          >
            <ChevronLeft size={15} strokeWidth={2} />
          </NavBtn>
          <NavBtn
            onClick={handleForward}
            disabled={!canForward}
            isDark={isDark}
            title="Forward"
          >
            <ChevronRight size={15} strokeWidth={2} />
          </NavBtn>
          {/* ── Reload / Stop — premium animated ── */}
          <button
            onClick={activeTab?.isLoading
              ? () => webviewRefs.current[activeTabId]?.stop()
              : handleReload}
            title={activeTab?.isLoading ? 'Stop loading' : 'Reload page'}
            className="no-drag"
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)',
              transition: 'background 0.14s, color 0.14s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement;
              if (activeTab?.isLoading) {
                btn.style.background = isDark ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.09)';
                btn.style.color = '#EF4444';
              } else {
                btn.style.background = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
                btn.style.color = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.82)';
              }
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.background = 'transparent';
              btn.style.color = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.50)';
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {activeTab?.isLoading ? (
                <motion.span
                  key="stop"
                  initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1,   rotate:   0 }}
                  exit={{   opacity: 0, scale: 0.4,  rotate:  90 }}
                  transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={13} strokeWidth={2.6} />
                </motion.span>
              ) : (
                <motion.span
                  key="reload"
                  initial={{ opacity: 0, scale: 0.4, rotate:  90 }}
                  animate={{ opacity: 1, scale: 1,   rotate:   0 }}
                  exit={{   opacity: 0, scale: 0.4,  rotate: -90 }}
                  transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <RotateCcw size={13} strokeWidth={2.2} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Separator */}
          <div style={{ width: 1, height: 14, background: sepColor, margin: '0 5px' }} />

          <NavBtn isDark={isDark} title="Bookmark this page">
            <Star size={14} strokeWidth={1.9} />
          </NavBtn>
        </div>

        {/* Address bar — fills remaining space */}
        <form
          onSubmit={handleAddrSubmit}
          className="flex-1 no-drag"
          style={{ minWidth: 0, padding: '0 7px' }}
        >
          <div
            className="relative flex items-center w-full transition-all duration-150"
            style={{
              height: 28,
              background: addrBg,
              borderRadius: 14,
              boxShadow: isDark
                ? 'inset 0 0 0 1px rgba(255,255,255,0.08)'
                : '0 1px 2px rgba(0,0,0,0.10), inset 0 0 0 0.5px rgba(0,0,0,0.06)',
            }}
          >
            {/* Protocol icon — left of input */}
            <div
              className="absolute pointer-events-none flex items-center"
              style={{ left: 10 }}
            >
              {!activeTab || activeTab.url === NEW_TAB || activeTab.url === DASHBOARD_URL
                ? <Shield size={12} color="#FB5B22" />
                : isSecureURL(activeTab.url)
                  ? <Lock size={11} className="text-[#00c76a]" />
                  : <Globe size={11} style={{ color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.28)' }} />
              }
            </div>

            <input
              ref={addrRef}
              type="text"
              value={isEditing ? addrInput : (activeTab ? resolveDisplay(activeTab.url) : '')}
              onChange={e => setAddrInput(e.target.value)}
              onFocus={() => {
                setIsEditing(true);
                setAddrInput(activeTab ? resolveDisplay(activeTab.url) : '');
                setTimeout(() => addrRef.current?.select(), 20);
              }}
              onBlur={() => setIsEditing(false)}
              placeholder="Search or enter address"
              className="w-full h-full bg-transparent focus:outline-none"
              style={{
                padding: '0 32px 0 28px',
                fontSize: 12.5,
                fontWeight: 400,
                color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.80)',
                letterSpacing: '0.01em',
              }}
            />

            {/* ENS / IPFS badge — right of input */}
            {activeTab?.type === 'ens' && !isEditing && (
              <span
                className="absolute pointer-events-none"
                style={{ right: 10, fontSize: 9, fontWeight: 700, color: '#00c76a', letterSpacing: '0.08em' }}
              >
                ENS
              </span>
            )}
            {(activeTab?.type === 'ipfs' || activeTab?.type === 'ipns') && !isEditing && (
              <span
                className="absolute pointer-events-none"
                style={{ right: 10, fontSize: 9, fontWeight: 700, color: '#00d1ff', letterSpacing: '0.08em' }}
              >
                IPFS
              </span>
            )}
          </div>
        </form>

        {/* Right cluster */}
        <div className="flex items-center shrink-0" style={{ gap: 2 }}>
          {/* Wallet */}
          <div className="relative">
            <button
              onClick={() => setWalletOpen(p => !p)}
              title="Orivon Wallet"
              className={`${iconBtnCls} ${iconBtnColors} no-drag`}
              style={walletOpen ? { background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)', color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.78)' } : {}}
            >
              <Wallet size={14} strokeWidth={1.9} />
            </button>
            <AnimatePresence>
              {walletOpen && (
                <WalletPanel
                  onClose={() => setWalletOpen(false)}
                  onOpenWalletModal={mode => { setWalletModal(mode); setWalletOpen(false); }}
                  onOpenDashboard={() => { navigate(DASHBOARD_URL); setWalletOpen(false); }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Web3 score badge */}
          {showWeb3Scores && score !== null && (
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              title={`Web3 Score: ${score}`}
              className={`no-drag flex items-center gap-1 h-[26px] px-1.5 rounded transition-colors duration-100 focus:outline-none`}
              style={{
                fontSize: 10,
                fontWeight: 600,
                background: rightPanelOpen
                  ? isDark ? 'rgba(0,255,135,0.10)' : 'rgba(0,180,90,0.09)'
                  : 'transparent',
                color: isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.40)',
              }}
            >
              <Shield size={11} />
              <span style={{ color: score >= 90 ? '#00c76a' : score >= 70 ? '#f59e0b' : '#f87171' }}>
                {score}
              </span>
            </button>
          )}

          {/* Separator */}
          <div style={{ width: 1, height: 14, background: sepColor, margin: '0 3px' }} />

          {/* Dashboard / profile */}
          <button
            onClick={() => navigate(DASHBOARD_URL)}
            title="Dashboard"
            className="no-drag flex items-center justify-center focus:outline-none transition-colors duration-100"
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'}`,
              background: 'transparent',
              color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
              (e.currentTarget as HTMLButtonElement).style.color = isDark ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.72)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.42)';
            }}
          >
            <User size={11} strokeWidth={2} />
          </button>

          {/* Hamburger menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(p => !p)}
              title="Menu"
              className={`${iconBtnCls} ${iconBtnColors} no-drag`}
              style={menuOpen ? { background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)', color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.78)' } : {}}
            >
              <AlignJustify size={14} strokeWidth={1.9} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <BurgerMenu
                  isDark={isDark}
                  isDarkMode={isDark}
                  zoom={zoom}
                  onZoomIn={() => setZoom(z => Math.min(z + 10, 200))}
                  onZoomOut={() => setZoom(z => Math.max(z - 10, 25))}
                  onNewTab={() => { addTab(); setMenuOpen(false); }}
                  onDashboard={() => { navigate(DASHBOARD_URL); setMenuOpen(false); }}
                  onWallet={() => { setWalletOpen(true); setMenuOpen(false); }}
                  onTheme={() => { setTheme(isDark ? 'light' : 'dark'); setMenuOpen(false); }}
                  onClose={() => setMenuOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Update banner ──────────────────────────────────────────────────── */}
      {updateState !== 'idle' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 16px', flexShrink: 0,
          background: updateState === 'ready'       ? '#4F46E5'
                    : updateState === 'downloading'  ? '#1D4ED8'
                    : '#2563EB',
          color: '#fff', fontSize: 12, fontWeight: 500,
        }}>
          {/* Progress bar fill for downloading state */}
          {updateState === 'downloading' && (
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: 'rgba(255,255,255,0.12)', width: `${updatePct}%`, transition: 'width 0.4s ease', pointerEvents: 'none' }} />
          )}
          <span style={{ flex: 1, position: 'relative' }}>
            {updateState === 'available'    && `Orivon ${updateVersion} is available — downloading update…`}
            {updateState === 'downloading'  && `Downloading update ${updateVersion}… ${updatePct}%`}
            {updateState === 'ready'        && `Orivon ${updateVersion} is ready to install.`}
          </span>
          {updateState === 'ready' && (
            <button
              onClick={() => window.electronAPI?.updater.restartAndInstall()}
              style={{ padding: '3px 12px', borderRadius: 6, background: '#fff', color: '#4F46E5', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
            >
              Restart now
            </button>
          )}
          <button
            onClick={() => setUpdateState('idle')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '2px 4px', fontSize: 14, lineHeight: 1, flexShrink: 0 }}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 relative overflow-hidden flex">
        <div className="flex-1 relative">
          {tabs.map(tab => (
            <div
              key={tab.url === NEW_TAB ? `${tab.id}-${newTabKeys[tab.id] ?? 0}` : tab.id}
              className="absolute inset-0"
              style={{
                zIndex: tab.id === activeTabId ? 1 : 0,
                pointerEvents: tab.id === activeTabId ? 'auto' : 'none',
              }}
            >
              {tab.url === NEW_TAB ? (
                <NewTab onNavigate={url => navigate(url, tab.id)} />
              ) : tab.url === DASHBOARD_URL ? (
                walletStatus === 'none'
                  ? <WalletSetupPage isDark={isDark} onOpenModal={mode => { setWalletModal(mode); }}/>
                  : walletStatus === 'locked'
                  ? <DashboardUnlockInline isDark={isDark} />
                  : <Dashboard onOpenBrowser={() => navigate(NEW_TAB)} />
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

        {/* Web3 side panel */}
        <AnimatePresence>
          {rightPanelOpen && showWeb3Scores && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="shrink-0 overflow-hidden"
              style={{
                borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                background: isDark ? '#111' : '#fff',
              }}
            >
              <Web3Panel
                score={score}
                tab={activeTab}
                isDark={isDark}
                onClose={() => setRightPanelOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

// ─── NavBtn ─────────────────────────────────────────────────────────────────
function NavBtn({
  children, onClick, disabled, isDark, title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isDark: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="no-drag focus:outline-none flex items-center justify-center rounded transition-colors duration-100 disabled:opacity-25 disabled:cursor-not-allowed"
      style={{ width: 28, height: 28 }}
      onMouseEnter={e => {
        if (!(e.currentTarget as HTMLButtonElement).disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
          (e.currentTarget as HTMLButtonElement).style.color = isDark ? 'rgba(255,255,255,0.80)' : 'rgba(0,0,0,0.75)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
      }}
      onMouseDown={e => {
        if (!(e.currentTarget as HTMLButtonElement).disabled)
          (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.09)';
      }}
      onMouseUp={e => {
        (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
      }}
    >
      <span style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)', display: 'flex', alignItems: 'center' }}>
        {children}
      </span>
    </button>
  );
}

// ─── Burger menu ────────────────────────────────────────────────────────────
interface BurgerMenuProps {
  isDark: boolean; isDarkMode: boolean; zoom: number;
  onNewTab: () => void; onDashboard: () => void; onWallet: () => void;
  onTheme: () => void; onZoomIn: () => void; onZoomOut: () => void; onClose: () => void;
}

function BurgerMenu({ isDark, isDarkMode, zoom, onNewTab, onDashboard, onWallet, onTheme, onZoomIn, onZoomOut, onClose }: BurgerMenuProps) {
  const bg    = isDark ? '#1c1c1f' : '#ffffff';
  const brd   = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)';
  const txt   = isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.82)';
  const muted = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const hov   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const ico   = { color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.45)', width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 as const };
  const row   = { display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, color: txt, fontSize: 12.5 };

  const item = (icon: React.ReactNode, label: string, sc: string, fn: () => void, chev?: boolean) => (
    <button
      key={label}
      onClick={fn}
      style={row}
      onMouseEnter={e => { e.currentTarget.style.background = hov; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
    >
      <span style={ico}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {sc && <span style={{ fontSize: 11, color: muted }}>{sc}</span>}
      {chev && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: muted }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>
      )}
    </button>
  );

  const div = () => <div style={{ height: 1, background: brd, margin: '3px 0' }} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ duration: 0.13 }}
      style={{
        position: 'absolute', top: 38, right: 0, width: 310, zIndex: 200,
        background: bg, borderRadius: 12,
        border: `1px solid ${brd}`,
        boxShadow: isDark ? '0 12px 48px rgba(0,0,0,0.55)' : '0 8px 32px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        paddingBottom: 4,
      }}
    >
      <div style={{ paddingTop: 4 }}>
        {item(<Plus size={15}/>, 'New Tab', '⌘T', onNewTab)}
        {item(<Square size={14}/>, 'New Window', '⌘N', () => onClose())}
        {item(<Lock size={13}/>, 'New Private Window', '⇧⌘N', () => onClose())}
      </div>
      {div()}
      {item(<LayoutGrid size={14}/>, 'Dashboard', '', onDashboard)}
      {item(<Wallet size={14}/>, 'Orivon Wallet', '', onWallet)}
      {item(isDarkMode ? <Sun size={14}/> : <Moon size={14}/>, isDarkMode ? 'Light mode' : 'Dark mode', '', onTheme)}
      {div()}
      {item(<History size={14}/>, 'History', '⌘Y', () => onClose(), true)}
      {item(<Bookmark size={14}/>, 'Bookmarks', '', () => onClose(), true)}
      {item(<Download size={14}/>, 'Downloads', '⌥⌘L', () => onClose())}
      {item(<Trash2 size={13}/>, 'Delete Browsing Data…', '⇧⌘⌫', () => onClose())}
      {div()}
      {/* Zoom row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '5px 14px', gap: 11 }}>
        <span style={ico}><ZoomIn size={15}/></span>
        <span style={{ flex: 1, fontSize: 12.5, color: txt }}>Zoom</span>
        <div style={{ display: 'flex', border: `1px solid ${brd}`, borderRadius: 7, overflow: 'hidden' }}>
          {[
            { icon: <ZoomOut size={12}/>, fn: onZoomOut },
            { icon: <span style={{ fontSize: 11, padding: '0 8px', minWidth: 46, textAlign: 'center' as const }}>{zoom}%</span>, fn: () => {} },
            { icon: <ZoomIn size={12}/>, fn: onZoomIn },
            { icon: <Maximize2 size={11}/>, fn: () => {} },
          ].map((b, i) => (
            <button
              key={i}
              onClick={b.fn}
              style={{ padding: '5px 7px', background: 'none', border: 'none', cursor: 'pointer', color: txt, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: i > 0 ? `1px solid ${brd}` : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = hov; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              {b.icon}
            </button>
          ))}
        </div>
      </div>
      {div()}
      {item(<Printer size={14}/>, 'Print…', '⌘P', () => onClose())}
      {item(<FileSearch size={14}/>, 'Find in page', '⌘F', () => onClose())}
      {div()}
      {item(<HelpCircle size={14}/>, 'Help', '', () => onClose(), true)}
      {item(<Settings size={14}/>, 'Settings', '⌘,', () => onClose())}
    </motion.div>
  );
}

// ─── Web3 Panel ─────────────────────────────────────────────────────────────
function Web3Panel({
  score, tab, isDark, onClose,
}: {
  score: number | null;
  tab?: ReturnType<typeof useTabsStore.getState>['tabs'][0];
  isDark: boolean;
  onClose: () => void;
}) {
  const muted = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const scores = [
    { label: 'Trust',    value: score ?? 0,                       color: '#00c76a' },
    { label: 'Security', value: score ? Math.round(score * 0.97) : 0, color: '#00D1FF' },
    { label: 'Privacy',  value: 96,                                color: '#a78bfa' },
  ];

  return (
    <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: muted }}>
          Web3 Score
        </span>
        <button
          onClick={onClose}
          style={{ width: 22, height: 22, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, color: muted }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
        >
          <X size={12} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {scores.map(s => (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
              <span style={{ color: muted }}>{s.label}</span>
              <span style={{ fontWeight: 600, color: s.color }}>{s.value}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${s.value}%`, background: s.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ─── Wallet Setup Page ────────────────────────────────────────────────────────
// Shown inside orivon://dashboard when the user has no wallet yet.
// Matches the Brave "Browser-native. Self-custody. And multi-chain." page.

function WalletSetupPage({ isDark, onOpenModal }: {
  isDark: boolean;
  onOpenModal: (mode: 'create' | 'import') => void;
}) {
  const bg    = isDark ? '#0f0f0f' : '#F0F2F9';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const cardBd = isDark ? 'rgba(255,255,255,0.09)' : '#E5E7EB';
  const title = isDark ? '#ffffff' : '#111827';
  const sub   = isDark ? 'rgba(255,255,255,0.55)' : '#6B7280';
  const hd    = isDark ? 'rgba(255,255,255,0.85)' : '#111827';
  const hd2   = isDark ? 'rgba(255,255,255,0.55)' : '#6B7280';

  const card = (accent: string, accBg: string, icon: string, head: string, desc: string, extra: React.ReactNode | null, onClick: () => void) => (
    <div
      onClick={onClick}
      style={{ background: cardBg, borderRadius: 18, padding: '28px 28px 24px', cursor: 'pointer', border: `1.5px solid ${cardBd}`, boxShadow: isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)', transition: 'border-color 0.15s, box-shadow 0.15s', flex: 1 }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#4F46E5'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(79,70,229,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = cardBd; (e.currentTarget as HTMLDivElement).style.boxShadow = isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 13, background: accBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 22, color: accent, fontWeight: 700 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: hd, margin: '0 0 8px' }}>{head}</h3>
      <p style={{ fontSize: 13, color: hd2, margin: extra ? '0 0 14px' : '0', lineHeight: 1.55 }}>{desc}</p>
      {extra}
    </div>
  );

  return (
    <div style={{ height: '100%', background: bg, display: 'flex', flexDirection: 'column', padding: '28px 48px 40px', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', overflowY: 'auto' }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
        <img src="/logo.png" alt="Orivon" style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: hd }}>Orivon Wallet</span>
      </div>

      {/* Heading */}
      <h1 style={{ fontSize: 36, fontWeight: 800, color: title, margin: '0 0 14px', lineHeight: 1.12, letterSpacing: '-0.5px' }}>
        Browser-native.<br />Self-custody.<br />And multi-chain.
      </h1>
      <p style={{ fontSize: 15, color: sub, margin: '0 0 36px', maxWidth: 560, lineHeight: 1.65 }}>
        Take control of your crypto and NFTs. Orivon Wallet supports Ethereum, EVM chains, Solana, Filecoin, Bitcoin, and more.
      </p>

      {/* Two cards */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 48 }}>
        {card(
          '#4F46E5', isDark ? 'rgba(79,70,229,0.15)' : '#EEF2FF',
          '+', 'Need a new wallet?',
          'Get started with Orivon Wallet in minutes.',
          null,
          () => onOpenModal('create')
        )}
        {card(
          '#0090FF', isDark ? 'rgba(0,144,255,0.12)' : '#E0F2FF',
          '↓', 'Already have a wallet?',
          'Import using your existing seed phrase.',
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {['🦁','🟣','🦊','🔵','🔒','🔳'].map((ic, i) => <span key={i} style={{ fontSize: 18 }}>{ic}</span>)}
          </div>,
          () => onOpenModal('import')
        )}
      </div>

      {/* Footer */}
      <p style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.25)' : '#9CA3AF', marginTop: 'auto' }}>
        ©2025 Orivon. All rights reserved. Orivon Wallet is not affiliated with Brave Software.
      </p>
    </div>
  );
}
