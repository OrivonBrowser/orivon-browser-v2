"use strict";
const electron = require("electron");
const updaterPkg = require("electron-updater");
const log = require("electron-log");
const path = require("path");
const Store = require("electron-store");
const ethers = require("ethers");
const bcrypt = require("bcryptjs");
const IPFS_GATEWAYS = [
  "https://ipfs.io",
  "https://cloudflare-ipfs.com",
  "https://dweb.link"
];
async function resolveURL(raw) {
  const input = raw.trim();
  if (!input) {
    return { ok: false, url: "", originalUrl: raw, type: "error", error: "Empty URL" };
  }
  if (input.startsWith("ipfs://")) {
    const cid = input.slice(7);
    const url2 = `${IPFS_GATEWAYS[0]}/ipfs/${cid}`;
    return { ok: true, url: url2, originalUrl: raw, type: "ipfs", ipfsGateway: IPFS_GATEWAYS[0] };
  }
  if (input.startsWith("ipns://")) {
    const name = input.slice(7);
    const url2 = `${IPFS_GATEWAYS[0]}/ipns/${name}`;
    return { ok: true, url: url2, originalUrl: raw, type: "ipns", ipfsGateway: IPFS_GATEWAYS[0] };
  }
  if (input.endsWith(".eth") || /^[a-z0-9-]+\.eth$/i.test(input.split("/")[0])) {
    return resolveENS(input);
  }
  if (input.startsWith("https://") || input.startsWith("http://")) {
    return { ok: true, url: input, originalUrl: raw, type: input.startsWith("https") ? "https" : "http" };
  }
  if (input.includes(".") && !input.includes(" ") && !input.startsWith(".")) {
    const url2 = `https://${input}`;
    return { ok: true, url: url2, originalUrl: raw, type: "https" };
  }
  const url = `https://www.google.com/search?q=${encodeURIComponent(input)}`;
  return { ok: true, url, originalUrl: raw, type: "search" };
}
async function resolveENS(name) {
  try {
    const domain = name.split("/")[0];
    const path2 = name.includes("/") ? name.slice(name.indexOf("/")) : "";
    const limoUrl = `https://${domain}.limo${path2}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5e3);
    try {
      const res = await fetch(limoUrl, { method: "HEAD", signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok || res.status === 301 || res.status === 302 || res.status === 200) {
        return { ok: true, url: limoUrl, originalUrl: name, type: "ens" };
      }
    } catch {
      clearTimeout(timeout);
    }
    const cfUrl = `https://${domain}.eth.limo${path2}`;
    return { ok: true, url: cfUrl, originalUrl: name, type: "ens" };
  } catch (err) {
    return { ok: false, url: "", originalUrl: name, type: "error", error: `ENS resolution failed: ${err}` };
  }
}
const { autoUpdater } = updaterPkg;
log.transports.file.level = "info";
log.transports.console.level = "debug";
log.initialize();
autoUpdater.logger = log;
const isDev = !!process.env["ELECTRON_RENDERER_URL"];
const CHROME_UA = process.platform === "darwin" ? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" : process.platform === "win32" ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
electron.app.commandLine.appendSwitch("disable-background-timer-throttling");
electron.app.commandLine.appendSwitch("disable-renderer-backgrounding");
electron.app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
electron.app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
electron.app.commandLine.appendSwitch("enable-accelerated-video-decode");
electron.app.commandLine.appendSwitch("enable-accelerated-video-encode");
electron.app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling,MediaSessionService");
const store = new Store();
let sessionUnlocked = false;
electron.ipcMain.handle("is-wallet-secured", () => {
  return !!store.get("wallet_secured");
});
electron.ipcMain.handle("is-wallet-unlocked", () => {
  return sessionUnlocked;
});
electron.ipcMain.handle("unlock-wallet", (_event, password) => {
  const stored = store.get("wallet_password_hash");
  if (!stored) return { success: false, error: "No password set" };
  const match = bcrypt.compareSync(password, stored);
  if (match) {
    sessionUnlocked = true;
    return { success: true };
  }
  return { success: false, error: "Incorrect password" };
});
electron.ipcMain.handle("set-password", (_event, password) => {
  const hash = bcrypt.hashSync(password, 12);
  store.set("wallet_password_hash", hash);
  store.set("wallet_secured", true);
  sessionUnlocked = true;
  return { success: true };
});
electron.ipcMain.handle("onboarding:complete", () => {
  store.set("onboarding_complete", true);
  return true;
});
electron.ipcMain.handle("onboarding:status", () => {
  return !!store.get("onboarding_complete");
});
async function initializeWallet() {
  try {
    const existing = store.get("orivon_wallet_address");
    if (!existing) {
      const wallet = ethers.ethers.Wallet.createRandom();
      store.set("orivon_wallet_address", wallet.address);
      store.set("orivon_wallet_mnemonic", wallet.mnemonic?.phrase);
      store.set("orivon_wallet_name", "Orivon Wallet 1");
      store.set("orivon_wallets", [{
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase,
        name: "Orivon Wallet 1"
      }]);
    }
  } catch (err) {
    log.error("Silent wallet init failed:", err);
  }
}
function createWindow() {
  const win = new electron.BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    // macOS: hidden Keeps native traffic lights, we position them
    // Windows/Linux: frame:false so we render our own controls
    ...process.platform === "darwin" ? {
      titleBarStyle: "hidden",
      trafficLightPosition: { x: 20, y: 10 },
      vibrancy: "under-window"
    } : {
      frame: false,
      titleBarStyle: "hidden"
    },
    backgroundColor: "#1a1a1a",
    show: false,
    icon: path.join(__dirname, "../../build/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });
  win.setFullScreenable(true);
  win.once("ready-to-show", () => win.show());
  if (isDev) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  win.on("enter-full-screen", () => {
    win.webContents.send("window:fullscreen-change", true);
  });
  win.on("leave-full-screen", () => {
    win.webContents.send("window:fullscreen-change", false);
  });
  win.on("maximize", () => {
    win.webContents.send("window:maximized-change", true);
  });
  win.on("unmaximize", () => {
    win.webContents.send("window:maximized-change", false);
  });
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    if (details.url.startsWith("devtools://")) {
      callback({});
      return;
    }
    const responseHeaders = { ...details.responseHeaders };
    responseHeaders["Content-Security-Policy"] = [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'self' https: wss:; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:;"
    ];
    if (!responseHeaders["Access-Control-Allow-Origin"] && !responseHeaders["access-control-allow-origin"]) {
      responseHeaders["Access-Control-Allow-Origin"] = ["*"];
    }
    callback({ responseHeaders });
  });
  return win;
}
function buildAppMenu() {
  const isMac = process.platform === "darwin";
  const editMenu = {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "pasteAndMatchStyle" },
      { role: "delete" },
      { role: "selectAll" }
    ]
  };
  const template = [
    ...isMac ? [{ label: electron.app.name, submenu: [{ role: "hide" }, { role: "quit" }] }] : [],
    editMenu
  ];
  electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(template));
}
function setupContextMenu(win) {
  win.webContents.on("context-menu", (_e, params) => {
    const items = [];
    if (params.selectionText) {
      items.push(
        { label: "Copy", accelerator: "CmdOrCtrl+C", click: () => electron.clipboard.writeText(params.selectionText) },
        { type: "separator" }
      );
    }
    if (params.isEditable) {
      items.push(
        { label: "Cut", role: "cut" },
        { label: "Copy", role: "copy" },
        { label: "Paste", role: "paste" },
        { type: "separator" },
        { label: "Select All", role: "selectAll" }
      );
    }
    if (items.length > 0) {
      electron.Menu.buildFromTemplate(items).popup({ window: win });
    }
  });
}
electron.app.whenReady().then(async () => {
  buildAppMenu();
  store.clear();
  await initializeWallet();
  electron.session.defaultSession.setUserAgent(CHROME_UA);
  electron.session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(true);
  });
  electron.session.defaultSession.setPermissionCheckHandler(() => true);
  const win = createWindow();
  setupContextMenu(win);
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      const w = createWindow();
      setupContextMenu(w);
    }
  });
  if (!isDev) {
    setupAutoUpdater();
  }
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.ipcMain.handle("store:get", (_e, key) => {
  return key ? store.get(key) : null;
});
electron.ipcMain.handle("store:set", (_e, key, value) => {
  store.set(key, value);
  return true;
});
electron.ipcMain.handle("store:delete", (_e, key) => {
  store.delete(key);
  return true;
});
electron.ipcMain.handle("get-wallet", () => {
  return {
    address: store.get("orivon_wallet_address") || null,
    name: store.get("orivon_wallet_name") || null,
    hasWallet: !!store.get("orivon_wallet_address")
  };
});
electron.ipcMain.handle("get-mnemonic", () => {
  return {
    mnemonic: store.get("orivon_wallet_mnemonic") || null
  };
});
electron.ipcMain.handle("import-wallet", async (_e, mnemonic) => {
  try {
    const isValid = ethers.ethers.Mnemonic.isValidMnemonic(mnemonic);
    if (!isValid) {
      return { success: false, error: "Invalid seed phrase" };
    }
    const wallet = ethers.ethers.Wallet.fromPhrase(mnemonic);
    const wallets = store.get("orivon_wallets") || [];
    if (wallets.some((w) => w.address.toLowerCase() === wallet.address.toLowerCase())) {
      return { success: true, address: wallet.address, alreadyExists: true };
    }
    wallets.push({
      address: wallet.address,
      mnemonic,
      name: `Imported Wallet ${wallets.length + 1}`
    });
    store.set("orivon_wallets", wallets);
    if (!store.get("orivon_wallet_address")) {
      store.set("orivon_wallet_address", wallet.address);
      store.set("orivon_wallet_mnemonic", mnemonic);
      store.set("orivon_wallet_name", `Imported Wallet ${wallets.length}`);
    }
    return { success: true, address: wallet.address };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("resolve:url", async (_e, url) => {
  try {
    return await resolveURL(url);
  } catch (err) {
    return { ok: false, url, type: "error", error: String(err) };
  }
});
electron.ipcMain.on("window:minimize", (e) => electron.BrowserWindow.fromWebContents(e.sender)?.minimize());
electron.ipcMain.on("window:maximize", (e) => {
  const w = electron.BrowserWindow.fromWebContents(e.sender);
  w?.isMaximized() ? w.unmaximize() : w?.maximize();
});
electron.ipcMain.on("window:close", (e) => electron.BrowserWindow.fromWebContents(e.sender)?.close());
electron.ipcMain.handle("window:is-maximized", (e) => electron.BrowserWindow.fromWebContents(e.sender)?.isMaximized());
electron.ipcMain.on("shell:open", (_e, url) => electron.shell.openExternal(url));
electron.app.on("web-contents-created", (_e, contents) => {
  contents.on("will-navigate", (ev, url) => {
    if (url.startsWith("devtools://") && !isDev) ev.preventDefault();
  });
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) electron.shell.openExternal(url);
    return { action: "deny" };
  });
});
function broadcast(channel, ...args) {
  electron.BrowserWindow.getAllWindows().forEach((w) => {
    if (!w.isDestroyed()) w.webContents.send(channel, ...args);
  });
}
function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("checking-for-update", () => {
    log.info("[updater] Checking for update…");
  });
  autoUpdater.on("update-available", (info) => {
    log.info(`[updater] Update available: ${info.version}`);
    broadcast("app:update-available", info.version);
  });
  autoUpdater.on("update-not-available", (info) => {
    log.info(`[updater] Already on latest version: ${info.version}`);
  });
  autoUpdater.on("error", (err) => {
    log.error("[updater] Error:", err.message ?? err);
    broadcast("app:update-error", err.message ?? String(err));
  });
  autoUpdater.on("download-progress", (progress) => {
    const pct = Math.round(progress.percent);
    log.info(`[updater] Downloading… ${pct}% (${Math.round(progress.bytesPerSecond / 1024)} KB/s)`);
    broadcast("app:update-progress", pct);
  });
  autoUpdater.on("update-downloaded", (info) => {
    log.info(`[updater] Update downloaded: ${info.version}. Will install on quit.`);
    broadcast("app:update-downloaded", info.version);
  });
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.warn("[updater] Check failed:", err.message ?? err);
    });
  }, 5e3);
  setInterval(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.warn("[updater] Periodic check failed:", err.message ?? err);
    });
  }, 4 * 60 * 60 * 1e3);
}
electron.ipcMain.on("app:install-update", () => {
  log.info("[updater] User requested immediate install — quitting and installing.");
  autoUpdater.quitAndInstall(false, true);
});
