import type { Lead, VentaStore } from '../types';
import { fetchSheet, postAction } from '../lib/googleSheets';
import { CACHE_KEYS, getCache, setCache } from '../lib/cache';
import { APPS_SCRIPT_URL } from '../config/api';

let cachedVentas: any[][] | null = null;

export async function fetchAllVentas(): Promise<any[][]> {
  const cached = getCache<any[][]>(CACHE_KEYS.ventas);
  if (cached && !cachedVentas) {
    cachedVentas = cached;
  }
  const data = await fetchSheet('Ventas');
  cachedVentas = data;
  setCache(CACHE_KEYS.ventas, data);
  return data;
}

export function getCachedVentas(): any[][] {
  if (cachedVentas) return cachedVentas;
  return getCache<any[][]>(CACHE_KEYS.ventas) || [];
}

export function parseVentas(
  rawData: any[][],
  _ganados: Lead[]
): { ventasMap: Record<string, VentaStore>; ventasList: any[] } {
  const ventasMap: Record<string, VentaStore> = {};
  rawData.forEach((row, idx) => {
    if (!row[0]) return;
    const key = String(row[0] || '') + '|' + String(row[1] || '');
    ventasMap[key] = {
      monto: parseFloat(row[2]) || 0,
      formaPago: String(row[3] || ''),
      estadoEntrega: String(row[4] || ''),
      notas: String(row[5] || ''),
      _rowIndex: idx,
    };
  });
  return { ventasMap, ventasList: rawData };
}

const ventaSaveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export function saveVenta(key: string, ventaObj: VentaStore): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ventaSaveTimers[key]) clearTimeout(ventaSaveTimers[key]);
    ventaSaveTimers[key] = setTimeout(() => {
      const parts = key.split('|');
      if (parts.length < 2 || !parts[0]) {
        reject(new Error(`Invalid venta key: "${key}"`));
        return;
      }
      const cliente = parts[0];
      const telefono = parts[1] || '';
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'findAndUpdate',
          sheet: 'Ventas',
          keyCol: 0,
          keyVal: cliente,
          headers: ['cliente', 'telefono', 'monto', 'forma_pago', 'estado_entrega', 'notas'],
          values: [cliente, telefono, ventaObj.monto || 0, ventaObj.formaPago || '', ventaObj.estadoEntrega || '', ventaObj.notas || ''],
        }),
      }).then(() => resolve()).catch(reject);
    }, 800);
  });
}

export async function deleteVenta(rowIndex: number): Promise<void> {
  await postAction({ action: 'deleteRow', sheet: 'Ventas', row: rowIndex }, true);
}
