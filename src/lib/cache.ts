export const CACHE_KEYS = {
  leads: 'qd_cache_leads',
  presupuestos: 'qd_cache_presupuestos',
  ventas: 'qd_cache_ventas',
  notas: 'qd_cache_notas',
  settings: 'qd_settings',
  pipelineStages: 'qd_pipeline_stages',
  messageTemplates: 'qd_message_templates',
  contactProducts: 'qd_contact_products',
  users: 'qd_users',
  todos: 'qd_todos',
  presupuestosHistory: 'qd_presupuestos_history',
} as const;

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // storage unavailable
  }
}
