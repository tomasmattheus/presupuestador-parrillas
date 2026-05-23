import { Search } from 'lucide-react';
import type { PipelineStage } from '../../types';
import { Select, type SelectOption } from '../ui/select';

interface Filters {
  estado: string;
  material: string;
  ciudad: string;
}

interface Props {
  searchTerm: string;
  onSearch: (term: string) => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  stages: PipelineStage[];
  ciudades: { name: string; count: number }[];
}

export default function ContactosFilters({
  searchTerm,
  onSearch,
  filters,
  onFilterChange,
  stages,
  ciudades,
}: Props) {
  const estadoOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    ...stages.map((s) => ({ value: s.name, label: s.name })),
  ];

  const materialOptions: SelectOption[] = [
    { value: '', label: 'Todos los materiales' },
    { value: 'Epoxi', label: 'Epoxi' },
    { value: 'Acero Inoxidable', label: 'Acero Inoxidable' },
  ];

  const ciudadOptions: SelectOption[] = [
    { value: '', label: 'Todas las ciudades' },
    ...ciudades.map((c) => ({ value: c.name, label: c.name, hint: `${c.count} contactos` })),
  ];

  return (
    <div className="flex items-center gap-2.5 mb-3 flex-shrink-0 flex-wrap">
      <div className="relative w-[260px]">
        <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        <input
          type="text"
          className="h-9 w-full pl-9 pr-3 border border-border rounded-md text-sm font-sans outline-none bg-white text-text focus:border-brand focus:ring-2 focus:ring-brand/15 placeholder:text-text-subtle"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="w-[180px]">
        <Select
          value={filters.estado}
          onChange={(v) => onFilterChange({ ...filters, estado: v })}
          options={estadoOptions}
        />
      </div>
      <div className="w-[180px]">
        <Select
          value={filters.material}
          onChange={(v) => onFilterChange({ ...filters, material: v })}
          options={materialOptions}
        />
      </div>
      <div className="w-[200px]">
        <Select
          value={filters.ciudad}
          onChange={(v) => onFilterChange({ ...filters, ciudad: v })}
          options={ciudadOptions}
        />
      </div>
    </div>
  );
}
