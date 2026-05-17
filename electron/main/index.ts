import { app, BrowserWindow, ipcMain, shell, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import fs from 'fs';
import { resolveURL } from './resolvers/url-router';

const isDev = !!process.env['ELECTRON_RENDERER_URL'];

// ─── Persistent store (userData JSON) ─────────────────────────────────────────

function storePath(): string {
  return path.join(app.getPath('userData'), 'orivon-store.json');
}
function readStore(): Record<string, unknown> {
  try { return JSON.parse(fs.readFileSync(storePath(), 'utf-8')); } catch { return {}; }
}
function writeStore(data: Record<string, unknown>): void {
  fs.writeFileSync(storePath(), JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Window factory ───────────────────────────────────────────────────────────

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'darwin',
    backgroundColor: '#0f0f0f',
    show: false,
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      // ── Preload path — file is index.mjs (ESM output from electron-vite) ──
      preload: path.join(__dirname, '../preload/index.mjs'),
      nodeIntegration: false,   // Never expose Node in renderer
      contextIsolation: true,   // Enforce context separation
      webviewTag: true,         // Allow <webview> for real browsing
      sandbox: false,           // Required for preload with contextBridge
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  // ── Load renderer ──────────────────────────────────────────────────────────
  if (isDev) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']!);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // ── Content Security Policy for the shell window ──────────────────────────
  // Webviews have their own session and are not covered here.
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    if (!details.url.startsWith('devtools://')) {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // Allow the renderer to load fonts from Google Fonts and connect to Ethereum RPC
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
            "connect-src 'self' https: wss:; " +
            "font-src 'self' https://fonts.gstatic.com data:; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "img-src 'self' data: https:;",
          ],
        },
      });
    } else {
      callback({});
    }
  });

  return win;
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  // Allow CORS from webview requests (users are browsing real websites)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
      },
    });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // ── Auto-updater (production only, GitHub Releases) ───────────────────────
  if (!isDev) {
    autoUpdater.logger = null; // Silence verbose logging; handle events below
    autoUpdater.checkForUpdatesAndNotify().catch(() => {
      // Non-fatal: runs fine without network or before first release
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── IPC: Persistent store ─────────────────────────────────────────────────────

ipcMain.handle('store:get', (_e, key: string) => {
  const s = readStore(); return key ? s[key] : s;
});
ipcMain.handle('store:set', (_e, key: string, value: unknown) => {
  const s = readStore(); s[key] = value; writeStore(s); return true;
});
ipcMain.handle('store:delete', (_e, key: string) => {
  const s = readStore(); delete s[key]; writeStore(s); return true;
});

// ─── IPC: URL resolution (ENS / IPFS / ipns) ──────────────────────────────────

ipcMain.handle('resolve:url', async (_e, url: string) => {
  try { return await resolveURL(url); }
  catch (err) { return { ok: false, url, type: 'error', error: String(err) }; }
});

// ─── IPC: Window controls ──────────────────────────────────────────────────────

ipcMain.on('window:minimize', e => BrowserWindow.fromWebContents(e.sender)?.minimize());
ipcMain.on('window:maximize', e => {
  const w = BrowserWindow.fromWebContents(e.sender);
  w?.isMaximized() ? w.unmaximize() : w?.maximize();
});
ipcMain.on('window:close', e => BrowserWindow.fromWebContents(e.sender)?.close());
ipcMain.on('shell:open',   (_e, url: string) => shell.openExternal(url));

// ─── Security: lock down new windows and webview navigations ──────────────────

app.on('web-contents-created', (_e, contents) => {
  contents.on('will-navigate', (ev, url) => {
    // Block devtools navigations in the shell window
    if (url.startsWith('devtools://') && !isDev) ev.preventDefault();
  });

  // Open _blank links in the system browser, never spawn new Electron windows
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
});

// ─── Auto-updater events (sent to all windows) ────────────────────────────────

autoUpdater.on('update-available', () => {
  BrowserWindow.getAllWindows().forEach(w =>
    w.webContents.send('app:update-available')
  );
});
autoUpdater.on('update-downloaded', () => {
  BrowserWindow.getAllWindows().forEach(w =>
    w.webContents.send('app:update-downloaded')
  );
});
