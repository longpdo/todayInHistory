const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
    title: 'Today In History',
    backgroundColor: '#062844',
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  win.loadFile('index.html');

  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const u = new URL(url);
      const allowed = u.protocol === 'https:';
      if (allowed) shell.openExternal(url);
    } catch { /* no-op */ }
    return { action: 'deny' };
  });

  // Prevent in-app navigation to external pages
  win.webContents.on('will-navigate', (e, url) => {
    if (url !== win.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
}

// Deny all permissions
app.whenReady().then(() => {
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((_wc, _perm, callback) => callback(false));
  app.on('web-contents-created', (_e, contents) => {
    // Disallow <webview>
    contents.on('will-attach-webview', (e) => e.preventDefault());
  });
  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
