'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Legend() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const gradientStops = [
    { color: 'rgb(239, 68, 68)', label: '0' },
    { color: 'rgb(249, 115, 22)', label: '25' },
    { color: 'rgb(234, 179, 8)', label: '50' },
    { color: 'rgb(132, 204, 22)', label: '75' },
    { color: 'rgb(34, 197, 94)', label: '100' },
  ];

  return (
    <div className="absolute bottom-6 left-4 z-40 lg:left-auto lg:right-4">
      <div className="glass-panel overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-carte-bg-tertiary/50"
        >
          <span className="text-xs font-medium text-carte-text-secondary">
            Légende
          </span>
          <svg
            className={cn(
              'h-4 w-4 text-carte-text-muted transition-transform',
              isCollapsed && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Content */}
        {!isCollapsed && (
          <div className="border-t border-carte-border-subtle p-3">
            <div className="mb-2 text-xs text-carte-text-muted">
              Score de vivabilité
            </div>

            {/* Gradient bar */}
            <div className="mb-2 h-3 w-full overflow-hidden rounded-full">
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(to right, ${gradientStops.map((s) => s.color).join(', ')})`,
                }}
              />
            </div>

            {/* Labels */}
            <div className="flex justify-between text-2xs text-carte-text-muted">
              {gradientStops.map((stop) => (
                <span key={stop.label}>{stop.label}</span>
              ))}
            </div>

            {/* Score levels */}
            <div className="mt-3 space-y-1.5">
              <LegendItem color="rgb(34, 197, 94)" label="Excellent (80-100)" />
              <LegendItem color="rgb(132, 204, 22)" label="Bon (60-79)" />
              <LegendItem color="rgb(234, 179, 8)" label="Moyen (40-59)" />
              <LegendItem color="rgb(249, 115, 22)" label="Faible (20-39)" />
              <LegendItem color="rgb(239, 68, 68)" label="Mauvais (0-19)" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-3 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-2xs text-carte-text-secondary">{label}</span>
    </div>
  );
}
