'use client';

/**
 * Hooks for fetching filter categories and data status from the API.
 * 
 * Filter categories are loaded dynamically from the backend based on
 * available datasets in the manifest.json.
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FilterCategory, DataStatus, FilterOptions } from '@/types';

/**
 * Fetch filter categories from the API.
 * 
 * Returns the list of available filters with metadata (name, description, icon, etc.)
 * based on the datasets configured in the backend manifest.
 */
export function useFilterCategories() {
  return useQuery<FilterCategory[], Error>({
    queryKey: ['filterCategories'],
    queryFn: () => api.getFilterCategories(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch default weights for all filters.
 * 
 * Returns a map of filter ID -> default weight (0-100).
 */
export function useDefaultWeights() {
  return useQuery<Record<string, number>, Error>({
    queryKey: ['defaultWeights'],
    queryFn: () => api.getDefaultWeights(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch data status from the API.
 * 
 * Shows which datasets are available and if the app is ready to display data.
 */
export function useDataStatus() {
  return useQuery<DataStatus, Error>({
    queryKey: ['dataStatus'],
    queryFn: () => api.getDataStatus(),
    staleTime: 30 * 1000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Poll every minute for changes
  });
}

/**
 * Fetch filter options (regions, departments, etc.)
 */
export function useFilterOptions() {
  return useQuery<FilterOptions, Error>({
    queryKey: ['filterOptions'],
    queryFn: () => api.getFilterOptions(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
