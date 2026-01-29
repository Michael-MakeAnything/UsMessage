import { useEffect, useState } from 'react';
import { useStore, Message, Conversation } from './store';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ConnectionStatus from './components/ConnectionStatus';
import DeviceScanner from './components/DeviceScanner';
import Settings from './components/Settings';

// Demo mode - set to true to test UI without a connected device
const DEMO_MODE = true;

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['+1 (555) 123-4567'],
    displayName: 'Mom',
    isGroup: false,
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    participants: ['+1 (555) 234-5678', '+1 (555) 345-6789'],
    displayName: 'Family Group',
    isGroup: true,
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    participants: ['+1 (555) 567-8901'],
    displayName: 'John',
    isGroup: false,
    unreadCount: 0,
  },
  {
    id: 'conv-4',
    participants: ['+1 (555) 678-9012', '+1 (555) 789-0123'],
    displayName: 'Work Team',
    isGroup: true,
    unreadCount: 5,
  },
];

const DEMO_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      sender: 'me',
      text: 'Hey Mom!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isFromMe: true,
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      sender: 'Mom',
      text: 'Hi sweetie! How are you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 55),
      isFromMe: false,
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      sender: 'me',
      text: "I'm doing great! Just finished work.",
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      isFromMe: true,
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-1',
      sender: 'Mom',
      text: "That's wonderful! I sent you some photos from the trip.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      isFromMe: false,
    },
    {
      id: 'msg-1-5',
      conversationId: 'conv-1',
      sender: 'Mom',
      text: 'Did you see the photos I sent?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isFromMe: false,
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      sender: 'Dad',
      text: "Hey everyone! What time is dinner on Sunday?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isFromMe: false,
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      sender: 'Sister',
      text: "I was thinking 6pm?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      isFromMe: false,
    },
    {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      sender: 'Mom',
      text: 'See everyone Sunday!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isFromMe: false,
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      sender: 'John',
      text: 'Want to grab lunch tomorrow?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25),
      isFromMe: false,
    },
    {
      id: 'msg-3-2',
      conversationId: 'conv-3',
      sender: 'me',
      text: 'Sounds good!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isFromMe: true,
    },
  ],
  'conv-4': [
    {
      id: 'msg-4-1',
      conversationId: 'conv-4',
      sender: 'Boss',
      text: 'Team, please review the Q4 report before tomorrow.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isFromMe: false,
    },
    {
      id: 'msg-4-2',
      conversationId: 'conv-4',
      sender: 'Colleague',
      text: "I'll have my section done by end of day.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isFromMe: false,
    },
    {
      id: 'msg-4-3',
      conversationId: 'conv-4',
      sender: 'me',
      text: 'Working on it now.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isFromMe: true,
    },
    {
      id: 'msg-4-4',
      conversationId: 'conv-4',
      sender: 'Boss',
      text: 'Meeting moved to 3pm',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isFromMe: false,
    },
  ],
};

function App() {
  const { deviceStatus, setDeviceStatus, addMessage, setConversations, setMessages, selectedConversationId } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (DEMO_MODE) {
      // Load demo data
      setDeviceStatus({ connected: true, deviceName: "Michael's iPhone (Demo)" });
      setConversations(DEMO_CONVERSATIONS);
      return;
    }

    // Check device status on load
    window.electronAPI?.getDeviceStatus().then(setDeviceStatus);

    // Listen for device events
    const cleanupConnected = window.electronAPI?.onDeviceConnected((deviceInfo) => {
      const info = deviceInfo as { name: string };
      setDeviceStatus({ connected: true, deviceName: info.name });
      // Fetch conversations when connected
      window.electronAPI?.getConversations().then((convs) => {
        setConversations(convs as Conversation[]);
      });
    });

    const cleanupDisconnected = window.electronAPI?.onDeviceDisconnected(() => {
      setDeviceStatus({ connected: false, deviceName: null });
    });

    const cleanupNewMessage = window.electronAPI?.onNewMessage((message) => {
      addMessage(message as Message);
    });

    const cleanupConversations = window.electronAPI?.onConversationsUpdated((conversations) => {
      setConversations(conversations as Conversation[]);
    });

    return () => {
      cleanupConnected?.();
      cleanupDisconnected?.();
      cleanupNewMessage?.();
      cleanupConversations?.();
    };
  }, [setDeviceStatus, addMessage, setConversations]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversationId) return;

    if (DEMO_MODE) {
      const demoMessages = DEMO_MESSAGES[selectedConversationId];
      if (demoMessages) {
        setMessages(selectedConversationId, demoMessages);
      }
      return;
    }

    // Fetch messages from device
    window.electronAPI?.getMessages(selectedConversationId).then((msgs) => {
      setMessages(selectedConversationId, msgs as Message[]);
    });
  }, [selectedConversationId, setMessages]);

  // Fetch conversations when connected (non-demo)
  useEffect(() => {
    if (DEMO_MODE) return;

    if (deviceStatus.connected) {
      window.electronAPI?.getConversations().then((convs) => {
        setConversations(convs as Conversation[]);
      });
    }
  }, [deviceStatus.connected, setConversations]);

  return (
    <div className="app">
      <div className="titlebar-drag-region" />
      <ConnectionStatus onSettingsClick={() => setShowSettings(true)} />
      <div className="main-content">
        {deviceStatus.connected ? (
          <>
            <Sidebar />
            <ChatView />
          </>
        ) : (
          <div className="setup-view">
            <DeviceScanner />
          </div>
        )}
      </div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
