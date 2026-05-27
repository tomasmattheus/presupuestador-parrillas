import { useCallback, useContext, useMemo, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLeads } from '../../hooks/useLeads';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { usePipelineDragDrop } from '../../hooks/usePipelineDragDrop';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { usePipelineFilters } from '../../hooks/usePipelineFilters';
import { updateLeadField, deleteLead } from '../../services/leads.service';
import { recordStageEntry, initStageTimestamps, getDaysInStage } from '../../lib/stageTimer';
import { sendPurchaseEvent } from '../../services/meta-capi';
import { ModalContext } from '../../contexts/ModalContext';
import type { Lead } from '../../types';
import KanbanBoard from './KanbanBoard';
import CerradosSection from './CerradosSection';
import StaleLeadsPanel from './StaleLeadsPanel';
import PipelineFilters from './PipelineFilters';
import LoadingOverlay from '../common/LoadingOverlay';
import NuevaVentaModal from '../ventas/NuevaVentaModal';

const STAGE_COL = 4;

export default function PipelinePage() {
  const { data: leads = [], isFetching, isLoading } = useLeads();
  const { budgetsFlat } = usePresupuestos();
  const { getActiveStages } = usePipelineStages();
  const { refreshAll } = useDataRefresh();
  const [hideArchived, setHideArchived] = useState(true);
  const [wonModalOpen, setWonModalOpen] = useState(false);
  const [wonPrefill, setWonPrefill] = useState<{ lead: Lead | null; monto: number }>({ lead: null, monto: 0 });
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

      const leadName = (lead.nombre || '').trim().toLowerCase();
      const latestBudget = budgetsFlat.find(
        (b) => b.cliente.trim().toLowerCase() === leadName
      );
      const prefillMonto = latestBudget && latestBudget.total > 0 ? latestBudget.total : 0;

      setWonPrefill({ lead, monto: prefillMonto });
      setWonModalOpen(true);

      sendPurchaseEvent({
        phone: String(lead.whatsapp || ''),
        value: prefillMonto || undefined,
        clientName: lead.nombre,
      });
    },
    [updateStageOptimistic, budgetsFlat]
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

  const archiveFilteredLeads = useMemo(() => {
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

  const {
    filters,
    filteredLeads,
    hasActiveFilters,
    update: updateFilter,
    reset: resetFilters,
  } = usePipelineFilters(archiveFilteredLeads);

  if (isLoading || (isFetching && leads.length === 0)) return <div className="flex-1 flex items-center justify-center"><LoadingOverlay /></div>;

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex flex-col flex-1 h-full bg-bg overflow-x-auto overflow-y-auto p-8">
        <div className="flex items-center justify-between gap-3 mb-5 shrink-0">
          <h1 className="text-[24px] font-bold tracking-tight text-text m-0 leading-tight">Pipeline</h1>
          {archivedCount > 0 && (
            <label className="flex items-center gap-2 text-[12px] text-text-muted cursor-pointer">
              <input type="checkbox" checked={hideArchived} onChange={() => setHideArchived(!hideArchived)} className="accent-brand" />
              Ocultar archivados ({archivedCount})
            </label>
          )}
        </div>

        <PipelineFilters
          leads={archiveFilteredLeads}
          filters={filters}
          update={updateFilter}
          reset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          totalShown={filteredLeads.length}
          totalAll={leads.length}
        />

        <KanbanBoard
          stages={activeStages}
          leads={filteredLeads}
          searchTerm={filters.search}
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

      <NuevaVentaModal
        isOpen={wonModalOpen}
        onClose={() => setWonModalOpen(false)}
        initialLead={wonPrefill.lead}
        initialMonto={wonPrefill.monto}
      />
    </div>
  );
}
