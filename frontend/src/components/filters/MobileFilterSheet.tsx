'use client';

import { useState, useEffect } from 'react';
import { FilterPanel } from './FilterPanel';
import { cn } from '@/lib/utils';
import { useFilterStore } from '@/stores/filterStore';

export function MobileFilterSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const { hasActiveFilters } = useFilterStore();

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile filter button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 lg:hidden"
      >
        <div className="flex items-center gap-2 rounded-full bg-carte-accent-primary px-5 py-3 font-medium text-white shadow-lg shadow-carte-accent-primary/30 transition-all hover:shadow-xl hover:shadow-carte-accent-primary/40">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Filtres</span>
          {hasActiveFilters() && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-carte-accent-primary">
              !
            </span>
          )}
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-carte-bg-secondary transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-carte-border-default" />
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-carte-bg-tertiary text-carte-text-muted transition-colors hover:text-carte-text-primary"
          aria-label="Fermer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Filter panel content */}
        <div className="flex-1 overflow-hidden">
          <FilterPanel />
        </div>
      </div>
    </>
  );
}
