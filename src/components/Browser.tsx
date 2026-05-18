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

// Inline unlock page — renders inside browser tab when orivon://dashboard is
// visited while the wallet is locked. Browser chrome (tabs + toolbar) stays visible.
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
    // On success walletStatus flips → 'unlocked', component unmounts automatically
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

// Browser props
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

  const [addrInput, setAddrInput]     = useState('');
  const [isEditing, setIsEditing]     = useState(false);
  const [walletOpen, setWalletOpen]   = useState(false);
  const [walletModal, setWalletModal] = useState<null | 'create' | 'import' | 'unlock'>(null);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [zoom, setZoom]               = useState(100);

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

  const navigate = useCallback(async (raw: string, tabId = activeTabId) => {
    const input = raw.trim();
    if (!input) return;
    setIsEditing(false);

    if (input.startsWith('orivon://')) {
      navigateTab(tabId, input, input, 'https');
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

  const toolbarBg = isDark ? 'bg-[#1c1c1e] border-white/[0.06]' : 'bg-[#f2f2f7] border-black/[0.06]';
  const addrBg    = isDark ? 'bg-[#2c2c2e] hover:bg-[#3a3a3c] focus-within:bg-[#3a3a3c]' : 'bg-white focus-within:bg-white';
  const btn       = isDark ? 'text-white/40 hover:text-white/75 hover:bg-white/[0.07]' : 'text-black/40 hover:text-black/75 hover:bg-black/[0.06]';
  const sep       = isDark ? 'bg-white/[0.10]' : 'bg-black/[0.10]';

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDark ? 'bg-[#0f0f0f] text-white' : 'bg-[#e8e8e8] text-black'}`}>

      <TabBar tabs={tabs} activeId={activeTabId} onTabClick={setActiveTab} onTabClose={handleTabClose} onNewTab={() => addTab()} isDark={isDark}
        windowControls={!isMac && isElectron ? { onMinimize: () => window.electronAPI?.window.minimize(), onMaximize: () => window.electronAPI?.window.maximize(), onClose: () => window.electronAPI?.window.close() } : undefined}
      />

      {/* h-9 = 36px — matches Brave's compact toolbar height */}
      <div className={`h-9 flex items-center border-b ${toolbarBg} shrink-0`} style={{ padding: '0 6px' }}>

        {/* Left: nav + bookmark — small icons, subtle weight */}
        <div className="flex items-center shrink-0 no-drag" style={{ gap: 1 }}>
          <NavBtn onClick={handleBack}    disabled={!canBack}    isDark={isDark}><ChevronLeft  size={13} strokeWidth={1.8}/></NavBtn>
          <NavBtn onClick={handleForward} disabled={!canForward} isDark={isDark}><ChevronRight size={13} strokeWidth={1.8}/></NavBtn>
          <NavBtn onClick={activeTab?.isLoading ? () => webviewRefs.current[activeTabId]?.stop() : handleReload} isDark={isDark}>
            <RotateCcw size={12} className={activeTab?.isLoading ? 'animate-spin' : ''}/>
          </NavBtn>
          <div className={`w-px h-3.5 mx-1.5 ${sep}`}/>
          <NavBtn isDark={isDark} title="Bookmark"><Star size={13}/></NavBtn>
        </div>

        {/* Address bar — fills all space between left and right clusters */}
        <form onSubmit={handleAddrSubmit} className="flex-1 no-drag" style={{ minWidth: 0, padding: '0 6px' }}>
          <div className={`relative flex items-center h-[26px] rounded-full transition-all w-full ${addrBg}`}
            style={{ boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.09)' }}>
            <div className="absolute left-2.5 pointer-events-none">
              {!activeTab || activeTab.url === NEW_TAB || activeTab.url === DASHBOARD_URL
                ? <Shield size={11} color="#FB5B22"/>
                : isSecureURL(activeTab.url) ? <Lock size={10} className="text-[#00FF87]/70"/>
                : <Globe size={10} className={isDark ? 'text-white/25' : 'text-black/25'}/>}
            </div>
            <input ref={addrRef} type="text"
              value={isEditing ? addrInput : (activeTab ? resolveDisplay(activeTab.url) : '')}
              onChange={e => setAddrInput(e.target.value)}
              onFocus={() => { setIsEditing(true); setAddrInput(activeTab ? resolveDisplay(activeTab.url) : ''); setTimeout(() => addrRef.current?.select(), 20); }}
              onBlur={() => setIsEditing(false)}
              placeholder="Search or enter URL · .eth · ipfs://"
              className="w-full h-full bg-transparent pl-7 pr-3 text-[12px] focus:outline-none placeholder:text-current placeholder:opacity-30"
            />
            {activeTab?.type === 'ens'                                   && !isEditing && <span className="absolute right-2.5 text-[9px] font-bold text-[#00FF87]/60 tracking-widest pointer-events-none">ENS</span>}
            {(activeTab?.type === 'ipfs' || activeTab?.type === 'ipns') && !isEditing && <span className="absolute right-2.5 text-[9px] font-bold text-[#00D1FF]/60 tracking-widest pointer-events-none">IPFS</span>}
          </div>
        </form>

        {/* Right cluster — all w-6 h-6 to stay compact */}
        <div className="flex items-center shrink-0 no-drag" style={{ gap: 1 }}>
          <div className="relative">
            <button onClick={() => setWalletOpen(p => !p)} title="Orivon Wallet"
              className={`no-drag w-6 h-6 rounded flex items-center justify-center transition-all focus:outline-none ${walletOpen ? isDark ? 'bg-white/12 text-white/90' : 'bg-black/8 text-black/80' : btn}`}>
              <Wallet size={13}/>
            </button>
            <AnimatePresence>
              {walletOpen && (
                <WalletPanel onClose={() => setWalletOpen(false)}
                  onOpenWalletModal={mode => { setWalletModal(mode); setWalletOpen(false); }}
                  onOpenDashboard={() => { navigate(DASHBOARD_URL); setWalletOpen(false); }}
                />
              )}
            </AnimatePresence>
          </div>

          {showWeb3Scores && score !== null && (
            <button onClick={() => setRightPanelOpen(!rightPanelOpen)} title={`Web3 Score: ${score}`}
              className={`no-drag flex items-center gap-1 h-6 px-1.5 rounded text-[10px] font-semibold transition-all focus:outline-none ${rightPanelOpen ? 'bg-[#00FF87]/12 text-[#00FF87]' : btn}`}>
              <Shield size={11}/>
              <span style={{ color: score >= 90 ? '#00FF87' : score >= 70 ? '#facc15' : '#f87171' }}>{score}</span>
            </button>
          )}

          <div className={`w-px h-3.5 mx-1 ${sep}`}/>

          <button onClick={() => navigate(DASHBOARD_URL)} title="Dashboard"
            className={`no-drag w-6 h-6 rounded-full flex items-center justify-center transition-all focus:outline-none border ${
              isDark ? 'border-white/15 text-white/45 hover:text-white/75 hover:bg-white/[0.07]' : 'border-black/15 text-black/45 hover:text-black/75 hover:bg-black/[0.05]'}`}>
            <User size={12}/>
          </button>

          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(p => !p)} title="Menu"
              className={`no-drag w-6 h-6 rounded flex items-center justify-center transition-all focus:outline-none ${menuOpen ? isDark ? 'bg-white/10 text-white' : 'bg-black/8 text-black' : btn}`}>
              <AlignJustify size={13}/>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <BurgerMenu isDark={isDark} isDarkMode={isDark} zoom={zoom}
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

      <div className="flex-1 relative overflow-hidden flex">
        <div className="flex-1 relative">
          {tabs.map(tab => (
            <div key={tab.id} className="absolute inset-0"
              style={{ zIndex: tab.id === activeTabId ? 1 : 0, pointerEvents: tab.id === activeTabId ? 'auto' : 'none' }}>
              {tab.url === NEW_TAB ? (
                <NewTab onNavigate={url => navigate(url, tab.id)}/>
              ) : tab.url === DASHBOARD_URL ? (
                walletStatus === 'locked'
                  ? <DashboardUnlockInline isDark={isDark}/>
                  : <Dashboard onOpenBrowser={() => navigate(NEW_TAB)}/>
              ) : (
                <WebView ref={el => { webviewRefs.current[tab.id] = el; }} src={tab.url} {...makeCallbacks(tab.id)}/>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {rightPanelOpen && showWeb3Scores && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.18 }}
              className={`shrink-0 overflow-hidden border-l ${isDark ? 'bg-[#111] border-white/[0.07]' : 'bg-white border-black/[0.07]'}`}>
              <Web3Panel score={score} tab={activeTab} isDark={isDark} onClose={() => setRightPanelOpen(false)}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {walletModal && (
          <WalletModal mode={walletModal} onClose={() => setWalletModal(null)} onSuccess={() => setWalletModal(null)}/>
        )}
      </AnimatePresence>
    </div>
  );
}

// Burger menu
interface BurgerMenuProps { isDark: boolean; isDarkMode: boolean; zoom: number; onNewTab: () => void; onDashboard: () => void; onWallet: () => void; onTheme: () => void; onZoomIn: () => void; onZoomOut: () => void; onClose: () => void; }

function BurgerMenu({ isDark, isDarkMode, zoom, onNewTab, onDashboard, onWallet, onTheme, onZoomIn, onZoomOut, onClose }: BurgerMenuProps) {
  const bg    = isDark ? '#1e1e1e' : '#ffffff';
  const brd   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';
  const txt   = isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.82)';
  const short = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const hov   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const ico   = { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  const row   = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, color: txt, fontSize: 13 };
  const item  = (icon: React.ReactNode, label: string, sc: string, fn: () => void, chev?: boolean) => (
    <button key={label} onClick={fn} style={row} onMouseEnter={e=>{e.currentTarget.style.background=hov}} onMouseLeave={e=>{e.currentTarget.style.background='none'}}>
      <span style={ico}>{icon}</span><span style={{ flex: 1 }}>{label}</span>
      {sc && <span style={{ fontSize: 11, color: short }}>{sc}</span>}
      {chev && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: short }}><path d="M9 18l6-6-6-6"/></svg>}
    </button>
  );
  const div = () => <div style={{ height: 1, background: brd, margin: '4px 0' }}/>;
  return (
    <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}
      style={{ position: 'absolute', top: 40, right: 0, width: 320, zIndex: 200, background: bg, borderRadius: 14, border: `1px solid ${brd}`, boxShadow: '0 12px 40px rgba(0,0,0,0.25)', overflow: 'hidden', paddingBottom: 4 }}>
      <div style={{ paddingTop: 4 }}>{item(<Plus size={16}/>,'New Tab','⌘T',onNewTab)}{item(<Square size={15}/>,'New Window','⌘N',()=>onClose())}{item(<Lock size={14}/>,'New Private Window','⇧⌘N',()=>onClose())}</div>
      {div()}{item(<LayoutGrid size={15}/>,'Dashboard','',onDashboard)}{item(<Wallet size={15}/>,'Orivon Wallet','',onWallet)}{item(isDarkMode?<Sun size={15}/>:<Moon size={15}/>,isDarkMode?'Light mode':'Dark mode','',onTheme)}
      {div()}{item(<History size={15}/>,'History','⌘Y',()=>onClose(),true)}{item(<Bookmark size={15}/>,'Bookmarks','',()=>onClose(),true)}{item(<Download size={15}/>,'Downloads','⌥⌘L',()=>onClose())}{item(<Trash2 size={14}/>,'Delete Browsing Data…','⇧⌘⌫',()=>onClose())}
      {div()}
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px', gap: 12 }}>
        <ZoomIn size={16} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}/>
        <span style={{ flex: 1, fontSize: 13, color: txt }}>Zoom</span>
        <div style={{ display: 'flex', border: `1px solid ${brd}`, borderRadius: 8, overflow: 'hidden' }}>
          {[{icon:<ZoomOut size={13}/>,fn:onZoomOut},{icon:<span style={{fontSize:12,padding:'0 10px',minWidth:52,textAlign:'center' as const}}>{zoom}%</span>,fn:()=>{}},{icon:<ZoomIn size={13}/>,fn:onZoomIn},{icon:<Maximize2 size={12}/>,fn:()=>{}}].map((b,i)=>(
            <button key={i} onClick={b.fn} style={{padding:'6px 8px',background:'none',border:'none',cursor:'pointer',color:txt,display:'flex',alignItems:'center',justifyContent:'center',borderLeft:i>0?`1px solid ${brd}`:'none'}} onMouseEnter={e=>{e.currentTarget.style.background=hov}} onMouseLeave={e=>{e.currentTarget.style.background='none'}}>{b.icon}</button>
          ))}
        </div>
      </div>
      {div()}{item(<Printer size={15}/>,'Print…','⌘P',()=>onClose())}{item(<FileSearch size={15}/>,'Find in page','⌘F',()=>onClose())}
      {div()}{item(<HelpCircle size={15}/>,'Help','',()=>onClose(),true)}{item(<Settings size={15}/>,'Settings','⌘,',()=>onClose())}
    </motion.div>
  );
}

function NavBtn({ children, onClick, disabled, isDark, title }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; isDark: boolean; title?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`no-drag w-6 h-6 rounded flex items-center justify-center transition-all focus:outline-none ${isDark ? 'text-white/55 hover:text-white/85 hover:bg-white/[0.07]' : 'text-black/55 hover:text-black/80 hover:bg-black/[0.06]'} disabled:opacity-25 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );
}

function Web3Panel({ score, tab, isDark, onClose }: { score: number | null; tab?: ReturnType<typeof useTabsStore.getState>['tabs'][0]; isDark: boolean; onClose: () => void }) {
  const muted = isDark ? 'text-white/35' : 'text-black/35';
  const scores = [{ label: 'Trust', value: score ?? 0, color: '#00FF87' }, { label: 'Security', value: score ? Math.round(score * 0.97) : 0, color: '#00D1FF' }, { label: 'Privacy', value: 96, color: '#a78bfa' }];
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${muted}`}>Web3 Score</span>
        <button onClick={onClose} className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'hover:bg-white/8 text-white/35' : 'hover:bg-black/6 text-black/35'}`}><X size={12}/></button>
      </div>
      <div className="space-y-3.5">
        {scores.map(s => (
          <div key={s.label} className="space-y-1.5">
            <div className="flex justify-between text-[11px]"><span className={muted}>{s.label}</span><span className="font-semibold" style={{ color: s.color }}>{s.value}</span></div>
            <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`}>
              <div className="h-full rounded-full" style={{ width: `${s.value}%`, backgroundColor: s.color }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
