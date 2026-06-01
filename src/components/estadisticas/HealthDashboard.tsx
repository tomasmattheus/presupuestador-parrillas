import { useMemo } from 'react';
import {
  Banknote,
  Receipt,
  Target,
  Clock,
  Truck,
  AlertTriangle,
  UserPlus,
  Snowflake,
} from 'lucide-react';
import type { Lead, VentaStore } from '../../types';
import { MetricCard, type HealthStatus } from '../ui/card';
import { formatPrice } from '../../lib/formatters';
import { parseGoogleDate } from '../../lib/dates';
import { getDaysInStage, getStageEntryDate } from '../../lib/stageTimer';
import { selectSales, ventaKey, WON_STAGE } from '../../lib/salesMetrics';

interface Props {
  leadsAll: Lead[];
  leadsPeriod: Lead[];
  leadsPrevPeriod: Lead[] | null;
  ventasMap: Record<string, VentaStore>;
  dateFrom: string;
  dateTo: string;
  prevFrom: string;
  prevTo: string;
}

function isoToYmd(iso: string | Date | null | undefined): string {
  const d = parseGoogleDate(iso);
  if (!d || isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function status(value: number, thresholds: { healthy: number; warning: number }, lowerIsBetter = true): HealthStatus {
  if (lowerIsBetter) {
    if (value <= thresholds.healthy) return 'healthy';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  }
  if (value >= thresholds.healthy) return 'healthy';
  if (value >= thresholds.warning) return 'warning';
  return 'critical';
}

function computeDelta(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return { value: '0%', sign: 'flat' as const };
    return null;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (Math.abs(pct) > 500) return null;
  if (pct === 0) return { value: '0%', sign: 'flat' as const };
  return { value: Math.abs(pct) + '%', sign: pct > 0 ? ('up' as const) : ('down' as const) };
}

interface RevenueStats {
  revenue: number;
  count: number;
  ticket: number;
  salesCycleAvg: number | null;
  deliveryAvg: number | null;
}

function computeRevenueStats(
  leads: Lead[],
  ventasMap: Record<string, VentaStore>,
  from: string,
  to: string,
): RevenueStats {
  let revenue = 0;
  const cycles: number[] = [];
  const deliveries: number[] = [];

  const sales = selectSales(leads, ventasMap, from, to);
  sales.forEach((lead) => {
    const venta = ventasMap[ventaKey(lead)];
    const cierreISO = venta?.fechaCierre || getStageEntryDate(lead.rowIndex, WON_STAGE) || '';
    revenue += venta?.monto || 0;

    const leadDate = parseGoogleDate(lead.fecha);
    const cierreDate = parseGoogleDate(cierreISO);
    if (leadDate && cierreDate && !isNaN(leadDate.getTime()) && !isNaN(cierreDate.getTime())) {
      const d = daysBetween(leadDate, cierreDate);
      if (d >= 0 && d < 365) cycles.push(d);
    }

    if (venta?.fechaEntrega && venta?.estadoEntrega === 'Entregado e instalado') {
      const entregaDate = parseGoogleDate(venta.fechaEntrega);
      if (cierreDate && entregaDate && !isNaN(entregaDate.getTime())) {
        const d = daysBetween(cierreDate, entregaDate);
        if (d >= 0 && d < 365) deliveries.push(d);
      }
    }
  });

  const count = sales.length;
  const ticket = count > 0 ? revenue / count : 0;
  const salesCycleAvg = cycles.length > 0 ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length) : null;
  const deliveryAvg = deliveries.length > 0 ? Math.round(deliveries.reduce((a, b) => a + b, 0) / deliveries.length) : null;

  return { revenue, count, ticket, salesCycleAvg, deliveryAvg };
}

function computeOperations(leads: Lead[], ventasMap: Record<string, VentaStore>) {
  const todayYmd = isoToYmd(new Date());
  let activasConFecha = 0;
  let atrasadas = 0;

  leads.forEach((lead) => {
    if (lead.stage !== 'Cerrado Ganado') return;
    const venta = ventasMap[ventaKey(lead)];
    if (!venta?.fechaEntrega) return;
    if (venta.estadoEntrega === 'Entregado e instalado') return;
    activasConFecha += 1;
    const entregaYmd = isoToYmd(venta.fechaEntrega);
    if (entregaYmd && entregaYmd < todayYmd) atrasadas += 1;
  });

  return {
    activasConFecha,
    atrasadas,
    pctAtrasadas: activasConFecha > 0 ? Math.round((atrasadas / activasConFecha) * 100) : 0,
  };
}

function computePipelineHealth(leads: Lead[]) {
  const activos = leads.filter((l) => l.stage !== 'Cerrado Ganado' && l.stage !== 'Cerrado Perdido');
  if (activos.length === 0) return { totalActivos: 0, frios: 0, pctFrios: 0 };
  let frios = 0;
  activos.forEach((l) => {
    const d = getDaysInStage(l.rowIndex, l.stage);
    if (d > 7) frios += 1;
  });
  return {
    totalActivos: activos.length,
    frios,
    pctFrios: Math.round((frios / activos.length) * 100),
  };
}

export default function HealthDashboard({
  leadsAll,
  leadsPeriod,
  leadsPrevPeriod,
  ventasMap,
  dateFrom,
  dateTo,
  prevFrom,
  prevTo,
}: Props) {
  const rev = useMemo(
    () => computeRevenueStats(leadsAll, ventasMap, dateFrom, dateTo),
    [leadsAll, ventasMap, dateFrom, dateTo],
  );

  const prevRev = useMemo(
    () => (prevFrom && prevTo ? computeRevenueStats(leadsAll, ventasMap, prevFrom, prevTo) : null),
    [leadsAll, ventasMap, prevFrom, prevTo],
  );

  const winRate = leadsPeriod.length > 0 ? Math.round((rev.count / leadsPeriod.length) * 100) : 0;
  const prevWinRate = leadsPrevPeriod && leadsPrevPeriod.length > 0 && prevRev
    ? Math.round((prevRev.count / leadsPrevPeriod.length) * 100)
    : null;

  const ops = useMemo(() => computeOperations(leadsAll, ventasMap), [leadsAll, ventasMap]);
  const pipeHealth = useMemo(() => computePipelineHealth(leadsAll), [leadsAll]);

  const cards = [
    {
      label: 'Revenue del período',
      value: formatPrice(rev.revenue),
      hint: `${rev.count} ventas cerradas`,
      icon: <Banknote size={14} strokeWidth={2} />,
      accent: '#10b981',
      delta: prevRev ? computeDelta(rev.revenue, prevRev.revenue) : null,
    },
    {
      label: 'Ticket promedio',
      value: rev.count > 0 ? formatPrice(rev.ticket) : '—',
      hint: 'Monto promedio por venta',
      icon: <Receipt size={14} strokeWidth={2} />,
      accent: '#0ea5e9',
      delta: prevRev && prevRev.count > 0 ? computeDelta(rev.ticket, prevRev.ticket) : null,
    },
    {
      label: 'Win rate',
      value: winRate + '%',
      hint: 'Target ≥ 25%',
      icon: <Target size={14} strokeWidth={2} />,
      accent: '#8b5cf6',
      status: status(winRate, { healthy: 25, warning: 15 }, false),
      delta: prevWinRate !== null ? computeDelta(winRate, prevWinRate) : null,
    },
    {
      label: 'Sales cycle',
      value: rev.salesCycleAvg !== null ? rev.salesCycleAvg + 'd' : '—',
      hint: 'Target ≤ 30 días',
      icon: <Clock size={14} strokeWidth={2} />,
      accent: '#f59e0b',
      status: rev.salesCycleAvg !== null ? status(rev.salesCycleAvg, { healthy: 30, warning: 45 }) : undefined,
      delta: prevRev?.salesCycleAvg !== null && prevRev?.salesCycleAvg !== undefined && rev.salesCycleAvg !== null
        ? computeDelta(rev.salesCycleAvg, prevRev.salesCycleAvg)
        : null,
      deltaInverse: true,
    },
    {
      label: 'Tiempo de entrega',
      value: rev.deliveryAvg !== null ? rev.deliveryAvg + 'd' : '—',
      hint: 'Target 20-30 días',
      icon: <Truck size={14} strokeWidth={2} />,
      accent: '#ef4444',
      status: rev.deliveryAvg !== null ? status(rev.deliveryAvg, { healthy: 30, warning: 45 }) : undefined,
      delta: prevRev?.deliveryAvg !== null && prevRev?.deliveryAvg !== undefined && rev.deliveryAvg !== null
        ? computeDelta(rev.deliveryAvg, prevRev.deliveryAvg)
        : null,
      deltaInverse: true,
    },
    {
      label: 'Órdenes atrasadas',
      value: ops.activasConFecha > 0 ? ops.pctAtrasadas + '%' : '—',
      hint: ops.activasConFecha > 0 ? `${ops.atrasadas} de ${ops.activasConFecha} entregas` : 'Sin entregas con fecha',
      icon: <AlertTriangle size={14} strokeWidth={2} />,
      accent: '#ef4444',
      status: ops.activasConFecha > 0 ? status(ops.pctAtrasadas, { healthy: 10, warning: 20 }) : undefined,
    },
    {
      label: 'Leads nuevos',
      value: String(leadsPeriod.length),
      hint: 'En el período seleccionado',
      icon: <UserPlus size={14} strokeWidth={2} />,
      accent: '#0ea5e9',
      delta: leadsPrevPeriod ? computeDelta(leadsPeriod.length, leadsPrevPeriod.length) : null,
    },
    {
      label: 'Leads fríos en pipeline',
      value: pipeHealth.totalActivos > 0 ? pipeHealth.pctFrios + '%' : '—',
      hint: pipeHealth.totalActivos > 0 ? `${pipeHealth.frios} de ${pipeHealth.totalActivos} activos >7d` : 'Sin pipeline activo',
      icon: <Snowflake size={14} strokeWidth={2} />,
      accent: '#06b6d4',
      status: pipeHealth.totalActivos > 0 ? status(pipeHealth.pctFrios, { healthy: 20, warning: 35 }) : undefined,
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-text-muted m-0">Salud comercial</h2>
        <span className="text-[11px] text-text-subtle">Dashboard ejecutivo</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c) => (
          <MetricCard
            key={c.label}
            label={c.label}
            value={c.value}
            hint={c.hint}
            icon={c.icon}
            accent={c.accent}
            status={c.status}
            delta={c.delta}
            deltaInverse={c.deltaInverse}
          />
        ))}
      </div>
    </div>
  );
}
