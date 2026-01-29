import { useState } from 'react';

interface SettingsProps {
  onClose: () => void;
}

function Settings({ onClose }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [startMinimized, setStartMinimized] = useState(false);

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <header className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="settings-content">
          <section className="settings-section">
            <h3>Notifications</h3>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Enable notifications</span>
                <span className="setting-description">Show desktop notifications for new messages</span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Notification sounds</span>
                <span className="setting-description">Play a sound when receiving messages</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
            </label>
          </section>

          <section className="settings-section">
            <h3>Appearance</h3>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Theme</span>
                <span className="setting-description">Choose your preferred color scheme</span>
              </div>
              <select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h3>Startup</h3>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Start minimized</span>
                <span className="setting-description">Start UsMessage in the system tray</span>
              </div>
              <input
                type="checkbox"
                checked={startMinimized}
                onChange={(e) => setStartMinimized(e.target.checked)}
              />
            </label>
          </section>

          <section className="settings-section">
            <h3>Connection</h3>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Auto-reconnect</span>
                <span className="setting-description">Automatically reconnect when iPhone is nearby</span>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
          </section>

          <section className="settings-section">
            <h3>About</h3>
            <div className="about-info">
              <p><strong>UsMessage</strong></p>
              <p className="version">Version 0.1.0</p>
              <p className="description">
                A Windows app for viewing and sending iMessage photos and group chats.
              </p>
              <div className="links">
                <a href="https://github.com/Michael-MakeAnything/UsMessage" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <span>•</span>
                <a href="https://github.com/Michael-MakeAnything/UsMessage/issues" target="_blank" rel="noopener noreferrer">
                  Report Issue
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;
