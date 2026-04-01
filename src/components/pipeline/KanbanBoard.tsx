import type { Lead, PipelineStage } from '../../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  stages: PipelineStage[];
  leads: Lead[];
  onDrop: (stageName: string) => void;
  onDragStart: (lead: Lead) => void;
  onOpenModal: (lead: Lead) => void;
  onMarkWon: (lead: Lead) => void;
  onMarkLost: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export default function KanbanBoard({
  stages,
  leads,
  onDrop,
  onDragStart,
  onOpenModal,
  onMarkWon,
  onMarkLost,
  onDelete,
}: KanbanBoardProps) {
  return (
    <div className="flex gap-3.5 flex-1 overflow-x-auto overflow-y-hidden pb-2.5">
      {stages.map((stage) => (
        <KanbanColumn
          key={stage.name}
          stage={stage}
          leads={leads.filter((l) => l.stage === stage.name)}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onOpenModal={onOpenModal}
          onMarkWon={onMarkWon}
          onMarkLost={onMarkLost}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
