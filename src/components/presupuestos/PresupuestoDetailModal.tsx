import type { BudgetFlat } from '../../types';
import { formatPrice } from '../../lib/formatters';
import { formatDateAR } from '../../lib/dates';

interface Props {
  isOpen: boolean;
  budget: BudgetFlat | null;
  onClose: () => void;
  onEdit: (b: BudgetFlat) => void;
  onDuplicate: (b: BudgetFlat) => void;
}

export default function PresupuestoDetailModal({ isOpen, budget, onClose, onEdit, onDuplicate }: Props) {
  if (!isOpen || !budget) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[600] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[560px] max-h-[85vh] overflow-y-auto p-8 shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-black text-brand mb-1">
          PRESUPUESTO #{budget.nro} &mdash; {formatDateAR(budget.fecha)}
        </h2>
        <div className="mb-4 text-sm text-[#444] leading-relaxed">
          <div><strong>Cliente:</strong> {budget.cliente}</div>
          <div><strong>Sistema:</strong> {budget.sistema}</div>
          <div><strong>Material:</strong> {budget.material}</div>
          <div><strong>Medidas:</strong> {budget.medidas}</div>
        </div>

        <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#888] mb-2">Detalle</h3>
        <table className="w-full border-collapse mb-4">
          <tbody>
            {budget.items.map((item, i) => (
              <tr key={i} className="border-b border-[#eee]">
                <td className="py-2 px-2.5 text-sm text-[#2a2a2a]">{item.nombre || '-'}</td>
                <td className="py-2 px-2.5 text-sm text-[#2a2a2a] text-right whitespace-nowrap">
                  {item.precio > 0 ? formatPrice(item.precio) : 'Sin cargo'}
                </td>
              </tr>
            ))}
            <tr className="bg-brand text-white">
              <td className="py-2.5 px-2.5 text-base font-black">TOTAL</td>
              <td className="py-2.5 px-2.5 text-base font-black text-right">{formatPrice(budget.total)}</td>
            </tr>
          </tbody>
        </table>

        {budget.descuento > 0 && (
          <div className="text-[13px] text-success font-semibold">
            Descuento anticipado: {budget.descuento}%
          </div>
        )}
        {budget.recargo > 0 && (
          <div className="text-[13px] text-warning font-semibold">
            Recargo cuotas: {budget.recargo}% ({budget.cuotas} cuotas)
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onEdit(budget)}
            className="flex-1 bg-brand text-white border-none py-2.5 rounded-md text-sm font-bold cursor-pointer font-sans hover:bg-brand-hover transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDuplicate(budget)}
            className="flex-1 bg-success text-white border-none py-2.5 rounded-md text-sm font-bold cursor-pointer font-sans hover:bg-[#059669] transition-colors"
          >
            Duplicar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#f0f0f0] text-[#555] border-none py-2.5 rounded-md text-sm font-bold cursor-pointer font-sans hover:bg-[#e0e0e0] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
