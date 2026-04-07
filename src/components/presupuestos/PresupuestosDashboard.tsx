import { useContext, useCallback, useMemo } from 'react';
import type { BudgetFlat } from '../../types';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { useBulkSelect } from '../../hooks/useBulkSelect';
import { deleteBudget } from '../../services/presupuestos.service';
import { formatPrice } from '../../lib/formatters';
import { ModalContext } from '../../contexts/ModalContext';
import { useQueryClient } from '@tanstack/react-query';
import PresupuestosTable from './PresupuestosTable';
import PresupuestoDetailModal from './PresupuestoDetailModal';
import BulkBar from '../common/BulkBar';
import LoadingOverlay from '../common/LoadingOverlay';
import { useState } from 'react';

interface Props {
  onCreateNew: () => void;
  onEdit: (b: BudgetFlat) => void;
  onDuplicate: (b: BudgetFlat) => void;
}

export default function PresupuestosDashboard({ onCreateNew, onEdit, onDuplicate }: Props) {
  const { budgetsFlat, loading } = usePresupuestos();
  const { selectedIds, toggle, toggleAll, clear, count } = useBulkSelect<string>();
  const { showConfirm, showToast } = useContext(ModalContext);
  const queryClient = useQueryClient();
  const [detailBudget, setDetailBudget] = useState<BudgetFlat | null>(null);

  const totalMonto = useMemo(() => budgetsFlat.reduce((s, b) => s + b.total, 0), [budgetsFlat]);
  const promedio = useMemo(() => (budgetsFlat.length > 0 ? Math.round(totalMonto / budgetsFlat.length) : 0), [totalMonto, budgetsFlat.length]);

  const handleDelete = useCallback((b: BudgetFlat) => {
    showConfirm('Eliminar presupuesto', 'Eliminar presupuesto #' + b.nro + '?', async () => {
      await deleteBudget(b._rowIndex);
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      showToast('Presupuesto eliminado', 'success');
    });
  }, [showConfirm, showToast, queryClient]);

  const handleBulkDelete = useCallback(() => {
    showConfirm('Eliminar seleccionados', 'Eliminar ' + count + ' presupuestos?', async () => {
      const toDelete = budgetsFlat.filter((b) => selectedIds.has(b.id));
      const sorted = [...toDelete].sort((a, b) => b._rowIndex - a._rowIndex);
      for (const b of sorted) {
        await deleteBudget(b._rowIndex);
        await new Promise((r) => setTimeout(r, 500));
      }
      clear();
      queryClient.invalidateQueries({ queryKey: ['presupuestos'] });
      showToast(sorted.length + ' presupuestos eliminados', 'success');
    });
  }, [showConfirm, showToast, queryClient, budgetsFlat, selectedIds, count, clear]);

  const handleView = useCallback((b: BudgetFlat) => {
    setDetailBudget(b);
  }, []);

  const allIds = useMemo(() => budgetsFlat.map((b) => b.id), [budgetsFlat]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><LoadingOverlay /></div>;

  return (
    <div className="flex-1 h-full bg-[#f0f2f5] overflow-y-auto p-7 flex flex-col">
      <div className="flex items-center gap-4 mb-5 shrink-0">
        <h1 className="text-[22px] font-black text-[#2a2a2a] tracking-wide m-0">Presupuestos</h1>
        <button
          onClick={onCreateNew}
          className="ml-auto bg-brand text-white border-none py-2.5 px-6 rounded-md cursor-pointer text-[15px] font-bold font-sans flex items-center gap-2 hover:bg-brand-hover transition-colors"
        >
          + Crear nuevo presupuesto
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-[10px] py-5 px-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full rounded-l-[10px] bg-brand" />
          <div className="text-[28px] font-black text-[#2a2a2a] leading-none">{budgetsFlat.length}</div>
          <div className="text-xs text-[#888] font-semibold uppercase tracking-wide mt-1.5">Presupuestos enviados</div>
        </div>
        <div className="bg-white rounded-[10px] py-5 px-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full rounded-l-[10px] bg-success" />
          <div className="text-[28px] font-black text-[#2a2a2a] leading-none">{formatPrice(totalMonto)}</div>
          <div className="text-xs text-[#888] font-semibold uppercase tracking-wide mt-1.5">Monto total presupuestado</div>
        </div>
        <div className="bg-white rounded-[10px] py-5 px-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full rounded-l-[10px] bg-warning" />
          <div className="text-[28px] font-black text-[#2a2a2a] leading-none">{formatPrice(promedio)}</div>
          <div className="text-xs text-[#888] font-semibold uppercase tracking-wide mt-1.5">Presupuesto promedio</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        {budgetsFlat.length === 0 ? (
          <div className="text-center py-15 px-5 text-[#999] text-[15px]">
            <div className="text-5xl mb-3 opacity-50">&#128196;</div>
            <div className="mb-5">No hay presupuestos generados todavia.<br />Crea tu primer presupuesto para verlo aqui.</div>
            <button
              onClick={onCreateNew}
              className="bg-brand text-white border-none py-2.5 px-6 rounded-md cursor-pointer text-[15px] font-bold font-sans hover:bg-brand-hover transition-colors"
            >
              + Crear nuevo presupuesto
            </button>
          </div>
        ) : (
          <PresupuestosTable
            budgets={budgetsFlat}
            selectedIds={selectedIds}
            onToggle={toggle}
            onToggleAll={() => toggleAll(allIds)}
            onView={handleView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={handleDelete}
          />
        )}
      </div>

      <BulkBar count={count} onDelete={handleBulkDelete} onClear={clear} />

      <PresupuestoDetailModal
        isOpen={detailBudget !== null}
        budget={detailBudget}
        onClose={() => setDetailBudget(null)}
        onEdit={(b) => { setDetailBudget(null); onEdit(b); }}
        onDuplicate={(b) => { setDetailBudget(null); onDuplicate(b); }}
      />
    </div>
  );
}
