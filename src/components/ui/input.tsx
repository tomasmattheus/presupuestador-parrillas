import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-9 w-full rounded-md border border-border bg-white px-3 text-sm text-text font-sans outline-none transition-colors placeholder:text-text-subtle focus:border-brand focus:ring-2 focus:ring-brand/15',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
