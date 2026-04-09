import { useState, useMemo } from 'react';
import type { Lead } from '../../types';
import { useLeads } from '../../hooks/useLeads';

interface Props {
  onLeadSelect: (lead: Lead) => void;
  onNewBlank: () => void;
}

export default function LeadSelector({ onLeadSelect, onNewBlank }: Props) {
  const { data: leads = [] } = useLeads();
  const [filter, setFilter] = useState<'all' | 'measures'>('all');
  const [selectedIdx, setSelectedIdx] = useState('');

  const filtered = useMemo(() => {
    if (filter === 'measures') return leads.filter((l) => l.hasMeasures);
    return leads;
  }, [leads, filter]);

  const handleLoad = () => {
    if (!selectedIdx) return;
    const idx = parseInt(selectedIdx);
    const lead = leads.find((l) => l.rowIndex === idx);
    if (lead) onLeadSelect(lead);
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(e.target.value)}
          className="flex-1 min-w-0 py-2 px-2.5 bg-white border border-[#ddd] rounded-md text-sm text-[#2a2a2a] font-sans outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,161,242,0.1)]"
        >
          <option value="">-- Seleccionar lead --</option>
          {filtered.map((l) => {
            const waShort = l.whatsapp ? String(l.whatsapp).replace(/\D/g, '').slice(-4) : '';
            return (
              <option key={l.rowIndex} value={l.rowIndex}>
                {l.nombre}{l.ciudad ? ' - ' + l.ciudad : ''}{waShort ? ' (...' + waShort + ')' : ''}{l.hasMeasures ? ' *' : ''}
              </option>
            );
          })}
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'measures')}
          className="w-auto py-1 px-2 text-xs bg-white border border-[#ddd] rounded-md text-[#2a2a2a] font-sans outline-none"
        >
          <option value="all">Todos</option>
          <option value="measures">Con medidas</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleLoad}
          className="flex-1 bg-[#333] text-white border border-[#555] py-2 px-4 rounded text-[13px] font-semibold cursor-pointer font-sans mb-2.5 hover:bg-[#444] transition-colors"
        >
          Cargar lead
        </button>
        <button
          onClick={onNewBlank}
          className="flex-1 bg-[#2a2a2a] text-brand border border-brand py-2 px-4 rounded text-[13px] font-semibold cursor-pointer font-sans mb-2.5 hover:bg-brand hover:text-white transition-colors"
        >
          Nuevo en blanco
        </button>
      </div>
    </div>
  );
}
