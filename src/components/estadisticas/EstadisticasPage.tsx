import { useState, useCallback, useContext, useMemo } from 'react';
import { useLeads } from '../../hooks/useLeads';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import { exportStatsExcel } from '../../services/export.service';
import { parseGoogleDate } from '../../lib/dates';
import { ModalContext } from '../../contexts/ModalContext';
import DatePresetBar from '../common/DatePresetBar';
import StatsCards from './StatsCards';
import StatsCharts from './StatsCharts';
import LoadingOverlay from '../common/LoadingOverlay';

type Preset = 'all' | '7d' | '15d' | '30d' | '60d' | '90d' | 'custom';

export default function EstadisticasPage() {
  const { data: leads = [], isLoading } = useLeads();
  const { stages = [] } = usePipelineStages();
  const { showToast } = useContext(ModalContext);

  const [activePreset, setActivePreset] = useState<Preset>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    if (!dateFrom && !dateTo) return leads;
    return leads.filter((l) => {
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
  }, [leads, dateFrom, dateTo]);

  const ganados = useMemo(
    () => filtered.filter((l) => l.stage === 'Cerrado Ganado'),
    [filtered]
  );

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
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(today.toISOString().slice(0, 10));
  }, []);

  const handleCustomRange = useCallback((from: string, to: string) => {
    setActivePreset('custom');
    setDateFrom(from);
    setDateTo(to);
  }, []);

  const handleExport = useCallback(() => {
    exportStatsExcel({ leads: filtered, stages });
    showToast('Reporte exportado', 'success');
  }, [filtered, stages, showToast]);

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingOverlay /></div>;

  return (
    <div className="flex-1 h-full overflow-y-auto p-7 flex flex-col bg-[#f0f2f5]">
      <div className="flex justify-between items-center flex-wrap gap-2.5 mb-2.5">
        <h1 className="text-[22px] font-black text-[#2a2a2a] tracking-wide m-0">Estadisticas</h1>
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
        <DatePresetBar
          activePreset={activePreset}
          onPreset={handlePreset}
          onCustomRange={handleCustomRange}
        />
      </div>

      <StatsCards leads={filtered} ganados={ganados} />
      <StatsCharts leads={filtered} stages={stages} />
    </div>
  );
}
