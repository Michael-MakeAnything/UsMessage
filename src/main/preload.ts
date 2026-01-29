import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Device management
  getDeviceStatus: () => ipcRenderer.invoke('get-device-status'),
  scanDevices: () => ipcRenderer.invoke('scan-devices'),
  connectDevice: (deviceId: string) => ipcRenderer.invoke('connect-device', deviceId),
  disconnectDevice: () => ipcRenderer.invoke('disconnect-device'),

  // Conversations
  getConversations: () => ipcRenderer.invoke('get-conversations'),

  // Messages
  getMessages: (conversationId: string) => ipcRenderer.invoke('get-messages', conversationId),
  sendMessage: (conversationId: string, message: string, attachments?: string[]) =>
    ipcRenderer.invoke('send-message', conversationId, message, attachments),

  // Attachments
  downloadAttachment: (attachmentId: string) => ipcRenderer.invoke('download-attachment', attachmentId),
  selectFiles: () => ipcRenderer.invoke('select-files'),

  // Events - device
  onDeviceConnected: (callback: (deviceInfo: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, deviceInfo: unknown) => callback(deviceInfo);
    ipcRenderer.on('device-connected', handler);
    return () => ipcRenderer.removeListener('device-connected', handler);
  },
  onDeviceDisconnected: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('device-disconnected', handler);
    return () => ipcRenderer.removeListener('device-disconnected', handler);
  },
  onConnectionState: (callback: (state: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: unknown) => callback(state);
    ipcRenderer.on('connection-state', handler);
    return () => ipcRenderer.removeListener('connection-state', handler);
  },

  // Events - messages
  onNewMessage: (callback: (message: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, message: unknown) => callback(message);
    ipcRenderer.on('new-message', handler);
    return () => ipcRenderer.removeListener('new-message', handler);
  },
  onConversationsUpdated: (callback: (conversations: unknown[]) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, conversations: unknown[]) => callback(conversations);
    ipcRenderer.on('conversations-updated', handler);
    return () => ipcRenderer.removeListener('conversations-updated', handler);
  },
});
