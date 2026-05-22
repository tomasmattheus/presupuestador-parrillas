import { useState, type DragEvent } from 'react';
import type { Lead, VentaStore } from '../../types';
import ProduccionCard from './ProduccionCard';

interface Props {
  stages: string[];
  groupedLeads: Record<string, Lead[]>;
  ventasMap: Record<string, VentaStore>;
  onMove: (lead: Lead, newEstado: string) => void;
}

const STAGE_COLORS: Record<string, string> = {
  'Pendiente fabricacion': '#f59e0b',
  'En fabricacion': '#1DA1F2',
  'Listo para entregar': '#8b5cf6',
  'Entregado e instalado': '#10b981',
};

function ventaKey(lead: Lead): string {
  return (lead.nombre || '') + '|' + (lead.whatsapp || '');
}

export default function ProduccionBoard({ stages, groupedLeads, ventasMap, onMove }: Props) {
  const [draggingLead, setDraggingLead] = useState<Lead | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>, stage: string) => {
    e.preventDefault();
    if (overStage !== stage) setOverStage(stage);
  };

  const handleDrop = (stage: string) => {
    if (draggingLead) {
      const currentEstado = ventasMap[ventaKey(draggingLead)]?.estadoEntrega || 'Pendiente fabricacion';
      if (currentEstado !== stage) {
        onMove(draggingLead, stage);
      }
    }
    setDraggingLead(null);
    setOverStage(null);
  };

  return (
    <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden pb-2 min-h-0">
      {stages.map((stage) => {
        const leads = groupedLeads[stage] || [];
        const color = STAGE_COLORS[stage] || '#888';
        return (
          <div
            key={stage}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDrop={() => handleDrop(stage)}
            onDragLeave={() => setOverStage(null)}
            className={`flex-1 min-w-[280px] max-w-[340px] flex flex-col bg-[#fafafa] rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all ${overStage === stage ? 'ring-2 ring-brand bg-[#f0f7ff]' : ''}`}
          >
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#eee] sticky top-0 bg-[#fafafa] rounded-t-lg shrink-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <h3 className="text-[12px] font-bold text-[#2a2a2a] uppercase tracking-wide">{stage}</h3>
              <span className="text-xs text-[#888] ml-auto font-semibold">{leads.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {leads.map((lead) => (
                <ProduccionCard
                  key={lead.rowIndex}
                  lead={lead}
                  venta={ventasMap[ventaKey(lead)]}
                  onDragStart={() => setDraggingLead(lead)}
                />
              ))}
              {leads.length === 0 && (
                <div className="text-center py-8 px-2 text-xs text-[#bbb] italic">
                  Sin órdenes
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
