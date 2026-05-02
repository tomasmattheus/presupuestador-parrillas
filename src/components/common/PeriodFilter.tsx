import { useState } from 'react';
import type { PeriodPreset } from '../../hooks/useDateFilter';

interface Props {
  activePreset: PeriodPreset;
  onPreset: (preset: PeriodPreset) => void;
  onCustomRange: (from: string, to: string) => void;
  dateFrom: string;
  dateTo: string;
}

const PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'esta-semana', label: 'Esta semana' },
  { key: 'este-mes', label: 'Este mes' },
  { key: 'mes-pasado', label: 'Mes pasado' },
];

export default function PeriodFilter({ activePreset, onPreset, onCustomRange, dateFrom, dateTo }: Props) {
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const applyCustom = () => {
    if (customFrom || customTo) onCustomRange(customFrom, customTo);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => onPreset(p.key)}
          className={`py-1.5 px-3 rounded-md border text-xs font-semibold cursor-pointer font-sans transition-colors ${
            activePreset === p.key
              ? 'bg-brand text-white border-brand'
              : 'bg-white text-[#555] border-[#ddd] hover:border-brand hover:text-brand'
          }`}
        >
          {p.label}
        </button>
      ))}
      <span className="text-[#ccc] text-xs">|</span>
      <input
        type="date"
        value={activePreset === 'custom' ? dateFrom : customFrom}
        onChange={(e) => setCustomFrom(e.target.value)}
        className="py-1 px-2 border border-[#ddd] rounded-md text-xs font-sans outline-none focus:border-brand"
      />
      <span className="text-xs text-[#999]">a</span>
      <input
        type="date"
        value={activePreset === 'custom' ? dateTo : customTo}
        onChange={(e) => setCustomTo(e.target.value)}
        className="py-1 px-2 border border-[#ddd] rounded-md text-xs font-sans outline-none focus:border-brand"
      />
      <button
        onClick={applyCustom}
        className="py-1.5 px-3 rounded-md border text-xs font-semibold cursor-pointer font-sans bg-white text-[#555] border-[#ddd] hover:border-brand hover:text-brand transition-colors"
      >
        Aplicar
      </button>
    </div>
  );
}
