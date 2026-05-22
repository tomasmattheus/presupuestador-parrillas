import type { Lead, BudgetFlat, VentaStore } from '../types';
import { parseGoogleDate } from './dates';

function ventaKey(lead: Lead): string {
  return (lead.nombre || '') + '|' + (lead.whatsapp || '');
}

function clientMatchesBudget(lead: Lead, b: BudgetFlat): boolean {
  const leadName = (lead.nombre || '').trim().toLowerCase();
  const leadPhone = String(lead.whatsapp || '').replace(/\D/g, '').slice(-10);
  const bName = b.cliente.trim().toLowerCase();
  const bPhone = String(b.telefono || '').replace(/\D/g, '').slice(-10);
  if (leadName && bName && leadName === bName) return true;
  if (leadPhone && bPhone && leadPhone === bPhone) return true;
  return false;
}

export function getLeadActivityDate(
  lead: Lead,
  budgets: BudgetFlat[],
  ventasMap: Record<string, VentaStore>
): string {
  const venta = ventasMap[ventaKey(lead)];
  if (venta?.fechaCierre) return venta.fechaCierre;

  const relatedBudgets = budgets.filter((b) => clientMatchesBudget(lead, b));
  if (relatedBudgets.length > 0) {
    let latest: BudgetFlat | null = null;
    let latestTime = -Infinity;
    relatedBudgets.forEach((b) => {
      const d = parseGoogleDate(b.fecha);
      if (d && !isNaN(d.getTime()) && d.getTime() > latestTime) {
        latestTime = d.getTime();
        latest = b;
      }
    });
    if (latest) return (latest as BudgetFlat).fecha;
  }

  return lead.fecha || '';
}
