import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1a1a',
      symbolColor: '#ffffff',
      height: 40,
    },
    backgroundColor: '#1a1a1a',
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for iPhone communication will go here
ipcMain.handle('get-device-status', async () => {
  // TODO: Implement device detection via libimobiledevice
  return { connected: false, deviceName: null };
});

ipcMain.handle('get-conversations', async () => {
  // TODO: Fetch conversations from iPhone
  return [];
});

ipcMain.handle('get-messages', async (_event, conversationId: string) => {
  // TODO: Fetch messages for a conversation
  return [];
});

ipcMain.handle('send-message', async (_event, conversationId: string, message: string, attachments?: string[]) => {
  // TODO: Send message via iPhone
  return { success: false, error: 'Not implemented' };
});
