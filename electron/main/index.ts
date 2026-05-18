import { app, BrowserWindow, ipcMain, shell, session } from 'electron';
import updaterPkg from 'electron-updater';
const { autoUpdater } = updaterPkg;
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { resolveURL } from './resolvers/url-router';

// ─── Logger ───────────────────────────────────────────────────────────────────
// electron-log writes to:
//   macOS: ~/Library/Logs/Orivon/main.log
//   Win:   %USERPROFILE%\AppData\Roaming\Orivon\logs\main.log
//   Linux: ~/.config/Orivon/logs/main.log
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.initialize();                        // hook console.* → electron-log in renderer
autoUpdater.logger = log;

const isDev = !!process.env['ELECTRON_RENDERER_URL'];

// Chrome user-agent — must match a real Chrome version so sites like YouTube serve their
// full player with all features (seeking, quality selection, DRM, etc.)
const CHROME_UA = process.platform === 'darwin'
  ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  : process.platform === 'win32'
    ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// ─── Chromium switches (must be set before app.whenReady) ─────────────────────
//
// These affect the entire Chromium instance — not just the shell window.
// Background-tab switches are critical: they stop Chromium from pausing media,
// timers and rendering in tabs that are not currently visible.

// Keep background tabs fully alive (video/audio continues when switching tabs)
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

// Allow media to auto-play without a user gesture (required for many Web3 apps)
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Hardware video decoding (smoother YouTube, reduces CPU)
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-accelerated-video-encode');

// Disable the OS-level media-key handling that Electron intercepts — lets
// media-key events reach the webview instead (pause/play keys work in YouTube)
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

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
    // macOS: hiddenInset keeps native traffic lights, we position them
    // Windows/Linux: frame:false so we render our own controls
    ...(process.platform === 'darwin'
      ? {
          titleBarStyle: 'hiddenInset' as const,
          trafficLightPosition: { x: 14, y: 12 },
        }
      : {
          frame: false,
          titleBarStyle: 'hidden' as const,
        }),
    backgroundColor: '#1a1a1a',
    show: false,
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  if (isDev) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']!);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // CSP for the shell window only (webviews have their own session)
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    if (details.url.startsWith('devtools://')) { callback({}); return; }
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "connect-src 'self' https: wss:; " +
          "font-src 'self' https://fonts.gstatic.com data:; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data: https:;",
        ],
      },
    });
  });

  return win;
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  // ── User agent — override for ALL requests from this session ──────────────
  // This makes sites serve the same content they'd serve to Chrome.
  // The webview element also sets useragent="" which overrides navigator.userAgent
  // inside the page — both levels are needed for full YouTube compatibility.
  session.defaultSession.setUserAgent(CHROME_UA);

  // ── Permissions — grant everything webviews ask for ───────────────────────
  // Webview pages need media access (camera, mic, DRM), notifications, etc.
  // We grant everything here; real permission UX can be layered on top later.
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(true); // allow all (media, geolocation, notifications, clipboard, etc.)
  });
  session.defaultSession.setPermissionCheckHandler(() => true);

  // ── CORS headers — allow cross-origin requests from webviews ──────────────
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

  if (!isDev) {
    setupAutoUpdater();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─── IPC: Store ───────────────────────────────────────────────────────────────

ipcMain.handle('store:get', (_e, key: string) => {
  const s = readStore(); return key ? s[key] : s;
});
ipcMain.handle('store:set', (_e, key: string, value: unknown) => {
  const s = readStore(); s[key] = value; writeStore(s); return true;
});
ipcMain.handle('store:delete', (_e, key: string) => {
  const s = readStore(); delete s[key]; writeStore(s); return true;
});

// ─── IPC: URL resolution ──────────────────────────────────────────────────────

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

// ─── Security: control new windows and navigations ───────────────────────────

app.on('web-contents-created', (_e, contents) => {
  contents.on('will-navigate', (ev, url) => {
    if (url.startsWith('devtools://') && !isDev) ev.preventDefault();
  });

  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url);
    return { action: 'deny' };
  });
});

// ─── Auto-updater ─────────────────────────────────────────────────────────────

function broadcast(channel: string, ...args: unknown[]) {
  BrowserWindow.getAllWindows().forEach(w => {
    if (!w.isDestroyed()) w.webContents.send(channel, ...args);
  });
}

function setupAutoUpdater() {
  // Download updates silently in background; install on next quit by default.
  autoUpdater.autoDownload        = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    log.info('[updater] Checking for update…');
  });

  autoUpdater.on('update-available', (info: { version: string }) => {
    log.info(`[updater] Update available: ${info.version}`);
    broadcast('app:update-available', info.version);
  });

  autoUpdater.on('update-not-available', (info: { version: string }) => {
    log.info(`[updater] Already on latest version: ${info.version}`);
  });

  autoUpdater.on('error', (err: Error) => {
    log.error('[updater] Error:', err.message ?? err);
    broadcast('app:update-error', err.message ?? String(err));
  });

  autoUpdater.on('download-progress', (progress: { percent: number; bytesPerSecond: number }) => {
    const pct = Math.round(progress.percent);
    log.info(`[updater] Downloading… ${pct}% (${Math.round(progress.bytesPerSecond / 1024)} KB/s)`);
    broadcast('app:update-progress', pct);
  });

  autoUpdater.on('update-downloaded', (info: { version: string }) => {
    log.info(`[updater] Update downloaded: ${info.version}. Will install on quit.`);
    broadcast('app:update-downloaded', info.version);
  });

  // Delay first check 5 s so the window is fully ready before any notification
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err: Error) => {
      log.warn('[updater] Check failed:', err.message ?? err);
    });
  }, 5_000);

  // Re-check every 4 hours while the app is running
  setInterval(() => {
    autoUpdater.checkForUpdates().catch((err: Error) => {
      log.warn('[updater] Periodic check failed:', err.message ?? err);
    });
  }, 4 * 60 * 60 * 1_000);
}

// Called from renderer when user clicks "Restart now"
ipcMain.on('app:install-update', () => {
  log.info('[updater] User requested immediate install — quitting and installing.');
  autoUpdater.quitAndInstall(false, true); // isSilent=false, isForceRunAfter=true
});
