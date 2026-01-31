import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with French locale
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('fr-FR', options).format(value);
}

/**
 * Format a population number
 */
export function formatPopulation(population: number): string {
  if (population >= 1_000_000) {
    return `${formatNumber(population / 1_000_000, { maximumFractionDigits: 1 })} M`;
  }
  if (population >= 1_000) {
    return `${formatNumber(population / 1_000, { maximumFractionDigits: 1 })} k`;
  }
  return formatNumber(population);
}

/**
 * Format a score as percentage
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'rgb(34, 197, 94)'; // green
  if (score >= 60) return 'rgb(132, 204, 22)'; // lime
  if (score >= 40) return 'rgb(234, 179, 8)'; // yellow
  if (score >= 20) return 'rgb(249, 115, 22)'; // orange
  return 'rgb(239, 68, 68)'; // red
}

/**
 * Interpolate between two colors based on a score
 */
export function interpolateScoreColor(score: number): string {
  // Clamp score between 0 and 100
  const s = Math.max(0, Math.min(100, score));

  // Color stops: red (0) -> orange (25) -> yellow (50) -> lime (75) -> green (100)
  const stops = [
    { pos: 0, r: 239, g: 68, b: 68 },
    { pos: 25, r: 249, g: 115, b: 22 },
    { pos: 50, r: 234, g: 179, b: 8 },
    { pos: 75, r: 132, g: 204, b: 22 },
    { pos: 100, r: 34, g: 197, b: 94 },
  ];

  // Find the two stops to interpolate between
  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    const currentStop = stops[i];
    const nextStop = stops[i + 1];
    if (currentStop && nextStop && s >= currentStop.pos && s <= nextStop.pos) {
      lower = currentStop;
      upper = nextStop;
      break;
    }
  }

  if (!lower || !upper) {
    return 'rgb(148, 163, 184)';
  }

  // Interpolate
  const range = upper.pos - lower.pos;
  const factor = range > 0 ? (s - lower.pos) / range : 0;

  const r = Math.round(lower.r + (upper.r - lower.r) * factor);
  const g = Math.round(lower.g + (upper.g - lower.g) * factor);
  const b = Math.round(lower.b + (upper.b - lower.b) * factor);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
}
