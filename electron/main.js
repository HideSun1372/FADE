const { app, BrowserWindow } = require('electron');

const BACKEND_URL = 'https://fade-3aef.onrender.com';

let mainWindow;

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

  mainWindow.loadURL(BACKEND_URL);
  mainWindow.on('page-title-updated', (e) => e.preventDefault());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
