import type { Lead, PipelineStage } from '../types';
import { fetchLeadsGviz, postAction } from '../lib/googleSheets';
import { CACHE_KEYS, getCache, setCache } from '../lib/cache';

let cachedLeads: Lead[] | null = null;

export async function fetchAllLeads(stages: PipelineStage[]): Promise<Lead[]> {
  const cached = getCache<Lead[]>(CACHE_KEYS.leads);
  if (cached && !cachedLeads) {
    cachedLeads = cached;
  }
  const leads = await fetchLeadsGviz(stages);
  cachedLeads = leads;
  setCache(CACHE_KEYS.leads, leads);
  return leads;
}

export function getCachedLeads(): Lead[] {
  if (cachedLeads) return cachedLeads;
  return getCache<Lead[]>(CACHE_KEYS.leads) || [];
}

export async function addLead(values: string[]): Promise<void> {
  await postAction({ action: 'addRow', values }, true);
}

export async function updateLeadField(rowIndex: number, col: number, value: string): Promise<void> {
  await postAction({ action: 'update', row: rowIndex - 2, col, value }, true);
}

export async function deleteLead(rowIndex: number): Promise<void> {
  await postAction({ action: 'deleteRow', row: rowIndex - 2 }, true);
}
