import { useState, useMemo, useCallback } from 'react';
import type { Lead } from '../types';

interface Filters {
  estado: string;
  material: string;
  ciudad: string;
}

export function useContactos(leads: Lead[]) {
  const [sortCol, setSortCol] = useState<keyof Lead>('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({ estado: '', material: '', ciudad: '' });

  const sortBy = useCallback((col: keyof Lead) => {
    setSortCol((prev) => {
      if (prev === col) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return col;
    });
  }, []);

  const filteredAndSortedLeads = useMemo(() => {
    let result = leads;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (l) =>
          (l.nombre || '').toLowerCase().includes(term) ||
          (l.whatsapp || '').toLowerCase().includes(term) ||
          (l.ciudad || '').toLowerCase().includes(term)
      );
    }

    if (filters.estado) result = result.filter((l) => (l.estado || '') === filters.estado);
    if (filters.material) result = result.filter((l) => (l.material || '') === filters.material);
    if (filters.ciudad) result = result.filter((l) => (l.ciudad || '') === filters.ciudad);

    result = [...result].sort((a, b) => {
      const aVal = String(a[sortCol] ?? '');
      const bVal = String(b[sortCol] ?? '');
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [leads, searchTerm, filters, sortCol, sortDir]);

  return {
    sortCol,
    sortDir,
    searchTerm,
    filters,
    filteredAndSortedLeads,
    sortBy,
    setSearchTerm,
    setFilters,
  };
}
