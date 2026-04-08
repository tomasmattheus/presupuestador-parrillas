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
    case 'vencido': return { bg: 'bg-[#fef2f2]', border: 'border-[#fca5a5]', dot: 'bg-[#ef4444]', text: 'text-[#dc2626]' };
    case 'hoy': return { bg: 'bg-[#eff6ff]', border: 'border-[#93c5fd]', dot: 'bg-[#3b82f6]', text: 'text-[#2563eb]' };
    case 'proximo': return { bg: 'bg-[#f0fdf4]', border: 'border-[#86efac]', dot: 'bg-[#22c55e]', text: 'text-[#16a34a]' };
  }
}

const FILTERS: { key: UrgencyKey; label: string; color: string; activeColor: string }[] = [
  { key: 'all', label: 'Todos', color: 'text-[#666] bg-[#f0f0f0]', activeColor: 'text-white bg-[#2a2a2a]' },
  { key: 'vencido', label: 'Vencido', color: 'text-[#dc2626] bg-[#fef2f2]', activeColor: 'text-white bg-[#ef4444]' },
  { key: 'hoy', label: 'Hoy', color: 'text-[#2563eb] bg-[#eff6ff]', activeColor: 'text-white bg-[#3b82f6]' },
  { key: 'proximo', label: 'Proximo', color: 'text-[#16a34a] bg-[#f0fdf4]', activeColor: 'text-white bg-[#22c55e]' },
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
    <div className="w-[260px] min-w-[260px] h-full overflow-hidden bg-white border-l border-[#e5e5e5] flex flex-col">
      <div className="px-4 py-3.5 border-b border-[#eee] shrink-0">
        <h3 className="text-xs font-bold text-[#2a2a2a] uppercase tracking-wider m-0 mb-2.5">Seguimientos</h3>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count = counts[f.key];
            if (f.key !== 'all' && count === 0) return null;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[10px] font-bold px-2 py-1 rounded-full border-none cursor-pointer transition-colors ${active ? f.activeColor : f.color}`}
              >
                {f.label} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-2.5 flex flex-col gap-2">
        {filtered.map((lead) => {
          const u = getUrgencyStyle(lead.urgency);
          return (
            <div
              key={lead.rowIndex}
              onClick={() => openLeadModal(lead)}
              className={`${u.bg} border ${u.border} rounded-lg p-3 cursor-pointer hover:shadow-md transition-all`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${u.dot}`} />
                <span className="text-[13px] font-bold text-[#2a2a2a] truncate flex-1">{lead.nombre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#888] bg-white/60 px-1.5 py-0.5 rounded">{lead.stage}</span>
                <span className={`text-[11px] font-bold ${u.text}`}>
                  {lead.urgency === 'hoy' ? 'Hoy' : lead.urgency === 'vencido' ? `${lead.days}d atraso` : `en ${lead.days}d`}
                </span>
              </div>
              {lead.ciudad && (
                <div className="text-[10px] text-[#999] mt-1">{lead.ciudad}</div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-[12px] text-[#bbb] py-6">Sin seguimientos en esta categoria</div>
        )}
      </div>
    </div>
  );
}
