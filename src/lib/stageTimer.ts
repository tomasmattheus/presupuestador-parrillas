import { parseGoogleDate } from './dates';

const STORAGE_KEY = 'qd_stage_timestamps';

type StageTimestamps = Record<string, string>;

function getAll(): StageTimestamps {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function save(data: StageTimestamps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function makeKey(rowIndex: number, stage: string) {
  return `${rowIndex}:${stage}`;
}

export function recordStageEntry(rowIndex: number, stage: string) {
  const all = getAll();
  const key = makeKey(rowIndex, stage);
  if (!all[key]) {
    all[key] = new Date().toISOString();
    save(all);
  }
}

export function getStageEntryDate(rowIndex: number, stage: string): string | null {
  return getAll()[makeKey(rowIndex, stage)] || null;
}

export function getDaysInStage(rowIndex: number, stage: string): number {
  const entry = getStageEntryDate(rowIndex, stage);
  if (!entry) return -1;
  const entryDate = new Date(entry);
  const now = new Date();
  entryDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function initStageTimestamps(leads: { rowIndex: number; stage: string; fecha: string }[]) {
  const all = getAll();
  let changed = false;
  leads.forEach((lead) => {
    const key = makeKey(lead.rowIndex, lead.stage);
    if (!all[key]) {
      const parsed = parseGoogleDate(lead.fecha);
      all[key] = (parsed && !isNaN(parsed.getTime()) ? parsed : new Date()).toISOString();
      changed = true;
    }
  });
  if (changed) save(all);
}
