import { useCallback, useContext, useMemo } from 'react';
import { useLeads } from '../../hooks/useLeads';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { exportStatsExcel } from '../../services/export.service';
import { useDateFilter, filterItemsByDate } from '../../hooks/useDateFilter';
import { ModalContext } from '../../contexts/ModalContext';
import PeriodFilter from '../common/PeriodFilter';
import StatsCards from './StatsCards';
import StatsCharts from './StatsCharts';
import LoadingOverlay from '../common/LoadingOverlay';

export default function EstadisticasPage() {
  const { data: leads = [], isLoading } = useLeads();
  const { stages = [] } = usePipelineStages();
  const { showToast } = useContext(ModalContext);

  const dateFilter = useDateFilter('este-mes');

  const filtered = useMemo(
    () => filterItemsByDate(leads, (l) => l.fecha, dateFilter.dateFrom, dateFilter.dateTo),
    [leads, dateFilter.dateFrom, dateFilter.dateTo]
  );

  const filteredPrev = useMemo(
    () => (dateFilter.prevFrom ? filterItemsByDate(leads, (l) => l.fecha, dateFilter.prevFrom, dateFilter.prevTo) : null),
    [leads, dateFilter.prevFrom, dateFilter.prevTo]
  );

  const ganados = useMemo(
    () => filtered.filter((l) => l.stage === 'Cerrado Ganado'),
    [filtered]
  );

  const handleExport = useCallback(() => {
    exportStatsExcel({ leads: filtered, stages });
    showToast('Reporte exportado', 'success');
  }, [filtered, stages, showToast]);

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingOverlay /></div>;

  return (
    <div className="flex-1 h-full overflow-y-auto p-7 flex flex-col bg-bg">
      <div className="flex justify-between items-center flex-wrap gap-2.5 mb-2.5">
        <h1 className="text-[24px] font-bold tracking-tight text-text m-0 leading-tight">Estadisticas</h1>
        <button
          onClick={handleExport}
          className="bg-brand text-white border-none py-2 px-[18px] rounded-md cursor-pointer text-[13px] font-bold font-sans transition-colors hover:bg-brand-hover flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z" fill="currentColor" />
            <path d="M14 14H2v-3H0v4a1 1 0 001 1h14a1 1 0 001-1v-4h-2v3z" fill="currentColor" />
          </svg>
          Exportar reporte
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

      <StatsCards leads={filtered} ganados={ganados} prevLeads={filteredPrev} />
      <StatsCharts leads={filtered} stages={stages} />
    </div>
  );
}
