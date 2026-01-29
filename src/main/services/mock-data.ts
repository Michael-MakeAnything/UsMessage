import { Conversation, Message } from './message-service';

/**
 * Mock data for UI development and testing
 * Enable by setting USE_MOCK_DATA=true in environment
 */

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['+1 (555) 123-4567'],
    displayName: 'Mom',
    isGroup: false,
    unreadCount: 2,
    lastMessage: {
      id: 'msg-1-5',
      conversationId: 'conv-1',
      sender: '+1 (555) 123-4567',
      text: 'Did you see the photos I sent?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isFromMe: false,
      status: 'delivered',
    },
  },
  {
    id: 'conv-2',
    participants: ['+1 (555) 234-5678', '+1 (555) 345-6789', '+1 (555) 456-7890'],
    displayName: 'Family Group',
    isGroup: true,
    unreadCount: 0,
    lastMessage: {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      sender: '+1 (555) 234-5678',
      text: 'See everyone Sunday!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isFromMe: false,
      status: 'delivered',
    },
  },
  {
    id: 'conv-3',
    participants: ['+1 (555) 567-8901'],
    displayName: 'John',
    isGroup: false,
    unreadCount: 0,
    lastMessage: {
      id: 'msg-3-2',
      conversationId: 'conv-3',
      sender: 'me',
      text: 'Sounds good!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isFromMe: true,
      status: 'read',
    },
  },
  {
    id: 'conv-4',
    participants: ['+1 (555) 678-9012', '+1 (555) 789-0123'],
    displayName: 'Work Team',
    isGroup: true,
    unreadCount: 5,
    lastMessage: {
      id: 'msg-4-10',
      conversationId: 'conv-4',
      sender: '+1 (555) 678-9012',
      text: 'Meeting moved to 3pm',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isFromMe: false,
      status: 'delivered',
    },
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      sender: 'me',
      text: 'Hey Mom!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isFromMe: true,
      status: 'read',
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      sender: '+1 (555) 123-4567',
      text: 'Hi sweetie! How are you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 55),
      isFromMe: false,
      status: 'delivered',
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      sender: 'me',
      text: "I'm doing great! Just finished work.",
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      isFromMe: true,
      status: 'read',
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-1',
      sender: '+1 (555) 123-4567',
      text: "That's wonderful! I sent you some photos from the trip.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      isFromMe: false,
      status: 'delivered',
      attachments: [
        {
          id: 'att-1',
          type: 'image',
          filename: 'beach_sunset.jpg',
          mimeType: 'image/jpeg',
          size: 1024000,
        },
        {
          id: 'att-2',
          type: 'image',
          filename: 'family_dinner.jpg',
          mimeType: 'image/jpeg',
          size: 2048000,
        },
      ],
    },
    {
      id: 'msg-1-5',
      conversationId: 'conv-1',
      sender: '+1 (555) 123-4567',
      text: 'Did you see the photos I sent?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isFromMe: false,
      status: 'delivered',
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      sender: '+1 (555) 345-6789',
      text: "Hey everyone! What time is dinner on Sunday?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isFromMe: false,
      status: 'delivered',
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      sender: '+1 (555) 456-7890',
      text: "I was thinking 6pm?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      isFromMe: false,
      status: 'delivered',
    },
    {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      sender: '+1 (555) 234-5678',
      text: 'See everyone Sunday!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isFromMe: false,
      status: 'delivered',
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      sender: '+1 (555) 567-8901',
      text: 'Want to grab lunch tomorrow?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25),
      isFromMe: false,
      status: 'delivered',
    },
    {
      id: 'msg-3-2',
      conversationId: 'conv-3',
      sender: 'me',
      text: 'Sounds good!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isFromMe: true,
      status: 'read',
    },
  ],
  'conv-4': [
    {
      id: 'msg-4-1',
      conversationId: 'conv-4',
      sender: '+1 (555) 678-9012',
      text: 'Team, please review the Q4 report before tomorrow.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isFromMe: false,
      status: 'delivered',
    },
    {
      id: 'msg-4-2',
      conversationId: 'conv-4',
      sender: '+1 (555) 789-0123',
      text: "I'll have my section done by end of day.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isFromMe: false,
      status: 'delivered',
    },
    {
      id: 'msg-4-3',
      conversationId: 'conv-4',
      sender: 'me',
      text: 'Working on it now.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isFromMe: true,
      status: 'delivered',
    },
    {
      id: 'msg-4-10',
      conversationId: 'conv-4',
      sender: '+1 (555) 678-9012',
      text: 'Meeting moved to 3pm',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isFromMe: false,
      status: 'delivered',
    },
  ],
};

export function getMockConversations(): Conversation[] {
  return MOCK_CONVERSATIONS;
}

export function getMockMessages(conversationId: string): Message[] {
  return MOCK_MESSAGES[conversationId] || [];
}
