import type { Lead } from '../../types';
import { useMemo } from 'react';

interface Props {
  leads: Lead[];
  ganados: Lead[];
}

export default function StatsCards({ leads, ganados }: Props) {
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const ganadosCount = ganados.length;
    const perdidos = leads.filter((l) => l.stage === 'Cerrado Perdido').length;
    const presupEnviados = leads.filter((l) => l.stage === 'Presupuesto Enviado').length;
    const tasaCierre = totalLeads > 0 ? Math.round((ganadosCount / totalLeads) * 100) : 0;
    const tasaPresup = totalLeads > 0 ? Math.round(((presupEnviados + ganadosCount + perdidos) / totalLeads) * 100) : 0;
    return { totalLeads, ganadosCount, perdidos, presupEnviados, tasaCierre, tasaPresup };
  }, [leads, ganados]);

  const cards = [
    { number: String(stats.totalLeads), label: 'Total leads', color: '#1DA1F2' },
    { number: stats.tasaPresup + '%', label: 'Presupuestados (' + (stats.presupEnviados + stats.ganadosCount + stats.perdidos) + ' de ' + stats.totalLeads + ')', color: '#f59e0b' },
    { number: String(stats.ganadosCount), label: 'Cerrados ganados', color: '#10b981' },
    { number: stats.tasaCierre + '%', label: 'Tasa de cierre (' + stats.ganadosCount + ' de ' + stats.totalLeads + ')', color: '#8b5cf6' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
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
        </div>
      ))}
    </div>
  );
}
