import { useState, useCallback } from 'react';
import { getSettings, saveSettings as persistSettings } from '../services/settings.service';
import { pushSingleKey } from '../services/sync.service';
import { CACHE_KEYS } from '../lib/cache';
import { DEFAULT_SETTINGS } from '../config/defaults';
import type { AppSettings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(getSettings);

  const saveSettings = useCallback((data: AppSettings) => {
    persistSettings(data);
    setSettings(data);
    pushSingleKey(CACHE_KEYS.settings).catch(() => {});
  }, []);

  const restoreDefaults = useCallback(() => {
    const defaults = { ...DEFAULT_SETTINGS };
    persistSettings(defaults);
    setSettings(defaults);
    pushSingleKey(CACHE_KEYS.settings).catch(() => {});
  }, []);

  return { settings, saveSettings, restoreDefaults };
}
