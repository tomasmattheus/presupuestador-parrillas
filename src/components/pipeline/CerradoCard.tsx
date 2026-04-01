import { useCallback } from 'react';
import type { Lead } from '../../types';
import { formatDateAR } from '../../lib/dates';

interface CerradoCardProps {
  lead: Lead;
  onUndoStage: (lead: Lead) => void;
}

export default function CerradoCard({ lead, onUndoStage }: CerradoCardProps) {
  const handleUndo = useCallback(() => {
    onUndoStage(lead);
  }, [lead, onUndoStage]);

  return (
    <div className="bg-[#fafafa] rounded-lg px-3.5 py-2.5 border border-[#eee] min-w-[180px] max-w-[220px]">
      <div className="text-sm font-bold text-[#2a2a2a] mb-0.5">{lead.nombre}</div>
      <div className="text-xs text-[#666]">{lead.ciudad || '-'}</div>
      <div className="text-[11px] text-[#bbb] mt-1">{formatDateAR(lead.fecha) || '-'}</div>
      <button
        onClick={handleUndo}
        className="bg-transparent border border-[#ddd] text-[#888] text-xs font-semibold px-2.5 py-1 rounded cursor-pointer mt-1.5 font-[inherit] transition-all duration-200 hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
      >
        &#8617; Deshacer
      </button>
    </div>
  );
}
