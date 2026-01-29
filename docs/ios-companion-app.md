# UsMessage iOS Companion App Specification

This document outlines the requirements for the iOS companion app that enables UsMessage to communicate with iMessage.

## Overview

The iOS companion app runs on the iPhone and acts as a bridge between the Windows UsMessage app and iMessage. It uses Bluetooth Low Energy (BLE) to communicate.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        iPhone                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              UsMessage Companion App                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │   BLE GATT  │  │   Message   │  │  Shortcut   │      │   │
│  │  │   Server    │  │   Handler   │  │  Integration│      │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │   │
│  │         │                │                │              │   │
│  │         └────────────────┼────────────────┘              │   │
│  │                          │                               │   │
│  └──────────────────────────┼───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────┼───────────────────────────────┐   │
│  │                     iOS Messages                          │   │
│  │              (via Shortcuts / MessageUI)                  │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## BLE Service Specification

### Service UUID
```
12345678-1234-5678-1234-56789abcdef0
```

### Characteristics

#### Messages Characteristic (Read/Write/Notify)
**UUID:** `12345678-1234-5678-1234-56789abcdef1`

Used for reading conversations and sending messages.

**Read Response Format (JSON):**
```json
{
  "type": "conversations",
  "data": [
    {
      "id": "conv-123",
      "participants": ["+15551234567"],
      "displayName": "John Doe",
      "isGroup": false,
      "lastMessageTime": 1704067200000
    }
  ]
}
```

**Write Request Format (JSON):**
```json
{
  "action": "get_messages",
  "conversationId": "conv-123",
  "limit": 50,
  "beforeTimestamp": null
}
```

```json
{
  "action": "send_message",
  "conversationId": "conv-123",
  "text": "Hello!",
  "attachments": ["base64-encoded-data"]
}
```

#### Photos Characteristic (Read/Write/Notify)
**UUID:** `12345678-1234-5678-1234-56789abcdef2`

Used for transferring photo/video attachments.

**Write Request (to request an attachment):**
```json
{
  "action": "get_attachment",
  "attachmentId": "att-456"
}
```

**Read Response:**
- Chunked binary data with header indicating total size
- Uses BLE's maximum MTU for efficient transfer

#### Notifications Characteristic (Notify)
**UUID:** `12345678-1234-5678-1234-56789abcdef3`

Push notifications for new messages.

**Notification Format (JSON):**
```json
{
  "type": "new_message",
  "conversationId": "conv-123",
  "message": {
    "id": "msg-789",
    "sender": "+15551234567",
    "text": "New message!",
    "timestamp": 1704067200000,
    "hasAttachments": true
  }
}
```

## iOS Implementation Notes

### Option 1: Shortcuts Integration (Recommended for non-jailbroken devices)

iOS Shortcuts can be used to:
- Read recent messages (limited)
- Send messages via the Messages app
- Handle incoming message notifications

**Limitations:**
- Cannot read full message history
- Requires user interaction for some actions
- No direct access to message database

### Option 2: MessageUI Framework

For sending messages only:
```swift
import MessageUI

class MessageComposer: MFMessageComposeViewControllerDelegate {
    func sendMessage(to recipients: [String], body: String, attachments: [Data]) {
        let controller = MFMessageComposeViewController()
        controller.recipients = recipients
        controller.body = body

        for attachment in attachments {
            controller.addAttachmentData(attachment, typeIdentifier: "public.data", filename: "attachment")
        }

        controller.messageComposeDelegate = self
        // Present controller
    }
}
```

**Limitations:**
- Cannot send silently (requires UI)
- No access to received messages

### Option 3: Jailbroken Device (Full Access)

With a jailbroken device, direct access to iMessage database is possible:
- Read `/var/mobile/Library/SMS/sms.db`
- Use private frameworks for sending

**Note:** This approach is not recommended for general users.

## Required iOS Permissions

```xml
<!-- Info.plist -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>UsMessage needs Bluetooth to connect to your Windows PC</string>

<key>NSBluetoothPeripheralUsageDescription</key>
<string>UsMessage uses Bluetooth to sync messages with your PC</string>

<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-peripheral</string>
    <string>bluetooth-central</string>
</array>
```

## BLE Server Implementation (Swift)

```swift
import CoreBluetooth

class UsMessageBLEServer: NSObject, CBPeripheralManagerDelegate {
    private var peripheralManager: CBPeripheralManager!
    private var messageCharacteristic: CBMutableCharacteristic!

    let serviceUUID = CBUUID(string: "12345678-1234-5678-1234-56789abcdef0")
    let messageCharUUID = CBUUID(string: "12345678-1234-5678-1234-56789abcdef1")

    override init() {
        super.init()
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
    }

    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        if peripheral.state == .poweredOn {
            setupService()
            startAdvertising()
        }
    }

    private func setupService() {
        messageCharacteristic = CBMutableCharacteristic(
            type: messageCharUUID,
            properties: [.read, .write, .notify],
            value: nil,
            permissions: [.readable, .writeable]
        )

        let service = CBMutableService(type: serviceUUID, primary: true)
        service.characteristics = [messageCharacteristic]
        peripheralManager.add(service)
    }

    private func startAdvertising() {
        peripheralManager.startAdvertising([
            CBAdvertisementDataServiceUUIDsKey: [serviceUUID],
            CBAdvertisementDataLocalNameKey: "UsMessage"
        ])
    }
}
```

## Security Considerations

1. **Pairing**: Require Bluetooth pairing before allowing data access
2. **Encryption**: BLE communication is encrypted at the transport layer
3. **Authentication**: Consider adding app-level authentication (PIN/biometric)
4. **Data Privacy**: Never store sensitive data in plaintext
5. **Background Limits**: iOS limits background Bluetooth activity

## Development Roadmap

### Phase 1: Basic BLE Server
- [ ] Create BLE peripheral with basic characteristics
- [ ] Handle device discovery and pairing
- [ ] Implement basic read/write operations

### Phase 2: Message Reading
- [ ] Integrate with iOS Shortcuts for message access
- [ ] Implement conversation list retrieval
- [ ] Handle message history requests

### Phase 3: Message Sending
- [ ] Implement MessageUI integration
- [ ] Handle attachment encoding/decoding
- [ ] Add send confirmation feedback

### Phase 4: Real-time Notifications
- [ ] Implement push notification handling
- [ ] Notify Windows app of new messages
- [ ] Handle app background/foreground transitions

## Alternative Approaches

### Web-based Bridge
Instead of direct Bluetooth, use a local web server on the iPhone:
- Companion app runs HTTP server on local network
- Windows app connects via WiFi
- Simpler implementation but requires same network

### iCloud Integration
Use iCloud to sync message data:
- Requires Apple ID authentication
- May violate Apple TOS
- More complex implementation

## Resources

- [Core Bluetooth Programming Guide](https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/)
- [BLE GATT Specification](https://www.bluetooth.com/specifications/gatt/)
- [iOS Shortcuts User Guide](https://support.apple.com/guide/shortcuts/welcome/ios)
