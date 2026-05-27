import { useState, useContext, type DragEvent, type MouseEvent } from 'react';
import type { Lead, VentaStore } from '../../types';
import { formatDateAR, parseGoogleDate } from '../../lib/dates';
import { formatPrice } from '../../lib/formatters';
import { getStageEntryDate } from '../../lib/stageTimer';
import { ModalContext } from '../../contexts/ModalContext';

interface Props {
  lead: Lead;
  venta: VentaStore | undefined;
  onDragStart: () => void;
}

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const d = parseGoogleDate(iso);
  if (!d || isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function daysSince(iso: string): number | null {
  const n = daysUntil(iso);
  return n === null ? null : -n;
}

export default function ProduccionCard({ lead, venta, onDragStart }: Props) {
  const [dragging, setDragging] = useState(false);
  const { openLeadModal } = useContext(ModalContext);

  const stageEntryISO = getStageEntryDate(lead.rowIndex, 'Cerrado Ganado');
  const fechaCierre = venta?.fechaCierre || stageEntryISO || '';
  const fechaEntrega = venta?.fechaEntrega || '';
  const monto = venta?.monto || 0;

  const diasDesdeCierre = fechaCierre ? daysSince(fechaCierre) : null;
  const diasParaEntrega = fechaEntrega ? daysUntil(fechaEntrega) : null;
  const isOverdue = diasParaEntrega !== null && diasParaEntrega < 0;

  const measures = lead.hasMeasures && lead.ancho && lead.alto ? `${lead.ancho} x ${lead.alto} cm` : '';
  const detail = [lead.sistema, lead.material].filter(Boolean).join(' / ');
  const waNum = lead.whatsapp ? lead.whatsapp.toString().replace(/\D/g, '') : '';

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    onDragStart();
    setDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-action]')) return;
    openLeadModal(lead);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setDragging(false)}
      onClick={handleClick}
      className={`bg-white rounded-lg p-3 mb-2 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border cursor-grab transition-all duration-150 hover:shadow-[0_3px_8px_rgba(0,0,0,0.12)] ${dragging ? 'opacity-50 rotate-1' : ''} ${isOverdue ? 'border-[#ef4444]' : 'border-[#eee]'}`}
    >
      <div className="flex items-start gap-2 mb-1">
        <div className="text-sm font-bold text-[#2a2a2a] flex-1 leading-tight">{lead.nombre}</div>
        {waNum && (
          <a
            data-action="wa"
            href={`https://wa.me/${waNum}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-full bg-[#25D366] text-white text-[10px] font-bold flex items-center justify-center shrink-0 opacity-80 hover:opacity-100"
            title="WhatsApp"
          >
            WA
          </a>
        )}
      </div>

      {lead.ciudad && <div className="text-[11px] text-[#666]">{lead.ciudad}</div>}
      {detail && <div className="text-[11px] text-[#999] mt-0.5">{detail}</div>}
      {measures && <div className="text-[11px] text-[#999]">{measures}</div>}

      {monto > 0 && (
        <div className="text-[12px] text-[#10b981] font-bold mt-1.5">{formatPrice(monto)}</div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f5f5f5] gap-2">
        <div className="text-[10px] text-[#aaa] leading-tight">
          <div>Cierre: {formatDateAR(fechaCierre)}</div>
          {diasDesdeCierre !== null && diasDesdeCierre >= 0 && (
            <div className="text-[#999]">hace {diasDesdeCierre}d</div>
          )}
        </div>
        <div className="text-right">
          {fechaEntrega ? (
            <>
              <div className="text-[10px] text-[#aaa] leading-tight">Entrega: {formatDateAR(fechaEntrega)}</div>
              {diasParaEntrega !== null && (
                <div className={`text-[10px] font-bold ${isOverdue ? 'text-[#ef4444]' : diasParaEntrega <= 7 ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                  {isOverdue ? `Atrasado ${Math.abs(diasParaEntrega)}d` : diasParaEntrega === 0 ? 'HOY' : `en ${diasParaEntrega}d`}
                </div>
              )}
            </>
          ) : (
            <div className="text-[10px] text-[#bbb] italic">Sin fecha entrega</div>
          )}
        </div>
      </div>
    </div>
  );
}
