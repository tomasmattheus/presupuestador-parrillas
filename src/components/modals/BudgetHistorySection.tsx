import { useState, useMemo } from 'react';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { formatPrice } from '../../lib/formatters';
import { formatDateAR } from '../../lib/dates';
import type { BudgetFlat } from '../../types';

interface Props {
  clienteKey: string;
}

function BudgetCard({ budget }: { budget: BudgetFlat }) {
  const [open, setOpen] = useState(false);

  const materialShort = (budget.material || '')
    .replace('Acero inoxidable esmerilado', 'Inox')
    .replace('Chapa pintada epoxi negro', 'Epoxi');

  return (
    <div className="bg-[#f7f9fb] border border-[#e8ecf0] rounded-lg px-3.5 py-3 mb-2">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm font-bold text-[#2a2a2a]">
            #{budget.nro || '-'} &middot; {formatDateAR(budget.fecha) || '-'}
          </div>
          <div className="text-xs text-[#666] mt-0.5">
            {budget.sistema || '-'} &middot; {materialShort || '-'}
          </div>
        </div>
        <div className="text-[15px] font-black text-[#1DA1F2]">
          {formatPrice(budget.total || 0)}
        </div>
      </div>
      <button
        className="bg-transparent border-none text-[#1DA1F2] text-xs font-semibold cursor-pointer pt-1 mt-1.5 font-inherit hover:underline"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Ocultar detalle \u25B2' : 'Ver detalle \u25BC'}
      </button>
      {open && (
        <div className="mt-2 pt-2 border-t border-[#e0e4e8] text-[13px]">
          {budget.items && budget.items.length > 0 && budget.items.map((item, i) => (
            <div key={i} className="flex justify-between py-0.5 text-[#444]">
              <span>{item.nombre || '-'}</span>
              <span>{item.precio > 0 ? formatPrice(item.precio) : 'Sin cargo'}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-[#2a2a2a] pt-1.5 border-t border-[#e0e4e8] mt-1">
            <span>Total</span>
            <span>{formatPrice(budget.total || 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

function keysMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const [nameA, phoneA] = a.split('|');
  const [nameB, phoneB] = b.split('|');
  if (nameA?.toLowerCase().trim() !== nameB?.toLowerCase().trim()) return false;
  if (!phoneA || !phoneB) return nameA?.toLowerCase().trim() === nameB?.toLowerCase().trim();
  return normalizePhone(phoneA) === normalizePhone(phoneB);
}

export default function BudgetHistorySection({ clienteKey }: Props) {
  const { budgetsFlat = [] } = usePresupuestos();

  const budgets = useMemo(
    () => budgetsFlat.filter((b) => keysMatch(b.clientKey, clienteKey)),
    [budgetsFlat, clienteKey]
  );

  if (budgets.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t-2 border-[#f0f0f0]">
      <h3 className="text-[13px] font-bold text-[#1DA1F2] uppercase tracking-wide mb-3">
        Presupuestos enviados
      </h3>
      {budgets.map((b, idx) => (
        <BudgetCard key={b.id || idx} budget={b} />
      ))}
    </div>
  );
}
