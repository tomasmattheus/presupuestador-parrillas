import { useMemo } from 'react';
import type { Lead, TabId } from '../../types';
import { getDaysInStage } from '../../lib/stageTimer';

const THRESHOLD_DAYS = 0;

interface Props {
  leads: Lead[];
  onNavigate: (tab: TabId) => void;
}

export default function StaleLeadsAlert({ leads, onNavigate }: Props) {
  const staleLeads = useMemo(() => {
    const activeStages = ['Nuevo Lead', 'Presupuesto Enviado', 'En Seguimiento'];
    return leads
      .filter((l) => activeStages.includes(l.stage))
      .map((l) => ({ ...l, days: getDaysInStage(l.rowIndex, l.stage) }))
      .filter((l) => l.days >= THRESHOLD_DAYS)
      .sort((a, b) => b.days - a.days);
  }, [leads]);

  if (staleLeads.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] self-start">
      <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-[#f0f0f0]">
        <span className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-brand text-sm">!</span>
        <div className="flex-1">
          <h3 className="text-[13px] font-bold text-[#2a2a2a] m-0">
            {staleLeads.length} lead{staleLeads.length > 1 ? 's' : ''} esperando seguimiento
          </h3>
          <p className="text-[11px] text-[#999] m-0">Mas de 4 dias sin actividad</p>
        </div>
        <button
          onClick={() => onNavigate('pipeline')}
          className="text-xs font-semibold text-brand bg-[#1DA1F2]/10 border-none rounded-md px-3.5 py-1.5 cursor-pointer hover:bg-brand hover:text-white transition-colors"
        >
          Ver pipeline
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {staleLeads.slice(0, 5).map((lead) => (
          <div
            key={lead.rowIndex}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-[#f8f9fa] transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${lead.days > 7 ? 'bg-[#ef4444]' : 'bg-brand'}`} />
            <span className="text-[13px] font-semibold text-[#2a2a2a] flex-1 truncate">{lead.nombre}</span>
            <span className="text-[11px] text-[#999]">{lead.stage}</span>
            <span className={`text-[11px] font-bold min-w-[50px] text-right ${lead.days > 7 ? 'text-[#ef4444]' : 'text-[#999]'}`}>
              {lead.days}d
            </span>
          </div>
        ))}
        {staleLeads.length > 5 && (
          <div className="text-[11px] text-[#999] text-center pt-1">
            y {staleLeads.length - 5} mas...
          </div>
        )}
      </div>
    </div>
  );
}
