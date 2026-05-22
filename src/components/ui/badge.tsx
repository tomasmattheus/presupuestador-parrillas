import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border',
  {
    variants: {
      variant: {
        default: 'bg-bg-muted text-text-muted border-border',
        brand: 'bg-brand-soft text-brand border-brand/20',
        success: 'bg-success-soft text-[#047857] border-[#a7f3d0]',
        warning: 'bg-warning-soft text-[#b45309] border-[#fcd9a8]',
        danger: 'bg-danger-soft text-[#b91c1c] border-[#fca5a5]',
        purple: 'bg-purple-soft text-[#6b21a8] border-[#e1c8f5]',
        new: 'bg-danger text-white border-danger animate-pulse',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
  ),
);
Badge.displayName = 'Badge';
