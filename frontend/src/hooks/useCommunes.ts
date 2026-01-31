/**
 * React Query hooks for commune data
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useMapStore } from '@/stores/mapStore';
import { useFilterStore } from '@/stores/filterStore';
import type { SearchFilters } from '@/types';

// Query keys
export const queryKeys = {
  communes: ['communes'] as const,
  commune: (codeInsee: string) => ['communes', codeInsee] as const,
  search: (filters: SearchFilters) => ['communes', 'search', filters] as const,
  geojson: (minScore?: number) => ['geojson', minScore] as const,
  filterOptions: ['filterOptions'] as const,
  health: ['health'] as const,
};

/**
 * Hook to fetch a single commune by code INSEE
 */
export function useCommune(codeInsee: string | null) {
  return useQuery({
    queryKey: codeInsee ? queryKeys.commune(codeInsee) : ['commune-null'],
    queryFn: () => (codeInsee ? api.getCommune(codeInsee) : Promise.resolve(null)),
    enabled: !!codeInsee,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch communes list
 */
export function useCommunes(params?: {
  limit?: number;
  offset?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: [...queryKeys.communes, params],
    queryFn: () => api.getCommunes(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to search communes with custom weights
 */
export function useSearchCommunes(weights: Record<string, number>) {
  const { minScore, population, searchQuery, departements, regions } = useFilterStore();
  const { setCommunes, setLoading, setError } = useMapStore();

  const filters: SearchFilters = {
    weights,
    minScore,
    populationMin: population.enabled ? population.min : undefined,
    populationMax: population.enabled ? population.max : undefined,
    searchQuery: searchQuery || undefined,
    departements: departements.length > 0 ? departements : undefined,
    regions: regions.length > 0 ? regions : undefined,
    // Don't use viewport bounds - we want all communes visible on the map
    bounds: undefined,
    // No limit - we want all communes for the GeoJSON map
    limit: undefined,
  };

  const query = useQuery({
    queryKey: queryKeys.search(filters),
    queryFn: async () => {
      setLoading(true);
      try {
        // Fetch both search results and GeoJSON
        const [searchResult, geojson] = await Promise.all([
          api.searchCommunes(filters),
          api.searchGeoJSON(filters, true),
        ]);

        setCommunes(geojson);
        return searchResult;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return query;
}

/**
 * Hook to fetch GeoJSON data
 */
export function useGeoJSON(minScore?: number) {
  const { setCommunes, setLoading, setError } = useMapStore();

  const query = useQuery({
    queryKey: queryKeys.geojson(minScore),
    queryFn: async () => {
      setLoading(true);
      try {
        const geojson = await api.getGeoJSON({ minScore, simplified: true });
        setCommunes(geojson);
        return geojson;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur de chargement');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  return query;
}

/**
 * Hook to check API health
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.healthCheck(),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook to initialize map data on mount
 */
export function useInitializeMap() {
  const { setLoading, setCommunes, setError } = useMapStore();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const geojson = await api.getGeoJSON({ simplified: true });
        setCommunes(geojson);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    void loadInitialData();
  }, [setLoading, setCommunes, setError]);
}
