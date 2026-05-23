import { useMemo } from 'react';
import { Users, FileSignature, Trophy, Target } from 'lucide-react';
import type { Lead } from '../../types';
import { MetricCard } from '../ui/card';

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

function computeDelta(current: number, previous: number): { value: string; sign: 'up' | 'down' | 'flat' } | null {
  if (previous === 0) {
    if (current === 0) return { value: '0%', sign: 'flat' };
    return null;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (Math.abs(pct) > 500) return null;
  if (pct === 0) return { value: '0%', sign: 'flat' };
  return { value: Math.abs(pct) + '%', sign: pct > 0 ? 'up' : 'down' };
}

export default function StatsCards({ leads, ganados, prevLeads }: Props) {
  const stats = useMemo(() => computeStats(leads, ganados), [leads, ganados]);

  const prevStats = useMemo(() => {
    if (!prevLeads) return null;
    const prevGanados = prevLeads.filter((l) => l.stage === 'Cerrado Ganado');
    return computeStats(prevLeads, prevGanados);
  }, [prevLeads]);

  const cards: {
    label: string;
    value: string;
    accent: string;
    icon: React.ReactNode;
    key: keyof ReturnType<typeof computeStats>;
  }[] = [
    { label: 'Total leads', value: String(stats.totalLeads), accent: '#0ea5e9', icon: <Users size={14} strokeWidth={2} />, key: 'totalLeads' },
    { label: 'Tasa de presupuesto', value: stats.tasaPresup + '%', accent: '#f59e0b', icon: <FileSignature size={14} strokeWidth={2} />, key: 'tasaPresup' },
    { label: 'Cerrados ganados', value: String(stats.ganadosCount), accent: '#10b981', icon: <Trophy size={14} strokeWidth={2} />, key: 'ganadosCount' },
    { label: 'Tasa de cierre', value: stats.tasaCierre + '%', accent: '#8b5cf6', icon: <Target size={14} strokeWidth={2} />, key: 'tasaCierre' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const delta = prevStats ? computeDelta(stats[card.key] as number, prevStats[card.key] as number) : null;
        return (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            accent={card.accent}
            icon={card.icon}
            delta={delta}
          />
        );
      })}
    </div>
  );
}
