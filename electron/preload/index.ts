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

  // ── URL resolution (ENS / IPFS / ipns) ────────────────────────────────────
  resolveURL: (url: string) => ipcRenderer.invoke('resolve:url', url),

  // ── Window controls ────────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close:    () => ipcRenderer.send('window:close'),
  },

  // ── Shell ──────────────────────────────────────────────────────────────────
  openExternal: (url: string) => ipcRenderer.send('shell:open', url),
});
