import { useStore } from '../store';

interface ConnectionStatusProps {
  onSettingsClick: () => void;
}

function ConnectionStatus({ onSettingsClick }: ConnectionStatusProps) {
  const { deviceStatus } = useStore();

  return (
    <div className={`connection-status ${deviceStatus.connected ? 'connected' : 'disconnected'}`}>
      <span className="status-indicator" />
      <span className="status-text">
        {deviceStatus.connected ? `Connected to ${deviceStatus.deviceName}` : 'iPhone not connected'}
      </span>
      <button className="settings-btn" onClick={onSettingsClick} title="Settings">
        ⚙
      </button>
    </div>
  );
}

export default ConnectionStatus;
