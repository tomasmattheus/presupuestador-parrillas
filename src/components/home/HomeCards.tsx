import { useMemo } from 'react';
import { Workflow, FileText, Users, ShoppingCart, TrendingUp, Settings } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { useVentas } from '../../hooks/useVentas';
import { formatPrice } from '../../lib/formatters';
import { cn } from '../../lib/utils';
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

  const cards: {
    id: TabId;
    label: string;
    value: string;
    color: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  }[] = [
    { id: 'pipeline', label: 'Pipeline activo', value: loading ? '…' : String(activeLeads), color: '#0ea5e9', icon: Workflow },
    { id: 'presupuestos', label: 'Presupuestos del mes', value: loading ? '…' : String(budgetsThisMonth), color: '#f59e0b', icon: FileText },
    { id: 'contactos', label: 'Contactos', value: loading ? '…' : String(leads.length), color: '#8b5cf6', icon: Users },
    { id: 'ventas', label: 'Facturación', value: loading ? '…' : facDisplay, color: '#10b981', icon: ShoppingCart },
    { id: 'estadisticas', label: 'Tasa de cierre', value: loading ? '…' : `${tasaCierre}%`, color: '#ef4444', icon: TrendingUp },
    { id: 'ajustes', label: 'Ajustes', value: '', color: '#64748b', icon: Settings },
  ];

  return (
    <div className="grid grid-cols-6 gap-3 mb-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={cn(
              'group bg-white rounded-xl border border-border shadow-[var(--shadow-card)] p-4 cursor-pointer text-left',
              'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] hover:border-text-subtle/30',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">{card.label}</span>
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: card.color + '15', color: card.color }}
              >
                <Icon size={14} strokeWidth={2} />
              </span>
            </div>
            {card.value ? (
              <div className="text-[22px] font-bold tracking-tight text-text leading-none">{card.value}</div>
            ) : (
              <div className="text-[13px] text-text-subtle italic">Configuración</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
