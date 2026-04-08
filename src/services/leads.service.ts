import type { Lead, PipelineStage } from '../types';
import { fetchSheet, postAction } from '../lib/googleSheets';
import { mapEstadoToStage } from '../lib/mappers';
import { CACHE_KEYS, getCache, setCache } from '../lib/cache';

const LEADS_SHEET = 'Leads QD';

let cachedLeads: Lead[] | null = null;

export async function fetchAllLeads(stages: PipelineStage[]): Promise<Lead[]> {
  const cached = getCache<Lead[]>(CACHE_KEYS.leads);
  if (cached && !cachedLeads) {
    cachedLeads = cached;
  }
  const data = await fetchSheet(LEADS_SHEET);
  const leads: Lead[] = [];
  data.forEach((row, idx) => {
    if (!row[0]) return;
    const anchoVal = row[5] ?? '';
    const altoVal = row[6] ?? '';
    const hasMeasures =
      anchoVal && anchoVal !== '--' && anchoVal !== '-' &&
      altoVal && altoVal !== '--' && altoVal !== '-' &&
      !isNaN(parseFloat(anchoVal)) && !isNaN(parseFloat(altoVal));
    const cell = (i: number) => row[i] ?? '';
    leads.push({
      rowIndex: idx + 2,
      nombre: String(cell(0)),
      whatsapp: String(cell(1)),
      fecha: String(cell(2)),
      ciudad: String(cell(3)),
      estado: String(cell(4)),
      ancho: String(anchoVal),
      alto: String(altoVal),
      boca: String(cell(7)),
      foto: String(cell(8)),
      sistema: String(cell(9)),
      material: String(cell(10)),
      adicionales: String(cell(11)),
      medidasPend: String(cell(12)),
      seguimiento: String(cell(13)),
      hasMeasures: !!hasMeasures,
      stage: mapEstadoToStage(String(cell(4)), stages),
    });
  });
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
