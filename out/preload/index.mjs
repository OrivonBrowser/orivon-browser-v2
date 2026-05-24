import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  // ── Platform ───────────────────────────────────────────────────────────────
  platform: process.platform,
  isElectron: true,
  // ── Persistent store (main-process JSON file in userData) ─────────────────
  store: {
    get: (key) => ipcRenderer.invoke("store:get", key),
    set: (key, value) => ipcRenderer.invoke("store:set", key, value),
    delete: (key) => ipcRenderer.invoke("store:delete", key)
  },
  // ── Wallet ─────────────────────────────────────────────────────────────────
  getWallet: () => ipcRenderer.invoke("get-wallet"),
  importWallet: (mnemonic) => ipcRenderer.invoke("import-wallet", mnemonic),
  // ── URL resolution (ENS / IPFS / ipns) ────────────────────────────────────
  resolveURL: (url) => ipcRenderer.invoke("resolve:url", url),
  // ── Window controls ────────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close")
  },
  // ── Shell ──────────────────────────────────────────────────────────────────
  openExternal: (url) => ipcRenderer.send("shell:open", url),
  // ── Auto-updater events ────────────────────────────────────────────────────
  updater: {
    onAvailable: (cb) => ipcRenderer.on("app:update-available", (_e, v) => cb(v)),
    onProgress: (cb) => ipcRenderer.on("app:update-progress", (_e, p) => cb(p)),
    onDownloaded: (cb) => ipcRenderer.on("app:update-downloaded", (_e, v) => cb(v)),
    onError: (cb) => ipcRenderer.on("app:update-error", (_e, m) => cb(m)),
    restartAndInstall: () => ipcRenderer.send("app:install-update")
  }
});
