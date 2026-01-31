import { create } from 'zustand';
import type { CommunesGeoJSON, Coordinates } from '@/types';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface SelectedCommune {
  codeInsee: string;
  nom: string;
  scoreGlobal: number;
  coordinates: Coordinates;
}

interface MapStoreState {
  // State
  communes: CommunesGeoJSON | null;
  selectedCommune: SelectedCommune | null;
  viewportBounds: ViewportBounds | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCommunes: (communes: CommunesGeoJSON) => void;
  setSelectedCommune: (commune: SelectedCommune | null) => void;
  setViewportBounds: (bounds: ViewportBounds) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSelection: () => void;
}

export const useMapStore = create<MapStoreState>()((set) => ({
  communes: null,
  selectedCommune: null,
  viewportBounds: null,
  isLoading: false,
  error: null,

  setCommunes: (communes) => {
    set({ communes, error: null });
  },

  setSelectedCommune: (commune) => {
    set({ selectedCommune: commune });
  },

  setViewportBounds: (bounds) => {
    set({ viewportBounds: bounds });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  clearSelection: () => {
    set({ selectedCommune: null });
  },
}));
