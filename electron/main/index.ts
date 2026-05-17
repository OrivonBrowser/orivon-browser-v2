import { app, BrowserWindow, ipcMain, shell, session, protocol } from 'electron';
import path from 'path';
import fs from 'fs';
import { resolveURL } from './resolvers/url-router';

// ─── Persistence (simple JSON file in userData) ───────────────────────────────

function storePath(): string {
  return path.join(app.getPath('userData'), 'orivon-store.json');
}

function readStore(): Record<string, unknown> {
  try {
    const raw = fs.readFileSync(storePath(), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, unknown>): void {
  fs.writeFileSync(storePath(), JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Window creation ──────────────────────────────────────────────────────────

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
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,          // Enable <webview> tags in renderer
      sandbox: false,            // Required for preload
      webSecurity: true,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  // Load renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    // electron-vite dev mode
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  // Allow all content security policies in webviews (real browsing)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
      },
    });
  });

  // Intercept webview navigations to resolve ENS / IPFS
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['*://*/*'] },
    (details, callback) => {
      callback({});
    }
  );

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── IPC: Persistent store ────────────────────────────────────────────────────

ipcMain.handle('store:get', (_evt, key: string) => {
  const store = readStore();
  return key ? store[key] : store;
});

ipcMain.handle('store:set', (_evt, key: string, value: unknown) => {
  const store = readStore();
  store[key] = value;
  writeStore(store);
  return true;
});

ipcMain.handle('store:delete', (_evt, key: string) => {
  const store = readStore();
  delete store[key];
  writeStore(store);
  return true;
});

// ─── IPC: URL resolution (ENS / IPFS / ipns) ─────────────────────────────────

ipcMain.handle('resolve:url', async (_evt, url: string) => {
  try {
    return await resolveURL(url);
  } catch (err) {
    return { ok: false, url, type: 'error', error: String(err) };
  }
});

// ─── IPC: Window controls (non-macOS) ─────────────────────────────────────────

ipcMain.on('window:minimize', (evt) => {
  BrowserWindow.fromWebContents(evt.sender)?.minimize();
});

ipcMain.on('window:maximize', (evt) => {
  const win = BrowserWindow.fromWebContents(evt.sender);
  if (!win) return;
  win.isMaximized() ? win.unmaximize() : win.maximize();
});

ipcMain.on('window:close', (evt) => {
  BrowserWindow.fromWebContents(evt.sender)?.close();
});

// ─── IPC: Open external URL in system browser ─────────────────────────────────

ipcMain.on('shell:open', (_evt, url: string) => {
  shell.openExternal(url);
});

// ─── IPC: Webview permissions ─────────────────────────────────────────────────

app.on('web-contents-created', (_evt, contents) => {
  // For webview contents, allow navigation but block dangerous things
  contents.on('will-navigate', (_e, url) => {
    // Allow all navigations within webview (user browsing)
    if (url.startsWith('devtools://')) _e.preventDefault();
  });

  // Open links that target _blank in system browser
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
