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
      className={`min-w-[290px] w-[290px] bg-bg-muted rounded-xl flex flex-col shrink-0 max-h-full border transition-all duration-200 ${
        dragOver
          ? 'border-brand bg-brand-soft/40 shadow-[0_0_0_3px_rgba(14,165,233,0.12)]'
          : 'border-border'
      }`}
    >
      <div className="flex items-center gap-2 px-3.5 py-3 border-b border-border shrink-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: stage.color }} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-text">
          {stage.name}
        </span>
        <span className="ml-auto text-[11px] text-text-muted font-semibold">
          {leads.length}
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto p-2 px-2.5 min-h-[60px]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {leads.length === 0 ? (
          <div className="py-6 px-2.5 text-center">
            <div className="text-xs text-text-subtle italic">Sin leads</div>
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
