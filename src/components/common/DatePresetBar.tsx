import { useState } from 'react';

type Preset = 'all' | '7d' | '15d' | '30d' | '60d' | '90d' | 'custom';

interface Props {
  onPreset: (preset: Preset) => void;
  onCustomRange: (from: string, to: string) => void;
  activePreset: Preset;
}

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: '7d', label: '7d' },
  { id: '15d', label: '15d' },
  { id: '30d', label: '30d' },
  { id: '60d', label: '60d' },
  { id: '90d', label: '90d' },
];

export default function DatePresetBar({ onPreset, onCustomRange, activePreset }: Props) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  function handleCustomApply() {
    if (fromDate && toDate) {
      onCustomRange(fromDate, toDate);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          onClick={() => onPreset(p.id)}
          className={`py-1.5 px-3 rounded-md border text-xs font-semibold cursor-pointer font-sans transition-all duration-150 ${
            activePreset === p.id
              ? 'bg-brand text-white border-brand'
              : 'bg-white text-[#666] border-[#ddd] hover:border-brand hover:text-brand'
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-1.5 ml-2">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-white border border-[#ddd] text-[#2a2a2a] py-1 px-2 rounded text-xs font-sans outline-none focus:border-brand"
        />
        <span className="text-[#666] text-xs">a</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-white border border-[#ddd] text-[#2a2a2a] py-1 px-2 rounded text-xs font-sans outline-none focus:border-brand"
        />
        <button
          onClick={handleCustomApply}
          className="py-1 px-2.5 rounded border border-brand text-brand bg-transparent text-xs font-semibold cursor-pointer font-sans hover:bg-brand hover:text-white transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
