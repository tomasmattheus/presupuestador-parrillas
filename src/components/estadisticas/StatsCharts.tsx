import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Lead, PipelineStage } from '../../types';
import { getWeeklyCounts } from '../../lib/dates';

interface Props {
  leads: Lead[];
  stages: PipelineStage[];
}

const PALETTE = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

function ChartCard({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-border shadow-[var(--shadow-card)] p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-[14px] font-bold text-text m-0 tracking-tight leading-tight">{title}</h3>
        {subtitle && <div className="text-[11px] text-text-muted mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

interface TooltipPayload {
  value?: number;
  name?: string;
  payload?: { fill?: string };
}

function TooltipBox({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-border rounded-md px-2.5 py-1.5 shadow-[var(--shadow-pop)] text-[11px]">
      {label && <div className="font-semibold text-text mb-0.5">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.payload?.fill || PALETTE[0] }} />
          <span className="text-text-muted">{p.name || 'Valor'}:</span>
          <span className="font-semibold text-text">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ height }: { height: number }) {
  return (
    <div className="flex items-center justify-center text-[12px] text-text-subtle italic" style={{ height }}>
      Sin datos en el período
    </div>
  );
}

function PieLegend({ data }: { data: { name: string; value: number; fill: string }[] }) {
  return (
    <div className="flex justify-center gap-x-4 gap-y-1.5 flex-wrap mt-3 pt-3 border-t border-border-soft">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
          <span>{d.name}</span>
          <span className="font-semibold text-text">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsCharts({ leads = [], stages = [] }: Props) {
  const stageData = useMemo(() => {
    const counts: Record<string, number> = {};
    stages.forEach((s) => { counts[s.name] = 0; });
    leads.forEach((l) => { counts[l.stage] = (counts[l.stage] || 0) + 1; });
    return stages.map((s, i) => ({
      name: s.name,
      value: counts[s.name] || 0,
      fill: PALETTE[i % PALETTE.length],
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
      .slice(0, 8)
      .map(([name, value]) => ({ name, value, fill: '#0ea5e9' }));
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
      { name: 'Epoxi', value: counts.Epoxi, fill: '#0ea5e9' },
      { name: 'Inoxidable', value: counts.Inoxidable, fill: '#8b5cf6' },
      { name: 'Sin definir', value: counts['Sin definir'], fill: '#cbd5e1' },
    ].filter((d) => d.value > 0);
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
      { name: 'Guillotina', value: counts.Guillotina, fill: '#10b981' },
      { name: 'Levadizo', value: counts.Levadizo, fill: '#f59e0b' },
      { name: 'Sin definir', value: counts['Sin definir'], fill: '#cbd5e1' },
    ].filter((d) => d.value > 0);
  }, [leads]);

  const weekData = useMemo(() => {
    const weeks = getWeeklyCounts(leads, 8);
    return weeks.map((w) => ({ name: w.label, value: w.count }));
  }, [leads]);

  const weekHasData = weekData.some((w) => w.value > 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="Leads por etapa" subtitle="Distribución del pipeline actual">
        <div style={{ height: 240 }}>
          {stageData.length === 0 ? <EmptyChart height={240} /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TooltipBox />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stageData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      <ChartCard title="Top ciudades" subtitle="Las 8 con más leads">
        <div style={{ height: 240 }}>
          {ciudadData.length === 0 ? <EmptyChart height={240} /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ciudadData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<TooltipBox />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      <ChartCard title="Por material" subtitle="Distribución según tipo">
        <div style={{ height: 200 }}>
          {materialData.length === 0 ? <EmptyChart height={200} /> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={materialData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {materialData.map((d, i) => <Cell key={i} fill={d.fill} stroke="white" strokeWidth={2} />)}
                </Pie>
                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {materialData.length > 0 && <PieLegend data={materialData} />}
      </ChartCard>

      <ChartCard title="Por sistema" subtitle="Guillotina vs Levadizo">
        <div style={{ height: 200 }}>
          {sistemaData.length === 0 ? <EmptyChart height={200} /> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sistemaData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {sistemaData.map((d, i) => <Cell key={i} fill={d.fill} stroke="white" strokeWidth={2} />)}
                </Pie>
                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {sistemaData.length > 0 && <PieLegend data={sistemaData} />}
      </ChartCard>

      <ChartCard title="Leads por semana" subtitle="Últimas 8 semanas" className="col-span-2">
        <div style={{ height: 260 }}>
          {!weekHasData ? <EmptyChart height={260} /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData} margin={{ top: 10, right: 16, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TooltipBox />} cursor={{ stroke: '#0ea5e9', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#leadsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
