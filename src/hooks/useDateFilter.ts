import { useState, useCallback } from 'react';
import { parseGoogleDate } from '../lib/dates';

export type PeriodPreset = 'all' | 'esta-semana' | 'este-mes' | 'mes-pasado' | 'custom';

function computeRange(preset: PeriodPreset): { from: string; to: string } {
  const today = new Date();
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayStr = fmt(today);

  switch (preset) {
    case 'esta-semana': {
      const day = today.getDay();
      const mon = new Date(today);
      mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      return { from: fmt(mon), to: todayStr };
    }
    case 'este-mes': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: fmt(first), to: todayStr };
    }
    case 'mes-pasado': {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: fmt(first), to: fmt(last) };
    }
    default:
      return { from: '', to: '' };
  }
}

export function filterItemsByDate<T>(
  items: T[],
  dateExtractor: (item: T) => string | null | undefined,
  dateFrom: string,
  dateTo: string
): T[] {
  if (!dateFrom && !dateTo) return items;
  return items.filter((item) => {
    const raw = dateExtractor(item);
    if (!raw) return true;
    const d = parseGoogleDate(raw);
    if (!d || isNaN(d.getTime())) return true;
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (dateFrom && str < dateFrom) return false;
    if (dateTo && str > dateTo) return false;
    return true;
  });
}

export function useDateFilter(defaultPreset: PeriodPreset = 'este-mes') {
  const initial = computeRange(defaultPreset);
  const [activePreset, setActivePreset] = useState<PeriodPreset>(defaultPreset);
  const [dateFrom, setDateFrom] = useState(initial.from);
  const [dateTo, setDateTo] = useState(initial.to);

  const setPreset = useCallback((preset: PeriodPreset) => {
    setActivePreset(preset);
    if (preset !== 'custom') {
      const range = computeRange(preset);
      setDateFrom(range.from);
      setDateTo(range.to);
    }
  }, []);

  const setCustomRange = useCallback((from: string, to: string) => {
    setActivePreset('custom');
    setDateFrom(from);
    setDateTo(to);
  }, []);

  return { activePreset, dateFrom, dateTo, setPreset, setCustomRange };
}
