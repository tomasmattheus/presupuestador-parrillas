import { useMemo } from 'react';
import type { Lead, PipelineStage } from '../../types';
import { getWeeklyCounts } from '../../lib/dates';
import BarChart from './BarChart';

interface Props {
  leads: Lead[];
  stages: PipelineStage[];
}

export default function StatsCharts({ leads = [], stages = [] }: Props) {
  const stageData = useMemo(() => {
    const counts: Record<string, number> = {};
    stages.forEach((s) => { counts[s.name] = 0; });
    leads.forEach((l) => { counts[l.stage] = (counts[l.stage] || 0) + 1; });
    return stages.map((s) => ({
      label: s.name,
      count: counts[s.name] || 0,
      color: s.color,
    }));
  }, [leads, stages]);

  const ciudadData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      let c = (l.ciudad || 'Sin ciudad').trim();
      if (!c) c = 'Sin ciudad';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count, color: '#1DA1F2' }));
  }, [leads]);

  const materialData = useMemo(() => {
    const counts = { Epoxi: 0, Inoxidable: 0, 'Sin definir': 0 };
    leads.forEach((l) => {
      const m = (l.material || '').toLowerCase();
      if (m.indexOf('epoxi') >= 0 || m.indexOf('chapa') >= 0) counts.Epoxi++;
      else if (m.indexOf('inox') >= 0 || m.indexOf('acero') >= 0) counts.Inoxidable++;
      else counts['Sin definir']++;
    });
    return [
      { label: 'Epoxi', count: counts.Epoxi, color: '#2563eb' },
      { label: 'Inoxidable', count: counts.Inoxidable, color: '#7c3aed' },
      { label: 'Sin definir', count: counts['Sin definir'], color: '#9ca3af' },
    ];
  }, [leads]);

  const sistemaData = useMemo(() => {
    const counts = { Guillotina: 0, Levadizo: 0, 'Sin definir': 0 };
    leads.forEach((l) => {
      const s = (l.sistema || '').toLowerCase();
      if (s.indexOf('guillotina') >= 0) counts.Guillotina++;
      else if (s.indexOf('levadizo') >= 0) counts.Levadizo++;
      else counts['Sin definir']++;
    });
    return [
      { label: 'Guillotina', count: counts.Guillotina, color: '#1DA1F2' },
      { label: 'Levadizo', count: counts.Levadizo, color: '#f59e0b' },
      { label: 'Sin definir', count: counts['Sin definir'], color: '#9ca3af' },
    ];
  }, [leads]);

  const weekData = useMemo(() => {
    const weeks = getWeeklyCounts(leads, 8);
    return weeks.map((w) => ({
      label: w.label,
      count: w.count,
      color: '#1DA1F2',
    }));
  }, [leads]);

  return (
    <div className="grid grid-cols-2 gap-5">
      <BarChart data={stageData} title="Leads por etapa" />
      <BarChart data={ciudadData} title="Leads por ciudad" />
      <BarChart data={materialData} title="Leads por material" />
      <BarChart data={sistemaData} title="Leads por sistema" />
      <BarChart data={weekData} title="Leads por semana (ultimas 8 semanas)" fullWidth />
    </div>
  );
}
