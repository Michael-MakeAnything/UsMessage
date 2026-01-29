import { EventEmitter } from 'events';
import { bluetoothService, BluetoothDevice, ConnectionState } from './bluetooth';

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'bluetooth' | 'usb' | 'wifi';
  connected: boolean;
  batteryLevel?: number;
}

/**
 * DeviceManager coordinates device discovery and connection
 * across multiple transport types (Bluetooth, USB, WiFi)
 */
export class DeviceManager extends EventEmitter {
  private currentDevice: DeviceInfo | null = null;
  private isScanning = false;

  constructor() {
    super();
    this.setupBluetoothListeners();
  }

  private setupBluetoothListeners() {
    bluetoothService.on('state-changed', (state: ConnectionState) => {
      this.emit('connection-state', state);

      if (state.status === 'connected' && state.device) {
        this.currentDevice = {
          id: state.device.id,
          name: state.device.name,
          type: 'bluetooth',
          connected: true,
        };
        this.emit('device-connected', this.currentDevice);
      } else if (state.status === 'disconnected') {
        if (this.currentDevice) {
          this.emit('device-disconnected', this.currentDevice);
          this.currentDevice = null;
        }
      }
    });

    bluetoothService.on('connected', (device: BluetoothDevice) => {
      console.log('Bluetooth device connected:', device.name);
    });

    bluetoothService.on('disconnected', () => {
      console.log('Bluetooth device disconnected');
    });
  }

  /**
   * Get current connection status
   */
  getStatus(): { connected: boolean; deviceName: string | null } {
    return {
      connected: this.currentDevice?.connected ?? false,
      deviceName: this.currentDevice?.name ?? null,
    };
  }

  /**
   * Scan for available devices
   */
  async scanForDevices(): Promise<DeviceInfo[]> {
    if (this.isScanning) {
      return [];
    }

    this.isScanning = true;
    this.emit('scan-started');

    try {
      const devices: DeviceInfo[] = [];

      // Scan Bluetooth
      const btDevices = await bluetoothService.scanForDevices();
      for (const device of btDevices) {
        // Filter for iPhones (by name pattern)
        if (this.isLikelyIPhone(device.name)) {
          devices.push({
            id: device.id,
            name: device.name,
            type: 'bluetooth',
            connected: device.connected,
          });
        }
      }

      this.emit('scan-complete', devices);
      return devices;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Connect to a device
   */
  async connect(deviceId: string, type: 'bluetooth' | 'usb' | 'wifi' = 'bluetooth'): Promise<void> {
    switch (type) {
      case 'bluetooth':
        await bluetoothService.connect(deviceId);
        break;
      case 'usb':
        // TODO: Implement USB connection
        throw new Error('USB connection not implemented');
      case 'wifi':
        // TODO: Implement WiFi connection
        throw new Error('WiFi connection not implemented');
    }
  }

  /**
   * Disconnect from current device
   */
  async disconnect(): Promise<void> {
    if (this.currentDevice) {
      switch (this.currentDevice.type) {
        case 'bluetooth':
          await bluetoothService.disconnect();
          break;
      }
    }
  }

  /**
   * Simple heuristic to detect iPhone devices
   */
  private isLikelyIPhone(name: string): boolean {
    const lowerName = name.toLowerCase();
    return (
      lowerName.includes('iphone') ||
      lowerName.includes('ipad') ||
      lowerName.includes("'s iphone") ||
      lowerName.includes("'s ipad")
    );
  }
}

export const deviceManager = new DeviceManager();
