import { useState, useCallback, useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Download, FileSpreadsheet } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { useVentas } from '../../hooks/useVentas';
import { useBulkSelect } from '../../hooks/useBulkSelect';
import { saveVenta, deleteVenta } from '../../services/ventas.service';
import { updateLeadField } from '../../services/leads.service';
import { exportVentasCSV, exportVentasExcel } from '../../services/export.service';
import { useDateFilter } from '../../hooks/useDateFilter';
import { selectSales, computeSalesMetrics, ventaKey as getVentaKey } from '../../lib/salesMetrics';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead, VentaStore } from '../../types';
import PeriodFilter from '../common/PeriodFilter';
import BulkBar from '../common/BulkBar';
import VentasMetrics from './VentasMetrics';
import VentasTable from './VentasTable';
import NuevaVentaModal from './NuevaVentaModal';
import EditVentaModal from './EditVentaModal';
import LoadingOverlay from '../common/LoadingOverlay';
import { Button } from '../ui/button';

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

  const filtered = useMemo(
    () => selectSales(leads, ventasMap, dateFilter.dateFrom, dateFilter.dateTo),
    [leads, ventasMap, dateFilter.dateFrom, dateFilter.dateTo]
  );

  const filteredPrev = useMemo(
    () => (dateFilter.prevFrom ? selectSales(leads, ventasMap, dateFilter.prevFrom, dateFilter.prevTo) : []),
    [leads, ventasMap, dateFilter.prevFrom, dateFilter.prevTo]
  );

  const metrics = useMemo(() => computeSalesMetrics(filtered, ventasMap), [filtered, ventasMap]);
  const prevMetrics = useMemo(
    () => (dateFilter.prevFrom ? computeSalesMetrics(filteredPrev, ventasMap) : null),
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
    <div className="flex-1 h-full overflow-y-auto p-8 flex flex-col bg-bg">
      <div className="flex items-center justify-between gap-3 mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-text m-0 leading-tight">Ventas</h1>
          <div className="text-[13px] text-text-muted mt-1">{filtered.length} ventas · {metrics.count > 0 ? `ticket promedio ${Math.round(metrics.ticketPromedio).toLocaleString('es-AR')}` : ''}</div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" size="md" onClick={handleExportCSV}>
            <Download size={14} strokeWidth={2} />
            CSV
          </Button>
          <Button variant="outline" size="md" onClick={handleExportExcel}>
            <FileSpreadsheet size={14} strokeWidth={2} />
            Excel
          </Button>
          <Button variant="success" size="md" onClick={() => setNuevaOpen(true)}>
            <Plus size={14} strokeWidth={2.2} />
            Nueva venta
          </Button>
        </div>
      </div>

      <div className="mb-5 shrink-0">
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
