'use client';

import { useId, useCallback, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
  description?: string;
  icon?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
  formatValue = (v) => `${v}`,
  className,
  description,
  icon,
}: SliderProps) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      onChange(clampedValue);
    },
    [disabled, min, max, step, onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      handleChange(e.clientX);
    },
    [disabled, handleChange]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      setIsDragging(true);
      const touch = e.touches[0];
      if (touch) {
        handleChange(touch.clientX);
      }
    },
    [disabled, handleChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleChange(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handleChange(touch.clientX);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleChange]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className={cn(
            'flex items-center gap-2 text-sm font-medium',
            disabled ? 'text-carte-text-muted' : 'text-carte-text-primary'
          )}
        >
          {icon && <span className="text-base">{icon}</span>}
          {label}
        </label>
        {showValue && (
          <span
            className={cn(
              'text-sm font-medium tabular-nums',
              disabled ? 'text-carte-text-muted' : 'text-carte-accent-primary'
            )}
          >
            {formatValue(value)}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-carte-text-muted">{description}</p>
      )}

      {/* Slider track */}
      <div
        ref={trackRef}
        className={cn(
          'relative h-2 cursor-pointer rounded-full bg-carte-bg-tertiary',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        tabIndex={disabled ? -1 : 0}
        id={id}
      >
        {/* Filled portion */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-75',
            disabled ? 'bg-carte-border-default' : 'bg-carte-accent-primary'
          )}
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-75',
            disabled
              ? 'border-carte-border-default bg-carte-bg-tertiary'
              : 'border-carte-accent-primary bg-carte-bg-secondary shadow-md',
            isDragging && !disabled && 'scale-110 shadow-glow'
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-2xs text-carte-text-muted">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
