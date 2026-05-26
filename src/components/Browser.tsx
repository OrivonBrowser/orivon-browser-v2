import React, { useRef, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, RotateCcw, Lock, Globe,
  Shield, Wallet, X, Star, User, AlignJustify,
  Plus, Square, History, Bookmark, Download, Trash2,
  Printer, FileSearch, LayoutGrid, HelpCircle, Settings,
  ZoomIn, ZoomOut, Maximize2, Sun, Moon, Eye, EyeOff, Layers,
  Puzzle, PanelRight, Folder, MapPin, CheckCircle2, AlertTriangle, Info, Check,
} from 'lucide-react';

import TabBar      from './TabBar';
import WebView, { WebViewHandle } from './WebView';
import WalletPanel from './WalletPanel';
import NewTab      from '../pages/NewTab';
import Dashboard   from '../pages/Dashboard';
import SettingsPage from '../pages/Settings';
import NodeManagerPage from '../pages/NodeManager';

import UniswapDemo from '../pages/demo/UniswapDemo';
import MastodonDemo from '../pages/demo/MastodonDemo';
import BitcoinNodeDemo from '../pages/demo/BitcoinNodeDemo';
import AppStoreDemo from '../pages/demo/AppStoreDemo';
import OpenSeaDemo from '../pages/demo/OpenSeaDemo';

import logo from '@/assets/logo.png';
import Spinner from './Spinner';

import { useTabsStore }    from '../store/tabs';
import { useSettings }     from '../store/settings';
import { useWalletStore }   from '../store/wallet';
import { useRuntimeStore }  from '../store/runtime';
import { useSessionStore }  from '../store/session';
import { DASHBOARD_URL, SETTINGS_URL, NODEMANAGER_URL, NEW_TAB_URL as NEW_TAB } from '../constants';

import OnboardingOverlay from './OnboardingOverlay';
import PasswordModal from './PasswordModal';

const DEMO_URLS = ['uniswap.eth', 'mastodon.eth', 'btcnode.eth', 'apps.orivon.eth', 'opensea.eth'];

