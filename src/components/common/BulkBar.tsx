interface Props {
  count: number;
  onDelete: () => void;
  onClear: () => void;
  label?: string;
}

export default function BulkBar({ count, onDelete, onClear, label = 'seleccionados' }: Props) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white text-[#2a2a2a] py-3 px-6 rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center gap-4 z-[500] text-sm font-semibold">
      <span className="text-brand">{count}</span>
      <span>{label}</span>
      <button
        onClick={onDelete}
        className="bg-danger text-white border-none py-2 px-4.5 rounded-md text-[13px] font-bold cursor-pointer font-sans hover:bg-danger-hover"
      >
        Eliminar
      </button>
      <button
        onClick={onClear}
        className="bg-transparent text-[#888] border-none text-[13px] cursor-pointer font-sans hover:text-[#2a2a2a]"
      >
        Cancelar
      </button>
    </div>
  );
}
