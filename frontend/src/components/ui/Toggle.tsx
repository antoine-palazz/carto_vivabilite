'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  className,
  description,
}: ToggleProps) {
  const id = useId();

  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="flex-1">
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium',
            disabled ? 'text-carte-text-muted' : 'text-carte-text-primary'
          )}
        >
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs text-carte-text-muted">{description}</p>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-carte-accent-primary/50 focus:ring-offset-2 focus:ring-offset-carte-bg-primary',
          checked ? 'bg-carte-accent-primary' : 'bg-carte-border-default',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}
