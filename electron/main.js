const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow;
let javaProcess;

function resourcePath(...parts) {
    if (app.isPackaged) return path.join(process.resourcesPath, ...parts);
    return path.join(__dirname, 'resources', ...parts);
}

function waitForBackend(retries = 40, delay = 1500) {
    return new Promise((resolve, reject) => {
        const attempt = () => {
            http.get('http://localhost:8080/api/start', () => resolve())
                .on('error', () => {
                    if (retries-- > 0) setTimeout(attempt, delay);
                    else reject(new Error('Backend did not start in time'));
                });
        };
        attempt();
    });
}

app.whenReady().then(async () => {
    const javaExe = resourcePath('jre', 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
    const userData = app.getPath('userData');

    javaProcess = spawn(javaExe, [
        '-Dspring.profiles.active=desktop',
        `-Dfade.data=${userData}`,
        '-jar',
        resourcePath('app.jar'),
    ]);

    javaProcess.stdout.on('data', (d) => console.log(`[java] ${d}`));
    javaProcess.stderr.on('data', (d) => console.error(`[java] ${d}`));

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

    await waitForBackend();
    mainWindow.loadURL('http://localhost:8080');

    mainWindow.on('page-title-updated', (e) => e.preventDefault());
    mainWindow.on('closed', () => { mainWindow = null; });
});

app.on('will-quit', () => {
    if (javaProcess) javaProcess.kill();
});

app.on('window-all-closed', () => app.quit());
