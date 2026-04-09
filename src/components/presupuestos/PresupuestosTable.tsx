import { useState, useMemo } from 'react';
import type { BudgetFlat } from '../../types';
import { formatPrice } from '../../lib/formatters';
import { formatDateAR } from '../../lib/dates';

interface Props {
  budgets: BudgetFlat[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onView: (b: BudgetFlat) => void;
  onEdit: (b: BudgetFlat) => void;
  onDuplicate: (b: BudgetFlat) => void;
  onDelete: (b: BudgetFlat) => void;
}

interface ClientGroup {
  key: string;
  cliente: string;
  latest: BudgetFlat;
  versions: BudgetFlat[];
}

function shortenMaterial(m: string): string {
  return (m || '').replace('Acero inoxidable esmerilado', 'Inox').replace('Chapa pintada epoxi negro', 'Epoxi');
}

function shortenSistema(s: string): string {
  return (s || '').replace(' contrapesado', '').replace(' con pistones', '');
}

export default function PresupuestosTable({
  budgets,
  selectedIds,
  onToggle,
  onToggleAll,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  const allSelected = budgets.length > 0 && selectedIds.size === budgets.length;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const groups: ClientGroup[] = useMemo(() => {
    const map = new Map<string, BudgetFlat[]>();
    budgets.forEach((b) => {
      const key = b.cliente.toLowerCase().trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    const result: ClientGroup[] = [];
    map.forEach((versions, key) => {
      const sorted = [...versions].sort((a, b) => parseInt(b.nro) - parseInt(a.nro));
      result.push({ key, cliente: sorted[0].cliente, latest: sorted[0], versions: sorted });
    });
    result.sort((a, b) => parseInt(b.latest.nro) - parseInt(a.latest.nro));
    return result;
  }, [budgets]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const renderRow = (b: BudgetFlat, isLatest: boolean, isSubRow: boolean) => {
    const itemCount = b.items.length + ' prod.';
    return (
      <tr
        key={b.id}
        className={`transition-colors duration-150 hover:bg-[#f0f7ff] ${isSubRow ? 'bg-[#f8f9fb]' : 'even:bg-[#fafafa]'} even:hover:bg-[#f0f7ff]`}
      >
        <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle">
          <input
            type="checkbox"
            checked={selectedIds.has(b.id)}
            onChange={() => onToggle(b.id)}
            className="accent-brand w-4 h-4"
          />
        </td>
        <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle font-bold text-[#2a2a2a]">
          {isSubRow && <span className="text-[#ccc] mr-1">&#8627;</span>}
          {b.nro}
        </td>
        <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-[#2a2a2a]">{formatDateAR(b.fecha)}</td>
        <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle font-semibold text-brand">{b.cliente}</td>
        <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-[#2a2a2a]">{shortenSistema(b.sistema)}</td>
        <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-[#2a2a2a]">{shortenMaterial(b.material)}</td>
        <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle font-black text-brand">{formatPrice(b.total)}</td>
        <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-xs text-[#888]">
          {itemCount}
          {isLatest && !isSubRow && (
            <span className="ml-1.5 text-[9px] bg-[#d1fae5] text-[#059669] px-1.5 py-0.5 rounded font-bold">ULTIMO</span>
          )}
        </td>
        <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle whitespace-nowrap">
          <button onClick={() => onView(b)} className="bg-transparent border border-[#ddd] text-[#555] text-xs font-semibold py-1 px-2.5 rounded cursor-pointer font-sans transition-all mr-1 hover:border-brand hover:text-brand">Ver</button>
          <button onClick={() => onEdit(b)} className="bg-transparent border border-[#93c5fd] text-[#3b82f6] text-xs font-semibold py-1 px-2.5 rounded cursor-pointer font-sans transition-all mr-1 hover:border-[#3b82f6] hover:text-white hover:bg-[#3b82f6]">Editar</button>
          <button onClick={() => onDuplicate(b)} className="bg-transparent border border-[#ddd] text-[#555] text-xs font-semibold py-1 px-2.5 rounded cursor-pointer font-sans transition-all mr-1 hover:border-success hover:text-success">Duplicar</button>
          <button onClick={() => onDelete(b)} className="bg-transparent border border-[#fca5a5] text-danger text-xs font-semibold py-1 px-2.5 rounded cursor-pointer font-sans transition-all hover:border-danger hover:text-white hover:bg-danger">Eliminar</button>
        </td>
      </tr>
    );
  };

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap w-[30px]">
            <input type="checkbox" checked={allSelected} onChange={onToggleAll} className="accent-brand w-4 h-4" />
          </th>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap">N&deg;</th>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap">Fecha</th>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap">Cliente</th>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap">Sistema</th>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap">Material</th>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap">Total</th>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap">Items</th>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {groups.map((group) => {
          const isExpanded = expanded.has(group.key);
          const hasMultiple = group.versions.length > 1;
          return (
            <>
              <tr
                key={group.key + '-header'}
                className={`transition-colors duration-150 hover:bg-[#f0f7ff] ${hasMultiple ? 'cursor-pointer' : ''}`}
                onClick={hasMultiple ? () => toggleExpand(group.key) : undefined}
              >
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(group.latest.id)}
                    onChange={() => onToggle(group.latest.id)}
                    className="accent-brand w-4 h-4"
                  />
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle font-bold text-[#2a2a2a]">
                  {hasMultiple && (
                    <span className={`text-[10px] text-[#999] mr-1.5 inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                  )}
                  {group.latest.nro}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-[#2a2a2a]">{formatDateAR(group.latest.fecha)}</td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle font-semibold text-brand">
                  {group.cliente}
                  {hasMultiple && (
                    <span className="ml-2 text-[10px] bg-[#f0f2f5] text-[#888] px-1.5 py-0.5 rounded font-bold">{group.versions.length} vers.</span>
                  )}
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-[#2a2a2a]">{shortenSistema(group.latest.sistema)}</td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-[#2a2a2a]">{shortenMaterial(group.latest.material)}</td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle font-black text-brand">{formatPrice(group.latest.total)}</td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-xs text-[#888]">
                  {group.latest.items.length} prod.
                  <span className="ml-1.5 text-[9px] bg-[#d1fae5] text-[#059669] px-1.5 py-0.5 rounded font-bold">ULTIMO</span>
                </td>
                <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => onView(group.latest)} className="bg-transparent border border-[#ddd] text-[#555] text-xs font-semibold py-1 px-2.5 rounded cursor-pointer font-sans transition-all mr-1 hover:border-brand hover:text-brand">Ver</button>
                  <button onClick={() => onEdit(group.latest)} className="bg-transparent border border-[#93c5fd] text-[#3b82f6] text-xs font-semibold py-1 px-2.5 rounded cursor-pointer font-sans transition-all mr-1 hover:border-[#3b82f6] hover:text-white hover:bg-[#3b82f6]">Editar</button>
                  <button onClick={() => onDuplicate(group.latest)} className="bg-transparent border border-[#ddd] text-[#555] text-xs font-semibold py-1 px-2.5 rounded cursor-pointer font-sans transition-all mr-1 hover:border-success hover:text-success">Duplicar</button>
                  <button onClick={() => onDelete(group.latest)} className="bg-transparent border border-[#fca5a5] text-danger text-xs font-semibold py-1 px-2.5 rounded cursor-pointer font-sans transition-all hover:border-danger hover:text-white hover:bg-danger">Eliminar</button>
                </td>
              </tr>
              {isExpanded && group.versions.slice(1).map((b) => renderRow(b, false, true))}
            </>
          );
        })}
      </tbody>
    </table>
  );
}
