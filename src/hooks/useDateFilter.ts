import { useState, useCallback, useMemo } from 'react';
import { parseGoogleDate } from '../lib/dates';

export type PeriodPreset = 'all' | 'esta-semana' | 'este-mes' | 'mes-pasado' | 'mes-especifico' | 'custom';

const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function rangeForMonth(year: number, month: number): { from: string; to: string } {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return { from: fmt(first), to: fmt(last) };
}

function computeRange(preset: PeriodPreset, monthKey?: string): { from: string; to: string } {
  const today = new Date();
  const todayStr = fmt(today);

  switch (preset) {
    case 'esta-semana': {
      const day = today.getDay();
      const mon = new Date(today);
      mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      return { from: fmt(mon), to: todayStr };
    }
    case 'este-mes':
      return rangeForMonth(today.getFullYear(), today.getMonth());
    case 'mes-pasado':
      return rangeForMonth(today.getFullYear(), today.getMonth() - 1);
    case 'mes-especifico': {
      if (!monthKey) return { from: '', to: '' };
      const [yStr, mStr] = monthKey.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      if (isNaN(y) || isNaN(m)) return { from: '', to: '' };
      return rangeForMonth(y, m);
    }
    default:
      return { from: '', to: '' };
  }
}

function previousRange(preset: PeriodPreset, dateFrom: string, dateTo: string, monthKey?: string): { from: string; to: string } | null {
  if (!dateFrom || !dateTo) return null;

  if (preset === 'esta-semana') {
    const today = new Date();
    const day = today.getDay();
    const thisMon = new Date(today);
    thisMon.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    const prevSun = new Date(thisMon);
    prevSun.setDate(thisMon.getDate() - 1);
    const prevMon = new Date(prevSun);
    prevMon.setDate(prevSun.getDate() - 6);
    return { from: fmt(prevMon), to: fmt(prevSun) };
  }
  if (preset === 'este-mes') {
    const today = new Date();
    return rangeForMonth(today.getFullYear(), today.getMonth() - 1);
  }
  if (preset === 'mes-pasado') {
    const today = new Date();
    return rangeForMonth(today.getFullYear(), today.getMonth() - 2);
  }
  if (preset === 'mes-especifico' && monthKey) {
    const [yStr, mStr] = monthKey.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10) - 1;
    if (isNaN(y) || isNaN(m)) return null;
    return rangeForMonth(y, m - 1);
  }

  const from = new Date(dateFrom + 'T00:00:00');
  const to = new Date(dateTo + 'T00:00:00');
  const diffDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - diffDays);
  return { from: fmt(prevFrom), to: fmt(prevTo) };
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
  const [monthKey, setMonthKey] = useState<string>('');
  const [dateFrom, setDateFrom] = useState(initial.from);
  const [dateTo, setDateTo] = useState(initial.to);

  const setPreset = useCallback((preset: PeriodPreset) => {
    setActivePreset(preset);
    setMonthKey('');
    if (preset !== 'custom' && preset !== 'mes-especifico') {
      const range = computeRange(preset);
      setDateFrom(range.from);
      setDateTo(range.to);
    }
  }, []);

  const setSpecificMonth = useCallback((yyyymm: string) => {
    setActivePreset('mes-especifico');
    setMonthKey(yyyymm);
    const range = computeRange('mes-especifico', yyyymm);
    setDateFrom(range.from);
    setDateTo(range.to);
  }, []);

  const setCustomRange = useCallback((from: string, to: string) => {
    setActivePreset('custom');
    setMonthKey('');
    setDateFrom(from);
    setDateTo(to);
  }, []);

  const prevRange = useMemo(
    () => previousRange(activePreset, dateFrom, dateTo, monthKey),
    [activePreset, dateFrom, dateTo, monthKey]
  );

  return {
    activePreset,
    monthKey,
    dateFrom,
    dateTo,
    prevFrom: prevRange?.from ?? '',
    prevTo: prevRange?.to ?? '',
    setPreset,
    setSpecificMonth,
    setCustomRange,
  };
}
