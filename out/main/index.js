import { app, session, BrowserWindow, ipcMain, shell } from "electron";
import updaterPkg from "electron-updater";
import path from "path";
import fs from "fs";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
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
const isDev = !!process.env["ELECTRON_RENDERER_URL"];
const CHROME_UA = process.platform === "darwin" ? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" : process.platform === "win32" ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
app.commandLine.appendSwitch("enable-accelerated-video-decode");
app.commandLine.appendSwitch("enable-accelerated-video-encode");
app.commandLine.appendSwitch("disable-features", "HardwareMediaKeyHandling,MediaSessionService");
function storePath() {
  return path.join(app.getPath("userData"), "orivon-store.json");
}
function readStore() {
  try {
    return JSON.parse(fs.readFileSync(storePath(), "utf-8"));
  } catch {
    return {};
  }
}
function writeStore(data) {
  fs.writeFileSync(storePath(), JSON.stringify(data, null, 2), "utf-8");
}
function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    frame: process.platform !== "darwin",
    backgroundColor: "#0f0f0f",
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
  win.once("ready-to-show", () => win.show());
  if (isDev) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    if (details.url.startsWith("devtools://")) {
      callback({});
      return;
    }
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'self' https: wss:; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:;"
        ]
      }
    });
  });
  return win;
}
app.whenReady().then(() => {
  session.defaultSession.setUserAgent(CHROME_UA);
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(true);
  });
  session.defaultSession.setPermissionCheckHandler(() => true);
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Access-Control-Allow-Origin": ["*"]
      }
    });
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  if (!isDev) {
    autoUpdater.logger = null;
    autoUpdater.checkForUpdatesAndNotify().catch(() => {
    });
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
ipcMain.handle("store:get", (_e, key) => {
  const s = readStore();
  return key ? s[key] : s;
});
ipcMain.handle("store:set", (_e, key, value) => {
  const s = readStore();
  s[key] = value;
  writeStore(s);
  return true;
});
ipcMain.handle("store:delete", (_e, key) => {
  const s = readStore();
  delete s[key];
  writeStore(s);
  return true;
});
ipcMain.handle("resolve:url", async (_e, url) => {
  try {
    return await resolveURL(url);
  } catch (err) {
    return { ok: false, url, type: "error", error: String(err) };
  }
});
ipcMain.on("window:minimize", (e) => BrowserWindow.fromWebContents(e.sender)?.minimize());
ipcMain.on("window:maximize", (e) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  w?.isMaximized() ? w.unmaximize() : w?.maximize();
});
ipcMain.on("window:close", (e) => BrowserWindow.fromWebContents(e.sender)?.close());
ipcMain.on("shell:open", (_e, url) => shell.openExternal(url));
app.on("web-contents-created", (_e, contents) => {
  contents.on("will-navigate", (ev, url) => {
    if (url.startsWith("devtools://") && !isDev) ev.preventDefault();
  });
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    return { action: "deny" };
  });
});
autoUpdater.on("update-available", () => {
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send("app:update-available"));
});
autoUpdater.on("update-downloaded", () => {
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send("app:update-downloaded"));
});
