import { useMemo } from 'react';
import { useLeads } from '../../hooks/useLeads';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { useVentas } from '../../hooks/useVentas';
import { formatPrice } from '../../lib/formatters';
import type { TabId } from '../../types';

interface HomeCardsProps {
  onNavigate: (tab: TabId) => void;
}

export default function HomeCards({ onNavigate }: HomeCardsProps) {
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { budgetsFlat = [], loading: budgetsLoading } = usePresupuestos();
  const { ventasMap = {} } = useVentas();
  const loading = leadsLoading || budgetsLoading;

  const activeLeads = useMemo(
    () => leads.filter((l) => l.stage !== 'Cerrado Ganado' && l.stage !== 'Cerrado Perdido').length,
    [leads]
  );

  const budgetsThisMonth = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    return budgetsFlat.filter((b) => {
      const ts = parseInt(b.id);
      if (isNaN(ts)) return false;
      const d = new Date(ts);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
  }, [budgetsFlat]);

  const ganados = useMemo(
    () => leads.filter((l) => l.stage === 'Cerrado Ganado'),
    [leads]
  );

  const facturacionTotal = useMemo(() => {
    let total = 0;
    ganados.forEach((lead) => {
      const key = lead.nombre + '|' + lead.whatsapp;
      const vdata = ventasMap[key];
      if (vdata?.monto) total += vdata.monto;
    });
    return total;
  }, [ganados, ventasMap]);

  const facDisplay = facturacionTotal >= 1000000
    ? `$ ${(facturacionTotal / 1000000).toFixed(1)}M`
    : formatPrice(facturacionTotal);

  const tasaCierre = leads.length > 0
    ? Math.round((ganados.length / leads.length) * 100)
    : 0;

  const dot = loading ? '...' : '';
  const cards: { id: TabId; label: string; value: string; color: string }[] = [
    { id: 'pipeline', label: 'Pipeline', value: dot || `${activeLeads}`, color: '#1DA1F2' },
    { id: 'presupuestos', label: 'Presupuestos', value: dot || `${budgetsThisMonth}`, color: '#f59e0b' },
    { id: 'contactos', label: 'Contactos', value: dot || `${leads.length}`, color: '#8b5cf6' },
    { id: 'ventas', label: 'Ventas', value: dot || facDisplay, color: '#22c55e' },
    { id: 'estadisticas', label: 'Estadisticas', value: dot || `${tasaCierre}%`, color: '#ef4444' },
    { id: 'ajustes', label: 'Ajustes', value: '', color: '#6b7280' },
  ];

  return (
    <div className="grid grid-cols-6 gap-3 mb-5">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => onNavigate(card.id)}
          className="bg-white rounded-xl py-3 px-2 shadow-sm border-none cursor-pointer
            flex flex-col items-center text-center transition-all duration-150
            hover:-translate-y-0.5 hover:shadow-md"
        >
          {card.value && (
            <div className="text-xl font-black leading-none mb-1" style={{ color: card.color }}>
              {card.value}
            </div>
          )}
          {!card.value && (
            <div className="text-xl leading-none mb-1" style={{ color: card.color }}>&#9881;</div>
          )}
          <div className="text-[10px] text-[#888] font-semibold uppercase tracking-wide">
            {card.label}
          </div>
        </button>
      ))}
    </div>
  );
}
