import { useState, useMemo, useCallback, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLeads } from '../../hooks/useLeads';
import { useVentas } from '../../hooks/useVentas';
import { saveVenta } from '../../services/ventas.service';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead, VentaStore } from '../../types';
import { isRealSale, ventaKey } from '../../lib/salesMetrics';
import ProduccionBoard from './ProduccionBoard';
import LoadingOverlay from '../common/LoadingOverlay';

const ALL_STAGES = ['Pendiente fabricacion', 'En fabricacion', 'Listo para entregar', 'Entregado e instalado'];

export default function ProduccionPage() {
  const { data: leads = [], isLoading } = useLeads();
  const { ventasMap = {} } = useVentas();
  const { showToast } = useContext(ModalContext);
  const queryClient = useQueryClient();
  const [showEntregados, setShowEntregados] = useState(false);

  const ganados = useMemo(
    () => leads.filter((l) => isRealSale(l, ventasMap)),
    [leads, ventasMap]
  );

  const groupedLeads = useMemo(() => {
    const groups: Record<string, Lead[]> = {};
    ALL_STAGES.forEach((s) => { groups[s] = []; });
    ganados.forEach((lead) => {
      const estado = ventasMap[ventaKey(lead)]?.estadoEntrega || 'Pendiente fabricacion';
      const target = ALL_STAGES.includes(estado) ? estado : 'Pendiente fabricacion';
      groups[target].push(lead);
    });
    return groups;
  }, [ganados, ventasMap]);

  const totals = useMemo(() => ({
    pendientes: groupedLeads['Pendiente fabricacion'].length,
    enFabricacion: groupedLeads['En fabricacion'].length,
    listos: groupedLeads['Listo para entregar'].length,
    entregados: groupedLeads['Entregado e instalado'].length,
  }), [groupedLeads]);

  const handleMove = useCallback((lead: Lead, newEstado: string) => {
    const key = ventaKey(lead);
    const current: VentaStore = ventasMap[key] || {
      monto: 0,
      formaPago: '',
      estadoEntrega: '',
      notas: '',
      fechaCierre: '',
      fechaEntrega: '',
    };
    const updated: VentaStore = { ...current, estadoEntrega: newEstado };

    queryClient.setQueryData<any[][]>(['ventas'], (old) => {
      if (!old) return old;
      const idx = current._rowIndex;
      if (typeof idx !== 'number') return old;
      return old.map((row, i) => {
        if (i === idx) {
          const newRow = [...row];
          newRow[4] = newEstado;
          return newRow;
        }
        return row;
      });
    });

    showToast(`${lead.nombre} → ${newEstado}`, 'info');
    saveVenta(key, updated)
      .then(() => {
        setTimeout(() => queryClient.invalidateQueries({ queryKey: ['ventas'] }), 2000);
      })
      .catch(() => showToast('Error al mover', 'error'));
  }, [ventasMap, queryClient, showToast]);

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingOverlay /></div>;

  const visibleStages = showEntregados ? ALL_STAGES : ALL_STAGES.slice(0, 3);

  return (
    <div className="flex flex-col flex-1 h-full bg-bg p-7 overflow-hidden">
      <div className="flex items-center gap-3 mb-4 shrink-0 flex-wrap">
        <h1 className="text-[24px] font-bold tracking-tight text-text m-0 leading-tight">Producción</h1>
        <div className="flex items-center gap-4 text-[12px] text-[#666] ml-2">
          <span><strong className="text-[#f59e0b]">{totals.pendientes}</strong> pendientes</span>
          <span><strong className="text-[#1DA1F2]">{totals.enFabricacion}</strong> en fabricación</span>
          <span><strong className="text-[#8b5cf6]">{totals.listos}</strong> listos</span>
          <span><strong className="text-[#10b981]">{totals.entregados}</strong> entregados</span>
        </div>
        <label className="ml-auto flex items-center gap-1.5 text-xs text-[#888] cursor-pointer">
          <input
            type="checkbox"
            checked={showEntregados}
            onChange={() => setShowEntregados(!showEntregados)}
            className="accent-brand"
          />
          Mostrar entregados
        </label>
      </div>

      <ProduccionBoard
        stages={visibleStages}
        groupedLeads={groupedLeads}
        ventasMap={ventasMap}
        onMove={handleMove}
      />
    </div>
  );
}
