import { createContext, useContext, useEffect, useState } from 'react';
import { publicApi } from '../api';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (settings?.website_name) {
      document.title = settings.website_name;
    }
    if (settings?.primary_color) {
      document.documentElement.style.setProperty('--primary', settings.primary_color);
    }
    if (settings?.accent_color) {
      document.documentElement.style.setProperty('--accent', settings.accent_color);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: () => publicApi.getSettings().then(setSettings) }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
