import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import Store from 'electron-store';

const store = new Store();
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../renderer/preload.js')
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('store-get', (_, key) => store.get(key));
ipcMain.handle('store-set', (_, key, value) => store.set(key, value));
ipcMain.handle('store-delete', (_, key) => store.delete(key));
