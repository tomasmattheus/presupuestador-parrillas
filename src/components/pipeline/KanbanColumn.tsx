import { useState, useCallback, type DragEvent } from 'react';
import type { Lead, PipelineStage } from '../../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  onDrop: (stageName: string) => void;
  onDragStart: (lead: Lead) => void;
  onOpenModal: (lead: Lead) => void;
  onMarkWon: (lead: Lead) => void;
  onMarkLost: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export default function KanbanColumn({
  stage,
  leads,
  onDrop,
  onDragStart,
  onOpenModal,
  onMarkWon,
  onMarkLost,
  onDelete,
}: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    const current = e.currentTarget;
    if (!current.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      onDrop(stage.name);
    },
    [onDrop, stage.name]
  );

  return (
    <div
      className={`min-w-[300px] w-[300px] bg-[#f5f5f5] rounded-[10px] flex flex-col shrink-0 max-h-full border-2 transition-all duration-200 ${dragOver ? 'border-[#1DA1F2] shadow-[0_0_0_3px_rgba(29,161,242,0.15)]' : 'border-transparent'}`}
    >
      <div
        className="px-3.5 pt-3 pb-2.5 rounded-t-[10px] shrink-0 flex items-center justify-between"
        style={{ background: stage.color }}
      >
        <span className="text-[13px] font-bold uppercase tracking-wide text-white">
          {stage.name}
        </span>
        <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-[10px] min-w-[24px] text-center">
          {leads.length}
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto p-2 px-2.5 min-h-[60px] scrollbar-thin scrollbar-thumb-[#ccc] scrollbar-track-transparent"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {leads.length === 0 ? (
          <div className="py-5 px-2.5 text-center">
            <div className="text-[28px] opacity-30">&#9744;</div>
            <div className="text-xs text-[#bbb] mt-1.5">Sin leads en esta etapa</div>
          </div>
        ) : (
          leads.map((lead) => (
            <KanbanCard
              key={lead.rowIndex}
              lead={lead}
              onDragStart={onDragStart}
              onOpenModal={onOpenModal}
              onMarkWon={onMarkWon}
              onMarkLost={onMarkLost}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