function OrivonPermissionPrompt({ details, onApprove, onReject }: { details: any, onApprove: () => void, onReject: () => void }) {
  const isInstall = details.type === 'install';

  const handleAction = () => {
    (window as any).requestSecurityCheck(onApprove);
  };
  
  return (
    <motion.div 
      initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 w-[400px] bg-[#111218] border border-[#1e2030] rounded-xl shadow-2xl z-[2000] overflow-hidden"
    >
       <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-9 h-9 rounded-lg bg-[#161720] border border-[#1e2030] flex items-center justify-center text-[#6366f1]">
                <Shield size={18} />
             </div>
             <div className="flex flex-col">
                <span className="text-label text-[#6366f1]">{details.origin}</span>
                <span className="text-[15px] font-semibold text-[#f8fafc]">{isInstall ? 'Install Module' : 'Approve Transaction'}</span>
             </div>
          </div>

          <div className="bg-[#161720] rounded-xl p-5 border border-[#1e2030] space-y-4 mb-6">
             {isInstall ? (
                <>
                   <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-white text-lg" style={{ backgroundColor: details.app.color }}>{details.app.icon}</div>
                      <div className="flex flex-col">
                         <span className="font-semibold text-[#f8fafc] text-[14px]">{details.app.name}</span>
                         <span className="text-[11px] text-[#64748b] font-medium uppercase tracking-wider">Module Installation</span>
                      </div>
                   </div>
                   <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-[#22c55e] tabular tracking-wider"><div className="w-1 h-1 rounded-full bg-[#22c55e]" /> Network Access</div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-[#f59e0b] tabular tracking-wider"><div className="w-1 h-1 rounded-full bg-[#f59e0b]" /> Storage Access</div>
                   </div>
                </>
             ) : (
                <>
                   <div className="flex justify-between items-center text-[13px] font-medium tabular">
                      <span className="text-[#64748b] uppercase text-[11px]">Action</span>
                      <span className="text-[#f8fafc]">{details.from} → {details.to}</span>
                   </div>
                   <div className="flex justify-between items-center text-[13px] font-medium tabular">
                      <span className="text-[#64748b] uppercase text-[11px]">Fee</span>
                      <span className="text-[#f8fafc]">{details.fee}</span>
                   </div>
                </>
             )}
          </div>

          <div className="flex items-center justify-between px-1 mb-8">
             <span className="text-label text-[#475569]">Web3 Score</span>
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
                <span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-widest">TRUSTLESS</span>
             </div>
          </div>

          <div className="flex gap-3">
             <button onClick={onReject} className="flex-1 h-11 rounded-lg bg-[#161720] border border-[#1e2030] text-[#64748b] font-semibold text-[13px] uppercase tracking-wider hover:text-[#f8fafc] transition-all cursor-pointer">Reject</button>
             <button onClick={handleAction} className="flex-2 h-11 rounded-lg bg-[#6366f1] text-white font-semibold text-[13px] uppercase tracking-widest hover:bg-[#4f46e5] active:scale-[0.98] transition-all border-none cursor-pointer">
                {isInstall ? 'Install' : 'Approve'}
             </button>
          </div>
       </div>
    </motion.div>
  );
}

function ExtensionNotification({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div 
      initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 w-[480px] bg-[#111218] border border-[#22c55e]/30 rounded-xl shadow-2xl z-[1500] p-4 flex items-center gap-5"
    >
       <div className="w-10 h-10 rounded-lg bg-[#22c55e]/5 flex items-center justify-center text-[#22c55e] shrink-0 border border-[#22c55e]/10">
          <Shield size={20} />
       </div>
       <div className="flex-1">
          <div className="text-[13px] font-semibold text-[#f8fafc] uppercase tracking-wider mb-0.5">Orivon Wallet is already connected</div>
          <div className="text-[12px] font-medium text-[#64748b]">Site requested an extension. Orivon connects natively.</div>
       </div>
       <div className="flex gap-2">
          <button onClick={onDismiss} className="px-4 h-8 rounded-lg bg-[#22c55e] text-white font-bold text-[11px] uppercase tracking-wider border-none cursor-pointer hover:bg-[#16a34a]">Got it</button>
       </div>
    </motion.div>
  );
}

function resolveDisplay(url: string, isEditing: boolean): string {
  if (!url || url === NEW_TAB || url === SETTINGS_URL || url === DASHBOARD_URL) return '';
  if (isEditing) return url;

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.hostname;
    }
    return url;
  } catch {
    return url;
  }
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

function getWeb3Color(url: string): string {
  if (!url || url === NEW_TAB || url.startsWith(DASHBOARD_URL)) return '#6b7280';
  if (url === SETTINGS_URL || url === NODEMANAGER_URL) return '#a855f7';
  if (url === 'opensea.eth') return '#f59e0b';
  if (url.endsWith('.eth')) return '#22c55e';
  if (url.includes('.onion')) return '#a855f7';
  if (url.startsWith('https://')) return '#22c55e';
  if (url.startsWith('http://')) return '#f97316';

  return '#6b7280';
}

function getWeb3ScoreInfo(url: string) {
  if (url === SETTINGS_URL || url === NODEMANAGER_URL || url.startsWith('orivon://')) {
    return { name: 'Internal Page', color: '#a855f7', desc: 'Secure internal browser configuration page.' };
  }
  if (url === 'opensea.eth') return { name: 'Partial', color: '#f59e0b', desc: 'Mix of decentralized and centralized components.' };
  if (url.endsWith('.eth')) return { name: 'Trustless', color: '#22c55e', desc: 'Decentralized .eth domain resolving directly via IPFS.' };
  if (url.includes('.onion')) return { name: 'Private', color: '#a855f7', desc: 'Fully private and trustless connection via Tor.' };
  if (url.startsWith('https://')) return { name: 'Centralized', color: '#ef4444', desc: 'Standard web domain resolving via traditional centralized DNS.' };
  if (url.startsWith('http://')) return { name: 'Unsecured', color: '#ef4444', desc: 'Unsecured connection. Standard web domain without SSL.' };
  return { name: 'Unknown', color: '#6b7280', desc: 'The trust level of this page is unknown or still loading.' };
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
          <img src={logo} alt="Orivon" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
}

function ToolbarIcon({ icon, title, onClick, isLast }: { icon: React.ReactNode; title: string; onClick?: () => void; isLast?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`no-drag w-8 h-8 flex items-center justify-center rounded-[6px] transition-all text-[#9a9ba5] hover:text-[#e6e7e8] hover:bg-white/[0.08] ${isLast ? '' : 'mr-[4px]'}`}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 18 })}
    </button>
  );
}

