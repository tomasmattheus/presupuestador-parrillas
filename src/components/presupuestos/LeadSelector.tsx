import { useState, useMemo, useRef, useEffect } from 'react';
import type { Lead } from '../../types';
import { useLeads } from '../../hooks/useLeads';

interface Props {
  onLeadSelect: (lead: Lead) => void;
  onNewBlank: () => void;
}

export default function LeadSelector({ onLeadSelect, onNewBlank }: Props) {
  const { data: leads = [] } = useLeads();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'measures'>('all');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    let list = leads;
    if (filter === 'measures') list = list.filter((l) => l.hasMeasures);
    if (!search.trim()) return list;
    const q = search.toLowerCase().trim();
    return list.filter((l) =>
      (l.nombre || '').toLowerCase().includes(q) ||
      (l.ciudad || '').toLowerCase().includes(q) ||
      String(l.whatsapp || '').includes(q)
    );
  }, [leads, filter, search]);

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
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ddd] rounded-md shadow-lg z-50 max-h-[250px] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-3 py-3 text-[12px] text-[#999] text-center">Sin resultados</div>
              )}
              {filtered.map((l) => {
                const waShort = l.whatsapp ? String(l.whatsapp).replace(/\D/g, '').slice(-4) : '';
                return (
                  <div
                    key={l.rowIndex}
                    onClick={() => handleSelect(l)}
                    className="px-3 py-2.5 cursor-pointer hover:bg-[#f0f7ff] transition-colors border-b border-[#f5f5f5] last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#2a2a2a]">{l.nombre}</span>
                      {l.hasMeasures && <span className="text-[9px] bg-[#d1fae5] text-[#059669] px-1.5 py-0.5 rounded font-bold">MEDIDAS</span>}
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
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'measures')}
          className="w-auto py-1 px-2 text-xs bg-white border border-[#ddd] rounded-md text-[#2a2a2a] font-sans outline-none"
        >
          <option value="all">Todos</option>
          <option value="measures">Con medidas</option>
        </select>
      </div>
      <button
        onClick={onNewBlank}
        className="w-full bg-[#2a2a2a] text-brand border border-brand py-2 px-4 rounded text-[13px] font-semibold cursor-pointer font-sans mb-2.5 hover:bg-brand hover:text-white transition-colors"
      >
        Nuevo en blanco
      </button>
    </div>
  );
}
