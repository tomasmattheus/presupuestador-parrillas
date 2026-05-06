import { useCallback, useContext, useMemo, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLeads } from '../../hooks/useLeads';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { usePipelineDragDrop } from '../../hooks/usePipelineDragDrop';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { updateLeadField, deleteLead } from '../../services/leads.service';
import { saveVenta } from '../../services/ventas.service';
import { recordStageEntry, initStageTimestamps, getDaysInStage } from '../../lib/stageTimer';
import { sendPurchaseEvent } from '../../services/meta-capi';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead } from '../../types';
import KanbanBoard from './KanbanBoard';
import CerradosSection from './CerradosSection';
import StaleLeadsPanel from './StaleLeadsPanel';
import LoadingOverlay from '../common/LoadingOverlay';

const STAGE_COL = 4;

export default function PipelinePage() {
  const { data: leads = [], isFetching, isLoading } = useLeads();
  const { budgetsFlat } = usePresupuestos();
  const { getActiveStages } = usePipelineStages();
  const { refreshAll } = useDataRefresh();
  const [hideArchived, setHideArchived] = useState(true);
  const { showConfirm, openLeadModal, showToast } = useContext(ModalContext);
  const queryClient = useQueryClient();

  const activeStages = useMemo(() => getActiveStages(), [getActiveStages]);

  useEffect(() => {
    if (leads.length > 0) initStageTimestamps(leads);
  }, [leads]);

  const updateStageOptimistic = useCallback(
    (lead: Lead, newStage: string) => {
      recordStageEntry(lead.rowIndex, newStage);

      queryClient.setQueryData<Lead[]>(['leads'], (old) => {
        const updated = (old || []).map((l) =>
          l.rowIndex === lead.rowIndex
            ? { ...l, stage: newStage, estado: newStage }
            : l
        );
        try { localStorage.setItem('qd_cache_leads', JSON.stringify(updated)); } catch {}
        return updated;
      });

      showToast('Procesando...', 'info');

      updateLeadField(lead.rowIndex, STAGE_COL, newStage)
        .then(() => {
          showToast(`Actualizado: ${lead.nombre} → ${newStage}`, 'success');
          setTimeout(() => queryClient.invalidateQueries({ queryKey: ['leads'] }), 2000);
        })
        .catch(() => {
          queryClient.setQueryData<Lead[]>(['leads'], (old) => {
            const reverted = (old || []).map((l) =>
              l.rowIndex === lead.rowIndex
                ? { ...l, stage: lead.stage, estado: lead.estado }
                : l
            );
            try { localStorage.setItem('qd_cache_leads', JSON.stringify(reverted)); } catch {}
            return reverted;
          });
          showToast('Error al actualizar', 'error');
        });
    },
    [queryClient, showToast]
  );

  const handleStageDrop = useCallback(
    (lead: Lead, newStage: string) => {
      if (lead.stage !== newStage) {
        updateStageOptimistic(lead, newStage);
      }
    },
    [updateStageOptimistic]
  );

  const { onDragStart, onDrop } = usePipelineDragDrop(handleStageDrop);

  const handleMarkWon = useCallback(
    (lead: Lead) => {
      updateStageOptimistic(lead, 'Cerrado Ganado');

      /* AUTO-ACTION 3: Auto-fill venta from latest budget */
      const leadName = (lead.nombre || '').trim().toLowerCase();
      const latestBudget = budgetsFlat.find(
        (b) => b.cliente.trim().toLowerCase() === leadName
      );
      if (latestBudget && latestBudget.total > 0) {
        const ventaKey = (lead.nombre || '') + '|' + (lead.whatsapp || '');
        saveVenta(ventaKey, {
          monto: latestBudget.total,
          formaPago: '',
          estadoEntrega: 'Pendiente fabricacion',
          notas: '',
        })
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['ventas'] });
            showToast('Venta registrada automaticamente', 'success');
          })
          .catch(() => { /* silent */ });

        sendPurchaseEvent({
          phone: String(lead.whatsapp || ''),
          value: latestBudget.total,
          clientName: lead.nombre,
        });
      } else {
        sendPurchaseEvent({
          phone: String(lead.whatsapp || ''),
          clientName: lead.nombre,
        });
      }
    },
    [updateStageOptimistic, budgetsFlat, queryClient, showToast]
  );

  const handleMarkLost = useCallback(
    (lead: Lead) => updateStageOptimistic(lead, 'Cerrado Perdido'),
    [updateStageOptimistic]
  );

  const handleDelete = useCallback(
    (lead: Lead) => {
      showConfirm(
        `Eliminar "${lead.nombre}" del pipeline?`,
        'Esta accion no se puede deshacer.',
        () => {
          queryClient.setQueryData<Lead[]>(['leads'], (old) =>
            (old || []).filter((l) => l.rowIndex !== lead.rowIndex)
          );
          deleteLead(lead.rowIndex)
            .then(() => showToast('Lead eliminado', 'success'))
            .catch(() => {
              refreshAll();
              showToast('Error al eliminar', 'error');
            });
        }
      );
    },
    [showConfirm, queryClient, showToast, refreshAll]
  );

  const handleUndoStage = useCallback(
    (lead: Lead) => updateStageOptimistic(lead, 'Nuevo Lead'),
    [updateStageOptimistic]
  );

  const filteredLeads = useMemo(() => {
    if (!hideArchived) return leads;
    return leads.filter((l) => {
      if (l.stage === 'Cerrado Ganado' || l.stage === 'Cerrado Perdido') return true;
      return getDaysInStage(l.rowIndex, l.stage) < 60;
    });
  }, [leads, hideArchived]);

  const archivedCount = useMemo(() => {
    return leads.filter((l) =>
      l.stage !== 'Cerrado Ganado' && l.stage !== 'Cerrado Perdido' && getDaysInStage(l.rowIndex, l.stage) >= 60
    ).length;
  }, [leads]);

  if (isLoading || (isFetching && leads.length === 0)) return <div className="flex-1 flex items-center justify-center"><LoadingOverlay /></div>;

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex flex-col flex-1 h-full bg-[#f0f2f5] overflow-x-auto overflow-y-auto p-7">
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <h1 className="text-[22px] font-black text-[#2a2a2a] tracking-wide m-0">
            Pipeline CRM
          </h1>
          <button
            onClick={refreshAll}
            disabled={isFetching}
            className={`bg-[#1DA1F2] text-white border-none px-4 py-2 rounded-md text-[13px] font-semibold font-[inherit] flex items-center gap-1.5 cursor-pointer transition-colors duration-200 hover:bg-[#0d8de0] ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}
          >
            &#8635; Refrescar
          </button>
          <span className="text-[13px] text-[#888] ml-auto">
            {filteredLeads.length} de {leads.length} leads
          </span>
        </div>

        {archivedCount > 0 && (
          <div className="flex items-center gap-3 mb-4 shrink-0 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs text-[#888] cursor-pointer ml-auto">
              <input type="checkbox" checked={hideArchived} onChange={() => setHideArchived(!hideArchived)} className="accent-brand" />
              Ocultar archivados ({archivedCount})
            </label>
          </div>
        )}

        <KanbanBoard
          stages={activeStages}
          leads={filteredLeads}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onOpenModal={openLeadModal}
          onMarkWon={handleMarkWon}
          onMarkLost={handleMarkLost}
          onDelete={handleDelete}
        />

        <CerradosSection leads={leads} onUndoStage={handleUndoStage} />
      </div>

      <StaleLeadsPanel leads={leads} />
    </div>
  );
}
