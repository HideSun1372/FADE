const { app, BrowserWindow } = require('electron');
const https = require('https');

const BACKEND_URL = 'https://fade-3aef.onrender.com';

let mainWindow;

function waitForBackend(delay, onSuccess) {
  const req = https.get(BACKEND_URL, (res) => {
    onSuccess();
  });
  req.on('error', () => {
    setTimeout(() => waitForBackend(delay, onSuccess), delay);
  });
  req.setTimeout(3000, () => req.destroy());
}

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    title: 'Faint Aura - Development Experiment',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('loading.html');
  mainWindow.on('page-title-updated', (e) => e.preventDefault());

  setTimeout(() => {
    if (mainWindow) mainWindow.webContents.executeJavaScript(
      'document.getElementById("error-msg").style.display = "block"'
    );
  }, 30000);

  waitForBackend(2000, () => {
    if (mainWindow) mainWindow.loadURL(BACKEND_URL);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
