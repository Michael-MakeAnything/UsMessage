import { useEffect } from 'react';
import { useStore, Message } from './store';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ConnectionStatus from './components/ConnectionStatus';
import DeviceScanner from './components/DeviceScanner';

function App() {
  const { deviceStatus, setDeviceStatus, addMessage, setConversations } = useStore();

  useEffect(() => {
    // Check device status on load
    window.electronAPI?.getDeviceStatus().then(setDeviceStatus);

    // Listen for device events
    const cleanupConnected = window.electronAPI?.onDeviceConnected((deviceInfo) => {
      const info = deviceInfo as { name: string };
      setDeviceStatus({ connected: true, deviceName: info.name });
      // Fetch conversations when connected
      window.electronAPI?.getConversations().then((convs) => {
        setConversations(convs as never[]);
      });
    });

    const cleanupDisconnected = window.electronAPI?.onDeviceDisconnected(() => {
      setDeviceStatus({ connected: false, deviceName: null });
    });

    const cleanupNewMessage = window.electronAPI?.onNewMessage((message) => {
      addMessage(message as Message);
    });

    const cleanupConversations = window.electronAPI?.onConversationsUpdated((conversations) => {
      setConversations(conversations as never[]);
    });

    return () => {
      cleanupConnected?.();
      cleanupDisconnected?.();
      cleanupNewMessage?.();
      cleanupConversations?.();
    };
  }, [setDeviceStatus, addMessage, setConversations]);

  // Fetch conversations when already connected
  useEffect(() => {
    if (deviceStatus.connected) {
      window.electronAPI?.getConversations().then((convs) => {
        setConversations(convs as never[]);
      });
    }
  }, [deviceStatus.connected, setConversations]);

  return (
    <div className="app">
      <div className="titlebar-drag-region" />
      <ConnectionStatus />
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
    </div>
  );
}

export default App;
