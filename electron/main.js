const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow;
let javaProcess;

function getResourcesPath() {
  return app.isPackaged ? process.resourcesPath : path.join(__dirname, 'resources');
}

function getJrePath() {
  return app.isPackaged ? path.join(process.resourcesPath, 'jre') : path.join(__dirname, 'jre');
}

function waitForBackend(retries, delay, onSuccess, onFail) {
  const req = http.get('http://localhost:8080/', (res) => {
    onSuccess();
  });
  req.on('error', () => {
    if (retries > 0) {
      setTimeout(() => waitForBackend(retries - 1, delay, onSuccess, onFail), delay);
    } else {
      onFail();
    }
  });
  req.setTimeout(1000, () => req.destroy());
}

app.whenReady().then(() => {
  const resourcesPath = getResourcesPath();
  const jrePath = getJrePath();
  const jarPath = path.join(resourcesPath, 'app.jar');
  const javaExe = path.join(jrePath, 'bin', 'java.exe');
  const configPath = path.join(resourcesPath, 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

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

  javaProcess = spawn(javaExe, ['-jar', jarPath], {
    env: {
      ...process.env,
      DATABASE_URL: config.DATABASE_URL,
      DB_USERNAME: config.DB_USERNAME,
      DB_PASSWORD: config.DB_PASSWORD,
    },
    cwd: resourcesPath,
  });

  javaProcess.on('error', (err) => console.error('Failed to start Java:', err));
  javaProcess.stdout.on('data', (data) => process.stdout.write(`[Java] ${data}`));
  javaProcess.stderr.on('data', (data) => process.stderr.write(`[Java] ${data}`));

  waitForBackend(30, 1000,
    () => {
      if (mainWindow) mainWindow.loadURL('http://localhost:8080');
    },
    () => {
      if (mainWindow) mainWindow.webContents.executeJavaScript(
        'document.getElementById("error-msg").style.display = "block"'
      );
    }
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  if (javaProcess) javaProcess.kill();
  app.quit();
});
