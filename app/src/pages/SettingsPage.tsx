import { useState } from 'react';
import { useAuth } from '../auth';
import { loadSettings, saveSettings, type Settings } from '../data';

// Admin-only page (RQ3: role-based UI access). Staff navigating here directly
// gets an explicit access-denied view instead of the form.
export function SettingsPage() {
  const { session } = useAuth();
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [saved, setSaved] = useState(false);

  // SEEDED BUG #4 (RQ3): access guard dropped — staff can open the settings form
  void session;

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-form">
        <label>
          Store name
          <input value={settings.storeName} onChange={(e) => set('storeName', e.target.value)} />
        </label>
        <label>
          Currency
          <select
            value={settings.currency}
            onChange={(e) => set('currency', e.target.value as Settings['currency'])}
          >
            <option value="USD">USD</option>
            <option value="VND">VND</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
        <label>
          Low-stock threshold
          <input
            value={String(settings.lowStockThreshold)}
            onChange={(e) => set('lowStockThreshold', Number(e.target.value) || 0)}
          />
        </label>
        <button
          className="btn btn-primary"
          onClick={() => {
            saveSettings(settings);
            setSaved(true);
          }}
        >
          Save settings
        </button>
        {saved && <span className="toast">Settings saved</span>}
      </div>
    </div>
  );
}
