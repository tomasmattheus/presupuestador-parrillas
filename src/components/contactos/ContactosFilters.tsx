import type { PipelineStage } from '../../types';

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
  return (
    <div className="flex items-center gap-3 mb-4 flex-shrink-0 flex-wrap">
      <h1 className="text-[22px] font-black text-[#2a2a2a] tracking-wide m-0">Contactos</h1>
      <input
        type="text"
        className="py-2 px-3.5 border border-[#ddd] rounded-md text-sm font-sans outline-none w-[220px] bg-white text-[#2a2a2a] focus:border-brand"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select
        className="py-2 px-3 border border-[#ddd] rounded-md text-[13px] font-sans outline-none bg-white text-[#2a2a2a] cursor-pointer focus:border-brand"
        value={filters.estado}
        onChange={(e) => onFilterChange({ ...filters, estado: e.target.value })}
      >
        <option value="">Todos los estados</option>
        {stages.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
      <select
        className="py-2 px-3 border border-[#ddd] rounded-md text-[13px] font-sans outline-none bg-white text-[#2a2a2a] cursor-pointer focus:border-brand"
        value={filters.material}
        onChange={(e) => onFilterChange({ ...filters, material: e.target.value })}
      >
        <option value="">Todos los materiales</option>
        <option value="Epoxi">Epoxi</option>
        <option value="Acero Inoxidable">Acero Inoxidable</option>
      </select>
      <select
        className="py-2 px-3 border border-[#ddd] rounded-md text-[13px] font-sans outline-none bg-white text-[#2a2a2a] cursor-pointer focus:border-brand"
        value={filters.ciudad}
        onChange={(e) => onFilterChange({ ...filters, ciudad: e.target.value })}
      >
        <option value="">Todas las ciudades</option>
        {ciudades.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name} ({c.count})
          </option>
        ))}
      </select>
    </div>
  );
}
