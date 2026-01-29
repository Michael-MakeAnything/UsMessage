# UsMessage

A Windows desktop app for viewing and sending iMessage photos and group chats from your iPhone.

## Why?

Windows Phone Link doesn't support sending photos through iMessage. This app aims to fill that gap by connecting directly to your iPhone.

## Features (Planned)

- View iMessage conversations and group chats
- Send and receive photos
- Real-time message sync
- Native Windows notifications
- Dark/light theme support

## Technical Approach

This app connects directly to your iPhone using USB/WiFi protocols. It leverages:
- **libimobiledevice** - Open-source library for communicating with iOS devices
- **Electron + React** - Cross-platform desktop framework
- **TypeScript** - Type-safe development

## Requirements

- Windows 10/11
- iPhone with iMessage
- iTunes installed (for Apple device drivers)
- USB cable or same WiFi network

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package as installer
npm run package
```

## Project Status

🚧 **Early Development** - This project is in the research and prototyping phase.

## Legal Notice

This is an unofficial project not affiliated with Apple. iMessage is a trademark of Apple Inc. Use at your own discretion.

## License

MIT
