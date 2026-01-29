import { EventEmitter } from 'events';
import { bluetoothService } from './bluetooth';
import { deviceManager } from './device-manager';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface Conversation {
  id: string;
  participants: string[];
  displayName: string;
  isGroup: boolean;
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  text: string;
  timestamp: Date;
  attachments?: Attachment[];
  isFromMe: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file';
  filename: string;
  mimeType: string;
  size: number;
  localPath?: string;
  thumbnail?: string;
}

/**
 * MessageService handles fetching, sending, and caching messages
 */
export class MessageService extends EventEmitter {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private attachmentCache: string;

  constructor() {
    super();
    this.attachmentCache = path.join(app.getPath('userData'), 'attachments');
    this.ensureCacheDir();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.attachmentCache)) {
      fs.mkdirSync(this.attachmentCache, { recursive: true });
    }
  }

  /**
   * Fetch all conversations from connected device
   */
  async fetchConversations(): Promise<Conversation[]> {
    const status = deviceManager.getStatus();
    if (!status.connected) {
      return Array.from(this.conversations.values());
    }

    try {
      const rawConversations = await bluetoothService.getConversations();

      for (const conv of rawConversations) {
        const conversation: Conversation = {
          id: conv.id,
          participants: conv.participants,
          displayName: conv.displayName || conv.participants.join(', '),
          isGroup: conv.isGroup || conv.participants.length > 1,
          unreadCount: 0, // TODO: Get from device
        };
        this.conversations.set(conv.id, conversation);
      }

      const list = Array.from(this.conversations.values());
      this.emit('conversations-updated', list);
      return list;
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      return Array.from(this.conversations.values());
    }
  }

  /**
   * Fetch messages for a specific conversation
   */
  async fetchMessages(conversationId: string): Promise<Message[]> {
    const status = deviceManager.getStatus();
    if (!status.connected) {
      return this.messages.get(conversationId) || [];
    }

    try {
      const rawMessages = await bluetoothService.getMessages(conversationId);

      const messages: Message[] = rawMessages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date(msg.timestamp),
        isFromMe: msg.sender === 'me', // TODO: Get actual user identifier
        status: 'delivered' as const,
        attachments: msg.attachments?.map(att => ({
          id: att.id,
          type: this.getAttachmentType(att.type),
          filename: att.filename,
          mimeType: att.type,
          size: 0,
        })),
      }));

      this.messages.set(conversationId, messages);
      this.emit('messages-updated', conversationId, messages);
      return messages;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return this.messages.get(conversationId) || [];
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    text: string,
    attachmentPaths?: string[]
  ): Promise<Message | null> {
    const status = deviceManager.getStatus();
    if (!status.connected) {
      throw new Error('Not connected to device');
    }

    // Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const message: Message = {
      id: tempId,
      conversationId,
      sender: 'me',
      text,
      timestamp: new Date(),
      isFromMe: true,
      status: 'sending',
      attachments: attachmentPaths?.map((p, i) => ({
        id: `att-${i}`,
        type: this.getAttachmentTypeFromPath(p),
        filename: path.basename(p),
        mimeType: this.getMimeType(p),
        size: fs.existsSync(p) ? fs.statSync(p).size : 0,
        localPath: p,
      })),
    };

    // Add to local cache immediately (optimistic update)
    const existing = this.messages.get(conversationId) || [];
    this.messages.set(conversationId, [...existing, message]);
    this.emit('message-added', message);

    try {
      const success = await bluetoothService.sendMessage(conversationId, text, attachmentPaths);

      if (success) {
        message.status = 'sent';
        this.emit('message-updated', message);
        return message;
      } else {
        message.status = 'failed';
        this.emit('message-updated', message);
        return null;
      }
    } catch (error) {
      message.status = 'failed';
      this.emit('message-updated', message);
      throw error;
    }
  }

  /**
   * Download and cache an attachment
   */
  async downloadAttachment(attachmentId: string): Promise<string> {
    const localPath = path.join(this.attachmentCache, attachmentId);

    if (fs.existsSync(localPath)) {
      return localPath;
    }

    const data = await bluetoothService.getAttachment(attachmentId);
    fs.writeFileSync(localPath, data);

    return localPath;
  }

  private getAttachmentType(mimeType: string): 'image' | 'video' | 'file' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'file';
  }

  private getAttachmentTypeFromPath(filePath: string): 'image' | 'video' | 'file' {
    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'].includes(ext)) return 'image';
    if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) return 'video';
    return 'file';
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.heic': 'image/heic',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.webm': 'video/webm',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const messageService = new MessageService();
