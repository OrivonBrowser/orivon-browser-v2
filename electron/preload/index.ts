import { contextBridge, ipcRenderer } from 'electron';

// Expose a minimal, typed API surface to the renderer.
// Nothing here touches the file system directly — all calls go through IPC.

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Platform ───────────────────────────────────────────────────────────────
  platform: process.platform as NodeJS.Platform,
  isElectron: true,

  // ── Persistent store (main-process JSON file in userData) ─────────────────
  store: {
    get:    (key: string)                   => ipcRenderer.invoke('store:get', key),
    set:    (key: string, value: unknown)   => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string)                   => ipcRenderer.invoke('store:delete', key),
  },

  // ── Wallet ─────────────────────────────────────────────────────────────────
  getWallet:    ()                => ipcRenderer.invoke('get-wallet'),
  getMnemonic:  ()                => ipcRenderer.invoke('get-mnemonic'),
  importWallet: (mnemonic: string) => ipcRenderer.invoke('import-wallet', mnemonic),

  // ── URL resolution (ENS / IPFS / ipns) ────────────────────────────────────
  resolveURL: (url: string) => ipcRenderer.invoke('resolve:url', url),

  // ── Window controls ────────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close:    () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    onFullscreenChange: (cb: (isFullscreen: boolean) => void) =>
      ipcRenderer.on('window:fullscreen-change', (_e, v: boolean) => cb(v)),
    onMaximizedChange: (cb: (isMaximized: boolean) => void) =>
      ipcRenderer.on('window:maximized-change', (_e, v: boolean) => cb(v)),
  },

  // ── Shell ──────────────────────────────────────────────────────────────────
  openExternal: (url: string) => ipcRenderer.send('shell:open', url),

  // ── Auto-updater events ────────────────────────────────────────────────────
  updater: {
    onAvailable:  (cb: (version: string) => void) =>
      ipcRenderer.on('app:update-available',  (_e, v: string) => cb(v)),
    onProgress:   (cb: (pct: number)     => void) =>
      ipcRenderer.on('app:update-progress',   (_e, p: number) => cb(p)),
    onDownloaded: (cb: (version: string) => void) =>
      ipcRenderer.on('app:update-downloaded', (_e, v: string) => cb(v)),
    onError:      (cb: (msg: string)     => void) =>
      ipcRenderer.on('app:update-error',      (_e, m: string) => cb(m)),
    restartAndInstall: () => ipcRenderer.send('app:install-update'),
  },
});
