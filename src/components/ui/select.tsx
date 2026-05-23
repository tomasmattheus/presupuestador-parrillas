import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (val: T) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'pill';
  disabled?: boolean;
  renderValue?: (opt: SelectOption<T> | null) => ReactNode;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
}

export function Select<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
  size = 'md',
  disabled,
  renderValue,
  triggerClassName,
  triggerStyle,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value) || null;
  const heightClass =
    size === 'pill' ? 'h-7 text-[11px] px-2.5 font-bold uppercase tracking-wider rounded-full'
      : size === 'sm' ? 'h-8 text-xs px-2.5'
      : 'h-9 text-sm px-3';

  const baseTrigger = triggerClassName
    ? cn('w-full flex items-center justify-between gap-2 transition-colors outline-none cursor-pointer', heightClass, triggerClassName)
    : cn(
        'w-full flex items-center justify-between gap-2 bg-white border border-border rounded-md text-text font-sans transition-colors outline-none',
        'hover:border-text-muted',
        'focus:border-brand focus:ring-2 focus:ring-brand/15',
        open && 'border-brand ring-2 ring-brand/15',
        disabled && 'opacity-50 cursor-not-allowed bg-bg-muted',
        !disabled && 'cursor-pointer',
        heightClass,
      );

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={baseTrigger}
        style={triggerStyle}
      >
        <span className={cn('truncate text-left flex-1', !selected && 'text-text-subtle')}>
          {renderValue ? renderValue(selected) : (selected ? selected.label : placeholder)}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={cn('text-text-subtle shrink-0 transition-transform duration-150', open && 'rotate-180 text-brand')}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-lg shadow-[var(--shadow-pop)] z-[60] max-h-[280px] overflow-y-auto py-1">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[12px] text-text-subtle italic text-center">Sin opciones</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer border-none',
                    isSelected
                      ? 'bg-brand-soft text-brand'
                      : 'bg-transparent text-text hover:bg-bg-muted',
                  )}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{opt.label}</span>
                    {opt.hint && <span className="block text-[11px] text-text-muted truncate font-normal">{opt.hint}</span>}
                  </span>
                  {isSelected && <Check size={14} strokeWidth={2.5} className="shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
