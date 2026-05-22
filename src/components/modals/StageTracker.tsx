import type { PipelineStage } from '../../types';

interface Props {
  stages: PipelineStage[];
  currentStage: string;
  onStageClick?: (stage: string) => void;
}

export default function StageTracker({ stages, currentStage, onStageClick }: Props) {
  const isClosed = currentStage === 'Cerrado Ganado' || currentStage === 'Cerrado Perdido';

  const displayStages = stages.filter((s) => {
    if (s.name === 'Cerrado Perdido' && currentStage !== 'Cerrado Perdido') return false;
    if (s.name === 'Cerrado Ganado' && !isClosed) return false;
    return true;
  });

  const currentIdx = displayStages.findIndex((s) => s.name === currentStage);
  const isLost = currentStage === 'Cerrado Perdido';

  return (
    <div className="flex items-center gap-1 w-full">
      {displayStages.map((stage, i) => {
        const isCurrent = i === currentIdx;
        const isPast = currentIdx >= 0 && i < currentIdx;
        const isFuture = currentIdx >= 0 && i > currentIdx;

        let bgClass = '';
        let textClass = '';
        let dotClass = '';
        if (isCurrent) {
          if (isLost) {
            bgClass = 'bg-[#fee2e2] border-[#fca5a5]';
            textClass = 'text-[#b91c1c]';
            dotClass = 'bg-[#ef4444]';
          } else if (stage.name === 'Cerrado Ganado') {
            bgClass = 'bg-[#d1fae5] border-[#a7f3d0]';
            textClass = 'text-[#047857]';
            dotClass = 'bg-[#10b981]';
          } else {
            bgClass = 'bg-brand/10 border-brand/30';
            textClass = 'text-brand';
            dotClass = 'bg-brand';
          }
        } else if (isPast) {
          bgClass = 'bg-[#f3f4f6] border-[#e5e7eb]';
          textClass = 'text-[#6b7280]';
          dotClass = 'bg-[#10b981]';
        } else if (isFuture) {
          bgClass = 'bg-white border-[#e5e7eb]';
          textClass = 'text-[#9ca3af]';
          dotClass = 'bg-[#e5e7eb]';
        }

        return (
          <button
            key={stage.name}
            onClick={() => onStageClick?.(stage.name)}
            className={`flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${bgClass} ${textClass} ${onStageClick ? 'hover:scale-[1.02]' : ''}`}
            title={stage.name}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
            <span className="truncate">{stage.name}</span>
          </button>
        );
      })}
    </div>
  );
}
