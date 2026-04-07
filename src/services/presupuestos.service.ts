import type { Budget, BudgetFlat, BudgetItem } from '../types';
import { fetchSheet, postAction } from '../lib/googleSheets';
import { CACHE_KEYS, getCache, setCache } from '../lib/cache';

let cachedPresupuestos: any[][] | null = null;

export async function fetchAllPresupuestos(): Promise<any[][]> {
  const cached = getCache<any[][]>(CACHE_KEYS.presupuestos);
  if (cached && !cachedPresupuestos) {
    cachedPresupuestos = cached;
  }
  const data = await fetchSheet('Presupuestos');
  cachedPresupuestos = data;
  setCache(CACHE_KEYS.presupuestos, data);
  return data;
}

export function getCachedPresupuestos(): any[][] {
  if (cachedPresupuestos) return cachedPresupuestos;
  return getCache<any[][]>(CACHE_KEYS.presupuestos) || [];
}

export function parseBudgets(rawData: any[][]): Record<string, Budget[]> {
  const result: Record<string, Budget[]> = {};
  rawData.forEach((row, idx) => {
    if (!row[0]) return;
    if (!row[2] || String(row[2]).trim() === '0' || String(row[2]).trim() === '') return;
    if (row[0] === row[1] && row[1] === row[2]) return;
    const key = (row[3] || '') + '|' + (row[4] || '');
    if (!result[key]) result[key] = [];
    let items: BudgetItem[];
    try { items = JSON.parse(row[8] || '[]'); } catch { items = []; }
    result[key].push({
      id: String(row[0] || ''),
      fecha: String(row[1] || ''),
      nro: String(row[2] || ''),
      cliente: String(row[3] || ''),
      telefono: String(row[4] || ''),
      sistema: String(row[5] || ''),
      material: String(row[6] || ''),
      medidas: String(row[7] || ''),
      items,
      subtotal: parseFloat(row[9]) || 0,
      iva: parseFloat(row[10]) || 0,
      total: parseFloat(row[11]) || 0,
      descuento: parseFloat(row[12]) || 0,
      recargo: parseFloat(row[13]) || 0,
      cuotas: parseInt(row[14]) || 0,
      _rowIndex: idx + 2,
    });
  });
  return result;
}

export function getAllBudgetsFlat(rawData: any[][]): BudgetFlat[] {
  const all = parseBudgets(rawData);
  const flat: BudgetFlat[] = [];
  for (const key in all) {
    if (!Object.prototype.hasOwnProperty.call(all, key)) continue;
    const parts = key.split('|');
    const clientName = parts[0] || 'Sin cliente';
    const budgets = all[key];
    if (!Array.isArray(budgets)) continue;
    budgets.forEach((b) => {
      flat.push({
        clientKey: key,
        cliente: clientName,
        nro: b.nro || '',
        fecha: b.fecha || '',
        sistema: b.sistema || '',
        material: b.material || '',
        medidas: b.medidas || '',
        total: b.total || 0,
        subtotal: b.subtotal || 0,
        iva: b.iva || 0,
        items: b.items || [],
        descuento: b.descuento || 0,
        recargo: b.recargo || 0,
        cuotas: b.cuotas || 3,
        id: b.id || '',
        telefono: b.telefono || '',
        _rowIndex: b._rowIndex,
      });
    });
  }
  flat.sort((a, b) => {
    const nroA = parseInt(a.nro) || 0;
    const nroB = parseInt(b.nro) || 0;
    if (nroB !== nroA) return nroB - nroA;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });
  return flat;
}

export function getNextPresupNumber(budgets: BudgetFlat[]): string {
  let maxNro = 0;
  budgets.forEach((b) => {
    const n = parseInt(b.nro);
    if (!isNaN(n) && n > maxNro) maxNro = n;
  });
  return String(maxNro + 1).padStart(4, '0');
}

export async function saveBudget(budget: {
  id: string;
  fecha: string;
  nro: string;
  cliente: string;
  telefono: string;
  sistema: string;
  material: string;
  medidas: string;
  items: BudgetItem[];
  subtotal: number;
  iva: number;
  total: number;
  descuento: number;
  recargo: number;
  cuotas: number;
}): Promise<void> {
  await postAction({
    action: 'addRow',
    sheet: 'Presupuestos',
    headers: ['id', 'fecha', 'nro', 'cliente', 'telefono', 'sistema', 'material', 'medidas', 'items_json', 'subtotal', 'iva', 'total', 'descuento', 'recargo', 'cuotas'],
    values: [
      budget.id,
      budget.fecha,
      budget.nro,
      budget.cliente,
      budget.telefono,
      budget.sistema,
      budget.material,
      budget.medidas,
      JSON.stringify(budget.items),
      budget.subtotal,
      budget.iva,
      budget.total,
      budget.descuento,
      budget.recargo,
      budget.cuotas,
    ],
  }, true);
}

export async function deleteBudget(rowIndex: number): Promise<void> {
  await postAction({ action: 'deleteRow', sheet: 'Presupuestos', row: rowIndex }, true);
}
