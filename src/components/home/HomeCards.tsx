import { useMemo } from 'react';
import { useLeads } from '../../hooks/useLeads';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { useVentas } from '../../hooks/useVentas';
import { formatPrice } from '../../lib/formatters';
import type { TabId } from '../../types';

interface HomeCardsProps {
  onNavigate: (tab: TabId) => void;
}

const PipelineIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="5" height="18" rx="1" />
    <rect x="10" y="3" width="5" height="12" rx="1" />
    <rect x="17" y="3" width="5" height="15" rx="1" />
  </svg>
);

const PresupIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

const ContactosIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const VentasIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
    <polyline points="17,6 23,6 23,12" />
  </svg>
);

const StatsIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const AjustesIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export default function HomeCards({ onNavigate }: HomeCardsProps) {
  const { data: leads = [] } = useLeads();
  const { budgetsFlat = [] } = usePresupuestos();
  const { ventasMap = {} } = useVentas();

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

  const totalContactos = leads.length;

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

  const cards = [
    { id: 'pipeline' as TabId, icon: <PipelineIcon />, title: 'Pipeline', label: `${activeLeads} leads activos` },
    { id: 'presupuestos' as TabId, icon: <PresupIcon />, title: 'Presupuestos', label: `${budgetsThisMonth} enviados este mes` },
    { id: 'contactos' as TabId, icon: <ContactosIcon />, title: 'Contactos', label: `${totalContactos} en la base` },
    { id: 'ventas' as TabId, icon: <VentasIcon />, title: 'Ventas', label: `${facDisplay} facturado` },
    { id: 'estadisticas' as TabId, icon: <StatsIcon />, title: 'Estadisticas', label: `${tasaCierre}% tasa de cierre` },
    { id: 'ajustes' as TabId, icon: <AjustesIcon />, title: 'Ajustes', label: 'Configuracion del sistema' },
  ];

  return (
    <div className="grid grid-cols-3 gap-5 justify-center mb-6 max-w-[580px] mx-auto">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => onNavigate(card.id)}
          className="group bg-white rounded-2xl p-7 shadow-sm border-t-[3px] border-t-transparent
            aspect-square flex flex-col items-center justify-center text-center
            transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-t-[#1DA1F2]"
        >
          <div className="w-9 h-9 mb-3.5 text-[#1DA1F2]">{card.icon}</div>
          <div className="text-base font-bold text-[#2a2a2a] leading-none mb-1.5">{card.title}</div>
          <div className="text-[11px] text-[#999] font-medium tracking-wide">{card.label}</div>
        </button>
      ))}
    </div>
  );
}
