import type { Nota } from '../types';
import { fetchSheet, postAction } from '../lib/googleSheets';
import { CACHE_KEYS, getCache, setCache } from '../lib/cache';

let cachedNotas: any[][] | null = null;

export async function fetchAllNotas(): Promise<any[][]> {
  const cached = getCache<any[][]>(CACHE_KEYS.notas);
  if (cached && !cachedNotas) {
    cachedNotas = cached;
  }
  const data = await fetchSheet('Notas');
  cachedNotas = data;
  setCache(CACHE_KEYS.notas, data);
  return data;
}

export function getCachedNotas(): any[][] {
  if (cachedNotas) return cachedNotas;
  return getCache<any[][]>(CACHE_KEYS.notas) || [];
}

export function parseNotas(rawData: any[][]): Nota[] {
  const notas: Nota[] = [];
  rawData.forEach((row, idx) => {
    if (!row[0]) return;
    notas.push({
      rowIndex: idx,
      cliente: String(row[0] || ''),
      telefono: String(row[1] || ''),
      fecha: String(row[2] || ''),
      usuario: String(row[3] || ''),
      texto: String(row[4] || ''),
    });
  });
  return notas;
}

function normalizeKey(name: string, phone: string): string {
  return (name || '').trim().toLowerCase() + '|' + String(phone || '').replace(/\D/g, '').slice(-10);
}

export function getNotesForContact(allNotas: Nota[], clienteKey: string): Nota[] {
  const parts = clienteKey.split('|');
  const normalized = normalizeKey(parts[0] || '', parts[1] || '');
  return allNotas
    .filter((n) => normalizeKey(n.cliente, n.telefono) === normalized)
    .slice()
    .sort((a, b) => {
      const da = String(a.fecha || '');
      const db = String(b.fecha || '');
      return db.localeCompare(da);
    });
}

export async function addNota(nota: {
  cliente: string;
  telefono: string;
  fecha: string;
  usuario: string;
  texto: string;
}): Promise<void> {
  await postAction({
    action: 'addRow',
    sheet: 'Notas',
    headers: ['cliente', 'telefono', 'fecha', 'usuario', 'texto'],
    values: [nota.cliente, nota.telefono, nota.fecha, nota.usuario, nota.texto],
  }, true);
}

export async function deleteNota(rowIndex: number): Promise<void> {
  await postAction({ action: 'deleteRow', sheet: 'Notas', row: rowIndex }, true);
}
