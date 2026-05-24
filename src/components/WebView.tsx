/**
 * WebView — wraps Electron's <webview> tag.
 *
 * Key behaviours:
 * - Sets a real Chrome user-agent so sites like YouTube serve their full player.
 * - Loading overlay: an opaque div sits on top of the webview during every
 *   navigation/reload.  It is driven by the webview's own did-start-loading /
 *   did-stop-loading events (not the Zustand store, which is a render cycle
 *   behind).  This eliminates the brief flash of blank or stale content that
 *   would otherwise appear when switching back to a tab or hitting reload.
 * - All tabs stay fully rendered (no visibility:hidden / display:none) so media
 *   in background tabs keeps playing.
 * - Falls back to an iframe in non-Electron (Vite browser dev) mode.
 */
import React, {
  useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback
} from 'react';
import { Globe, RefreshCcw } from 'lucide-react';
import { useSettings } from '../store/settings';

// Chrome user-agent passed to the webview element.
// This overrides navigator.userAgent *inside the page*, which is what
// YouTube's player reads when deciding whether to enable full controls.
const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// ─── Public API ───────────────────────────────────────────────────────────────

export interface WebViewHandle {
  loadURL:      (url: string) => void;
  goBack:       () => void;
  goForward:    () => void;
  reload:       () => void;
  stop:         () => void;
  canGoBack:    () => boolean;
  canGoForward: () => boolean;
  getURL:       () => string;
}

interface WebViewProps {
  src:              string;
  onDidNavigate?:   (url: string) => void;
  onTitleUpdate?:   (title: string) => void;
  onLoadStart?:     () => void;
  onLoadStop?:      () => void;
  onLoadFail?:      (code: number, desc: string) => void;
  onNewWindow?:     (url: string) => void;
  className?:       string;
}

const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

// ─── Component ────────────────────────────────────────────────────────────────

