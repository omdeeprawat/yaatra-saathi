import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStops } from '@/hooks/useStops';
import Spinner from '@/components/ui/Spinner';
import type { YatraStop } from '@/types';

// Fix Leaflet default icon issue with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom marker icon (saffron colored)
const createCustomIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: #E8650A;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export default function LeafletMap() {
  const { data: stops, isLoading, isError } = useStops();

  const stopsList = (stops || []) as YatraStop[];

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Spinner size="large" />
      </div>
    );
  }

  if (isError || stopsList.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load stops</p>
          <p className="text-sm text-gray-600">Ensure the backend is running and stops are seeded.</p>
        </div>
      </div>
    );
  }

  // Route line coordinates sorted by stage
  const routeCoordinates = [...stopsList]
    .sort((a, b) => a.stage_number - b.stage_number)
    .map(stop => [stop.latitude, stop.longitude] as [number, number]);

  console.log('Route coordinates:', routeCoordinates);
  console.log('Stops list:', stopsList);

  // Calculate bounds to center map on the entire route
  let mapCenter: [number, number] = [30.4200, 79.6300];
  if (routeCoordinates.length > 0) {
    const lats = stopsList.map(s => s.latitude);
    const lons = stopsList.map(s => s.longitude);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    mapCenter = [centerLat, centerLon];
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        {/* Base Map Layer - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Line - rendered before markers so it's underneath */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#E8650A',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: '8, 6',
            }}
          />
        )}

        {/* Markers for each stop */}
        {stopsList.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={createCustomIcon(stop.stage_number)}
          >
            <Popup>
              <div className="p-3 min-w-[280px] max-w-sm">
                <h3 className="font-bold text-lg text-saffron-600 mb-2">
                  {stop.name}
                </h3>
                {stop.name_hindi && (
                  <p className="text-sm text-gray-600 mb-3 font-devanagari">{stop.name_hindi}</p>
                )}
                <div className="space-y-2 text-sm border-b pb-3 mb-3">
                  <p className="flex justify-between">
                    <span className="text-gray-600 font-medium">Stage:</span>
                    <span className="font-semibold text-gray-900">{stop.stage_number}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600 font-medium">Altitude:</span>
                    <span className="font-semibold text-gray-900">{stop.altitude_meters.toLocaleString()}m</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600 font-medium">Distance from prev:</span>
                    <span className="font-semibold text-gray-900">{stop.distance_from_previous_km}km</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600 font-medium">Cumulative:</span>
                    <span className="font-semibold text-gray-900">{stop.cumulative_km}km</span>
                  </p>
                </div>
                {stop.description && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Description</p>
                    <p className="text-gray-700 text-xs leading-relaxed">
                      {stop.description}
                    </p>
                  </div>
                )}
                {stop.significance && (
                  <div>
                    <p className="text-xs font-semibold text-saffron-600 uppercase mb-1">Significance</p>
                    <p className="text-gray-700 text-xs leading-relaxed">
                      {stop.significance}
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}


