import { useCallback, useState, type DragEvent, type MouseEvent } from 'react';
import type { Lead } from '../../types';
import { formatDateAR } from '../../lib/dates';
import { getDaysInStage } from '../../lib/stageTimer';

interface KanbanCardProps {
  lead: Lead;
  onDragStart: (lead: Lead) => void;
  onOpenModal: (lead: Lead) => void;
  onMarkWon: (lead: Lead) => void;
  onMarkLost: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export default function KanbanCard({
  lead,
  onDragStart,
  onOpenModal,
  onMarkWon,
  onMarkLost,
  onDelete,
}: KanbanCardProps) {
  const [dragging, setDragging] = useState(false);

  const dotClass = lead.hasMeasures
    ? 'bg-[#1DA1F2]'
    : 'bg-[#ccc]';

  const measuresText = lead.hasMeasures
    ? `${lead.ancho} x ${lead.alto} cm`
    : '';

  const detailParts: string[] = [];
  if (lead.sistema) detailParts.push(lead.sistema);
  if (lead.material) detailParts.push(lead.material);
  const detailText = detailParts.join(' / ');

  const daysInStage = getDaysInStage(lead.rowIndex, lead.stage);

  const waNum = lead.whatsapp ? lead.whatsapp.toString().replace(/\D/g, '') : '';

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      onDragStart(lead);
      setDragging(true);
      e.dataTransfer.effectAllowed = 'move';
    },
    [lead, onDragStart]
  );

  const handleDragEnd = useCallback(() => {
    setDragging(false);
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-action]')) return;
      onOpenModal(lead);
    },
    [lead, onOpenModal]
  );

  const handleWin = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onMarkWon(lead);
    },
    [lead, onMarkWon]
  );

  const handleLose = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onMarkLost(lead);
    },
    [lead, onMarkLost]
  );

  const handleDelete = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDelete(lead);
    },
    [lead, onDelete]
  );

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`relative bg-white rounded-lg px-3.5 pt-3 pb-7 mb-2 shadow-[0_1px_3px_rgba(0,0,0,0.08)] cursor-grab border border-[#eee] transition-all duration-150 hover:shadow-[0_3px_8px_rgba(0,0,0,0.12)] group ${dragging ? 'opacity-50 rotate-2' : ''}`}
    >
      <div className="flex gap-1.5 absolute top-2.5 right-2.5">
        {waNum && (
          <a
            data-action="wa"
            href={`https://wa.me/${waNum}`}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full bg-[#25D366] text-white text-xs font-bold flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-115 hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-150"
          >
            WA
          </a>
        )}
        <button
          data-action="win"
          onClick={handleWin}
          title="Cerrado Ganado"
          className="w-7 h-7 rounded-full bg-[#10b981] text-white text-sm font-bold flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-115 hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-150 border-none cursor-pointer"
        >
          &#10003;
        </button>
        <button
          data-action="lose"
          onClick={handleLose}
          title="Cerrado Perdido"
          className="w-7 h-7 rounded-full bg-[#ef4444] text-white text-sm font-bold flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-115 hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-150 border-none cursor-pointer"
        >
          &#10007;
        </button>
      </div>

      <div className="text-sm font-bold text-[#2a2a2a] mb-1 flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
        {lead.nombre}
      </div>

      {lead.ciudad && (
        <div className="text-xs text-[#666] mb-0.5">{lead.ciudad}</div>
      )}

      {detailText && (
        <div className="text-[11px] text-[#999] leading-snug">{detailText}</div>
      )}

      {measuresText && (
        <div className="text-[11px] text-[#999] leading-snug">{measuresText}</div>
      )}

      <div className="text-[11px] text-[#bbb] mt-1.5">
        {lead.fecha ? formatDateAR(lead.fecha) : ''}
        {daysInStage >= 0 && (
          <span className={`font-semibold ${daysInStage > 7 ? 'text-[#ef4444]' : daysInStage > 3 ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
            {' '}· {daysInStage === 0 ? 'hoy' : daysInStage === 1 ? 'hace 1 dia' : `hace ${daysInStage} dias`}
          </span>
        )}
      </div>

      <button
        data-action="delete"
        onClick={handleDelete}
        title="Eliminar"
        className="absolute bottom-2 right-2.5 w-[22px] h-[22px] rounded-full border-none cursor-pointer text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-60 hover:!opacity-100 bg-[#ddd] text-[#999] hover:!bg-[#ef4444] hover:!text-white transition-all duration-150"
      >
        &#128465;
      </button>
    </div>
  );
}