const WebView = forwardRef<WebViewHandle, WebViewProps>(({
  src,
  onDidNavigate,
  onTitleUpdate,
  onLoadStart,
  onLoadStop,
  onLoadFail,
  onNewWindow,
  className = '',
}, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wvRef   = useRef<any>(null);
  const ifrRef  = useRef<HTMLIFrameElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [iframeBlocked, setIframeBlocked] = useState(false);

  // ── Loading overlay state ────────────────────────────────────────────────
  // Starts visible so there is never a flash of raw HTML before the first paint.
  // Fades out once did-stop-loading fires (with a small delay so the browser
  // composites the first frame before we remove the cover).
  const [overlay, setOverlay]   = useState(true);
  const [fading,  setFading]    = useState(false); // triggers CSS opacity transition

  const showOverlay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFading(false);
    setOverlay(true);
  }, []);

  const hideOverlay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // Short settle delay so the first painted frame is visible before we fade
    timerRef.current = setTimeout(() => {
      setFading(true);
      timerRef.current = setTimeout(() => setOverlay(false), 180); // matches transition
    }, 80);
  }, []);

  // ── Imperative handle ────────────────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    loadURL: (url) => {
      if (isElectron && wvRef.current) {
        showOverlay();
        wvRef.current.loadURL(url);
      } else {
        setIframeBlocked(false);
        if (ifrRef.current) ifrRef.current.src = url;
      }
    },
    goBack:       () => { if (isElectron && wvRef.current?.canGoBack())    { showOverlay(); wvRef.current.goBack();    } },
    goForward:    () => { if (isElectron && wvRef.current?.canGoForward()) { showOverlay(); wvRef.current.goForward(); } },
    reload:       () => { if (isElectron && wvRef.current) { showOverlay(); wvRef.current.reload(); } else if (ifrRef.current) { ifrRef.current.src = ifrRef.current.src; } },
    stop:         () => { if (isElectron && wvRef.current) wvRef.current.stop(); },
    canGoBack:    () => !!(isElectron && wvRef.current?.canGoBack()),
    canGoForward: () => !!(isElectron && wvRef.current?.canGoForward()),
    getURL:       () => (isElectron && wvRef.current ? wvRef.current.getURL() : (ifrRef.current?.src ?? src)),
  }));

  // ── Electron event wiring ────────────────────────────────────────────────
  // Two separate effects:
  //   1. Parent callbacks — re-attached when callbacks change (referential equality)
  //   2. Local overlay — attached once to the stable DOM node, no dep churn

  useEffect(() => {
    if (!isElectron || !wvRef.current) return;
    const wv = wvRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onNav    = (e: any) => onDidNavigate?.(e.url ?? wv.getURL());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onTitle  = (e: any) => onTitleUpdate?.(e.title ?? '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFail   = (e: any) => onLoadFail?.(e.errorCode, e.errorDescription);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onNewWin = (e: any) => { onNewWindow?.(e.url ?? ''); e.preventDefault(); };

    const onStart = () => onLoadStart?.();
    const onStop  = () => onLoadStop?.();

    wv.addEventListener('did-start-loading',    onStart);
    wv.addEventListener('did-stop-loading',     onStop);
    wv.addEventListener('did-navigate',         onNav);
    wv.addEventListener('did-navigate-in-page', onNav);
    wv.addEventListener('page-title-updated',   onTitle);
    wv.addEventListener('did-fail-load',        onFail);
    wv.addEventListener('new-window',           onNewWin);

    return () => {
      wv.removeEventListener('did-start-loading',    onStart);
      wv.removeEventListener('did-stop-loading',     onStop);
      wv.removeEventListener('did-navigate',         onNav);
      wv.removeEventListener('did-navigate-in-page', onNav);
      wv.removeEventListener('page-title-updated',   onTitle);
      wv.removeEventListener('did-fail-load',        onFail);
      wv.removeEventListener('new-window',           onNewWin);
    };
  }, [onLoadStart, onLoadStop, onDidNavigate, onTitleUpdate, onLoadFail, onNewWindow]);

  // Local overlay listeners — attached once, no external deps
  useEffect(() => {
    if (!isElectron) return;
    const wv = wvRef.current;
    if (!wv) return;

    const onStart = () => showOverlay();
    const onStop  = () => hideOverlay();
    const onFail  = () => hideOverlay();

    wv.addEventListener('did-start-loading', onStart);
    wv.addEventListener('did-stop-loading',  onStop);
    wv.addEventListener('did-fail-load',     onFail);

    return () => {
      wv.removeEventListener('did-start-loading', onStart);
      wv.removeEventListener('did-stop-loading',  onStop);
      wv.removeEventListener('did-fail-load',     onFail);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Electron render ──────────────────────────────────────────────────────

  if (isElectron) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        {/*
          useragent="..." overrides navigator.userAgent inside the page.
          This is the primary fix for YouTube's "something went wrong" error —
          the player reads navigator.userAgent to decide which features to enable.
        */}
        {/* @ts-ignore — webview is an Electron-only HTML element */}
        <webview
          ref={wvRef}
          src={src}
          useragent={CHROME_UA}
          allowpopups="true"
          webpreferences="contextIsolation=yes, javascript=yes, images=yes"
          style={{ width: '100%', height: '100%', border: 'none', display: 'flex' }}
        />

        {/* Loading overlay — eliminates blank-page flash on navigate / reload */}
        {overlay && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              background: '#13141a',
              opacity: fading ? 0 : 1,
              transition: fading ? 'opacity 0.18s ease' : 'none',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    );
  }

  // ── Browser / iframe fallback ────────────────────────────────────────────

  return (
    <div className={`relative w-full h-full bg-white ${className}`}>
      {!iframeBlocked ? (
        <iframe
          ref={ifrRef}
          src={src}
          className="w-full h-full border-none"
          onError={() => setIframeBlocked(true)}
          title="browser-content"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        />
      ) : (
        <BlockedPage url={src} onRetry={() => setIframeBlocked(false)} />
      )}
    </div>
  );
});

WebView.displayName = 'WebView';
export default WebView;

// ─── Blocked page ─────────────────────────────────────────────────────────────

function BlockedPage({ url, onRetry }: { url: string; onRetry: () => void }) {
  const { theme } = useSettings();
  let hostname = url;
  try { hostname = new URL(url).hostname; } catch {}
  const isDark = theme === 'dark';

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-5 ${isDark ? 'bg-[#13141a] text-white' : 'bg-[#f5f5f5] text-black'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-black/[0.03] border border-black/[0.07]'}`}>
        <Globe size={22} className={isDark ? 'text-white/25' : 'text-black/25'} />
      </div>
      <div className="text-center space-y-2">
        <p className={`text-[15px] font-semibold ${isDark ? 'text-white/60' : 'text-black/60'}`}>{hostname}</p>
        <p className={`text-[12px] ${isDark ? 'text-white/30' : 'text-black/30'}`}>
          This site blocks embedding. Run <code className={`px-1 rounded text-[11px] ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>npm run dev</code> to browse with real WebView.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className={`flex items-center gap-2 h-8 px-4 rounded-lg text-[12px] border transition-all ${isDark ? 'bg-white/[0.04] hover:bg-white/8 text-white/50 hover:text-white/80 border-white/[0.07]' : 'bg-black/[0.03] hover:bg-black/6 text-black/50 border-black/[0.07]'}`}
        >
          <RefreshCcw size={12} /> Retry
        </button>
        {window.electronAPI?.openExternal && (
          <button
            onClick={() => window.electronAPI!.openExternal(url)}
            className={`flex items-center gap-2 h-8 px-4 rounded-lg text-[12px] border transition-all ${isDark ? 'bg-white/[0.04] hover:bg-white/8 text-white/50 hover:text-white/80 border-white/[0.07]' : 'bg-black/[0.03] hover:bg-black/6 text-black/50 border-black/[0.07]'}`}
          >
            Open externally
          </button>
        )}
      </div>
    </div>
  );
}
