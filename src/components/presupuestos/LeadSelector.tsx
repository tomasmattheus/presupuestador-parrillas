import { useState, useMemo, useRef, useEffect } from 'react';
import type { Lead } from '../../types';
import { useLeads } from '../../hooks/useLeads';
import { usePresupuestos } from '../../hooks/usePresupuestos';

interface Props {
  onLeadSelect: (lead: Lead) => void;
  onNewBlank: () => void;
}

function normalizePhone(phone: string): string {
  return String(phone).replace(/\D/g, '').slice(-10);
}

export default function LeadSelector({ onLeadSelect, onNewBlank }: Props) {
  const { data: leads = [] } = useLeads();
  const { budgetsFlat = [] } = usePresupuestos();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const budgetedPhones = useMemo(() => {
    const set = new Set<string>();
    budgetsFlat.forEach((b) => {
      const key = (b.cliente || '').toLowerCase().trim() + '|' + normalizePhone(b.telefono || '');
      set.add(key);
    });
    return set;
  }, [budgetsFlat]);

  const filtered = useMemo(() => {
    let list = leads;
    if (!showAll) {
      list = list.filter((l) => {
        const key = (l.nombre || '').toLowerCase().trim() + '|' + normalizePhone(l.whatsapp || '');
        return !budgetedPhones.has(key);
      });
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase().trim();
    return list.filter((l) =>
      (l.nombre || '').toLowerCase().includes(q) ||
      (l.ciudad || '').toLowerCase().includes(q) ||
      String(l.whatsapp || '').includes(q)
    );
  }, [leads, budgetedPhones, showAll, search]);

  const pendingCount = useMemo(() => {
    return leads.filter((l) => {
      const key = (l.nombre || '').toLowerCase().trim() + '|' + normalizePhone(l.whatsapp || '');
      return !budgetedPhones.has(key);
    }).length;
  }, [leads, budgetedPhones]);

  const handleSelect = (lead: Lead) => {
    setSearch('');
    setOpen(false);
    onLeadSelect(lead);
  };

  return (
    <div>
      <div className="flex gap-2 mb-2" ref={wrapperRef}>
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Buscar por nombre, ciudad o telefono..."
            className="w-full py-2 px-3 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]"
          />
          {open && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ddd] rounded-md shadow-lg z-50 max-h-[280px] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-3 py-3 text-[12px] text-[#999] text-center">
                  {showAll ? 'Sin resultados' : 'Todos presupuestados'}
                </div>
              )}
              {filtered.map((l) => {
                const waShort = l.whatsapp ? String(l.whatsapp).replace(/\D/g, '').slice(-4) : '';
                const hasPresup = budgetedPhones.has(
                  (l.nombre || '').toLowerCase().trim() + '|' + normalizePhone(l.whatsapp || '')
                );
                return (
                  <div
                    key={l.rowIndex}
                    onClick={() => handleSelect(l)}
                    className="px-3 py-2.5 cursor-pointer hover:bg-[#f0f7ff] transition-colors border-b border-[#f5f5f5] last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#2a2a2a]">{l.nombre}</span>
                      {l.hasMeasures && <span className="text-[9px] bg-[#d1fae5] text-[#059669] px-1.5 py-0.5 rounded font-bold">MEDIDAS</span>}
                      {hasPresup && <span className="text-[9px] bg-[#fef3e2] text-[#b45309] px-1.5 py-0.5 rounded font-bold">PRESUPUESTADO</span>}
                    </div>
                    <div className="text-[11px] text-[#999] mt-0.5">
                      {l.ciudad || 'Sin ciudad'}{waShort ? ` \u00b7 ...${waShort}` : ''}{l.sistema ? ` \u00b7 ${l.sistema}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-2.5">
        <button
          onClick={() => setShowAll(!showAll)}
          className={`flex-1 border py-1.5 px-3 rounded text-[11px] font-semibold cursor-pointer font-sans transition-colors ${
            showAll
              ? 'bg-[#f0f2f5] text-[#555] border-[#ddd] hover:bg-[#e5e7eb]'
              : 'bg-white text-brand border-brand hover:bg-[#f0f7ff]'
          }`}
        >
          {showAll ? `Mostrando todos (${leads.length})` : `Sin presupuesto (${pendingCount})`}
        </button>
        <button
          onClick={onNewBlank}
          className="flex-1 bg-[#2a2a2a] text-brand border border-brand py-1.5 px-3 rounded text-[11px] font-semibold cursor-pointer font-sans hover:bg-brand hover:text-white transition-colors"
        >
          Nuevo en blanco
        </button>
      </div>
    </div>
  );
}
