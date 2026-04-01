import { formatPrice } from '../../lib/formatters';

interface Props {
  metrics: {
    totalMonto: number;
    count: number;
    ticketPromedio: number;
  };
}

const CARDS = [
  { key: 'count' as const, label: 'Ventas cerradas', format: false },
  { key: 'totalMonto' as const, label: 'Facturacion total', format: true },
  { key: 'ticketPromedio' as const, label: 'Ticket promedio', format: true },
];

export default function VentasMetrics({ metrics }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-[10px] py-5 px-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-success rounded-l-[10px]" />
          <div className="text-[28px] font-black text-[#2a2a2a] leading-none">
            {card.format
              ? formatPrice(Math.round(metrics[card.key] || 0))
              : (metrics[card.key] ?? 0)}
          </div>
          <div className="text-xs text-[#888] font-semibold uppercase tracking-wide mt-1.5">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
