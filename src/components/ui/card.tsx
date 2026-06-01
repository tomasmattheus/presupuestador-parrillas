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

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  delta?: { value: string; sign: 'up' | 'down' | 'flat' } | null;
  accent?: string;
  icon?: React.ReactNode;
  hint?: string;
  status?: HealthStatus;
  deltaInverse?: boolean;
}

const STATUS_BAR: Record<HealthStatus, string> = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  critical: 'bg-danger',
};

const STATUS_DOT: Record<HealthStatus, string> = {
  healthy: 'bg-success',
  warning: 'bg-warning',
  critical: 'bg-danger',
};

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, label, value, delta, accent = '#0ea5e9', icon, hint, status, deltaInverse, ...props }, ref) => {
    const upGood = !deltaInverse;
    const deltaColor =
      delta?.sign === 'flat'
        ? 'text-text-muted'
        : delta?.sign === 'up'
          ? upGood
            ? 'text-success'
            : 'text-danger'
          : upGood
            ? 'text-danger'
            : 'text-success';
    const deltaArrow = delta?.sign === 'up' ? '▲' : delta?.sign === 'down' ? '▼' : '–';
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-white rounded-xl border border-border shadow-[var(--shadow-card)] p-4 flex flex-col gap-2 transition-all hover:shadow-[var(--shadow-pop)]',
          className,
        )}
        {...props}
      >
        {status && (
          <span
            aria-hidden="true"
            className={cn('absolute left-0 top-0 bottom-0 w-[3px]', STATUS_BAR[status])}
          />
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            {status && <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[status])} />}
            {label}
          </span>
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
        {hint && (
          <div className="text-[10.5px] text-text-subtle font-medium leading-tight">{hint}</div>
        )}
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
