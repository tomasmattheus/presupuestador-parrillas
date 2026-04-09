import { fetchSheet, postAction } from '../lib/googleSheets';
import { CACHE_KEYS, getCache, setCache } from '../lib/cache';

const SHEET_NAME = 'Config';

let configCache: Record<string, string> | null = null;

export async function fetchAllConfig(): Promise<Record<string, string>> {
  try {
    const data = await fetchSheet(SHEET_NAME);
    const map: Record<string, string> = {};
    data.forEach((row) => {
      if (row[0]) map[String(row[0])] = row[1] != null ? String(row[1]) : '';
    });
    configCache = map;
    setCache('qd_config_cache', map);
    return map;
  } catch {
    return configCache || getCache<Record<string, string>>('qd_config_cache') || {};
  }
}

export function getCachedConfig(): Record<string, string> {
  if (configCache) return configCache;
  return getCache<Record<string, string>>('qd_config_cache') || {};
}

export async function saveConfigKey(key: string, value: string): Promise<void> {
  await postAction({
    action: 'findAndUpdate',
    sheet: SHEET_NAME,
    keyCol: 0,
    keyVal: key,
    headers: ['key', 'value'],
    values: [key, value],
  }, true);
  if (configCache) configCache[key] = value;
  const cached = getCache<Record<string, string>>('qd_config_cache') || {};
  cached[key] = value;
  setCache('qd_config_cache', cached);
}

const SYNC_KEYS = [
  CACHE_KEYS.settings,
  CACHE_KEYS.pipelineStages,
  CACHE_KEYS.messageTemplates,
  CACHE_KEYS.users,
  CACHE_KEYS.todos,
] as const;

export async function pullFromCloud(): Promise<void> {
  const config = await fetchAllConfig();
  SYNC_KEYS.forEach((localKey) => {
    const cloudValue = config[localKey];
    if (cloudValue) {
      try {
        const parsed = JSON.parse(cloudValue);
        setCache(localKey, parsed);
        localStorage.setItem(localKey, JSON.stringify(parsed));
      } catch { /* ignore malformed */ }
    }
  });
}

export async function pushToCloud(): Promise<void> {
  const promises = SYNC_KEYS.map((localKey) => {
    const localValue = localStorage.getItem(localKey);
    if (localValue) {
      return saveConfigKey(localKey, localValue);
    }
    return Promise.resolve();
  });
  await Promise.all(promises);
}

export async function pushSingleKey(localKey: string): Promise<void> {
  const localValue = localStorage.getItem(localKey);
  if (localValue) {
    await saveConfigKey(localKey, localValue);
    await new Promise((r) => setTimeout(r, 1500));
    await saveConfigKey(localKey, localValue);
  }
}
