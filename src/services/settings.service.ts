import type { AppSettings, MessageTemplate, PipelineStage, TodoItem } from '../types';
import { CACHE_KEYS, getCache, setCache } from '../lib/cache';
import { DEFAULT_SETTINGS, DEFAULT_PIPELINE_STAGES, DEFAULT_MESSAGE_TEMPLATES, DEFAULT_USERS } from '../config/defaults';

export function getSettings(): AppSettings {
  const s = getCache<Partial<AppSettings>>(CACHE_KEYS.settings);
  const result = {} as Record<string, any>;
  for (const k in DEFAULT_SETTINGS) {
    const key = k as keyof AppSettings;
    result[key] = (s && s[key] !== undefined && s[key] !== null) ? s[key] : DEFAULT_SETTINGS[key];
  }
  return result as AppSettings;
}

export function saveSettings(data: AppSettings): void {
  setCache(CACHE_KEYS.settings, data);
}

export function getPipelineStages(): PipelineStage[] {
  const parsed = getCache<PipelineStage[]>(CACHE_KEYS.pipelineStages);
  if (parsed && Array.isArray(parsed) && parsed.length >= 2) return parsed;
  return JSON.parse(JSON.stringify(DEFAULT_PIPELINE_STAGES));
}

export function savePipelineStages(stages: PipelineStage[]): void {
  setCache(CACHE_KEYS.pipelineStages, stages);
}

export function getActivePipelineStages(): PipelineStage[] {
  return getPipelineStages().filter((s) => s.name !== 'Cerrado Ganado' && s.name !== 'Cerrado Perdido');
}

export function getAllPipelineStages(): PipelineStage[] {
  return getPipelineStages();
}

export function getUsers(): Record<string, string> {
  const raw = getCache<Record<string, string>>(CACHE_KEYS.users);
  if (raw) return raw;
  return { ...DEFAULT_USERS };
}

export function saveUsers(users: Record<string, string>): void {
  setCache(CACHE_KEYS.users, users);
}

export function getMessageTemplates(): MessageTemplate[] {
  const parsed = getCache<MessageTemplate[]>(CACHE_KEYS.messageTemplates);
  if (parsed && parsed.length > 0) return parsed;
  return DEFAULT_MESSAGE_TEMPLATES.slice();
}

export function saveMessageTemplates(templates: MessageTemplate[]): void {
  setCache(CACHE_KEYS.messageTemplates, templates);
}

export function getTodos(): TodoItem[] {
  return getCache<TodoItem[]>(CACHE_KEYS.todos) || [];
}

export function saveTodos(todos: TodoItem[]): void {
  setCache(CACHE_KEYS.todos, todos);
}
