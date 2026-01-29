# UsMessage

A Windows desktop app for viewing and sending iMessage photos and group chats from your iPhone via Bluetooth.

## Why?

Windows Phone Link doesn't support sending photos through iMessage. This app aims to fill that gap by connecting directly to your iPhone over Bluetooth - similar to how Phone Link connects to Android devices.

## Features (Planned)

- View iMessage conversations and group chats
- Send and receive photos and videos
- Real-time message sync via Bluetooth
- Native Windows notifications
- Dark/light theme support

## How It Works

UsMessage uses Bluetooth Low Energy (BLE) to communicate with a companion app on your iPhone:

```
┌─────────────┐         Bluetooth          ┌─────────────┐
│   Windows   │ ◄────────────────────────► │   iPhone    │
│  UsMessage  │                            │ Companion   │
│   (This)    │   BLE GATT Service         │    App      │
└─────────────┘                            └─────────────┘
                                                  │
                                                  ▼
                                           ┌─────────────┐
                                           │  iMessage   │
                                           │   (iOS)     │
                                           └─────────────┘
```

### Architecture

1. **Windows App (This repo)**: Electron + React application that:
   - Discovers nearby iPhones via Bluetooth
   - Connects to the companion app's BLE service
   - Displays conversations and messages
   - Sends messages and attachments

2. **iOS Companion App** (separate repo needed): Swift app that:
   - Advertises a BLE GATT service
   - Accesses iMessage conversations (with user permission)
   - Relays messages between Windows and iMessage
   - Handles photo/video attachments

## Requirements

- Windows 10/11 with Bluetooth 4.0+ (BLE support)
- iPhone with iOS 15+
- UsMessage Companion App installed on iPhone

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package as Windows installer
npm run package
```

## Project Structure

```
src/
├── main/                  # Electron main process
│   ├── main.ts           # App entry point
│   ├── preload.ts        # Context bridge for IPC
│   └── services/
│       ├── bluetooth.ts   # Bluetooth communication
│       ├── device-manager.ts
│       └── message-service.ts
└── renderer/              # React UI
    ├── App.tsx
    ├── store.ts          # Zustand state
    ├── components/
    │   ├── Sidebar.tsx
    │   ├── ChatView.tsx
    │   ├── ConnectionStatus.tsx
    │   └── DeviceScanner.tsx
    └── styles/
```

## Project Status

🚧 **Early Development** - This project is in active development.

### Roadmap

- [x] Basic Windows app UI
- [x] Bluetooth service architecture
- [ ] Windows Bluetooth scanning
- [ ] BLE GATT communication
- [ ] iOS Companion App (separate project)
- [ ] Message sync
- [ ] Photo/video attachment support
- [ ] Windows notifications

## Technical Notes

### Why Bluetooth?

Phone Link uses Bluetooth to communicate with phones, providing:
- No server/cloud required - direct device-to-device
- Works without WiFi
- Lower latency than web-based solutions
- Better privacy - messages stay on your devices

### iOS Limitations

Apple doesn't provide public APIs for iMessage. The companion app approach requires:
- iOS Shortcuts automation (limited)
- Or a jailbroken device with direct access
- Or exploring CallKit/MessageUI frameworks

## Legal Notice

This is an unofficial project not affiliated with Apple. iMessage is a trademark of Apple Inc. Use at your own discretion.

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.

## License

MIT
