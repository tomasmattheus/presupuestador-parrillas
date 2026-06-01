import { useCallback, useContext, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { useVentas } from '../../hooks/useVentas';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { exportStatsExcel } from '../../services/export.service';
import { useDateFilter, filterItemsByDate } from '../../hooks/useDateFilter';
import { ModalContext } from '../../contexts/ModalContext';
import PeriodFilter from '../common/PeriodFilter';
import HealthDashboard from './HealthDashboard';
import StatsCharts from './StatsCharts';
import LoadingOverlay from '../common/LoadingOverlay';
import { Button } from '../ui/button';

export default function EstadisticasPage() {
  const { data: leads = [], isLoading } = useLeads();
  const { ventasMap = {} } = useVentas();
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
    <div className="flex-1 h-full overflow-y-auto p-8 flex flex-col bg-bg">
      <div className="flex justify-between items-center gap-3 mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-text m-0 leading-tight">Estadísticas</h1>
          <div className="text-[13px] text-text-muted mt-1">{filtered.length} leads · {ganados.length} ganados en el período</div>
        </div>
        <Button onClick={handleExport} variant="outline" size="md">
          <Download size={14} strokeWidth={2} />
          Exportar reporte
        </Button>
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

      <HealthDashboard
        leadsAll={leads}
        leadsPeriod={filtered}
        leadsPrevPeriod={filteredPrev}
        ventasMap={ventasMap}
        dateFrom={dateFilter.dateFrom}
        dateTo={dateFilter.dateTo}
        prevFrom={dateFilter.prevFrom}
        prevTo={dateFilter.prevTo}
      />

      <StatsCharts leads={filtered} stages={stages} />
    </div>
  );
}
