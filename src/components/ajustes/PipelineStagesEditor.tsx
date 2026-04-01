import { usePipelineStages } from '../../hooks/usePipelineStages';

const FIXED_STAGES = ['Cerrado Ganado', 'Cerrado Perdido'];

export default function PipelineStagesEditor() {
  const { stages, saveStages, addStage, deleteStage } = usePipelineStages();

  const updateStage = (index: number, field: 'name' | 'color', value: string) => {
    const next = stages.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    saveStages(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <div className="bg-white rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <p className="text-xs text-[#999] mb-2.5">
          Etapas del pipeline de ventas. Las etapas &quot;Cerrado Ganado&quot; y &quot;Cerrado Perdido&quot; no se pueden eliminar.
        </p>

        {stages.map((stage, idx) => {
          const isFixed = FIXED_STAGES.includes(stage.name);
          return (
            <div
              key={idx}
              className="flex items-center gap-2 py-1.5 border-b border-[#f0f0f0]"
            >
              <input
                type="color"
                className="w-7 h-7 border border-[#ddd] rounded p-px cursor-pointer shrink-0"
                value={stage.color}
                onChange={(e) => updateStage(idx, 'color', e.target.value)}
              />
              <input
                type="text"
                className="flex-1 px-2.5 py-1.5 border border-[#ddd] rounded text-[13px] text-[#2a2a2a] outline-none focus:border-[#1DA1F2] font-[inherit]"
                value={stage.name}
                onChange={(e) => updateStage(idx, 'name', e.target.value)}
                readOnly={isFixed}
              />
              {isFixed ? (
                <span className="text-[11px] text-[#bbb] ml-auto whitespace-nowrap">Fijo</span>
              ) : (
                <button
                  className="bg-transparent border-none text-[#ef4444] text-base cursor-pointer px-1.5 py-0.5 rounded shrink-0 hover:bg-red-50"
                  onClick={() => deleteStage(idx)}
                >
                  &#10007;
                </button>
              )}
            </div>
          );
        })}

        <button
          className="w-full mt-2 bg-transparent border border-dashed border-[#ccc] text-[#888] py-2 px-4 rounded-md cursor-pointer text-[13px] font-semibold font-[inherit] transition-all hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
          onClick={() => addStage({ name: 'Nueva etapa', color: '#6b7280' })}
        >
          + Agregar etapa
        </button>
      </div>
    </div>
  );
}
