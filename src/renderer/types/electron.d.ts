export interface ElectronAPI {
  getDeviceStatus: () => Promise<{ connected: boolean; deviceName: string | null }>;
  getConversations: () => Promise<unknown[]>;
  getMessages: (conversationId: string) => Promise<unknown[]>;
  sendMessage: (
    conversationId: string,
    message: string,
    attachments?: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  onDeviceConnected: (callback: (deviceInfo: unknown) => void) => void;
  onDeviceDisconnected: (callback: () => void) => void;
  onNewMessage: (callback: (message: unknown) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
