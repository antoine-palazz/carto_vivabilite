/**
 * Types for commune data and scoring system
 * 
 * Scores are now dynamic - loaded from the backend based on available datasets.
 */

/** Geographic coordinates */
export interface Coordinates {
  lat: number;
  lng: number;
}

/** Base commune information */
export interface CommuneBase {
  codeInsee: string;
  nom: string;
  departement: string;
  departementCode: string;
  region: string;
  regionCode: string;
  population: number;
  coordinates: Coordinates;
}

/**
 * Dynamic scores - keys are filter IDs from the manifest.
 * This allows adding new filters without changing the type definition.
 */
export type CommuneScores = Record<string, number>;

/** Commune with computed scores */
export interface CommuneWithScore extends CommuneBase {
  scores: CommuneScores;
  /** Weighted global score (0-100) */
  scoreGlobal: number;
}

/** Commune summary for list views */
export interface CommuneSummary {
  codeInsee: string;
  nom: string;
  departement: string;
  scoreGlobal: number;
  coordinates: Coordinates;
}

/** GeoJSON feature for a commune */
export interface CommuneGeoJSONFeature {
  type: 'Feature';
  properties: {
    codeInsee: string;
    nom: string;
    scoreGlobal: number;
    population: number;
    scores?: CommuneScores;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

/** GeoJSON collection for communes */
export interface CommunesGeoJSON {
  type: 'FeatureCollection';
  features: CommuneGeoJSONFeature[];
}

/** Score level for UI display */
export type ScoreLevel = 'excellent' | 'good' | 'average' | 'poor' | 'bad';

/** Helper to get score level from numeric score */
export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  if (score >= 20) return 'poor';
  return 'bad';
}

/**
 * Filter category metadata from the API.
 * Loaded dynamically from the backend based on available datasets.
 */
export interface FilterCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  unit: string | undefined;
  weightDefault: number;
  datasetId: string;
}

/**
 * Data status from the API.
 * Shows what data is available and if the app is ready.
 */
export interface DataStatus {
  communesAvailable: boolean;
  communesFile: string | null;
  datasets: Array<{
    id: string;
    name: string;
    enabled: boolean;
    fileExists: boolean;
    filterCount: number;
  }>;
  filterCount: number;
  ready: boolean;
}
