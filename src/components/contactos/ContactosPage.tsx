import { useState, useContext, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLeads } from '../../hooks/useLeads';
import { useContactos } from '../../hooks/useContactos';
import { useBulkSelect } from '../../hooks/useBulkSelect';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { ModalContext } from '../../contexts/ModalContext';
import { updateLeadField, deleteLead } from '../../services/leads.service';
import { exportContactosExcel } from '../../services/export.service';
import { normalizeCiudad } from '../../lib/text';
import type { Lead } from '../../types';
import ContactosFilters from './ContactosFilters';
import ContactosTable from './ContactosTable';
import NuevoContactoModal from './NuevoContactoModal';
import EditContactModal from './EditContactModal';
import BulkBar from '../common/BulkBar';
import LoadingOverlay from '../common/LoadingOverlay';

export default function ContactosPage() {
  const { data: leads = [], isLoading, isFetching } = useLeads();
  const { stages } = usePipelineStages();
  const { showConfirm, showToast, openLeadModal } = useContext(ModalContext);
  const queryClient = useQueryClient();

  const {
    sortCol,
    sortDir,
    searchTerm,
    filters,
    filteredAndSortedLeads,
    sortBy,
    setSearchTerm,
    setFilters,
  } = useContactos(leads);

  const { selectedIds, toggle, toggleAll, clear, count } = useBulkSelect<number>();

  const [showNuevo, setShowNuevo] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  const ciudades = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.ciudad && l.ciudad.trim()) {
        const c = normalizeCiudad(l.ciudad);
        if (c) map[c] = (map[c] || 0) + 1;
      }
    });
    return Object.keys(map)
      .sort()
      .map((name) => ({ name, count: map[name] }));
  }, [leads]);

  const handleEstadoChange = useCallback(
    async (lead: Lead, newStage: string) => {
      try {
        await updateLeadField(lead.rowIndex, 4, newStage);
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      } catch {
        showToast('Error al actualizar estado', 'error');
      }
    },
    [queryClient, showToast]
  );

  const handleDelete = useCallback(
    (lead: Lead) => {
      showConfirm('Eliminar contacto', `Eliminar "${lead.nombre}"? Esta accion no se puede deshacer.`, () => {
        queryClient.setQueryData<Lead[]>(['leads'], (old) =>
          (old || []).filter((l) => l.rowIndex !== lead.rowIndex)
        );
        showToast('Contacto eliminado', 'success');
        deleteLead(lead.rowIndex)
          .then(() => queryClient.invalidateQueries({ queryKey: ['leads'] }))
          .catch(() => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            showToast('Error al eliminar', 'error');
          });
      });
    },
    [showConfirm, showToast, queryClient]
  );

  const handleBulkDelete = useCallback(() => {
    showConfirm('Eliminar contactos', `Eliminar ${count} contactos seleccionados?`, () => {
      const ids = Array.from(selectedIds);
      const idSet = new Set(ids);
      queryClient.setQueryData<Lead[]>(['leads'], (old) =>
        (old || []).filter((l) => !idSet.has(l.rowIndex))
      );
      clear();
      showToast(`${ids.length} contactos eliminados`, 'success');
      (async () => {
        for (const id of ids) await deleteLead(id);
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      })().catch(() => {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        showToast('Error al eliminar', 'error');
      });
    });
  }, [showConfirm, selectedIds, count, queryClient, clear, showToast]);

  const handleExport = useCallback(() => {
    exportContactosExcel(leads);
    showToast('Excel exportado', 'success');
  }, [leads, showToast]);

  if (isLoading || (isFetching && leads.length === 0)) return <div className="flex-1 flex items-center justify-center"><LoadingOverlay /></div>;

  return (
    <div className="flex flex-1 h-full bg-[#f0f2f5] overflow-hidden p-7 flex-col">
      <ContactosFilters
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        filters={filters}
        onFilterChange={setFilters}
        stages={stages}
        ciudades={ciudades}
      />
      <div className="flex items-center gap-3 mb-4 flex-shrink-0 flex-wrap justify-end -mt-2">
        <button
          className="bg-brand text-white border-none py-2 px-[18px] rounded-md cursor-pointer text-sm font-bold font-sans transition-colors duration-200 hover:bg-brand-hover"
          onClick={() => setShowNuevo(true)}
        >
          + Nuevo contacto
        </button>
        <button
          className="bg-[#10b981] text-white border-none py-2 px-[18px] rounded-md cursor-pointer text-sm font-bold font-sans transition-colors duration-200 hover:bg-[#059669]"
          onClick={handleExport}
        >
          Exportar Excel
        </button>
      </div>

      <ContactosTable
        leads={filteredAndSortedLeads}
        sortCol={sortCol}
        sortDir={sortDir}
        onSort={sortBy}
        selectedIds={selectedIds}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onOpenModal={openLeadModal}
        onEstadoChange={handleEstadoChange}
        onEdit={setEditLead}
        onDelete={handleDelete}
        stages={stages}
      />

      <BulkBar count={count} onDelete={handleBulkDelete} onClear={clear} />

      <NuevoContactoModal isOpen={showNuevo} onClose={() => setShowNuevo(false)} />
      <EditContactModal isOpen={!!editLead} onClose={() => setEditLead(null)} lead={editLead} />
    </div>
  );
}
