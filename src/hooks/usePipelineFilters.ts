import { useState, useMemo, useCallback } from 'react';
import type { Lead } from '../types';
import { getDaysInStage } from '../lib/stageTimer';

export type MeasuresFilter = 'all' | 'with' | 'without';
export type AgeFilter = 'all' | 'fresh' | 'warm' | 'stale';

export interface PipelineFilterState {
  search: string;
  ciudad: string;
  sistema: string;
  material: string;
  measures: MeasuresFilter;
  age: AgeFilter;
}

const initialState: PipelineFilterState = {
  search: '',
  ciudad: '',
  sistema: '',
  material: '',
  measures: 'all',
  age: 'all',
};

export function usePipelineFilters(leads: Lead[]) {
  const [filters, setFilters] = useState<PipelineFilterState>(initialState);

  const update = useCallback(
    <K extends keyof PipelineFilterState>(key: K, val: PipelineFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: val }));
    },
    [],
  );

  const reset = useCallback(() => setFilters(initialState), []);

  const hasActiveFilters = useMemo(
    () =>
      !!filters.search ||
      !!filters.ciudad ||
      !!filters.sistema ||
      !!filters.material ||
      filters.measures !== 'all' ||
      filters.age !== 'all',
    [filters],
  );

  const filteredLeads = useMemo(() => {
    let result = leads;
    const term = filters.search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (l) =>
          (l.nombre || '').toLowerCase().includes(term) ||
          (l.whatsapp || '').toLowerCase().includes(term) ||
          (l.ciudad || '').toLowerCase().includes(term) ||
          (l.sistema || '').toLowerCase().includes(term) ||
          (l.material || '').toLowerCase().includes(term),
      );
    }
    if (filters.ciudad) result = result.filter((l) => (l.ciudad || '') === filters.ciudad);
    if (filters.sistema) result = result.filter((l) => (l.sistema || '') === filters.sistema);
    if (filters.material) result = result.filter((l) => (l.material || '') === filters.material);
    if (filters.measures === 'with') result = result.filter((l) => l.hasMeasures);
    if (filters.measures === 'without') result = result.filter((l) => !l.hasMeasures);
    if (filters.age !== 'all') {
      result = result.filter((l) => {
        const d = getDaysInStage(l.rowIndex, l.stage);
        if (filters.age === 'fresh') return d >= 0 && d <= 3;
        if (filters.age === 'warm') return d > 3 && d <= 7;
        if (filters.age === 'stale') return d > 7;
        return true;
      });
    }
    return result;
  }, [leads, filters]);

  return { filters, filteredLeads, hasActiveFilters, update, reset };
}
