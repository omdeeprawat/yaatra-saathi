import { useState, useCallback, useRef } from 'react';
import MapGL, {
  NavigationControl,
  ScaleControl,
  ViewStateChangeEvent,
  MapRef,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useStops } from '@/hooks/useStops';
import type { YatraStop } from '@/types';
import StopMarker from '@/components/map/StopMarker';
import StopPopup from '@/components/map/StopPopup';
import RouteLayer from '@/components/map/RouteLayer';
import StopSidebar from '@/components/map/StopSidebar';
import ElevationProfile from '@/components/map/ElevationProfile';
import Spinner from '@/components/ui/Spinner';

// Mapbox token 
// Set VITE_MAPBOX_TOKEN in frontend/.env.local
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;


const INITIAL_VIEW = {
  longitude: 79.17,
  latitude:  30.39,
  zoom:      9.5,
  pitch:     45,   
  bearing:   15,
};

export default function Map() {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [selectedStop, setSelectedStop] = useState<YatraStop | null>(null);
  const { data: stops, isLoading, isError } = useStops();

  // Fly to a stop when clicked from sidebar or marker
  const flyToStop = useCallback((stop: YatraStop) => {
    setSelectedStop(stop);
    mapRef.current?.flyTo({
      center:   [stop.longitude, stop.latitude],
      zoom:     12,
      pitch:    55,
      duration: 1200,
      essential: true,
    });
  }, []);

  const handleMarkerClick = useCallback((stop: YatraStop) => {
    flyToStop(stop);
  }, [flyToStop]);

  const handleSidebarSelect = useCallback((stop: YatraStop) => {
    flyToStop(stop);
  }, [flyToStop]);

  const handlePopupClose = useCallback(() => {
    setSelectedStop(null);
  }, []);

  const resetView = () => {
    setSelectedStop(null);
    mapRef.current?.flyTo({ ...INITIAL_VIEW, duration: 1000 });
  };

  
  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card border-amber-500/20 bg-amber-500/5 max-w-md text-center">
          <h2 className="font-sans font-semibold text-stone-200 mb-2">
            Mapbox Token Required
          </h2>
          <p className="font-body text-stone-400 text-sm leading-relaxed mb-4">
            Add your Mapbox public token to the frontend environment file:
          </p>
          <code className="block bg-mountain-900 rounded-lg px-4 py-3 font-mono text-xs text-saffron-300 text-left">
            # frontend/.env.local<br />
            VITE_MAPBOX_TOKEN=pk.eyJ1...
          </code>
          <p className="font-sans text-xs text-stone-500 mt-3">
            Get a free token at{' '}
            <a href="https://mapbox.com" target="_blank" rel="noreferrer"
               className="text-saffron-400 hover:underline">
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center flex-col gap-3">
        <Spinner size="large" />
        <p className="font-sans text-stone-400 text-sm">Loading route data...</p>
      </div>
    );
  }

  if (isError || !stops) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="card border-red-500/20 bg-red-500/5 max-w-sm text-center">
          <p className="font-sans text-red-400 text-sm">
            Failed to load route data. Make sure the backend is running and
            stops are seeded.
          </p>
          <code className="block mt-3 bg-mountain-900 rounded-lg px-4 py-2 font-mono text-xs text-saffron-300">
            python -m services.seed_stops
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">

      <StopSidebar
        stops={stops}
        selectedStop={selectedStop}
        onSelect={handleSidebarSelect}
      />

      
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Map */}
        <div className="flex-1 relative">
          <MapGL
            ref={mapRef}
            {...viewState}
            onMove={(e: ViewStateChangeEvent) => setViewState(e.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            terrain={{ source: 'mapbox-dem', exaggeration: 1.8 }}
            onClick={handlePopupClose}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Terrain source for 3D hills */}
            <MapGL.Source
              id="mapbox-dem"
              type="raster-dem"
              url="mapbox://mapbox.mapbox-terrain-dem-v1"
              tileSize={512}
              maxzoom={14}
            />

            
            <NavigationControl position="top-right" />
            <ScaleControl position="bottom-right" unit="metric" />

            {/* Route line */}
            <RouteLayer stops={stops} />

            {/* Stop markers */}
            {stops.map(stop => (
              <StopMarker
                key={stop.id}
                stop={stop}
                isSelected={selectedStop?.id === stop.id}
                onClick={handleMarkerClick}
              />
            ))}

            {/* Selected stop popup */}
            {selectedStop && (
              <StopPopup stop={selectedStop} onClose={handlePopupClose} />
            )}
          </MapGL>

          
          <button
            onClick={resetView}
            className="absolute top-4 left-4 z-10 font-sans text-xs bg-mountain-900/90 border border-mountain-600/60 text-stone-300 hover:text-stone-100 px-3 py-2 rounded-lg transition-colors shadow-lg"
          >
            Reset View
          </button>

          
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5  bg-mountain-900/85 border border-mountain-700/50  rounded-xl px-4 py-3 shadow-xl">
            <p className="font-sans text-xs text-stone-500 uppercase tracking-widest">
              Full Route
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-display text-lg text-stone-100">~280km</p>
                <p className="font-sans text-[10px] text-stone-600">Total distance</p>
              </div>
              <div className="w-px h-8 bg-mountain-700" />
              <div>
                <p className="font-display text-lg text-stone-100">4,200m</p>
                <p className="font-sans text-[10px] text-stone-600">Max altitude</p>
              </div>
              <div className="w-px h-8 bg-mountain-700" />
              <div>
                <p className="font-display text-lg text-stone-100">~20 days</p>
                <p className="font-sans text-[10px] text-stone-600">Duration</p>
              </div>
            </div>
          </div>
        </div>

        
        <ElevationProfile
          stops={stops}
          selectedStop={selectedStop}
          onSelect={flyToStop}
        />
      </div>
    </div>
  );
}