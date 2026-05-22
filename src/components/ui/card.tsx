import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-xl border border-border shadow-[var(--shadow-card)]',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 pt-4 pb-2', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-[11px] font-semibold uppercase tracking-wider text-text-muted', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 py-3', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 py-3 border-t border-border', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  delta?: { value: string; sign: 'up' | 'down' | 'flat' } | null;
  accent?: string;
  icon?: React.ReactNode;
}

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, label, value, delta, accent = '#0ea5e9', icon, ...props }, ref) => {
    const deltaColor = delta?.sign === 'up' ? 'text-success' : delta?.sign === 'down' ? 'text-danger' : 'text-text-muted';
    const deltaArrow = delta?.sign === 'up' ? '▲' : delta?.sign === 'down' ? '▼' : '–';
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl border border-border shadow-[var(--shadow-card)] p-4 flex flex-col gap-2 transition-all hover:shadow-[var(--shadow-pop)]',
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</span>
          {icon && (
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: accent + '15', color: accent }}
            >
              {icon}
            </span>
          )}
        </div>
        <div className="text-[24px] font-bold tracking-tight text-text leading-none">{value}</div>
        {delta && (
          <div className={cn('text-[11px] font-semibold', deltaColor)}>
            {deltaArrow} {delta.value} <span className="text-text-subtle font-normal">vs período anterior</span>
          </div>
        )}
      </div>
    );
  },
);
MetricCard.displayName = 'MetricCard';
