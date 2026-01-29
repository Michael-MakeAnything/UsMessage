import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Device
  getDeviceStatus: () => ipcRenderer.invoke('get-device-status'),

  // Conversations
  getConversations: () => ipcRenderer.invoke('get-conversations'),
  getMessages: (conversationId: string) => ipcRenderer.invoke('get-messages', conversationId),
  sendMessage: (conversationId: string, message: string, attachments?: string[]) =>
    ipcRenderer.invoke('send-message', conversationId, message, attachments),

  // Events
  onDeviceConnected: (callback: (deviceInfo: unknown) => void) => {
    ipcRenderer.on('device-connected', (_event, deviceInfo) => callback(deviceInfo));
  },
  onDeviceDisconnected: (callback: () => void) => {
    ipcRenderer.on('device-disconnected', () => callback());
  },
  onNewMessage: (callback: (message: unknown) => void) => {
    ipcRenderer.on('new-message', (_event, message) => callback(message));
  },
});
