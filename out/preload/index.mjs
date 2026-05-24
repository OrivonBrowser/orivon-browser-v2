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
  getMnemonic: () => ipcRenderer.invoke("get-mnemonic"),
  importWallet: (mnemonic) => ipcRenderer.invoke("import-wallet", mnemonic),
  // ── Password Security ──────────────────────────────────────────────────────
  isWalletSecured: () => ipcRenderer.invoke("is-wallet-secured"),
  isWalletUnlocked: () => ipcRenderer.invoke("is-wallet-unlocked"),
  unlockWallet: (password) => ipcRenderer.invoke("unlock-wallet", password),
  setPassword: (password) => ipcRenderer.invoke("set-password", password),
  // ── Onboarding ─────────────────────────────────────────────────────────────
  onboarding: {
    complete: () => ipcRenderer.invoke("onboarding:complete"),
    status: () => ipcRenderer.invoke("onboarding:status")
  },
  // ── URL resolution (ENS / IPFS / ipns) ────────────────────────────────────
  resolveURL: (url) => ipcRenderer.invoke("resolve:url", url),
  // ── Window controls ────────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
    onFullscreenChange: (cb) => ipcRenderer.on("window:fullscreen-change", (_e, v) => cb(v)),
    onMaximizedChange: (cb) => ipcRenderer.on("window:maximized-change", (_e, v) => cb(v))
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
