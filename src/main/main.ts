import { app, BrowserWindow, ipcMain, dialog, Notification } from 'electron';
import * as path from 'path';
import { deviceManager } from './services/device-manager';
import { messageService } from './services/message-service';

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

function setupDeviceListeners(): void {
  deviceManager.on('device-connected', (device) => {
    mainWindow?.webContents.send('device-connected', device);

    // Show notification
    if (Notification.isSupported()) {
      new Notification({
        title: 'UsMessage',
        body: `Connected to ${device.name}`,
      }).show();
    }
  });

  deviceManager.on('device-disconnected', () => {
    mainWindow?.webContents.send('device-disconnected');
  });

  deviceManager.on('connection-state', (state) => {
    mainWindow?.webContents.send('connection-state', state);
  });
}

function setupMessageListeners(): void {
  messageService.on('message-added', (message) => {
    mainWindow?.webContents.send('new-message', message);

    // Show notification for incoming messages
    if (!message.isFromMe && Notification.isSupported()) {
      new Notification({
        title: message.sender,
        body: message.text || 'Sent an attachment',
      }).show();
    }
  });

  messageService.on('conversations-updated', (conversations) => {
    mainWindow?.webContents.send('conversations-updated', conversations);
  });
}

app.whenReady().then(() => {
  createWindow();
  setupDeviceListeners();
  setupMessageListeners();

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

// ===== IPC Handlers =====

// Device management
ipcMain.handle('get-device-status', async () => {
  return deviceManager.getStatus();
});

ipcMain.handle('scan-devices', async () => {
  return deviceManager.scanForDevices();
});

ipcMain.handle('connect-device', async (_event, deviceId: string) => {
  try {
    await deviceManager.connect(deviceId);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('disconnect-device', async () => {
  await deviceManager.disconnect();
  return { success: true };
});

// Conversations
ipcMain.handle('get-conversations', async () => {
  return messageService.fetchConversations();
});

// Messages
ipcMain.handle('get-messages', async (_event, conversationId: string) => {
  return messageService.fetchMessages(conversationId);
});

ipcMain.handle('send-message', async (_event, conversationId: string, text: string, attachments?: string[]) => {
  try {
    const message = await messageService.sendMessage(conversationId, text, attachments);
    return { success: !!message, message };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// Attachments
ipcMain.handle('download-attachment', async (_event, attachmentId: string) => {
  try {
    const localPath = await messageService.downloadAttachment(attachmentId);
    return { success: true, path: localPath };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// File picker
ipcMain.handle('select-files', async () => {
  if (!mainWindow) return [];

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'] },
      { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'webm'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  return result.canceled ? [] : result.filePaths;
});
