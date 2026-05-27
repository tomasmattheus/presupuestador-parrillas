import { useEffect, useMemo, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { Lead } from '../../types';
import { Select, type SelectOption } from '../ui/select';
import { normalizeCiudad } from '../../lib/text';
import type {
  PipelineFilterState,
  MeasuresFilter,
  AgeFilter,
} from '../../hooks/usePipelineFilters';

interface Props {
  leads: Lead[];
  filters: PipelineFilterState;
  update: <K extends keyof PipelineFilterState>(key: K, val: PipelineFilterState[K]) => void;
  reset: () => void;
  hasActiveFilters: boolean;
  totalShown: number;
  totalAll: number;
}

const measuresOptions = [
  { val: 'all', label: 'Todas' },
  { val: 'with', label: 'Con' },
  { val: 'without', label: 'Sin' },
] as const;

const ageOptions = [
  { val: 'all', label: 'Todos' },
  { val: 'fresh', label: 'Frescos' },
  { val: 'warm', label: 'Atencion' },
  { val: 'stale', label: 'Frios' },
] as const;

export default function PipelineFilters({
  leads,
  filters,
  update,
  reset,
  hasActiveFilters,
  totalShown,
  totalAll,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        update('search', '');
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [update]);

  const ciudades: SelectOption[] = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      const c = normalizeCiudad(l.ciudad);
      if (c) set.add(c);
    });
    return [
      { value: '', label: 'Toda ciudad' },
      ...Array.from(set).sort().map((c) => ({ value: c, label: c })),
    ];
  }, [leads]);

  const sistemas: SelectOption[] = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      const v = (l.sistema || '').trim();
      if (v) set.add(v);
    });
    return [
      { value: '', label: 'Todo sistema' },
      ...Array.from(set).sort().map((v) => ({ value: v, label: v })),
    ];
  }, [leads]);

  const materiales: SelectOption[] = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      const v = (l.material || '').trim();
      if (v) set.add(v);
    });
    return [
      { value: '', label: 'Todo material' },
      ...Array.from(set).sort().map((v) => ({ value: v, label: v })),
    ];
  }, [leads]);

  return (
    <div className="flex items-center gap-2 flex-wrap shrink-0 mb-4">
      <div className="relative w-[280px]">
        <Search
          size={14}
          strokeWidth={2}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Buscar nombre, telefono, ciudad..."
          className="h-9 w-full pl-9 pr-16 border border-border rounded-md text-sm font-sans outline-none bg-white text-text focus:border-brand focus:ring-2 focus:ring-brand/15 placeholder:text-text-subtle"
        />
        {filters.search ? (
          <button
            type="button"
            onClick={() => update('search', '')}
            title="Limpiar busqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text bg-bg-muted hover:bg-border rounded-full w-5 h-5 flex items-center justify-center cursor-pointer border-none"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        ) : (
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-subtle bg-bg-muted border border-border rounded px-1.5 py-0.5 pointer-events-none font-mono">
            &#8984;K
          </kbd>
        )}
      </div>

      <div className="w-[150px]">
        <Select
          value={filters.ciudad}
          onChange={(v) => update('ciudad', v)}
          options={ciudades}
          size="sm"
        />
      </div>
      <div className="w-[150px]">
        <Select
          value={filters.sistema}
          onChange={(v) => update('sistema', v)}
          options={sistemas}
          size="sm"
        />
      </div>
      <div className="w-[150px]">
        <Select
          value={filters.material}
          onChange={(v) => update('material', v)}
          options={materiales}
          size="sm"
        />
      </div>

      <PillGroup
        label="Medidas"
        options={measuresOptions}
        value={filters.measures}
        onChange={(v) => update('measures', v as MeasuresFilter)}
      />
      <PillGroup
        label="Antiguedad"
        options={ageOptions}
        value={filters.age}
        onChange={(v) => update('age', v as AgeFilter)}
      />

      <div className="ml-auto flex items-center gap-3">
        <div className="text-[12px] text-text-muted">
          <span className="font-semibold text-text">{totalShown}</span> de {totalAll} leads
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={reset}
            className="text-[12px] font-semibold text-brand hover:text-brand-hover flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
          >
            <X size={12} strokeWidth={2.5} />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

interface PillProps<T extends string> {
  label: string;
  options: readonly { val: T; label: string }[];
  value: T;
  onChange: (val: T) => void;
}

function PillGroup<T extends string>({ label, options, value, onChange }: PillProps<T>) {
  return (
    <div className="flex items-center gap-0.5 bg-bg-muted border border-border rounded-md h-8 pl-2 pr-1">
      <span className="text-[10px] uppercase tracking-wider font-bold text-text-subtle mr-1">
        {label}
      </span>
      {options.map((opt) => {
        const active = value === opt.val;
        return (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(opt.val)}
            className={`h-6 px-2 rounded text-[11px] font-semibold transition-colors cursor-pointer border-none ${
              active
                ? 'bg-white text-brand shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : 'bg-transparent text-text-muted hover:text-text'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
