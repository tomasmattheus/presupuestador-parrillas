import { ShoppingCart, DollarSign, Receipt } from 'lucide-react';
import { formatPrice } from '../../lib/formatters';
import { MetricCard } from '../ui/card';

interface Metrics {
  totalMonto: number;
  count: number;
  ticketPromedio: number;
}

interface Props {
  metrics: Metrics;
  prev?: Metrics | null;
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

export default function VentasMetrics({ metrics, prev }: Props) {
  const cards: {
    key: keyof Metrics;
    label: string;
    accent: string;
    icon: React.ReactNode;
    format: boolean;
  }[] = [
    { key: 'count', label: 'Ventas cerradas', accent: '#0ea5e9', icon: <ShoppingCart size={14} strokeWidth={2} />, format: false },
    { key: 'totalMonto', label: 'Facturación total', accent: '#10b981', icon: <DollarSign size={14} strokeWidth={2} />, format: true },
    { key: 'ticketPromedio', label: 'Ticket promedio', accent: '#f59e0b', icon: <Receipt size={14} strokeWidth={2} />, format: true },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {cards.map((card) => {
        const value = metrics[card.key] ?? 0;
        const prevValue = prev?.[card.key] ?? 0;
        const delta = prev ? computeDelta(value, prevValue) : null;
        const displayValue = card.format ? formatPrice(Math.round(value)) : String(value);
        return (
          <MetricCard
            key={card.key}
            label={card.label}
            value={displayValue}
            accent={card.accent}
            icon={card.icon}
            delta={delta}
          />
        );
      })}
    </div>
  );
}
