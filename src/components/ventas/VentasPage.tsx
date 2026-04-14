import { useState, useCallback, useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLeads } from '../../hooks/useLeads';
import { useVentas } from '../../hooks/useVentas';
import { useBulkSelect } from '../../hooks/useBulkSelect';
import { saveVenta, deleteVenta } from '../../services/ventas.service';
import { updateLeadField } from '../../services/leads.service';
import { exportVentasCSV, exportVentasExcel } from '../../services/export.service';
import { parseGoogleDate } from '../../lib/dates';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead, VentaStore } from '../../types';
import DatePresetBar from '../common/DatePresetBar';
import BulkBar from '../common/BulkBar';
import VentasMetrics from './VentasMetrics';
import VentasTable from './VentasTable';
import NuevaVentaModal from './NuevaVentaModal';
import EditVentaModal from './EditVentaModal';
import LoadingOverlay from '../common/LoadingOverlay';

type Preset = 'all' | '7d' | '15d' | '30d' | '60d' | '90d' | 'custom';

function getVentaKey(lead: Lead): string {
  return (lead.nombre || '') + '|' + (lead.whatsapp || '');
}

export default function VentasPage() {
  const { data: leads = [] } = useLeads();
  const { ventasMap = {}, loading } = useVentas();
  const { showConfirm, showToast } = useContext(ModalContext);
  const queryClient = useQueryClient();
  const bulk = useBulkSelect<number>();

  const [activePreset, setActivePreset] = useState<Preset>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [nuevaOpen, setNuevaOpen] = useState(false);
  const [editKey, setEditKey] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const ganados = useMemo(
    () => leads.filter((l) => l.stage === 'Cerrado Ganado'),
    [leads]
  );

  const filtered = useMemo(() => {
    if (!dateFrom && !dateTo) return ganados;
    return ganados.filter((l) => {
      const d = parseGoogleDate(l.fecha);
      if (!d) return true;
      d.setHours(0, 0, 0, 0);
      if (dateFrom) {
        const from = new Date(dateFrom + 'T00:00:00');
        if (d < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo + 'T23:59:59');
        if (d > to) return false;
      }
      return true;
    });
  }, [ganados, dateFrom, dateTo]);

  const metrics = useMemo(() => {
    let totalMonto = 0;
    filtered.forEach((lead) => {
      const key = getVentaKey(lead);
      const vdata = ventasMap[key];
      if (vdata?.monto) totalMonto += vdata.monto;
    });
    const count = filtered.length;
    const ticketPromedio = count > 0 ? totalMonto / count : 0;
    return { totalMonto, count, ticketPromedio };
  }, [filtered, ventasMap]);

  const handlePreset = useCallback((preset: Preset) => {
    setActivePreset(preset);
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
      return;
    }
    const days = parseInt(preset);
    if (isNaN(days)) return;
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - days);
    const toStr = today.toISOString().slice(0, 10);
    const fromStr = from.toISOString().slice(0, 10);
    setDateFrom(fromStr);
    setDateTo(toStr);
  }, []);

  const handleCustomRange = useCallback((from: string, to: string) => {
    setActivePreset('custom');
    setDateFrom(from);
    setDateTo(to);
  }, []);

  const handleSaveField = useCallback(
    (key: string, field: keyof VentaStore, value: string | number) => {
      const current = ventasMap[key] || { monto: 0, formaPago: '', estadoEntrega: '', notas: '' };
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
    <div className="flex-1 h-full overflow-y-auto p-7 flex flex-col bg-[#f0f2f5]">
      <div className="flex items-center gap-3 mb-5 flex-shrink-0 flex-wrap">
        <h1 className="text-[22px] font-black text-[#2a2a2a] tracking-wide m-0">Ventas</h1>
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
        <DatePresetBar
          activePreset={activePreset}
          onPreset={handlePreset}
          onCustomRange={handleCustomRange}
        />
      </div>

      <VentasMetrics metrics={metrics} />

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
