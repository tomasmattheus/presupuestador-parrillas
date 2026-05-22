import { useMemo } from 'react';
import type { Lead } from '../types';
import { usePresupuestos } from './usePresupuestos';
import { useVentas } from './useVentas';
import { getLeadActivityDate } from '../lib/leadActivity';

export function useLeadActivityDate(lead: Lead): string {
  const { budgetsFlat } = usePresupuestos();
  const { ventasMap } = useVentas();
  return useMemo(
    () => getLeadActivityDate(lead, budgetsFlat, ventasMap),
    [lead, budgetsFlat, ventasMap]
  );
}
