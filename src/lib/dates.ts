import type { Lead } from '../types';

export function parseGoogleDate(raw: string | Date | null | undefined): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  if (typeof raw === 'string') {
    const m = raw.match(/Date\((\d+),(\d+),(\d+)/);
    if (m) return new Date(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
    if (raw.indexOf('T') > 0) return new Date(raw);
    const slashParts = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashParts) return new Date(parseInt(slashParts[3]), parseInt(slashParts[2]) - 1, parseInt(slashParts[1]));
    const dashParts = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (dashParts) return new Date(parseInt(dashParts[1]), parseInt(dashParts[2]) - 1, parseInt(dashParts[3]));
  }
  return null;
}

export function formatDateAR(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '-';
  const d = parseGoogleDate(dateStr);
  if (d && !isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return dd + '-' + mm + '-' + yyyy;
  }
  if (typeof dateStr === 'string') {
    const parts = dateStr.split('-');
    if (parts.length === 3) return parts[2] + '-' + parts[1] + '-' + parts[0];
  }
  return String(dateStr);
}

export function getDaysFromDate(dateStr: string | Date | null | undefined): number {
  if (!dateStr) return -1;
  const d = parseGoogleDate(dateStr);
  if (!d || isNaN(d.getTime())) return -1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = today.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getTodayStr(): string {
  const t = new Date();
  const dd = String(t.getDate()).padStart(2, '0');
  const mm = String(t.getMonth() + 1).padStart(2, '0');
  const yyyy = t.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

interface WeekBucket {
  start: Date;
  end: Date;
  label: string;
  count: number;
}

export function getWeeklyCounts(allLeads: Lead[], numWeeks: number): WeekBucket[] {
  const now = new Date();
  const weeks: WeekBucket[] = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weeks.push({
      start: weekStart,
      end: weekEnd,
      label: weekStart.getDate() + '/' + (weekStart.getMonth() + 1) + ' - ' + weekEnd.getDate() + '/' + (weekEnd.getMonth() + 1),
      count: 0,
    });
  }

  allLeads.forEach((l) => {
    if (!l.fecha) return;
    const d = parseGoogleDate(l.fecha);
    if (!d) return;
    for (let i = 0; i < weeks.length; i++) {
      if (d >= weeks[i].start && d <= weeks[i].end) {
        weeks[i].count++;
        break;
      }
    }
  });

  return weeks;
}
