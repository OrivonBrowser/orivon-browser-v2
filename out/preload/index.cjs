"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // ── Platform ───────────────────────────────────────────────────────────────
  platform: process.platform,
  isElectron: true,
  // ── Persistent store (main-process JSON file in userData) ─────────────────
  store: {
    get: (key) => electron.ipcRenderer.invoke("store:get", key),
    set: (key, value) => electron.ipcRenderer.invoke("store:set", key, value),
    delete: (key) => electron.ipcRenderer.invoke("store:delete", key)
  },
  // ── Wallet ─────────────────────────────────────────────────────────────────
  getWallet: () => electron.ipcRenderer.invoke("get-wallet"),
  getMnemonic: () => electron.ipcRenderer.invoke("get-mnemonic"),
  importWallet: (mnemonic) => electron.ipcRenderer.invoke("import-wallet", mnemonic),
  // ── Password Security ──────────────────────────────────────────────────────
  isWalletSecured: () => electron.ipcRenderer.invoke("is-wallet-secured"),
  isWalletUnlocked: () => electron.ipcRenderer.invoke("is-wallet-unlocked"),
  unlockWallet: (password) => electron.ipcRenderer.invoke("unlock-wallet", password),
  setPassword: (password) => electron.ipcRenderer.invoke("set-password", password),
  // ── Onboarding ─────────────────────────────────────────────────────────────
  onboarding: {
    complete: () => electron.ipcRenderer.invoke("onboarding:complete"),
    status: () => electron.ipcRenderer.invoke("onboarding:status")
  },
  // ── URL resolution (ENS / IPFS / ipns) ────────────────────────────────────
  resolveURL: (url) => electron.ipcRenderer.invoke("resolve:url", url),
  // ── Window controls ────────────────────────────────────────────────────────
  window: {
    minimize: () => electron.ipcRenderer.send("window:minimize"),
    maximize: () => electron.ipcRenderer.send("window:maximize"),
    close: () => electron.ipcRenderer.send("window:close"),
    isMaximized: () => electron.ipcRenderer.invoke("window:is-maximized"),
    onFullscreenChange: (cb) => electron.ipcRenderer.on("window:fullscreen-change", (_e, v) => cb(v)),
    onMaximizedChange: (cb) => electron.ipcRenderer.on("window:maximized-change", (_e, v) => cb(v))
  },
  // ── Shell ──────────────────────────────────────────────────────────────────
  openExternal: (url) => electron.ipcRenderer.send("shell:open", url),
  // ── Auto-updater events ────────────────────────────────────────────────────
  updater: {
    onAvailable: (cb) => electron.ipcRenderer.on("app:update-available", (_e, v) => cb(v)),
    onProgress: (cb) => electron.ipcRenderer.on("app:update-progress", (_e, p) => cb(p)),
    onDownloaded: (cb) => electron.ipcRenderer.on("app:update-downloaded", (_e, v) => cb(v)),
    onError: (cb) => electron.ipcRenderer.on("app:update-error", (_e, m) => cb(m)),
    restartAndInstall: () => electron.ipcRenderer.send("app:install-update")
  }
});
