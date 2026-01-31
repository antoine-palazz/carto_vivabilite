/**
 * API client for communicating with the backend
 */

import type {
  CommuneWithScore,
  CommuneSummary,
  CommunesGeoJSON,
  CommuneScores,
  FilterOptions,
  SearchFilters,
  FilterCategory,
  DataStatus,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1 = `${API_URL}/api/v1`;

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_V1}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: { detail?: string } = await response.json().catch(() => ({ detail: 'Une erreur est survenue' })) as { detail?: string };
    throw new Error(error.detail ?? `Erreur ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * API response types (snake_case from backend)
 */
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

interface SearchResponse {
  communes: Array<{
    code_insee: string;
    nom: string;
    departement: string;
    score_global: number;
    coordinates: { lat: number; lng: number };
  }>;
  total: number;
  execution_time_ms: number;
}

interface CommuneDetailResponse {
  code_insee: string;
  nom: string;
  departement: string;
  departement_code: string;
  region: string;
  region_code: string;
  population: number;
  coordinates: { lat: number; lng: number };
  scores: Record<string, number>;  // Dynamic scores
  score_global: number;
}

interface FilterOptionsResponse {
  population_range: { min: number; max: number };
  departements: Array<{ code: string; nom: string }>;
  regions: Array<{ code: string; nom: string }>;
  score_categories: string[];
}

interface FilterCategoriesResponse {
  categories: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unit: string | null;
    weight_default: number;
    dataset_id: string;
  }>;
  count: number;
}

interface DataStatusResponse {
  communes_available: boolean;
  communes_file: string | null;
  datasets: Array<{
    id: string;
    name: string;
    enabled: boolean;
    file_exists: boolean;
    filter_count: number;
  }>;
  filter_count: number;
  ready: boolean;
}

/**
 * Transform snake_case scores to the same keys (no transformation needed for dynamic scores)
 */
function transformScores(scores: Record<string, number>): CommuneScores {
  // Scores are now dynamic, just pass through
  return scores;
}

/**
 * Transform snake_case response to camelCase
 */
function transformCommuneDetail(data: CommuneDetailResponse): CommuneWithScore {
  return {
    codeInsee: data.code_insee,
    nom: data.nom,
    departement: data.departement,
    departementCode: data.departement_code,
    region: data.region,
    regionCode: data.region_code,
    population: data.population,
    coordinates: data.coordinates,
    scores: transformScores(data.scores),
    scoreGlobal: data.score_global,
  };
}

function transformCommuneSummary(data: SearchResponse['communes'][0]): CommuneSummary {
  return {
    codeInsee: data.code_insee,
    nom: data.nom,
    departement: data.departement,
    scoreGlobal: data.score_global,
    coordinates: data.coordinates,
  };
}

function transformFilterCategory(data: FilterCategoriesResponse['categories'][0]): FilterCategory {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    icon: data.icon,
    unit: data.unit ?? undefined,
    weightDefault: data.weight_default,
    datasetId: data.dataset_id,
  };
}

function transformDataStatus(data: DataStatusResponse): DataStatus {
  return {
    communesAvailable: data.communes_available,
    communesFile: data.communes_file,
    datasets: data.datasets.map(ds => ({
      id: ds.id,
      name: ds.name,
      enabled: ds.enabled,
      fileExists: ds.file_exists,
      filterCount: ds.filter_count,
    })),
    filterCount: data.filter_count,
    ready: data.ready,
  };
}

/**
 * API methods
 */
export const api = {
  /**
   * Get paginated list of communes
   */
  async getCommunes(params?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ data: CommuneSummary[]; total: number; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.sortBy) searchParams.set('sort_by', params.sortBy);
    if (params?.order) searchParams.set('order', params.order);

    const query = searchParams.toString();
    const response = await fetchAPI<PaginatedResponse<SearchResponse['communes'][0]>>(
      `/communes${query ? `?${query}` : ''}`
    );

    return {
      data: response.data.map(transformCommuneSummary),
      total: response.total,
      hasMore: response.has_more,
    };
  },

  /**
   * Get single commune by code INSEE
   */
  async getCommune(codeInsee: string): Promise<CommuneWithScore> {
    const response = await fetchAPI<CommuneDetailResponse>(`/communes/${codeInsee}`);
    return transformCommuneDetail(response);
  },

  /**
   * Search communes with filters and custom weights
   */
  async searchCommunes(filters: SearchFilters): Promise<{
    communes: CommuneSummary[];
    total: number;
    executionTimeMs: number;
  }> {
    // Weights are already in the correct format (filter IDs)
    const body = {
      weights: filters.weights,
      min_score: filters.minScore,
      population_min: filters.populationMin,
      population_max: filters.populationMax,
      departements: filters.departements,
      regions: filters.regions,
      search_query: filters.searchQuery,
      bounds: filters.bounds,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };

    const response = await fetchAPI<SearchResponse>('/communes/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      communes: response.communes.map(transformCommuneSummary),
      total: response.total,
      executionTimeMs: response.execution_time_ms,
    };
  },

  /**
   * Get GeoJSON data for map rendering
   */
  async getGeoJSON(params?: {
    minScore?: number | undefined;
    simplified?: boolean | undefined;
  }): Promise<CommunesGeoJSON> {
    const searchParams = new URLSearchParams();
    if (params?.minScore !== undefined) {
      searchParams.set('min_score', String(params.minScore));
    }
    if (params?.simplified !== undefined) {
      searchParams.set('simplified', String(params.simplified));
    }

    const query = searchParams.toString();
    return fetchAPI<CommunesGeoJSON>(`/geojson/communes${query ? `?${query}` : ''}`);
  },

  /**
   * Get GeoJSON with search filters
   */
  async searchGeoJSON(
    filters: SearchFilters,
    simplified = true
  ): Promise<CommunesGeoJSON> {
    const body = {
      weights: filters.weights,
      min_score: filters.minScore,
      population_min: filters.populationMin,
      population_max: filters.populationMax,
      departements: filters.departements,
      regions: filters.regions,
      search_query: filters.searchQuery,
      bounds: filters.bounds,
      limit: filters.limit || 500,
      offset: 0,
    };

    const searchParams = new URLSearchParams();
    searchParams.set('simplified', String(simplified));

    return fetchAPI<CommunesGeoJSON>(`/geojson/communes/search?${searchParams}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * Get filter options
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await fetchAPI<FilterOptionsResponse>('/filters/options');

    return {
      populationRange: response.population_range,
      departements: response.departements,
      regions: response.regions,
    };
  },

  /**
   * Get filter categories with metadata
   */
  async getFilterCategories(): Promise<FilterCategory[]> {
    const response = await fetchAPI<FilterCategoriesResponse>('/filters/categories');
    return response.categories.map(transformFilterCategory);
  },

  /**
   * Get default weights for all filters
   */
  async getDefaultWeights(): Promise<Record<string, number>> {
    return fetchAPI<Record<string, number>>('/filters/defaults');
  },

  /**
   * Get data status
   */
  async getDataStatus(): Promise<DataStatus> {
    const response = await fetchAPI<DataStatusResponse>('/filters/data-status');
    return transformDataStatus(response);
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; version: string }> {
    return fetchAPI('/health');
  },
};
