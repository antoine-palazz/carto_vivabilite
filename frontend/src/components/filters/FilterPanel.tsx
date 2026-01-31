'use client';

import { useState, useEffect } from 'react';
import { useFilterStore } from '@/stores/filterStore';
import { useFilterCategories, useDataStatus } from '@/hooks/useFilters';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn, formatNumber, debounce } from '@/lib/utils';
import { useSearchCommunes, useInitializeMap } from '@/hooks/useCommunes';

export function FilterPanel() {
  // Load communes on component mount
  useInitializeMap();
  const {
    weights,
    minScore,
    population,
    searchQuery,
    categoriesLoaded,
    initializeFromCategories,
    setWeight,
    toggleFilter,
    setMinScore,
    setPopulationRange,
    togglePopulationFilter,
    setSearchQuery,
    resetFilters,
    hasActiveFilters,
    getEnabledWeights,
  } = useFilterStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isCollapsed, setIsCollapsed] = useState<Record<string, boolean>>({});

  // Fetch filter categories from API
  const { data: categories, isLoading: categoriesLoading } = useFilterCategories();
  const { data: dataStatus } = useDataStatus();

  // Initialize weights when categories are loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !categoriesLoaded) {
      initializeFromCategories(categories);
    }
  }, [categories, categoriesLoaded, initializeFromCategories]);

  // Trigger search with debounce
  const { refetch, isFetching } = useSearchCommunes(getEnabledWeights());

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const toggleSection = (section: string) => {
    setIsCollapsed((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Show loading state
  if (categoriesLoading) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-carte-accent-primary border-t-transparent mx-auto" />
            <p className="text-sm text-carte-text-muted">Chargement des filtres...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no categories available
  if (!categories || categories.length === 0) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-sm text-carte-text-muted mb-2">Aucun filtre disponible</p>
            <p className="text-xs text-carte-text-muted">
              Ajoutez des données dans le dossier backend/data/
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-carte-border-subtle bg-carte-bg-secondary/50 px-4 py-3">
        <h2 className="text-lg font-semibold text-carte-text-primary">Filtres</h2>
        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Data status warning */}
      {dataStatus && !dataStatus.ready && (
        <div className="border-b border-carte-border-subtle bg-amber-500/10 px-4 py-3">
          <p className="text-xs text-amber-400">
            ⚠️ Données en attente : ajoutez le fichier de communes pour voir la carte.
          </p>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="border-b border-carte-border-subtle p-4">
          <Input
            label="Rechercher une commune"
            placeholder="Ex: Lyon, Marseille..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              handleSearchChange(e.target.value);
            }}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Score minimum */}
        <div className="border-b border-carte-border-subtle p-4">
          <Slider
            label="Score minimum"
            value={minScore}
            onChange={setMinScore}
            min={0}
            max={100}
            step={5}
            formatValue={(v) => `${v}%`}
            description="Afficher uniquement les communes au-dessus de ce score"
          />
        </div>

        {/* Population filter */}
        <CollapsibleSection
          title="Population"
          isOpen={!isCollapsed['population']}
          onToggle={() => toggleSection('population')}
          badge={population.enabled ? 'Actif' : undefined}
        >
          <Toggle
            label="Filtrer par population"
            checked={population.enabled}
            onChange={togglePopulationFilter}
            description="Limiter les résultats à une tranche de population"
          />

          {population.enabled && (
            <div className="mt-4 space-y-4">
              <Slider
                label="Population minimale"
                value={population.min}
                onChange={(v) => setPopulationRange(v, population.max)}
                min={0}
                max={500000}
                step={1000}
                formatValue={(v) => formatNumber(v)}
              />
              <Slider
                label="Population maximale"
                value={population.max}
                onChange={(v) => setPopulationRange(population.min, v)}
                min={0}
                max={2500000}
                step={10000}
                formatValue={(v) => formatNumber(v)}
              />
            </div>
          )}
        </CollapsibleSection>

        {/* Score weights - Dynamic from API */}
        <CollapsibleSection
          title="Pondération des critères"
          isOpen={!isCollapsed['weights']}
          onToggle={() => toggleSection('weights')}
          description="Ajustez l'importance de chaque critère"
        >
          <div className="space-y-6">
            {categories.map((category) => {
              const config = weights[category.id];
              if (!config) return null;

              return (
                <div
                  key={category.id}
                  className={cn(
                    'rounded-lg border border-carte-border-subtle p-3 transition-all',
                    !config.enabled && 'opacity-50'
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium text-carte-text-primary">
                        {category.name}
                      </span>
                    </div>
                    <Toggle
                      label=""
                      checked={config.enabled}
                      onChange={() => toggleFilter(category.id)}
                    />
                  </div>

                  <Slider
                    label=""
                    value={config.weight}
                    onChange={(v) => setWeight(category.id, v)}
                    min={0}
                    max={100}
                    step={5}
                    disabled={!config.enabled}
                    formatValue={(v) => {
                      if (v === 0) return 'Ignoré';
                      if (v < 30) return 'Faible';
                      if (v < 70) return 'Moyen';
                      return 'Important';
                    }}
                  />

                  <p className="mt-2 text-xs text-carte-text-muted">
                    {category.description}
                    {category.unit && (
                      <span className="ml-1 text-carte-text-muted/70">({category.unit})</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      </div>

      {/* Footer with apply button */}
      <div className="border-t border-carte-border-subtle bg-carte-bg-secondary/50 p-4">
        <Button
          className="w-full"
          onClick={() => {
            void refetch();
          }}
          loading={isFetching}
          disabled={!dataStatus?.ready}
        >
          {dataStatus?.ready ? 'Appliquer les filtres' : 'En attente des données...'}
        </Button>
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string | undefined;
  description?: string | undefined;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  badge,
  description,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border-b border-carte-border-subtle">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-carte-bg-tertiary/30"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-carte-text-primary">{title}</span>
          {badge && (
            <span className="rounded-full bg-carte-accent-primary/20 px-2 py-0.5 text-2xs font-medium text-carte-accent-primary">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={cn(
            'h-4 w-4 text-carte-text-muted transition-transform',
            isOpen && 'rotate-180'
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

      {isOpen && (
        <div className="px-4 pb-4">
          {description && (
            <p className="mb-4 text-xs text-carte-text-muted">{description}</p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
