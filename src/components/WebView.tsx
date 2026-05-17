/**
 * WebView — wraps Electron's <webview> tag in React.
 * In non-Electron environments (browser dev mode), renders an iframe fallback.
 */
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { Globe, AlertTriangle, RefreshCcw } from 'lucide-react';

export interface WebViewHandle {
  loadURL:    (url: string) => void;
  goBack:     () => void;
  goForward:  () => void;
  reload:     () => void;
  stop:       () => void;
  canGoBack:  () => boolean;
  canGoForward: () => boolean;
  getURL:     () => string;
}

interface WebViewProps {
  src: string;
  onDidNavigate?:       (url: string) => void;
  onTitleUpdate?:       (title: string) => void;
  onLoadStart?:         () => void;
  onLoadStop?:          () => void;
  onLoadFail?:          (code: number, desc: string) => void;
  onNewWindow?:         (url: string) => void;
  className?: string;
}

const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

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
  const wvRef  = useRef<any>(null); // Electron.WebviewTag — typed as any for renderer compat
  const ifrRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [iframeLoaded, setIframeLoaded]   = useState(false);

  // Expose handle to parent
  useImperativeHandle(ref, () => ({
    loadURL: (url) => {
      if (isElectron && wvRef.current) {
        wvRef.current.loadURL(url);
      } else {
        setIframeBlocked(false);
        setIframeLoaded(false);
        if (ifrRef.current) ifrRef.current.src = url;
      }
    },
    goBack: () => {
      if (isElectron && wvRef.current && wvRef.current.canGoBack()) wvRef.current.goBack();
    },
    goForward: () => {
      if (isElectron && wvRef.current && wvRef.current.canGoForward()) wvRef.current.goForward();
    },
    reload: () => {
      if (isElectron && wvRef.current) wvRef.current.reload();
      else if (ifrRef.current) { ifrRef.current.src = ifrRef.current.src; }
    },
    stop: () => {
      if (isElectron && wvRef.current) wvRef.current.stop();
    },
    canGoBack: () =>    isElectron && wvRef.current ? wvRef.current.canGoBack()    : false,
    canGoForward: () => isElectron && wvRef.current ? wvRef.current.canGoForward() : false,
    getURL: () => {
      if (isElectron && wvRef.current) return wvRef.current.getURL();
      return ifrRef.current?.src ?? src;
    },
  }));

  // Wire up Electron webview events
  useEffect(() => {
    if (!isElectron || !wvRef.current) return;
    const wv = wvRef.current;

    const onStart   = () => onLoadStart?.();
    const onStop    = () => onLoadStop?.();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onNav     = (e: any) => { onDidNavigate?.(e.url ?? wv.getURL()); };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onTitle   = (e: any) => { onTitleUpdate?.(e.title ?? ''); };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFail    = (e: any) => { onLoadFail?.(e.errorCode, e.errorDescription); };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onNewWin  = (e: any) => { onNewWindow?.(e.url ?? ''); e.preventDefault(); };

    wv.addEventListener('did-start-loading',   onStart);
    wv.addEventListener('did-stop-loading',    onStop);
    wv.addEventListener('did-navigate',        onNav);
    wv.addEventListener('did-navigate-in-page',onNav);
    wv.addEventListener('page-title-updated',  onTitle);
    wv.addEventListener('did-fail-load',       onFail);
    wv.addEventListener('new-window',          onNewWin);

    return () => {
      wv.removeEventListener('did-start-loading',   onStart);
      wv.removeEventListener('did-stop-loading',    onStop);
      wv.removeEventListener('did-navigate',        onNav);
      wv.removeEventListener('did-navigate-in-page',onNav);
      wv.removeEventListener('page-title-updated',  onTitle);
      wv.removeEventListener('did-fail-load',       onFail);
      wv.removeEventListener('new-window',          onNewWin);
    };
  }, [onLoadStart, onLoadStop, onDidNavigate, onTitleUpdate, onLoadFail, onNewWindow]);

  // ── Electron mode: real webview ──────────────────────────────────────────────
  if (isElectron) {
    // webview is an Electron-only HTML element not in React's type definitions
    // @ts-ignore
    return <webview ref={wvRef} src={src} className={`w-full h-full border-none ${className}`} allowpopups="true" webpreferences="contextIsolation=yes" style={{ display: 'flex' }} />;
  }

  // ── Browser dev mode: iframe with fallback ───────────────────────────────────
  return (
    <div className={`relative w-full h-full bg-white ${className}`}>
      {!iframeBlocked && (
        <iframe
          ref={ifrRef}
          src={src}
          className="w-full h-full border-none"
          onLoad={() => setIframeLoaded(true)}
          onError={() => setIframeBlocked(true)}
          title="browser-content"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        />
      )}
      {iframeBlocked && <BlockedPage url={src} onRetry={() => setIframeBlocked(false)} />}
    </div>
  );
});

WebView.displayName = 'WebView';
export default WebView;

// ─── Blocked page (iframe blocked by X-Frame-Options) ─────────────────────────

function BlockedPage({ url, onRetry }: { url: string; onRetry: () => void }) {
  let hostname = url;
  try { hostname = new URL(url).hostname; } catch {}

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-5 bg-[#0f0f0f] text-white">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
        <Globe size={22} className="text-white/25" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-[15px] font-semibold text-white/60">{hostname}</p>
        <p className="text-[12px] text-white/30">
          This site blocks embedding. In the Electron build, it opens via native WebView.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 h-8 px-4 rounded-lg bg-white/[0.05] hover:bg-white/10 text-[12px] text-white/50 hover:text-white/80 border border-white/[0.07] transition-all"
        >
          <RefreshCcw size={12} /> Retry
        </button>
        {window.electronAPI?.openExternal && (
          <button
            onClick={() => window.electronAPI!.openExternal(url)}
            className="flex items-center gap-2 h-8 px-4 rounded-lg bg-white/[0.05] hover:bg-white/10 text-[12px] text-white/50 hover:text-white/80 border border-white/[0.07] transition-all"
          >
            Open in system browser
          </button>
        )}
      </div>
      <p className="text-[10px] text-white/15 text-center max-w-xs">
        Dev mode limitation. Run <code className="bg-white/5 px-1 rounded">npm run electron:dev</code> to browse with real WebView.
      </p>
    </div>
  );
}
