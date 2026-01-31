import { cn } from '@/lib/utils';
import { getScoreLevel, type ScoreLevel } from '@/types';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const levelLabels: Record<ScoreLevel, string> = {
  excellent: 'Excellent',
  good: 'Bon',
  average: 'Moyen',
  poor: 'Faible',
  bad: 'Mauvais',
};

export function ScoreBadge({
  score,
  size = 'md',
  showLabel = false,
  className,
}: ScoreBadgeProps) {
  const level = getScoreLevel(score);
  const roundedScore = Math.round(score);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold tabular-nums',
        `score-${level}`,
        sizeStyles[size],
        className
      )}
    >
      <span>{roundedScore}</span>
      {showLabel && (
        <>
          <span className="text-current/60">•</span>
          <span className="font-medium">{levelLabels[level]}</span>
        </>
      )}
    </span>
  );
}

interface ScoreBarProps {
  score: number;
  label?: string;
  className?: string;
}

export function ScoreBar({ score, label, className }: ScoreBarProps) {
  const level = getScoreLevel(score);

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-carte-text-secondary">{label}</span>
          <span className={cn('font-medium', `text-carte-score-${level}`)}>
            {Math.round(score)}%
          </span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-carte-bg-tertiary">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            `bg-carte-score-${level}`
          )}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}
