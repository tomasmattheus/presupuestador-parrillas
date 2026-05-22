import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        default: 'bg-brand text-white hover:bg-brand-hover shadow-[var(--shadow-card)]',
        success: 'bg-success text-white hover:bg-[#059669] shadow-[var(--shadow-card)]',
        danger: 'bg-danger text-white hover:bg-danger-hover shadow-[var(--shadow-card)]',
        outline: 'border border-border bg-white text-text hover:bg-bg-muted hover:border-text-muted',
        ghost: 'bg-transparent text-text hover:bg-bg-muted',
        subtle: 'bg-bg-muted text-text hover:bg-border',
        link: 'bg-transparent text-brand hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-sm',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
