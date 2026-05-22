import { useState, useCallback, useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLeads } from '../../hooks/useLeads';
import { useVentas } from '../../hooks/useVentas';
import { useBulkSelect } from '../../hooks/useBulkSelect';
import { saveVenta, deleteVenta } from '../../services/ventas.service';
import { updateLeadField } from '../../services/leads.service';
import { exportVentasCSV, exportVentasExcel } from '../../services/export.service';
import { useDateFilter, filterItemsByDate } from '../../hooks/useDateFilter';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead, VentaStore } from '../../types';
import PeriodFilter from '../common/PeriodFilter';
import BulkBar from '../common/BulkBar';
import VentasMetrics from './VentasMetrics';
import VentasTable from './VentasTable';
import NuevaVentaModal from './NuevaVentaModal';
import EditVentaModal from './EditVentaModal';
import LoadingOverlay from '../common/LoadingOverlay';

function getVentaKey(lead: Lead): string {
  return (lead.nombre || '') + '|' + (lead.whatsapp || '');
}

function computeMetrics(leads: Lead[], ventasMap: Record<string, VentaStore>) {
  let totalMonto = 0;
  leads.forEach((lead) => {
    const key = getVentaKey(lead);
    const vdata = ventasMap[key];
    if (vdata?.monto) totalMonto += vdata.monto;
  });
  const count = leads.length;
  const ticketPromedio = count > 0 ? totalMonto / count : 0;
  return { totalMonto, count, ticketPromedio };
}

