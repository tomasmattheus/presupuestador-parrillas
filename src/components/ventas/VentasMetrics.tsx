import { formatPrice } from '../../lib/formatters';

interface Metrics {
  totalMonto: number;
  count: number;
  ticketPromedio: number;
}

interface Props {
  metrics: Metrics;
  prev?: Metrics | null;
}

const CARDS = [
  { key: 'count' as const, label: 'Ventas cerradas', format: false },
  { key: 'totalMonto' as const, label: 'Facturacion total', format: true },
  { key: 'ticketPromedio' as const, label: 'Ticket promedio', format: true },
];

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

export default function VentasMetrics({ metrics, prev }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {CARDS.map((card) => {
        const value = metrics[card.key] ?? 0;
        const prevValue = prev?.[card.key] ?? 0;
        const delta = prev ? computeDelta(value, prevValue) : null;
        return (
          <div
            key={card.key}
            className="bg-white rounded-[10px] py-5 px-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-success rounded-l-[10px]" />
            <div className="text-[28px] font-black text-[#2a2a2a] leading-none">
              {card.format ? formatPrice(Math.round(value)) : value}
            </div>
            <div className="text-xs text-[#888] font-semibold uppercase tracking-wide mt-1.5">
              {card.label}
            </div>
            {prev && <DeltaBadge delta={delta} />}
          </div>
        );
      })}
    </div>
  );
}
