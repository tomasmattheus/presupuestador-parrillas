import { useState, useMemo } from 'react';
import type { Lead } from '../../types';
import CerradoCard from './CerradoCard';

interface CerradosSectionProps {
  leads: Lead[];
  onUndoStage: (lead: Lead) => void;
}

export default function CerradosSection({ leads, onUndoStage }: CerradosSectionProps) {
  const [open, setOpen] = useState(false);

  const ganados = useMemo(
    () => leads.filter((l) => l.stage === 'Cerrado Ganado'),
    [leads]
  );
  const perdidos = useMemo(
    () => leads.filter((l) => l.stage === 'Cerrado Perdido'),
    [leads]
  );

  return (
    <div className="mt-4 shrink-0">
      <div
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 cursor-pointer px-4 py-2.5 bg-[#e2e8f0] rounded-lg select-none transition-colors duration-200 hover:bg-[#cbd5e1]"
      >
        <span
          className={`text-sm text-[#555] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          &#9660;
        </span>
        <span className="text-sm font-bold text-[#2a2a2a]">Cerrados</span>
        <span className="text-[13px] text-[#666]">
          ({ganados.length} ganados &middot; {perdidos.length} perdidos)
        </span>
      </div>

      {open && (
        <div className="mt-2.5 rounded-lg bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden flex">
          <div className="flex-1 p-4 min-h-[80px] border-r border-[#f0f0f0]">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#10b981] mb-2.5 pb-1.5 border-b-2 border-[#10b981]">
              Ganados ({ganados.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {ganados.length === 0 ? (
                <p className="text-[#999] text-[13px]">Sin leads ganados</p>
              ) : (
                ganados.map((lead) => (
                  <CerradoCard key={lead.rowIndex} lead={lead} onUndoStage={onUndoStage} />
                ))
              )}
            </div>
          </div>

          <div className="flex-1 p-4 min-h-[80px]">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#ef4444] mb-2.5 pb-1.5 border-b-2 border-[#ef4444]">
              Perdidos ({perdidos.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {perdidos.length === 0 ? (
                <p className="text-[#999] text-[13px]">Sin leads perdidos</p>
              ) : (
                perdidos.map((lead) => (
                  <CerradoCard key={lead.rowIndex} lead={lead} onUndoStage={onUndoStage} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