export default function VentasPage() {
  const { data: leads = [] } = useLeads();
  const { ventasMap = {}, loading } = useVentas();
  const { showConfirm, showToast } = useContext(ModalContext);
  const queryClient = useQueryClient();
  const bulk = useBulkSelect<number>();

  const dateFilter = useDateFilter('este-mes');
  const [nuevaOpen, setNuevaOpen] = useState(false);
  const [editKey, setEditKey] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const ganados = useMemo(
    () => leads.filter((l) => l.stage === 'Cerrado Ganado'),
    [leads]
  );

  const getVentaFecha = useCallback(
    (l: Lead) => ventasMap[getVentaKey(l)]?.fechaCierre || l.fecha,
    [ventasMap]
  );

  const filtered = useMemo(
    () => filterItemsByDate(ganados, getVentaFecha, dateFilter.dateFrom, dateFilter.dateTo),
    [ganados, getVentaFecha, dateFilter.dateFrom, dateFilter.dateTo]
  );

  const filteredPrev = useMemo(
    () => filterItemsByDate(ganados, getVentaFecha, dateFilter.prevFrom, dateFilter.prevTo),
    [ganados, getVentaFecha, dateFilter.prevFrom, dateFilter.prevTo]
  );

  const metrics = useMemo(() => computeMetrics(filtered, ventasMap), [filtered, ventasMap]);
  const prevMetrics = useMemo(
    () => (dateFilter.prevFrom ? computeMetrics(filteredPrev, ventasMap) : null),
    [filteredPrev, ventasMap, dateFilter.prevFrom]
  );

  const handleSaveField = useCallback(
    (key: string, field: keyof VentaStore, value: string | number) => {
      const current = ventasMap[key] || { monto: 0, formaPago: '', estadoEntrega: '', notas: '', fechaCierre: '', fechaEntrega: '' };
      const updated = { ...current, [field]: value };
      saveVenta(key, updated);
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
    [ventasMap, queryClient]
  );

  const handleEdit = useCallback((key: string) => {
    setEditKey(key);
    setEditOpen(true);
  }, []);

  const handleDelete = useCallback(
    (lead: Lead) => {
      showConfirm(
        'Eliminar venta',
        'Eliminar la venta de "' + lead.nombre + '"? El lead volvera a Nuevo Lead.',
        () => {
          queryClient.setQueryData<Lead[]>(['leads'], (old) => {
            const updated = (old || []).map((l) => l.rowIndex === lead.rowIndex ? { ...l, stage: 'Nuevo Lead', estado: 'Nuevo Lead' } : l);
            try { localStorage.setItem('qd_cache_leads', JSON.stringify(updated)); } catch {}
            return updated;
          });
          showToast('Venta eliminada', 'success');
          const key = getVentaKey(lead);
          const vdata = ventasMap[key];
          const ops = [updateLeadField(lead.rowIndex, 4, 'Nuevo Lead')];
          if (vdata && typeof vdata._rowIndex === 'number') ops.push(deleteVenta(vdata._rowIndex));
          Promise.all(ops)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['leads'] });
              queryClient.invalidateQueries({ queryKey: ['ventas'] });
            })
            .catch(() => {
              queryClient.invalidateQueries({ queryKey: ['leads'] });
              queryClient.invalidateQueries({ queryKey: ['ventas'] });
              showToast('Error al eliminar venta', 'error');
            });
        }
      );
    },
    [ventasMap, queryClient, showConfirm, showToast]
  );

  const handleBulkDelete = useCallback(() => {
    showConfirm(
      'Eliminar ventas',
      'Eliminar ' + bulk.count + ' ventas seleccionadas?',
      () => {
        const ids = Array.from(bulk.selectedIds);
        queryClient.setQueryData<Lead[]>(['leads'], (old) => {
          const updated = (old || []).map((l) => ids.includes(l.rowIndex) ? { ...l, stage: 'Nuevo Lead', estado: 'Nuevo Lead' } : l);
          try { localStorage.setItem('qd_cache_leads', JSON.stringify(updated)); } catch {}
          return updated;
        });
        bulk.clear();
        showToast(ids.length + ' ventas eliminadas', 'success');
        (async () => {
          for (const rowIndex of ids) {
            await updateLeadField(rowIndex, 4, 'Nuevo Lead');
          }
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          queryClient.invalidateQueries({ queryKey: ['ventas'] });
        })().catch(() => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          queryClient.invalidateQueries({ queryKey: ['ventas'] });
          showToast('Error al eliminar ventas', 'error');
        });
      }
    );
  }, [bulk, leads, queryClient, showConfirm, showToast]);

  const handleExportCSV = useCallback(() => {
    exportVentasCSV({ ganados: filtered, ventasStore: ventasMap });
    showToast('CSV exportado', 'success');
  }, [filtered, ventasMap, showToast]);

  const handleExportExcel = useCallback(() => {
    exportVentasExcel({ ganados: filtered, ventasStore: ventasMap });
    showToast('Excel exportado', 'success');
  }, [filtered, ventasMap, showToast]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><LoadingOverlay /></div>;

  return (
    <div className="flex-1 h-full overflow-y-auto p-7 flex flex-col bg-bg">
      <div className="flex items-center gap-3 mb-5 flex-shrink-0 flex-wrap">
        <h1 className="text-[24px] font-bold tracking-tight text-text m-0 leading-tight">Ventas</h1>
        <button
          onClick={() => setNuevaOpen(true)}
          className="bg-success text-white border-none py-2 px-[18px] rounded-md cursor-pointer text-sm font-bold font-sans transition-colors hover:bg-[#059669]"
        >
          + Nueva venta
        </button>
        <button
          onClick={handleExportCSV}
          className="bg-success text-white border-none py-2 px-[18px] rounded-md cursor-pointer text-[13px] font-bold font-sans transition-colors hover:bg-[#059669] flex items-center gap-1.5 ml-auto"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z" fill="currentColor" />
            <path d="M14 14H2v-3H0v4a1 1 0 001 1h14a1 1 0 001-1v-4h-2v3z" fill="currentColor" />
          </svg>
          Exportar CSV
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-brand text-white border-none py-2 px-[18px] rounded-md cursor-pointer text-[13px] font-bold font-sans transition-colors hover:bg-brand-hover flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z" fill="currentColor" />
            <path d="M14 14H2v-3H0v4a1 1 0 001 1h14a1 1 0 001-1v-4h-2v3z" fill="currentColor" />
          </svg>
          Exportar Excel
        </button>
      </div>

      <div className="mb-3.5 flex-shrink-0">
        <PeriodFilter
          activePreset={dateFilter.activePreset}
          onPreset={dateFilter.setPreset}
          onCustomRange={dateFilter.setCustomRange}
          dateFrom={dateFilter.dateFrom}
          dateTo={dateFilter.dateTo}
        />
      </div>

      <VentasMetrics metrics={metrics} prev={prevMetrics} />

      <VentasTable
        ganados={filtered}
        ventasStore={ventasMap}
        selectedIds={bulk.selectedIds}
        onToggle={bulk.toggle}
        onToggleAll={bulk.toggleAll}
        onOpenModal={() => {}}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSaveField={handleSaveField}
      />

      <BulkBar
        count={bulk.count}
        onDelete={handleBulkDelete}
        onClear={bulk.clear}
      />

      <NuevaVentaModal
        isOpen={nuevaOpen}
        onClose={() => setNuevaOpen(false)}
      />

      <EditVentaModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        ventaKey={editKey}
        ventaData={ventasMap[editKey] || null}
      />
    </div>
  );
}
