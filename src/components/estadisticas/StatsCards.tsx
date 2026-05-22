import type { Lead } from '../../types';
import { useMemo } from 'react';

interface Props {
  leads: Lead[];
  ganados: Lead[];
  prevLeads?: Lead[] | null;
}

function computeStats(leads: Lead[], ganados: Lead[]) {
  const totalLeads = leads.length;
  const ganadosCount = ganados.length;
  const perdidos = leads.filter((l) => l.stage === 'Cerrado Perdido').length;
  const presupEnviados = leads.filter((l) => l.stage === 'Presupuesto Enviado').length;
  const tasaCierre = totalLeads > 0 ? Math.round((ganadosCount / totalLeads) * 100) : 0;
  const presupTotal = presupEnviados + ganadosCount + perdidos;
  const tasaPresup = totalLeads > 0 ? Math.round((presupTotal / totalLeads) * 100) : 0;
  return { totalLeads, ganadosCount, perdidos, presupEnviados, presupTotal, tasaCierre, tasaPresup };
}

function computeDelta(current: number, previous: number): { pct: number; sign: 'up' | 'down' | 'flat' } | null {
  if (previous === 0) {
    if (current === 0) return { pct: 0, sign: 'flat' };
    return null;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (Math.abs(pct) > 500) return null;
  if (pct === 0) return { pct: 0, sign: 'flat' };
  return { pct, sign: pct > 0 ? 'up' : 'down' };
}

function DeltaBadge({ delta }: { delta: ReturnType<typeof computeDelta> }) {
  if (!delta) return null;
  const color = delta.sign === 'up' ? 'text-[#10b981]' : delta.sign === 'down' ? 'text-[#ef4444]' : 'text-[#888]';
  const arrow = delta.sign === 'up' ? '▲' : delta.sign === 'down' ? '▼' : '–';
  return (
    <div className={`text-[11px] font-semibold mt-1.5 ${color}`}>
      {arrow} {Math.abs(delta.pct)}% vs período anterior
    </div>
  );
}

export default function StatsCards({ leads, ganados, prevLeads }: Props) {
  const stats = useMemo(() => computeStats(leads, ganados), [leads, ganados]);

  const prevStats = useMemo(() => {
    if (!prevLeads) return null;
    const prevGanados = prevLeads.filter((l) => l.stage === 'Cerrado Ganado');
    return computeStats(prevLeads, prevGanados);
  }, [prevLeads]);

  const cards: { number: string; label: string; color: string; deltaKey: keyof ReturnType<typeof computeStats> }[] = [
    { number: String(stats.totalLeads), label: 'Total leads', color: '#1DA1F2', deltaKey: 'totalLeads' },
    { number: stats.tasaPresup + '%', label: 'Presupuestados (' + stats.presupTotal + ' de ' + stats.totalLeads + ')', color: '#f59e0b', deltaKey: 'tasaPresup' },
    { number: String(stats.ganadosCount), label: 'Cerrados ganados', color: '#10b981', deltaKey: 'ganadosCount' },
    { number: stats.tasaCierre + '%', label: 'Tasa de cierre (' + stats.ganadosCount + ' de ' + stats.totalLeads + ')', color: '#8b5cf6', deltaKey: 'tasaCierre' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const delta = prevStats ? computeDelta(stats[card.deltaKey] as number, prevStats[card.deltaKey] as number) : null;
        return (
          <div
            key={card.label}
            className="bg-white rounded-[10px] py-5 px-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          >
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-l-[10px]"
              style={{ background: card.color }}
            />
            <div className="text-[28px] font-black text-[#2a2a2a] leading-none">
              {card.number}
            </div>
            <div className="text-xs text-[#888] font-semibold uppercase tracking-wide mt-1.5">
              {card.label}
            </div>
            {prevStats && <DeltaBadge delta={delta} />}
          </div>
        );
      })}
    </div>
  );
}
