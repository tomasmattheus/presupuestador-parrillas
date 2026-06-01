import type { Lead, VentaStore } from '../types';
import { parseGoogleDate } from './dates';
import { getStageEntryDate } from './stageTimer';

export const WON_STAGE = 'Cerrado Ganado';

export function ventaKey(lead: Lead): string {
  return (lead.nombre || '') + '|' + (lead.whatsapp || '');
}

function toYmd(raw: string | Date | null | undefined): string {
  const d = parseGoogleDate(raw);
  if (!d || isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getMonto(lead: Lead, ventasMap: Record<string, VentaStore>): number {
  return ventasMap[ventaKey(lead)]?.monto || 0;
}

export function getCierreYmd(lead: Lead, ventasMap: Record<string, VentaStore>): string {
  const venta = ventasMap[ventaKey(lead)];
  const iso = venta?.fechaCierre || getStageEntryDate(lead.rowIndex, WON_STAGE) || lead.fecha || '';
  return toYmd(iso);
}

export function isRealSale(lead: Lead, ventasMap: Record<string, VentaStore>): boolean {
  return lead.stage === WON_STAGE && getMonto(lead, ventasMap) > 0;
}

function inRange(ymd: string, from: string, to: string): boolean {
  if (!ymd) return false;
  if (from && ymd < from) return false;
  if (to && ymd > to) return false;
  return true;
}

export function selectSales(
  leads: Lead[],
  ventasMap: Record<string, VentaStore>,
  from: string,
  to: string,
): Lead[] {
  return leads.filter((lead) => {
    if (!isRealSale(lead, ventasMap)) return false;
    if (!from && !to) return true;
    return inRange(getCierreYmd(lead, ventasMap), from, to);
  });
}

export interface SalesMetrics {
  count: number;
  totalMonto: number;
  ticketPromedio: number;
}

export function computeSalesMetrics(
  sales: Lead[],
  ventasMap: Record<string, VentaStore>,
): SalesMetrics {
  let totalMonto = 0;
  sales.forEach((lead) => {
    totalMonto += getMonto(lead, ventasMap);
  });
  const count = sales.length;
  return { count, totalMonto, ticketPromedio: count > 0 ? totalMonto / count : 0 };
}
