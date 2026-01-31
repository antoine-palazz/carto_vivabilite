/**
 * API response types
 */

import type { CommuneWithScore, CommuneSummary, CommunesGeoJSON } from './commune';
import type { FilterOptions } from './filters';

/** Generic paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/** API error response */
export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

/** Health check response */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
}

/** Communes list response */
export type CommunesResponse = PaginatedResponse<CommuneSummary>;

/** Single commune response */
export type CommuneDetailResponse = CommuneWithScore;

/** Search results response */
export interface SearchResponse {
  communes: CommuneSummary[];
  total: number;
  executionTimeMs: number;
}

/** GeoJSON response */
export type GeoJSONResponse = CommunesGeoJSON;

/** Filter options response */
export type FilterOptionsResponse = FilterOptions;
