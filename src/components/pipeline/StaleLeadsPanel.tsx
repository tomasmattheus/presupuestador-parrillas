import { useMemo, useContext, useState } from 'react';
import type { Lead } from '../../types';
import { getDaysInStage } from '../../lib/stageTimer';
import { ModalContext } from '../../contexts/ModalContext';

const THRESHOLD_DAYS = 0;

type UrgencyKey = 'all' | 'hoy' | 'en-tiempo' | 'demorado' | 'urgente';

function getUrgencyKey(days: number): Exclude<UrgencyKey, 'all'> {
  if (days >= 7) return 'urgente';
  if (days >= 4) return 'demorado';
  if (days === 0) return 'hoy';
  return 'en-tiempo';
}

function getUrgencyStyle(key: Exclude<UrgencyKey, 'all'>) {
  switch (key) {
    case 'urgente': return { bg: 'bg-[#fef2f2]', border: 'border-[#fca5a5]', dot: 'bg-[#ef4444]', text: 'text-[#dc2626]' };
    case 'demorado': return { bg: 'bg-[#fffbeb]', border: 'border-[#fcd34d]', dot: 'bg-[#f59e0b]', text: 'text-[#d97706]' };
    case 'hoy': return { bg: 'bg-[#eff6ff]', border: 'border-[#93c5fd]', dot: 'bg-[#3b82f6]', text: 'text-[#2563eb]' };
    default: return { bg: 'bg-[#f0fdf4]', border: 'border-[#86efac]', dot: 'bg-[#22c55e]', text: 'text-[#16a34a]' };
  }
}

const FILTERS: { key: UrgencyKey; label: string; color: string; activeColor: string }[] = [
  { key: 'all', label: 'Todos', color: 'text-[#666] bg-[#f0f0f0]', activeColor: 'text-white bg-[#2a2a2a]' },
  { key: 'hoy', label: 'Hoy', color: 'text-[#2563eb] bg-[#eff6ff]', activeColor: 'text-white bg-[#3b82f6]' },
  { key: 'en-tiempo', label: 'En tiempo', color: 'text-[#16a34a] bg-[#f0fdf4]', activeColor: 'text-white bg-[#22c55e]' },
  { key: 'demorado', label: 'Demorado', color: 'text-[#d97706] bg-[#fffbeb]', activeColor: 'text-white bg-[#f59e0b]' },
  { key: 'urgente', label: 'Urgente', color: 'text-[#dc2626] bg-[#fef2f2]', activeColor: 'text-white bg-[#ef4444]' },
];

interface Props {
  leads: Lead[];
}

export default function StaleLeadsPanel({ leads }: Props) {
  const { openLeadModal } = useContext(ModalContext);
  const [filter, setFilter] = useState<UrgencyKey>('all');

  const allStaleLeads = useMemo(() => {
    const activeStages = ['Nuevo Lead', 'Presupuesto Enviado', 'En Seguimiento'];
    return leads
      .filter((l) => activeStages.includes(l.stage))
      .map((l) => ({ ...l, days: getDaysInStage(l.rowIndex, l.stage), urgency: getUrgencyKey(getDaysInStage(l.rowIndex, l.stage)) }))
      .filter((l) => l.days >= THRESHOLD_DAYS)
      .sort((a, b) => b.days - a.days);
  }, [leads]);

  const filtered = useMemo(() => {
    if (filter === 'all') return allStaleLeads;
    return allStaleLeads.filter((l) => l.urgency === filter);
  }, [allStaleLeads, filter]);

  const counts = useMemo(() => {
    const c: Record<UrgencyKey, number> = { all: allStaleLeads.length, hoy: 0, 'en-tiempo': 0, demorado: 0, urgente: 0 };
    allStaleLeads.forEach((l) => { c[l.urgency]++; });
    return c;
  }, [allStaleLeads]);

  if (allStaleLeads.length === 0) return null;

  return (
    <div className="w-[260px] min-w-[260px] h-full overflow-hidden bg-white border-l border-[#e5e5e5] flex flex-col">
      <div className="px-4 py-3.5 border-b border-[#eee] shrink-0">
        <h3 className="text-xs font-bold text-[#2a2a2a] uppercase tracking-wider m-0 mb-2.5">Seguimiento</h3>
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
                  {lead.days === 0 ? 'hoy' : `${lead.days}d`}
                </span>
              </div>
              {lead.ciudad && (
                <div className="text-[10px] text-[#999] mt-1">{lead.ciudad}</div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-[12px] text-[#bbb] py-6">Sin leads en esta categoria</div>
        )}
      </div>
    </div>
  );
}
