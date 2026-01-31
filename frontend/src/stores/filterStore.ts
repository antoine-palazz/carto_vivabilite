import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FilterState, WeightConfig } from '@/types';
import { createDefaultFilterState } from '@/types';
import type { FilterCategory } from '@/types';

interface FilterStoreState extends FilterState {
  // Actions
  initializeFromCategories: (categories: FilterCategory[]) => void;
  setWeight: (filterId: string, weight: number) => void;
  toggleFilter: (filterId: string) => void;
  setMinScore: (score: number) => void;
  setPopulationRange: (min: number, max: number) => void;
  togglePopulationFilter: () => void;
  setSearchQuery: (query: string) => void;
  setDepartements: (codes: string[]) => void;
  setRegions: (codes: string[]) => void;
  resetFilters: () => void;

  // Computed
  getEnabledWeights: () => Record<string, number>;
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterStoreState>()(
  persist(
    (set, get) => ({
      ...createDefaultFilterState(),

      initializeFromCategories: (categories) => {
        const currentWeights = get().weights;
        const newWeights: Record<string, WeightConfig> = {};

        for (const category of categories) {
          // Preserve existing weights if they exist (from localStorage)
          const existing = currentWeights[category.id];
          if (existing !== undefined) {
            newWeights[category.id] = existing;
          } else {
            // Initialize with default from API
            newWeights[category.id] = {
              id: category.id,
              weight: category.weightDefault,
              enabled: true,
            };
          }
        }

        set({
          weights: newWeights,
          categoriesLoaded: true,
        });
      },

      setWeight: (filterId, weight) => {
        set((state) => {
          if (!state.weights[filterId]) return state;
          
          return {
            weights: {
              ...state.weights,
              [filterId]: {
                ...state.weights[filterId],
                weight: Math.max(0, Math.min(100, weight)),
              },
            },
          };
        });
      },

      toggleFilter: (filterId) => {
        set((state) => {
          if (!state.weights[filterId]) return state;
          
          return {
            weights: {
              ...state.weights,
              [filterId]: {
                ...state.weights[filterId],
                enabled: !state.weights[filterId].enabled,
              },
            },
          };
        });
      },

      setMinScore: (score) => {
        set({ minScore: Math.max(0, Math.min(100, score)) });
      },

      setPopulationRange: (min, max) => {
        set((state) => ({
          population: {
            ...state.population,
            min: Math.max(0, min),
            max: Math.max(min, max),
          },
        }));
      },

      togglePopulationFilter: () => {
        set((state) => ({
          population: {
            ...state.population,
            enabled: !state.population.enabled,
          },
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setDepartements: (codes) => {
        set({ departements: codes });
      },

      setRegions: (codes) => {
        set({ regions: codes });
      },

      resetFilters: () => {
        // Keep weights structure but reset to defaults
        const state = get();
        const resetWeights: Record<string, WeightConfig> = {};
        
        for (const [id, config] of Object.entries(state.weights)) {
          resetWeights[id] = {
            ...config,
            weight: 50, // Reset to neutral
            enabled: true,
          };
        }

        set({
          weights: resetWeights,
          minScore: 0,
          population: {
            min: 0,
            max: 1000000,
            enabled: false,
          },
          searchQuery: '',
          departements: [],
          regions: [],
        });
      },

      getEnabledWeights: () => {
        const { weights } = get();
        const enabledWeights: Record<string, number> = {};

        for (const [filterId, config] of Object.entries(weights)) {
          if (config.enabled) {
            enabledWeights[filterId] = config.weight;
          } else {
            enabledWeights[filterId] = 0;
          }
        }

        return enabledWeights;
      },

      hasActiveFilters: () => {
        const state = get();

        // Check if any weight is different from default (50) or disabled
        for (const config of Object.values(state.weights)) {
          if (config.weight !== 50 || !config.enabled) {
            return true;
          }
        }

        // Check other filters
        if (state.minScore !== 0) return true;
        if (state.population.enabled) return true;
        if (state.searchQuery !== '') return true;
        if (state.departements.length > 0) return true;
        if (state.regions.length > 0) return true;

        return false;
      },
    }),
    {
      name: 'carto-vivabilite-filters',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        weights: state.weights,
        minScore: state.minScore,
        population: state.population,
        categoriesLoaded: state.categoriesLoaded,
      }),
    }
  )
);