function BookmarksBar() {
  return (
    <div 
      className="shrink-0 h-[28px] flex items-center px-[12px] gap-[12px]"
      style={{ background: '#1a1b20' }}
    >
      <div className="flex items-center gap-[4px] cursor-pointer hover:bg-white/5 px-1 py-0.5 rounded transition-colors">
        <LayoutGrid size={16} className="text-[#9a9ba5]" />
      </div>
      <div className="flex items-center gap-[6px] cursor-pointer hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
        <Folder size={16} className="text-[#9a9ba5]" />
        <span className="text-[12px] text-[#9a9ba5] font-medium">Other Bookmarks</span>
      </div>
    </div>
  );
}

export default function Browser({ onOpenDashboard }: BrowserProps = {}) {
  const { tabs, activeTabId, addTab, closeTab, updateTab, navigateTab, goBack, goForward, setActiveTab } = useTabsStore();
  const {
    theme, setTheme,
    rightPanelOpen, setRightPanelOpen,
    showWeb3Scores,
  } = useSettings();
  const { hasOnboarded, setHasOnboarded } = useSessionStore();
  const { status: walletStatus, initialize: initializeWallet } = useWalletStore();
  const { addLog } = useRuntimeStore();

  const [passwordModal, setPasswordModal] = useState<{ mode: 'setup' | 'unlock', onSuccess: () => void } | null>(null);

  useEffect(() => {
    if (window.electronAPI?.onboarding) {
      window.electronAPI.onboarding.status().then(status => {
        setHasOnboarded(status);
      });
    }
  }, [setHasOnboarded]);

  const requestSecurityCheck = useCallback(async (action: () => void) => {
    if (!window.electronAPI) {
      action();
      return;
    }
    const isSecured = await window.electronAPI.isWalletSecured();
    const isUnlocked = await window.electronAPI.isWalletUnlocked();

    if (!isSecured) {
      setPasswordModal({ mode: 'setup', onSuccess: () => { setPasswordModal(null); action(); } });
    } else if (!isUnlocked) {
      setPasswordModal({ mode: 'unlock', onSuccess: () => { setPasswordModal(null); action(); } });
    } else {
      action();
    }
  }, []);

  // Expose requestSecurityCheck to global window for other components to use
  useEffect(() => {
    (window as any).requestSecurityCheck = requestSecurityCheck;
  }, [requestSecurityCheck]);

  const webviewRefs = useRef<Record<string, WebViewHandle | null>>({});
  const addrRef     = useRef<HTMLInputElement>(null);
  const menuRef     = useRef<HTMLDivElement>(null);

  const [addrInput, setAddrInput]       = useState('');
  const [isEditing, setIsEditing]       = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized,  setIsMaximized]  = useState(false);

  useEffect(() => {
    if (window.electronAPI?.window) {
      window.electronAPI.window.isMaximized().then(setIsMaximized);
      
      window.electronAPI.window.onFullscreenChange(setIsFullscreen);
      window.electronAPI.window.onMaximizedChange(setIsMaximized);
    }
  }, []);
  const [walletOpen, setWalletOpen]     = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [zoom, setZoom]                 = useState(100);
  // tracks reload count per new-tab so we can force a remount
  const [newTabKeys, setNewTabKeys]     = useState<Record<string, number>>({});

  const [permissionPrompt, setPermissionPrompt] = useState<any>(null);
  const [showExtensionNotif, setShowExtensionNotif] = useState(false);

  // ── Auto-updater state ─────────────────────────────────────────────────────
  type UpdateState = 'idle' | 'available' | 'downloading' | 'ready';
  const [updateState,   setUpdateState]   = useState<UpdateState>('idle');
  const [updateVersion, setUpdateVersion] = useState('');
  const [updatePct,     setUpdatePct]     = useState(0);

  const activeTab  = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  const isDark     = theme === 'dark';

  const isDemoUrl = activeTab?.url && DEMO_URLS.includes(activeTab.url);

  const handleRequestApproval = (details: any) => {
    return new Promise<boolean>((resolve) => {
      setPermissionPrompt({ ...details, origin: activeTab?.url, resolve });
    });
  };

  const handleApprove = () => {
    permissionPrompt?.resolve(true);
    setPermissionPrompt(null);
  };

  const handleReject = () => {
    permissionPrompt?.resolve(false);
    setPermissionPrompt(null);
  };

  if (!activeTab) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#1e1f24] text-white">
        <Spinner size={32} color="#4f46e5" className="mb-4" />
        <p className="text-sm font-medium animate-pulse">Initializing Browser...</p>
      </div>
    );
  }

  const isMac      = window.electronAPI?.platform === 'darwin' || /Mac/.test(navigator.platform);
  const isElectron = !!window.electronAPI?.isElectron;
  const score      = activeTab?.url ? web3Score(activeTab.url) : null;
  const [scorePanelOpen, setScorePanelOpen] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isEditing) setAddrInput(activeTab ? resolveDisplay(activeTab.url, false) : '');
  }, [activeTabId, activeTab?.url, isEditing]);

  useEffect(() => {
    initializeWallet();
  }, [initializeWallet]);

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
    setIsNavigating(true);

    if (input.startsWith('orivon://')) {
      if (input === DASHBOARD_URL || input.startsWith(DASHBOARD_URL)) {
        const newId = addTab(input);
        setTimeout(() => setIsNavigating(false), 500);
        return;
      }
      navigateTab(tabId, input, input, 'https');
      setTimeout(() => setIsNavigating(false), 500);
      return;
    }

    let url = input;
    let type: ReturnType<typeof useTabsStore.getState>['tabs'][0]['type'] = 'https';

    if (DEMO_URLS.includes(input)) {
       url = input;
       type = 'ens';
    } else if (window.electronAPI?.resolveURL) {
      const r = await window.electronAPI.resolveURL(input);
      if (r.ok) { url = r.url; type = r.type as typeof type; }
    } else {
      const isUrl = input.includes('.') && !input.includes(' ');
      const hasProtocol = input.startsWith('http://') || input.startsWith('https://') || input.startsWith('ipfs://') || input.startsWith('ipns://');

      if (input.endsWith('.eth')) {
        url = `https://${input}.limo`; type = 'ens';
      } else if (input.startsWith('ipfs://')) {
        url = `https://ipfs.io/ipfs/${input.slice(7)}`; type = 'ipfs';
      } else if (hasProtocol) {
        url = input; type = input.startsWith('https') ? 'https' : 'http';
      } else if (isUrl) {
        url = `https://${input}`; type = 'https';
      } else {
        const engine = useSettings.getState().searchEngine;
        if (engine === 'web3compass') {
          url = `https://www.web3compass.net/search?q=${encodeURIComponent(input)}`;
        } else if (engine === 'duckduckgo') {
          url = `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;
        } else if (engine === 'brave') {
          url = `https://search.brave.com/search?q=${encodeURIComponent(input)}`;
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(input)}`;
        }
        type = 'search';
      }
    }

    navigateTab(tabId, url, input, type);
    setAddrInput(input);
    
    if (!DEMO_URLS.includes(url)) {
      webviewRefs.current[tabId]?.loadURL(url);
    }

    if (url.includes('uniswap.org') || url.includes('opensea.io') || url.includes('pancakeswap.finance')) {
       setTimeout(() => setShowExtensionNotif(true), 1500);
    }

    addLog(`→ ${url}`);
    setTimeout(() => setIsNavigating(false), 500);
  }, [activeTabId, navigateTab, addTab, addLog]);

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
  const toolbarBg  = isDark ? '#1e1f24' : '#f1f1f5';
  const toolbarBdr = isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.09)';
  const addrBg     = isDark ? '#3b3c42' : '#ffffff';
  const addrHover  = isDark ? '#43444a' : '#ffffff';
  const sepColor   = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
  const btnMuted   = isDark ? '#9a9ba5' : 'rgba(0,0,0,0.38)';
  const btnHoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const btnActive  = isDark ? '#e6e7e8' : 'rgba(0,0,0,0.75)';
  const addrTxt    = isDark ? '#e6e7e8' : 'rgba(0,0,0,0.45)';

  // Shared nav button style — matches Brave's compact 28×28 icon buttons
  const navBtnCls = `
    no-drag w-7 h-7 rounded flex items-center justify-center
    transition-all duration-150 focus:outline-none
    disabled:opacity-25 disabled:cursor-not-allowed
    active:scale-90
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
      style={{ background: isDark ? '#1e1f24' : '#e5e5ec' }}
    >
      {/* ── TAB BAR / TITLE BAR ── */}
      <div 
        className={`shrink-0 ${isFullscreen && !isMac ? 'fullscreen-titlebar-toggle' : 'h-9'}`}
      >
        <TabBar
          tabs={tabs}
          activeId={activeTabId}
          onTabClick={setActiveTab}
          onTabClose={handleTabClose}
          onNewTab={() => addTab()}
          isDark={isDark}
          isFullscreen={isFullscreen}
          isMaximized={isMaximized}
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
      </div>

      {/* ── TOOLBAR ── */}
      <div
        className="shrink-0 flex items-center"
        style={{
          height: 40,
          background: '#1e1f24',
          paddingLeft: isMac ? 80 : 12,
          paddingRight: 12,
          borderBottom: 'none',
        }}
      >
        {/* Left Side: Back / Forward / Reload */}
        <div className="flex items-center shrink-0" style={{ gap: 4 }}>
          <NavBtn onClick={handleBack} disabled={!canBack} title="Back">
            <ChevronLeft strokeWidth={2.5} />
          </NavBtn>
          <NavBtn onClick={handleForward} disabled={!canForward} title="Forward">
            <ChevronRight strokeWidth={2.5} />
          </NavBtn>
          <NavBtn 
            onClick={activeTab?.isLoading ? () => webviewRefs.current[activeTabId]?.stop() : handleReload} 
            title={activeTab?.isLoading ? 'Stop' : 'Reload'}
          >
            {activeTab?.isLoading ? <X strokeWidth={2.5} /> : <RotateCcw strokeWidth={2.5} />}
          </NavBtn>
        </div>

        {/* Gap and Bookmark Icon */}
        <div className="flex items-center ml-[12px] mr-[8px]">
           <button className="no-drag w-[34px] h-[34px] flex items-center justify-center text-[#9a9ba5] hover:text-[#e6e7e8] hover:bg-white/[0.08] rounded-[6px] transition-all">
              <Bookmark size={18} />
           </button>
        </div>

        {/* URL Bar */}
        <form
          onSubmit={handleAddrSubmit}
          className="flex-1 no-drag flex items-center"
          style={{ minWidth: 0 }}
        >
          <div
            className="relative flex items-center w-full transition-all duration-150 border border-[#3b3c42] focus-within:border-[#4f46e5]/50 group"
            style={{
              height: 32,
              background: '#2b2c31',
              borderRadius: 8,
            }}
          >
            {/* Inside left: Location Dot */}
            <div className="pl-3 flex items-center shrink-0 gap-2">
               {isDemoUrl ? (
                  <div className="w-4 h-4 rounded-full bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">
                     <Check size={12} strokeWidth={4} />
                  </div>
               ) : (
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ 
                      backgroundColor: getWeb3Color(activeTab.url),
                      transition: 'background-color 500ms ease'
                    }} 
                  />
               )}
            </div>

            <div className="flex-1 relative h-full flex items-center">
              <input
                ref={addrRef}
                type="text"
                value={isEditing ? addrInput : (activeTab ? resolveDisplay(activeTab.url, false) : '')}
                onChange={e => setAddrInput(e.target.value)}
                onFocus={() => {
                  setIsEditing(true);
                  setAddrInput(activeTab ? resolveDisplay(activeTab.url, true) : '');
                  setTimeout(() => addrRef.current?.select(), 20);
                }}
                onBlur={() => setIsEditing(false)}
                placeholder="Search or enter address"
                className="w-full h-full bg-transparent focus:outline-none"
                style={{
                  padding: `0 ${isDemoUrl ? '60px' : '12px'} 0 12px`,
                  fontSize: 13,
                  fontWeight: 400,
                  color: isDark ? '#e6e7e8' : 'rgba(0,0,0,0.90)',
                }}
              />
              {isDemoUrl && !isEditing && (
                 <div className="absolute right-3 flex items-center gap-2 pointer-events-none">
                    <div className="px-2 py-0.5 rounded-md bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-[#06b6d4] text-[9px] font-black uppercase tracking-widest">
                       IPFS
                    </div>
                 </div>
              )}
              {isNavigating && (
                <div className="absolute right-3">
                  <Spinner size={14} color="#4f46e5" />
                </div>
              )}
            </div>

            {/* Inside right: Web3 Score + AI Icon */}
            <div className="pr-2 flex items-center gap-1 shrink-0">
               <button 
                 type="button"
                 onClick={(e) => { e.stopPropagation(); setScorePanelOpen(!scorePanelOpen); }}
                 className="p-1 hover:bg-white/5 rounded text-[#9a9ba5] hover:text-[#e6e7e8] transition-colors"
               >
                 <Shield size={16} />
               </button>
               <button 
                 type="button"
                 className="p-1 hover:bg-white/5 rounded text-[#9a9ba5] hover:text-[#e6e7e8] transition-colors"
               >
                 <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center text-[8px] font-bold text-white">O</div>
               </button>
            </div>

            {scorePanelOpen && activeTab?.url && (
                <Web3ScoreDropdown
                  info={getWeb3ScoreInfo(activeTab.url)}
                  onClose={() => setScorePanelOpen(false)}
                  isDark={isDark}
                />
            )}
          </div>
        </form>

        {/* Right Side Icons */}
        <div className="flex items-center ml-2 shrink-0">
           <div className="w-[1px] h-5 bg-[#3b3c42] mr-2" />
           <ToolbarIcon icon={<Puzzle />} title="Extensions" />
           <ToolbarIcon icon={<PanelRight />} title="Sidebar" />
           <div className="relative">
             <ToolbarIcon icon={<Wallet />} title="Wallet" onClick={() => setWalletOpen(!walletOpen)} />
             {walletOpen && (
                  <WalletPanel
                    onClose={() => setWalletOpen(false)}
                    onOpenDashboard={() => { navigate(DASHBOARD_URL); setWalletOpen(false); }}
                  />
             )}
           </div>
           <ToolbarIcon icon={<Star />} title="Favorites" />
           <ToolbarIcon icon={<Shield />} title="Shields" />
           <ToolbarIcon 
             icon={<div className="w-2 h-2 rounded-full bg-green-500" />} 
             title="Node Status" 
           />
           <div className="relative">
             <ToolbarIcon icon={<AlignJustify />} title="Menu" isLast onClick={() => setMenuOpen(!menuOpen)} />
             {menuOpen && (
               <div ref={menuRef}>
                 <BurgerMenu
                    isDark={isDark}
                    isDarkMode={theme === 'dark'}
                    zoom={zoom}
                    onNewTab={() => addTab()}
                    onDashboard={() => navigate(DASHBOARD_URL)}
                    onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    onZoomIn={() => setZoom(z => Math.min(z + 10, 200))}
                    onZoomOut={() => setZoom(z => Math.max(z - 10, 25))}
                    onClose={() => setMenuOpen(false)}
                 />
               </div>
             )}
           </div>
        </div>
      </div>

      {/* ── BOOKMARKS BAR ── */}
      <BookmarksBar />

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
      <div className="flex-1 relative overflow-y-auto flex">
        <AnimatePresence>
          {!hasOnboarded && (
             <OnboardingOverlay onComplete={() => {
                setHasOnboarded(true);
                navigateTab(activeTabId, DASHBOARD_URL, DASHBOARD_URL, 'https');
             }} />
          )}
          {passwordModal && (
            <PasswordModal
              mode={passwordModal.mode}
              onSuccess={passwordModal.onSuccess}
              onCancel={() => setPasswordModal(null)}
            />
          )}
        </AnimatePresence>
        
        <div className="flex-1 relative min-h-full">
          <AnimatePresence>
            {permissionPrompt && (
               <OrivonPermissionPrompt 
                 details={permissionPrompt} 
                 onApprove={handleApprove} 
                 onReject={handleReject} 
               />
            )}
            {showExtensionNotif && (
               <ExtensionNotification onDismiss={() => setShowExtensionNotif(false)} />
            )}
          </AnimatePresence>

          {tabs.map(tab => (
            <div
              key={tab.url === NEW_TAB ? `${tab.id}-${newTabKeys[tab.id] ?? 0}` : tab.id}
              className="absolute inset-0"
              style={{
                zIndex: tab.id === activeTabId ? 1 : 0,
                pointerEvents: tab.id === activeTabId ? 'auto' : 'none',
                opacity: tab.id === activeTabId ? 1 : 0,
                display: tab.id === activeTabId ? 'block' : 'none',
              }}
            >
              {tab.url === NEW_TAB ? (
                <NewTab onNavigate={(url) => navigate(url, tab.id)} />
              ) : tab.url.startsWith(DASHBOARD_URL) ? (
                walletStatus === 'locked'
                  ? <DashboardUnlockInline isDark={isDark} />
                  : <Dashboard
                      onOpenBrowser={(url) => {
                        const newId = addTab(url);
                        setTimeout(() => navigate(url, newId), 10);
                      }}
                    />
              ) : tab.url === SETTINGS_URL ? (
                <SettingsPage />
              ) : tab.url === NODEMANAGER_URL ? (
                <NodeManagerPage />
              ) : tab.url === 'uniswap.eth' ? (
                <UniswapDemo onRequestApproval={handleRequestApproval} />
              ) : tab.url === 'mastodon.eth' ? (
                <MastodonDemo />
              ) : tab.url === 'btcnode.eth' ? (
                <BitcoinNodeDemo />
              ) : tab.url === 'apps.orivon.eth' || tab.url === 'orivon://apps' ? (
                <AppStoreDemo 
                  onInstall={(app) => handleRequestApproval({ type: 'install', app })} 
                  onNavigate={(url) => {
                    const newId = addTab(url);
                    setTimeout(() => navigate(url, newId), 10);
                  }}
                />
              ) : tab.url === 'opensea.eth' ? (
                <OpenSeaDemo />
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
        {rightPanelOpen && showWeb3Scores && (
            <div
              className="shrink-0 overflow-hidden"
              style={{
                width: 260,
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
            </div>
        )}
      </div>

    </div>
  );
}

// ─── NavBtn ─────────────────────────────────────────────────────────────────
function NavBtn({
  children, onClick, disabled, title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="no-drag w-[34px] h-[34px] flex items-center justify-center rounded-[6px] transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
    >
      <span 
        className="transition-colors group-hover:text-[#e6e7e8]"
        style={{ color: disabled ? '#6b7280' : '#9a9ba5', display: 'flex', alignItems: 'center' }}
      >
        {children}
      </span>
    </button>
  );
}

// ─── Burger menu ────────────────────────────────────────────────────────────
interface BurgerMenuProps {
  isDark: boolean; isDarkMode: boolean; zoom: number;
  onNewTab: () => void; onDashboard: () => void;
  onTheme: () => void; onZoomIn: () => void; onZoomOut: () => void; onClose: () => void;
}

function BurgerMenu({ isDark, isDarkMode, zoom, onNewTab, onDashboard, onTheme, onZoomIn, onZoomOut, onClose }: BurgerMenuProps) {
  const bg    = isDark ? '#1e1f24' : '#ffffff';
  const brd   = isDark ? '#2b2c31' : 'rgba(0,0,0,0.09)';
  const txt   = isDark ? '#e6e7e8' : 'rgba(0,0,0,0.82)';
  const muted = isDark ? '#9a9ba5' : 'rgba(0,0,0,0.35)';
  const hov   = isDark ? '#2b2c31' : 'rgba(0,0,0,0.05)';
  const ico   = { color: isDark ? '#9a9ba5' : 'rgba(0,0,0,0.45)', width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 as const };
  const row   = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '7px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, color: txt, fontSize: 13 };

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
        <ChevronRight size={14} className="text-[#9a9ba5]" />
      )}
    </button>
  );

  const div = () => <div style={{ height: 1, background: brd, margin: '4px 0' }} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.97 }}
      transition={{ duration: 0.13 }}
      style={{
        position: 'absolute', top: 34, right: 0, width: 280, zIndex: 200,
        background: bg, borderRadius: 12,
        border: `1px solid ${brd}`,
        boxShadow: isDark ? '0 12px 48px rgba(0,0,0,0.55)' : '0 8px 32px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        padding: '6px 0',
      }}
    >
      {item(<Plus size={16}/>, 'New Tab', '⌘T', onNewTab)}
      {item(<Square size={16}/>, 'New Window', '⌘N', () => onClose())}
      {div()}
      {item(<LayoutGrid size={16}/>, 'Dashboard', '', onDashboard)}
      {item(<History size={16}/>, 'History', '⌘Y', () => onClose())}
      {item(<Bookmark size={16}/>, 'Bookmarks', '⌘B', () => onClose())}
      {item(<Download size={16}/>, 'Downloads', '⇧⌘J', () => onClose())}
      {item(<Globe size={16}/>, 'Extensions', '', () => onClose())}
      {div()}
      {item(<Settings size={16}/>, 'Settings', '⌘,', () => onClose())}
      {item(<HelpCircle size={16}/>, 'About Orivon', '', () => onClose())}
    </motion.div>
  );
}

function Web3ScoreDropdown({ info, onClose, isDark }: {
  info: { name: string, color: string, desc: string },
  onClose: () => void,
  isDark: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{
        position: 'absolute',
        top: 32,
        left: 20,
        width: 240,
        background: isDark ? '#1c1c1f' : '#ffffff',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        zIndex: 100
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: info.color }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: isDark ? '#fff' : '#111' }}>{info.name}</span>
      </div>
      <p style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#4b5563', lineHeight: 1.5, marginBottom: 12 }}>
        {info.desc}
      </p>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); }}
        style={{ fontSize: 11, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
      >
        Learn more about Web3 Scores
      </a>
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
