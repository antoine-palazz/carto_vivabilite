'use client';

import { useEffect } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useCommune } from '@/hooks/useCommunes';
import { useFilterCategories } from '@/hooks/useFilters';
import { ScoreBadge, ScoreBar } from '@/components/ui/ScoreBadge';
import { Button } from '@/components/ui/Button';
import { formatPopulation } from '@/lib/utils';

export function ScoreCard() {
  const { selectedCommune, setSelectedCommune } = useMapStore();

  // Fetch filter categories from API
  const { data: categories } = useFilterCategories();

  // Fetch full commune details when selected
  const { data: communeDetails, isLoading, error } = useCommune(
    selectedCommune?.codeInsee ?? null
  );

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCommune(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedCommune]);

  if (!selectedCommune) return null;

  return (
    <div className="absolute right-4 top-4 z-50 w-80 max-w-[calc(100vw-2rem)] animate-slide-in-right">
      <div className="glass-panel overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-carte-border-subtle p-4">
          <div className="flex-1 pr-2">
            <h2 className="text-lg font-semibold text-carte-text-primary">
              {selectedCommune.nom}
            </h2>
            {communeDetails && (
              <p className="mt-0.5 text-sm text-carte-text-secondary">
                {communeDetails.departement}, {communeDetails.region}
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedCommune(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-carte-text-muted transition-colors hover:bg-carte-bg-tertiary hover:text-carte-text-primary"
            aria-label="Fermer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-16 animate-pulse rounded-lg bg-carte-bg-tertiary" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-carte-bg-tertiary" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-carte-accent-danger/10 p-4 text-center text-carte-accent-danger">
              <p>Erreur lors du chargement des données</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setSelectedCommune(null)}
              >
                Fermer
              </Button>
            </div>
          ) : communeDetails ? (
            <>
              {/* Global score */}
              <div className="mb-6 rounded-xl bg-carte-bg-tertiary/50 p-4 text-center">
                <div className="mb-2 text-sm text-carte-text-secondary">Score global</div>
                <div className="flex items-center justify-center gap-3">
                  <ScoreBadge score={communeDetails.scoreGlobal} size="lg" />
                  <span className="text-3xl font-bold text-carte-text-primary">
                    {Math.round(communeDetails.scoreGlobal)}
                    <span className="text-lg text-carte-text-muted">/100</span>
                  </span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-carte-bg-tertiary/50 p-3">
                  <div className="text-xs text-carte-text-muted">Population</div>
                  <div className="text-lg font-semibold text-carte-text-primary">
                    {formatPopulation(communeDetails.population)}
                  </div>
                </div>
                <div className="rounded-lg bg-carte-bg-tertiary/50 p-3">
                  <div className="text-xs text-carte-text-muted">Département</div>
                  <div className="text-lg font-semibold text-carte-text-primary">
                    {communeDetails.departementCode}
                  </div>
                </div>
              </div>

              {/* Score breakdown - Dynamic from API */}
              {categories && categories.length > 0 && Object.keys(communeDetails.scores).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-carte-text-secondary">
                    Détail des scores
                  </h3>
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1 scrollbar-hidden">
                    {categories.map((category) => {
                      const score = communeDetails.scores[category.id];
                      if (score === undefined) return null;

                      return (
                        <div
                          key={category.id}
                          className="rounded-lg bg-carte-bg-tertiary/30 p-2.5"
                        >
                          <div className="mb-1.5 flex items-center gap-2">
                            <span className="text-sm">{category.icon}</span>
                            <span className="text-xs font-medium text-carte-text-primary">
                              {category.name}
                            </span>
                          </div>
                          <ScoreBar score={score} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fallback if no scores */}
              {Object.keys(communeDetails.scores).length === 0 && (
                <div className="rounded-lg bg-carte-bg-tertiary/30 p-4 text-center">
                  <p className="text-sm text-carte-text-muted">
                    Scores en cours de calcul...
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
