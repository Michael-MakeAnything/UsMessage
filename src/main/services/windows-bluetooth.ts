import { BrowserWindow, ipcMain } from 'electron';
import { EventEmitter } from 'events';

/**
 * WindowsBluetooth provides Bluetooth functionality using Electron's Web Bluetooth API
 * and Windows native Bluetooth APIs where needed.
 *
 * Electron's Web Bluetooth requires user interaction to initiate device selection,
 * so we use the select-bluetooth-device event to handle device selection.
 */
export class WindowsBluetooth extends EventEmitter {
  private mainWindow: BrowserWindow | null = null;
  private selectedDevice: Electron.BluetoothDevice | null = null;

  // UsMessage companion app service UUID
  static readonly SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';

  constructor() {
    super();
  }

  /**
   * Initialize Bluetooth handling for a window
   */
  initialize(window: BrowserWindow): void {
    this.mainWindow = window;

    // Handle Bluetooth device selection
    window.webContents.on('select-bluetooth-device', (event, devices, callback) => {
      event.preventDefault();

      console.log('Bluetooth devices found:', devices.map(d => d.deviceName));

      // Emit devices for UI to display
      this.emit('devices-found', devices);

      // If we have a pending device selection, use it
      if (this.selectedDevice) {
        const device = devices.find(d => d.deviceId === this.selectedDevice?.deviceId);
        if (device) {
          callback(device.deviceId);
          this.selectedDevice = null;
          return;
        }
      }

      // Auto-select iPhone if found
      const iphone = devices.find(d =>
        d.deviceName?.toLowerCase().includes('iphone') ||
        d.deviceName?.toLowerCase().includes('usmessage')
      );

      if (iphone) {
        callback(iphone.deviceId);
      } else if (devices.length > 0) {
        // Let user choose - for now, don't auto-select
        // The device selection will be handled by selectDevice()
        this.pendingCallback = callback;
        this.pendingDevices = devices;
      } else {
        callback(''); // Cancel selection
      }
    });

    // Handle pairing requests
    window.webContents.session.setBluetoothPairingHandler((details, callback) => {
      console.log('Bluetooth pairing request:', details);
      // Auto-accept pairing for now
      // In production, you'd show a UI to confirm the PIN
      callback({ confirmed: true });
    });
  }

  private pendingCallback: ((deviceId: string) => void) | null = null;
  private pendingDevices: Electron.BluetoothDevice[] = [];

  /**
   * Get list of discovered devices
   */
  getDiscoveredDevices(): Electron.BluetoothDevice[] {
    return this.pendingDevices;
  }

  /**
   * Select a device from the pending list
   */
  selectDevice(deviceId: string): boolean {
    if (this.pendingCallback) {
      const device = this.pendingDevices.find(d => d.deviceId === deviceId);
      if (device) {
        this.pendingCallback(deviceId);
        this.pendingCallback = null;
        this.pendingDevices = [];
        return true;
      }
    }
    // Store for next scan
    this.selectedDevice = { deviceId, deviceName: '' };
    return false;
  }

  /**
   * Cancel device selection
   */
  cancelSelection(): void {
    if (this.pendingCallback) {
      this.pendingCallback('');
      this.pendingCallback = null;
      this.pendingDevices = [];
    }
  }

  /**
   * Request Bluetooth device scan via renderer
   * This triggers the Web Bluetooth API flow
   */
  async requestDeviceScan(): Promise<void> {
    if (!this.mainWindow) {
      throw new Error('Window not initialized');
    }

    // Execute Web Bluetooth request in renderer
    // This will trigger the select-bluetooth-device event
    await this.mainWindow.webContents.executeJavaScript(`
      (async () => {
        try {
          const device = await navigator.bluetooth.requestDevice({
            filters: [
              { namePrefix: 'iPhone' },
              { namePrefix: 'iPad' },
              { services: ['${WindowsBluetooth.SERVICE_UUID}'] }
            ],
            optionalServices: ['${WindowsBluetooth.SERVICE_UUID}']
          });
          return { success: true, device: { id: device.id, name: device.name } };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })()
    `);
  }
}

// Singleton instance
export const windowsBluetooth = new WindowsBluetooth();

/**
 * Setup IPC handlers for Bluetooth operations
 */
export function setupBluetoothIPC(): void {
  ipcMain.handle('bluetooth-get-devices', () => {
    return windowsBluetooth.getDiscoveredDevices().map(d => ({
      id: d.deviceId,
      name: d.deviceName || 'Unknown Device',
      type: 'bluetooth',
      connected: false,
    }));
  });

  ipcMain.handle('bluetooth-select-device', (_event, deviceId: string) => {
    return windowsBluetooth.selectDevice(deviceId);
  });

  ipcMain.handle('bluetooth-cancel-selection', () => {
    windowsBluetooth.cancelSelection();
  });
}
