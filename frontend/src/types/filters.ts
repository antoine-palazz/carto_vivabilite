/**
 * Types for filter configuration and state
 * 
 * Filter categories are now dynamic, loaded from the backend.
 */

/** Range filter value */
export interface RangeFilter {
  min: number;
  max: number;
  enabled: boolean;
}

/** Weight configuration for a filter category */
export interface WeightConfig {
  id: string;      // Filter ID from manifest
  weight: number;  // 0-100
  enabled: boolean;
}

/** Complete filter state */
export interface FilterState {
  /** Category weights for score calculation - dynamic keys */
  weights: Record<string, WeightConfig>;
  /** Minimum global score threshold */
  minScore: number;
  /** Population range filter */
  population: RangeFilter;
  /** Search query for commune name */
  searchQuery: string;
  /** Department filter */
  departements: string[];
  /** Region filter */
  regions: string[];
  /** Whether categories have been loaded from API */
  categoriesLoaded: boolean;
}

/** Create default filter state (empty weights until categories load) */
export function createDefaultFilterState(): FilterState {
  return {
    weights: {},
    minScore: 0,
    population: {
      min: 0,
      max: 1000000,
      enabled: false,
    },
    searchQuery: '',
    departements: [],
    regions: [],
    categoriesLoaded: false,
  };
}

/** Filter options from API */
export interface FilterOptions {
  populationRange: {
    min: number;
    max: number;
  };
  departements: Array<{
    code: string;
    nom: string;
  }>;
  regions: Array<{
    code: string;
    nom: string;
  }>;
}

/** Search filters for API request */
export interface SearchFilters {
  weights: Record<string, number>;
  minScore?: number | undefined;
  populationMin?: number | undefined;
  populationMax?: number | undefined;
  departements?: string[] | undefined;
  regions?: string[] | undefined;
  searchQuery?: string | undefined;
  /** Viewport bounds for map-based filtering */
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | undefined;
  /** Pagination */
  limit?: number | undefined;
  offset?: number | undefined;
}
