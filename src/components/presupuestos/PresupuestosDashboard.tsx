import { useContext, useCallback, useMemo, useState } from 'react';
import type { BudgetFlat } from '../../types';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { useLeads } from '../../hooks/useLeads';
import { useBulkSelect } from '../../hooks/useBulkSelect';
import { useDateFilter, filterItemsByDate } from '../../hooks/useDateFilter';
import { deleteBudget } from '../../services/presupuestos.service';
import { formatPrice } from '../../lib/formatters';
import { ModalContext } from '../../contexts/ModalContext';
import { useQueryClient } from '@tanstack/react-query';
import PresupuestosTable from './PresupuestosTable';
import PresupuestoDetailModal from './PresupuestoDetailModal';
import PeriodFilter from '../common/PeriodFilter';
import BulkBar from '../common/BulkBar';
import LoadingOverlay from '../common/LoadingOverlay';
import { MetricCard } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Users, DollarSign, TrendingUp, FileText } from 'lucide-react';

interface Props {
  onCreateNew: () => void;
  onEdit: (b: BudgetFlat) => void;
  onDuplicate: (b: BudgetFlat) => void;
}

export default function PresupuestosDashboard({ onCreateNew, onEdit, onDuplicate }: Props) {
  const { budgetsFlat, loading, fetching } = usePresupuestos();
  const { data: leads = [] } = useLeads();
  const dateFilter = useDateFilter('este-mes');
  const { selectedIds, toggle, toggleAll, clear, count } = useBulkSelect<string>();
  const { showConfirm, showToast, openLeadModal } = useContext(ModalContext);
  const queryClient = useQueryClient();
  const [detailBudget, setDetailBudget] = useState<BudgetFlat | null>(null);

  const handleClientClick = useCallback((b: BudgetFlat) => {
    const bName = (b.cliente || '').trim().toLowerCase();
    const bPhone = String(b.telefono || '').replace(/\D/g, '').slice(-10);
    const match = leads.find((l) => {
      const lName = (l.nombre || '').trim().toLowerCase();
      const lPhone = String(l.whatsapp || '').replace(/\D/g, '').slice(-10);
      if (lName && bName && lName === bName) return true;
      if (lPhone && bPhone && lPhone === bPhone) return true;
      return false;
    });
    if (match) openLeadModal(match);
    else showToast('No se encontró el contacto', 'error');
  }, [leads, openLeadModal, showToast]);

  const filteredBudgets = useMemo(() =>
    filterItemsByDate(budgetsFlat, (b) => b.fecha, dateFilter.dateFrom, dateFilter.dateTo),
    [budgetsFlat, dateFilter.dateFrom, dateFilter.dateTo]
  );

  const filteredBudgetsPrev = useMemo(() =>
    dateFilter.prevFrom ? filterItemsByDate(budgetsFlat, (b) => b.fecha, dateFilter.prevFrom, dateFilter.prevTo) : null,
    [budgetsFlat, dateFilter.prevFrom, dateFilter.prevTo]
  );

  const computeBudgetMetrics = (budgets: BudgetFlat[]) => {
    const byClient = new Map<string, BudgetFlat>();
    budgets.forEach((b) => {
      const key = b.cliente.toLowerCase().trim() + '|' + String(b.telefono || '').replace(/\D/g, '').slice(-10);
      const existing = byClient.get(key);
      if (!existing || parseInt(b.nro) > parseInt(existing.nro)) {
        byClient.set(key, b);
      }
    });
    const clients = byClient.size;
    let total = 0;
    byClient.forEach((b) => { total += b.total; });
    return {
      uniqueClients: clients,
      latestTotal: total,
      avgPerClient: clients > 0 ? Math.round(total / clients) : 0,
      pdfCount: budgets.length,
    };
  };

  const { uniqueClients, latestTotal, avgPerClient } = useMemo(
    () => computeBudgetMetrics(filteredBudgets),
    [filteredBudgets]
  );

  const prevMetrics = useMemo(
    () => filteredBudgetsPrev ? computeBudgetMetrics(filteredBudgetsPrev) : null,
    [filteredBudgetsPrev]
  );

  const deltaPct = (current: number, previous: number): { pct: number; sign: 'up' | 'down' | 'flat' } | null => {
    if (previous === 0) return current === 0 ? { pct: 0, sign: 'flat' } : null;
    const pct = Math.round(((current - previous) / previous) * 100);
    if (Math.abs(pct) > 500) return null;
    if (pct === 0) return { pct: 0, sign: 'flat' };
    return { pct, sign: pct > 0 ? 'up' : 'down' };
  };

  const handleDelete = useCallback((b: BudgetFlat) => {
    showConfirm('Eliminar presupuesto', 'Eliminar presupuesto #' + b.nro + '?', () => {
      queryClient.setQueryData(['presupuestos'], (old: any[][] | undefined) => {
        const updated = (old || []).filter((_: any, i: number) => i + 2 !== b._rowIndex);
        try { localStorage.setItem('qd_cache_presupuestos', JSON.stringify(updated)); } catch {}
        return updated;
      });
      showToast('Presupuesto eliminado', 'success');
      deleteBudget(b._rowIndex).then(() => {
        setTimeout(() => queryClient.invalidateQueries({ queryKey: ['presupuestos'] }), 2000);
      });
    });
  }, [showConfirm, showToast, queryClient]);

  const handleBulkDelete = useCallback(() => {
    showConfirm('Eliminar seleccionados', 'Eliminar ' + count + ' presupuestos?', () => {
      const toDelete = budgetsFlat.filter((b) => selectedIds.has(b.id));
      const sorted = [...toDelete].sort((a, b) => b._rowIndex - a._rowIndex);
      const rowSet = new Set(sorted.map((b) => b._rowIndex));
      queryClient.setQueryData(['presupuestos'], (old: any[][] | undefined) => {
        const updated = (old || []).filter((_: any, i: number) => !rowSet.has(i + 2));
        try { localStorage.setItem('qd_cache_presupuestos', JSON.stringify(updated)); } catch {}
        return updated;
      });
      clear();
      showToast(sorted.length + ' presupuestos eliminados', 'success');
      let delay = 0;
      for (const b of sorted) {
        setTimeout(() => deleteBudget(b._rowIndex), delay);
        delay += 1500;
      }
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['presupuestos'] }), delay + 3000);
    });
  }, [showConfirm, showToast, queryClient, budgetsFlat, selectedIds, count, clear]);

  const handleView = useCallback((b: BudgetFlat) => {
    setDetailBudget(b);
  }, []);

  const allIds = useMemo(() => filteredBudgets.map((b) => b.id), [filteredBudgets]);

  const showLoading = loading || (fetching && budgetsFlat.length === 0);
  if (showLoading) return <div className="flex-1 flex items-center justify-center"><LoadingOverlay /></div>;

  return (
    <div className="flex-1 h-full bg-bg overflow-y-auto p-8 flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-text m-0 leading-tight">Presupuestos</h1>
          <div className="text-[13px] text-text-muted mt-1">{uniqueClients} clientes · {filteredBudgets.length} PDFs generados</div>
        </div>
        <Button onClick={onCreateNew} size="lg">
          <Plus size={16} strokeWidth={2.2} />
          Crear nuevo presupuesto
        </Button>
      </div>

      <div className="mb-4 shrink-0">
        <PeriodFilter
          activePreset={dateFilter.activePreset}
          onPreset={dateFilter.setPreset}
          onCustomRange={dateFilter.setCustomRange}
          dateFrom={dateFilter.dateFrom}
          dateTo={dateFilter.dateTo}
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {([
          { label: 'Clientes presupuestados', value: String(uniqueClients), key: 'uniqueClients' as const, accent: '#0ea5e9', icon: <Users size={14} strokeWidth={2} /> },
          { label: 'Monto último por cliente', value: formatPrice(latestTotal), key: 'latestTotal' as const, accent: '#10b981', icon: <DollarSign size={14} strokeWidth={2} /> },
          { label: 'Promedio por cliente', value: formatPrice(avgPerClient), key: 'avgPerClient' as const, accent: '#f59e0b', icon: <TrendingUp size={14} strokeWidth={2} /> },
          { label: 'PDFs generados', value: String(filteredBudgets.length), key: 'pdfCount' as const, accent: '#8b5cf6', icon: <FileText size={14} strokeWidth={2} /> },
        ] as const).map((card) => {
          const currentNum = card.key === 'uniqueClients' ? uniqueClients
            : card.key === 'latestTotal' ? latestTotal
            : card.key === 'avgPerClient' ? avgPerClient
            : filteredBudgets.length;
          const d = prevMetrics ? deltaPct(currentNum, prevMetrics[card.key]) : null;
          const delta = d ? { value: Math.abs(d.pct) + '%', sign: d.sign } : null;
          return (
            <MetricCard key={card.label} label={card.label} value={card.value} accent={card.accent} icon={card.icon} delta={delta} />
          );
        })}
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        {filteredBudgets.length === 0 ? (
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
            budgets={filteredBudgets}
            selectedIds={selectedIds}
            onToggle={toggle}
            onToggleAll={() => toggleAll(allIds)}
            onView={handleView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={handleDelete}
            onClientClick={handleClientClick}
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
