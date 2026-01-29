import { useEffect } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  const { setDeviceStatus, addMessage } = useStore();

  useEffect(() => {
    // Check device status on load
    window.electronAPI?.getDeviceStatus().then(setDeviceStatus);

    // Listen for device events
    window.electronAPI?.onDeviceConnected((deviceInfo) => {
      setDeviceStatus({ connected: true, deviceName: (deviceInfo as { name: string }).name });
    });

    window.electronAPI?.onDeviceDisconnected(() => {
      setDeviceStatus({ connected: false, deviceName: null });
    });

    window.electronAPI?.onNewMessage((message) => {
      addMessage(message as Message);
    });
  }, [setDeviceStatus, addMessage]);

  return (
    <div className="app">
      <div className="titlebar-drag-region" />
      <ConnectionStatus />
      <div className="main-content">
        <Sidebar />
        <ChatView />
      </div>
    </div>
  );
}

export default App;
