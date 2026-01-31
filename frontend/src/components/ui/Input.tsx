import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const id = useId();

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block text-sm font-medium',
              disabled ? 'text-carte-text-muted' : 'text-carte-text-primary'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-carte-text-muted">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={cn(
              'input-base',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-carte-accent-danger focus:border-carte-accent-danger focus:ring-carte-accent-danger/30',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-carte-text-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || hint) && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-carte-accent-danger' : 'text-carte-text-muted'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
