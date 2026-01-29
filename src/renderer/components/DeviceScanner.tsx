import { useState } from 'react';
import { useStore, DeviceInfo } from '../store';

function DeviceScanner() {
  const { deviceStatus, setDeviceStatus } = useStore();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const foundDevices = await window.electronAPI?.scanDevices();
      setDevices(foundDevices || []);

      if (!foundDevices || foundDevices.length === 0) {
        setError('No iPhones found. Make sure your iPhone is nearby with Bluetooth enabled.');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (device: DeviceInfo) => {
    setError(null);

    try {
      const result = await window.electronAPI?.connectDevice(device.id);
      if (result?.success) {
        setDeviceStatus({ connected: true, deviceName: device.name });
      } else {
        setError(result?.error || 'Failed to connect');
      }
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDisconnect = async () => {
    try {
      await window.electronAPI?.disconnectDevice();
      setDeviceStatus({ connected: false, deviceName: null });
    } catch (err) {
      setError(String(err));
    }
  };

  if (deviceStatus.connected) {
    return (
      <div className="device-scanner connected">
        <div className="connected-device">
          <span className="device-icon">📱</span>
          <div className="device-info">
            <span className="device-name">{deviceStatus.deviceName}</span>
            <span className="device-status">Connected via Bluetooth</span>
          </div>
          <button className="disconnect-btn" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="device-scanner">
      <div className="scanner-header">
        <h3>Connect to iPhone</h3>
        <p>Scan for nearby iPhones with the UsMessage companion app</p>
      </div>

      {error && <div className="scanner-error">{error}</div>}

      <button
        className="scan-btn"
        onClick={handleScan}
        disabled={isScanning}
      >
        {isScanning ? 'Scanning...' : 'Scan for Devices'}
      </button>

      {devices.length > 0 && (
        <div className="device-list">
          {devices.map((device) => (
            <button
              key={device.id}
              className="device-item"
              onClick={() => handleConnect(device)}
            >
              <span className="device-icon">📱</span>
              <div className="device-info">
                <span className="device-name">{device.name}</span>
                <span className="device-type">{device.type}</span>
              </div>
              <span className="connect-arrow">→</span>
            </button>
          ))}
        </div>
      )}

      <div className="scanner-help">
        <h4>Setup Instructions</h4>
        <ol>
          <li>Install the UsMessage companion app on your iPhone</li>
          <li>Open the companion app and enable Bluetooth sharing</li>
          <li>Click "Scan for Devices" above</li>
          <li>Select your iPhone from the list</li>
        </ol>
      </div>
    </div>
  );
}

export default DeviceScanner;
