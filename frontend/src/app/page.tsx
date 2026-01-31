import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { ScoreCard } from '@/components/map/ScoreCard';
import { Legend } from '@/components/map/Legend';
import { MobileFilterSheet } from '@/components/filters/MobileFilterSheet';

// Dynamic import for Leaflet (no SSR)
const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-carte-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-carte-border-default border-t-carte-accent-primary" />
        <p className="text-carte-text-secondary">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-carte-bg-primary">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="relative flex flex-1 overflow-hidden">
        {/* Desktop filter panel - hidden on mobile */}
        <aside className="hidden lg:flex lg:w-88 xl:w-96 flex-shrink-0 flex-col border-r border-carte-border-subtle">
          <FilterPanel />
        </aside>

        {/* Map container */}
        <div className="relative flex-1">
          <MapContainer />

          {/* Score card overlay - appears when commune is selected */}
          <ScoreCard />

          {/* Legend overlay */}
          <Legend />
        </div>

        {/* Mobile filter sheet - visible only on mobile */}
        <MobileFilterSheet />
      </main>
    </div>
  );
}
