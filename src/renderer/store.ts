import { create } from 'zustand';

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  text: string;
  timestamp: Date;
  attachments?: Attachment[];
  isFromMe: boolean;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  thumbnail?: string;
  filename: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  displayName: string;
  isGroup: boolean;
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
}

export interface DeviceStatus {
  connected: boolean;
  deviceName: string | null;
}

interface AppState {
  // Device
  deviceStatus: DeviceStatus;
  setDeviceStatus: (status: DeviceStatus) => void;

  // Conversations
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  selectedConversationId: string | null;
  selectConversation: (id: string | null) => void;

  // Messages
  messages: Record<string, Message[]>;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // UI
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Device
  deviceStatus: { connected: false, deviceName: null },
  setDeviceStatus: (status) => set({ deviceStatus: status }),

  // Conversations
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  selectedConversationId: null,
  selectConversation: (id) => set({ selectedConversationId: id }),

  // Messages
  messages: {},
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),
  addMessage: (message) =>
    set((state) => {
      const existing = state.messages[message.conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [message.conversationId]: [...existing, message],
        },
      };
    }),

  // UI
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
