export interface DeviceInfo {
  id: string;
  name: string;
  type: 'bluetooth' | 'usb' | 'wifi';
  connected: boolean;
}

export interface ConnectionState {
  status: 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';
  device: DeviceInfo | null;
  error?: string;
}

export interface ElectronAPI {
  // Device management
  getDeviceStatus: () => Promise<{ connected: boolean; deviceName: string | null }>;
  scanDevices: () => Promise<DeviceInfo[]>;
  connectDevice: (deviceId: string) => Promise<{ success: boolean; error?: string }>;
  disconnectDevice: () => Promise<{ success: boolean }>;

  // Conversations
  getConversations: () => Promise<unknown[]>;

  // Messages
  getMessages: (conversationId: string) => Promise<unknown[]>;
  sendMessage: (
    conversationId: string,
    message: string,
    attachments?: string[]
  ) => Promise<{ success: boolean; error?: string; message?: unknown }>;

  // Attachments
  downloadAttachment: (attachmentId: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  selectFiles: () => Promise<string[]>;

  // Events - return cleanup function
  onDeviceConnected: (callback: (deviceInfo: unknown) => void) => () => void;
  onDeviceDisconnected: (callback: () => void) => () => void;
  onConnectionState: (callback: (state: ConnectionState) => void) => () => void;
  onNewMessage: (callback: (message: unknown) => void) => () => void;
  onConversationsUpdated: (callback: (conversations: unknown[]) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
