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

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="sticky top-0 bg-[#fafafa] py-2.5 px-3.5 text-left text-[11px] font-bold text-[#888] uppercase tracking-wide border-b-2 border-[#eee] z-[1] whitespace-nowrap w-[30px]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              className="accent-brand w-4 h-4"
            />
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
        {budgets.map((b) => {
          const itemCount = b.items.length + ' producto' + (b.items.length !== 1 ? 's' : '');
          return (
            <tr
              key={b.id}
              className="transition-colors duration-150 hover:bg-[#f0f7ff] even:bg-[#fafafa] even:hover:bg-[#f0f7ff]"
            >
              <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle">
                <input
                  type="checkbox"
                  checked={selectedIds.has(b.id)}
                  onChange={() => onToggle(b.id)}
                  className="accent-brand w-4 h-4"
                />
              </td>
              <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle font-bold text-[#2a2a2a]">{b.nro}</td>
              <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-[#2a2a2a]">{formatDateAR(b.fecha)}</td>
              <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle font-semibold text-brand">{b.cliente}</td>
              <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-[#2a2a2a]">{shortenSistema(b.sistema)}</td>
              <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-[#2a2a2a]">{shortenMaterial(b.material)}</td>
              <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle font-black text-brand">{formatPrice(b.total)}</td>
              <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle text-xs text-[#888]">{itemCount}</td>
              <td className="py-2.5 px-3.5 border-b border-[#f0f0f0] align-middle whitespace-nowrap">
                <button
                  onClick={() => onView(b)}
                  className="bg-transparent border border-[#ddd] text-[#555] text-xs font-semibold py-1 px-3 rounded cursor-pointer font-sans transition-all mr-1.5 hover:border-brand hover:text-brand"
                >
                  Ver
                </button>
                <button
                  onClick={() => onEdit(b)}
                  className="bg-transparent border border-[#93c5fd] text-[#3b82f6] text-xs font-semibold py-1 px-3 rounded cursor-pointer font-sans transition-all mr-1.5 hover:border-[#3b82f6] hover:text-white hover:bg-[#3b82f6]"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDuplicate(b)}
                  className="bg-transparent border border-[#ddd] text-[#555] text-xs font-semibold py-1 px-3 rounded cursor-pointer font-sans transition-all mr-1.5 hover:border-success hover:text-success"
                >
                  Duplicar
                </button>
                <button
                  onClick={() => onDelete(b)}
                  className="bg-transparent border border-[#fca5a5] text-danger text-xs font-semibold py-1 px-3 rounded cursor-pointer font-sans transition-all hover:border-danger hover:text-white hover:bg-danger"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
