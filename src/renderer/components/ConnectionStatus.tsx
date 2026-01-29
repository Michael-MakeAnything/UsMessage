import { useStore } from '../store';

function ConnectionStatus() {
  const { deviceStatus } = useStore();

  return (
    <div className={`connection-status ${deviceStatus.connected ? 'connected' : 'disconnected'}`}>
      <span className="status-indicator" />
      <span className="status-text">
        {deviceStatus.connected ? `Connected to ${deviceStatus.deviceName}` : 'iPhone not connected'}
      </span>
    </div>
  );
}

export default ConnectionStatus;
