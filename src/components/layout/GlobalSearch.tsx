import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useLeads } from '../../hooks/useLeads';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead, BudgetFlat } from '../../types';

interface SearchResult {
  type: 'lead' | 'presupuesto';
  name: string;
  detail: string;
  lead?: Lead;
  budget?: BudgetFlat;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data: leads = [] } = useLeads();
  const { budgetsFlat } = usePresupuestos();
  const { openLeadModal } = useContext(ModalContext);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(
    (q: string) => {
      const term = q.trim().toLowerCase();
      if (term.length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }

      const matched: SearchResult[] = [];

      // Search leads by nombre, whatsapp, ciudad
      let leadCount = 0;
      for (const lead of leads) {
        if (leadCount >= 5) break;
        const nombre = (lead.nombre || '').toLowerCase();
        const whatsapp = (lead.whatsapp || '').toLowerCase();
        const ciudad = (lead.ciudad || '').toLowerCase();
        if (nombre.includes(term) || whatsapp.includes(term) || ciudad.includes(term)) {
          matched.push({
            type: 'lead',
            name: lead.nombre || 'Sin nombre',
            detail: [lead.ciudad, lead.whatsapp].filter(Boolean).join(' - '),
            lead,
          });
          leadCount++;
        }
      }

      // Search presupuestos by cliente, nro
      let presupCount = 0;
      for (const b of budgetsFlat) {
        if (presupCount >= 5) break;
        const cliente = (b.cliente || '').toLowerCase();
        const nro = String(b.nro || '').toLowerCase();
        if (cliente.includes(term) || nro.includes(term)) {
          matched.push({
            type: 'presupuesto',
            name: `#${b.nro} - ${b.cliente}`,
            detail: b.total ? `$${b.total.toLocaleString('es-AR')}` : '',
            budget: b,
          });
          presupCount++;
        }
      }

      setResults(matched);
      setOpen(matched.length > 0 || term.length >= 2);
    },
    [leads, budgetsFlat]
  );

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  }

  function handleSelect(result: SearchResult) {
    setQuery('');
    setOpen(false);
    setResults([]);

    if (result.type === 'lead' && result.lead) {
      openLeadModal(result.lead);
    }
    // For presupuestos, no navigation action available without tab switching callback
  }

  // Group results by type
  const leadResults = results.filter((r) => r.type === 'lead');
  const presupResults = results.filter((r) => r.type === 'presupuesto');

  return (
    <div ref={wrapRef} className="relative ml-auto mr-3">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#666] text-sm pointer-events-none">
        &#128269;
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        placeholder="Buscar contacto o presupuesto..."
        className="bg-surface-card border border-[#444] text-[#eee] py-1.5 pl-8 pr-3 rounded-md text-[13px] w-[260px] outline-none font-sans focus:border-brand"
      />
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] max-h-[360px] overflow-y-auto z-[100] mt-1">
          {results.length === 0 ? (
            <div className="p-3 text-center text-[#888] text-sm">
              Sin resultados
            </div>
          ) : (
            <>
              {leadResults.length > 0 && (
                <>
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-[#888] uppercase tracking-wider bg-[#f8f8f8] border-b border-[#eee]">
                    Leads
                  </div>
                  {leadResults.map((r, i) => (
                    <div
                      key={'lead-' + i}
                      onClick={() => handleSelect(r)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#f5f8ff]"
                    >
                      <span className="font-semibold text-[#2a2a2a] text-sm">{r.name}</span>
                      <span className="text-[#888] text-xs ml-auto">{r.detail}</span>
                    </div>
                  ))}
                </>
              )}
              {presupResults.length > 0 && (
                <>
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-[#888] uppercase tracking-wider bg-[#f8f8f8] border-b border-[#eee]">
                    Presupuestos
                  </div>
                  {presupResults.map((r, i) => (
                    <div
                      key={'presup-' + i}
                      onClick={() => handleSelect(r)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#f5f8ff]"
                    >
                      <span className="font-semibold text-[#2a2a2a] text-sm">{r.name}</span>
                      <span className="text-[#888] text-xs ml-auto">{r.detail}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
