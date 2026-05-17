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
  // ── URL resolution (ENS / IPFS / ipns) ────────────────────────────────────
  resolveURL: (url) => ipcRenderer.invoke("resolve:url", url),
  // ── Window controls ────────────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close")
  },
  // ── Shell ──────────────────────────────────────────────────────────────────
  openExternal: (url) => ipcRenderer.send("shell:open", url)
});
