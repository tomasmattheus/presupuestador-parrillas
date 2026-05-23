import { useMemo, useContext, useState } from 'react';
import type { Lead } from '../../types';
import { parseGoogleDate } from '../../lib/dates';
import { ModalContext } from '../../contexts/ModalContext';

type UrgencyKey = 'all' | 'hoy' | 'proximo' | 'vencido';

function classifyFollowUp(lead: Lead): { urgency: Exclude<UrgencyKey, 'all'>; days: number } | null {
  if (!lead.seguimiento) return null;
  const d = parseGoogleDate(lead.seguimiento);
  if (!d || isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { urgency: 'vencido', days: Math.abs(diff) };
  if (diff === 0) return { urgency: 'hoy', days: 0 };
  if (diff <= 3) return { urgency: 'proximo', days: diff };
  return null;
}

function getUrgencyStyle(key: Exclude<UrgencyKey, 'all'>) {
  switch (key) {
    case 'vencido': return { dot: 'bg-danger', text: 'text-danger' };
    case 'hoy': return { dot: 'bg-brand', text: 'text-brand' };
    case 'proximo': return { dot: 'bg-success', text: 'text-success' };
  }
}

const FILTERS: { key: UrgencyKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'vencido', label: 'Vencido' },
  { key: 'hoy', label: 'Hoy' },
  { key: 'proximo', label: 'Próximo' },
];

interface Props {
  leads: Lead[];
}

export default function StaleLeadsPanel({ leads }: Props) {
  const { openLeadModal } = useContext(ModalContext);
  const [filter, setFilter] = useState<UrgencyKey>('all');

  const allFollowUps = useMemo(() => {
    const closedStages = ['Cerrado Ganado', 'Cerrado Perdido'];
    return leads
      .map((l) => {
        if (closedStages.includes(l.stage)) return null;
        const result = classifyFollowUp(l);
        if (!result) return null;
        return { ...l, ...result };
      })
      .filter(Boolean) as (Lead & { urgency: Exclude<UrgencyKey, 'all'>; days: number })[];
  }, [leads]);

  const sorted = useMemo(() => {
    return [...allFollowUps].sort((a, b) => {
      const order: Record<string, number> = { vencido: 0, hoy: 1, proximo: 2 };
      if (order[a.urgency] !== order[b.urgency]) return order[a.urgency] - order[b.urgency];
      if (a.urgency === 'vencido') return b.days - a.days;
      return a.days - b.days;
    });
  }, [allFollowUps]);

  const filtered = useMemo(() => {
    if (filter === 'all') return sorted;
    return sorted.filter((l) => l.urgency === filter);
  }, [sorted, filter]);

  const counts = useMemo(() => {
    const c: Record<UrgencyKey, number> = { all: allFollowUps.length, hoy: 0, proximo: 0, vencido: 0 };
    allFollowUps.forEach((l) => { c[l.urgency]++; });
    return c;
  }, [allFollowUps]);

  if (allFollowUps.length === 0) return null;

  return (
    <div className="w-[280px] min-w-[280px] h-full overflow-hidden bg-white border-l border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border shrink-0">
        <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider m-0 mb-3">Seguimientos</h3>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count = counts[f.key];
            if (f.key !== 'all' && count === 0) return null;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                  active
                    ? 'bg-text text-white border-text'
                    : 'bg-white text-text-muted border-border hover:border-text-muted hover:text-text'
                }`}
              >
                {f.label}{count > 0 ? ` · ${count}` : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {filtered.map((lead) => {
          const u = getUrgencyStyle(lead.urgency);
          return (
            <div
              key={lead.rowIndex}
              onClick={() => openLeadModal(lead)}
              className="bg-white border border-border rounded-lg p-3 cursor-pointer hover:border-text-subtle hover:shadow-[var(--shadow-card)] transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.dot}`} />
                <span className="text-[13px] font-semibold text-text truncate flex-1">
                  {lead.nombre}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-text-muted truncate">{lead.stage}</span>
                <span className={`text-[11px] font-semibold ${u.text} shrink-0`}>
                  {lead.urgency === 'hoy' ? 'Hoy' : lead.urgency === 'vencido' ? `${lead.days}d atraso` : `en ${lead.days}d`}
                </span>
              </div>
              {lead.ciudad && (
                <div className="text-[10px] text-text-subtle mt-1">{lead.ciudad}</div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-[12px] text-text-subtle py-8 italic">Sin seguimientos en esta categoría</div>
        )}
      </div>
    </div>
  );
}
