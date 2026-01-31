'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/stores/mapStore';
import { interpolateScoreColor } from '@/lib/utils';

// France bounds
const FRANCE_BOUNDS: L.LatLngBoundsExpression = [
  [41.0, -5.5], // Southwest
  [51.5, 10.0], // Northeast
];

const FRANCE_CENTER: L.LatLngExpression = [46.603354, 1.888334];
const DEFAULT_ZOOM = 6;

// Use Canvas renderer for better performance with 34k+ features
const canvasRenderer = L.canvas({ padding: 0.5 });

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapContainer() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const selectedCodeRef = useRef<string | null>(null);

  const { communes, selectedCommune, setSelectedCommune } = useMapStore();

  // Memoize style function to avoid recalculation
  const getFeatureStyle = useCallback((score: number, isSelected: boolean) => ({
    fillColor: interpolateScoreColor(score),
    fillOpacity: isSelected ? 0.85 : 0.55,
    color: isSelected ? '#1e293b' : '#64748b',
    weight: isSelected ? 2 : 0.3,
    opacity: isSelected ? 1 : 0.5,
    renderer: canvasRenderer, // Use Canvas for performance
  }), []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(containerRef.current, {
      center: FRANCE_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 5,
      maxZoom: 18,
      maxBounds: FRANCE_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: true,
    });

    // Add light-themed tile layer for better commune visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;

    // Update map store with bounds on move
    const updateBounds = () => {
      const bounds = map.getBounds();
      useMapStore.getState().setViewportBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    };

    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    updateBounds();

    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON layer when communes change (not on selection change)
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing layer
    if (geoJsonLayerRef.current) {
      mapRef.current.removeLayer(geoJsonLayerRef.current);
    }

    if (!communes || communes.features.length === 0) return;

    console.log(`Rendering ${communes.features.length} communes...`);
    const startTime = performance.now();

    // Create new GeoJSON layer with Canvas renderer for performance
    const geoJsonLayer = L.geoJSON(communes as GeoJSON.FeatureCollection, {
      renderer: canvasRenderer, // Canvas is much faster than SVG for many features
      style: (feature) => {
        const props = feature?.properties as { score_global?: number; code_insee?: string } | undefined;
        const score: number = props?.score_global ?? 50;
        const isSelected = props?.code_insee === selectedCodeRef.current;
        return getFeatureStyle(score, isSelected);
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties as {
          code_insee: string;
          nom: string;
          score_global: number;
          population: number;
        };

        // Tooltip - only bind on demand for better performance
        layer.bindTooltip(
          `<div class="font-sans">
            <div class="font-semibold">${props.nom}</div>
            <div class="text-xs opacity-70">
              Score: ${Math.round(props.score_global)}%
            </div>
          </div>`,
          {
            permanent: false,
            direction: 'top',
            className: 'leaflet-tooltip-custom',
          }
        );

        // Click handler
        layer.on('click', () => {
          setSelectedCommune({
            codeInsee: props.code_insee,
            nom: props.nom,
            scoreGlobal: props.score_global,
            coordinates: {
              lat: (layer as L.Polygon).getBounds().getCenter().lat,
              lng: (layer as L.Polygon).getBounds().getCenter().lng,
            },
          });
        });

        // Simplified hover - just change opacity, no border weight change
        layer.on('mouseover', () => {
          (layer as L.Path).setStyle({ fillOpacity: 0.85 });
        });

        layer.on('mouseout', () => {
          const isSelected = props.code_insee === selectedCodeRef.current;
          (layer as L.Path).setStyle({ fillOpacity: isSelected ? 0.85 : 0.55 });
        });
      },
    });

    geoJsonLayer.addTo(mapRef.current);
    geoJsonLayerRef.current = geoJsonLayer;

    console.log(`Rendered ${communes.features.length} communes in ${(performance.now() - startTime).toFixed(0)}ms`);

    return () => {
      if (mapRef.current && geoJsonLayerRef.current) {
        mapRef.current.removeLayer(geoJsonLayerRef.current);
      }
    };
  }, [communes, setSelectedCommune, getFeatureStyle]);

  // Update selected commune ref (without re-rendering all features)
  useEffect(() => {
    selectedCodeRef.current = selectedCommune?.codeInsee ?? null;
  }, [selectedCommune]);

  // Pan to selected commune
  useEffect(() => {
    if (!mapRef.current || !selectedCommune) return;

    mapRef.current.panTo([selectedCommune.coordinates.lat, selectedCommune.coordinates.lng], {
      animate: true,
      duration: 0.5,
    });
  }, [selectedCommune]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ background: 'var(--color-bg-primary)' }}
    />
  );
}
