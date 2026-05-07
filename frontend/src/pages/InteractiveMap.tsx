import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { Mountain, MapPin, Ruler, AlertCircle } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useStops } from "@/hooks/useStops";
import Spinner from "@/components/ui/Spinner";
import type { YatraStop } from "@/types";

// Fix icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function InteractiveMap() {
  const [selectedStop, setSelectedStop] = useState<number | null>(null);
  const [mapStyle, setMapStyle] = useState<"street" | "satellite" | "terrain">(
    "terrain",
  );
  const { data: stops, isLoading, isError } = useStops();

  const stopsList = (stops || []) as YatraStop[];
  const selectedStopData = selectedStop
    ? stopsList.find((s) => s.id === selectedStop)
    : null;

  const routeCoordinates = [...stopsList]
    .sort((a, b) => a.stage_number - b.stage_number)
    .map((stop) => [stop.latitude, stop.longitude] as [number, number]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="large" />
          <p className="mt-4 text-gray-600">Loading yatra stops...</p>
        </div>
      </div>
    );
  }

  if (isError || stopsList.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load stops
          </h2>
          <p className="text-gray-600">
            Please check if the backend is running and stops are seeded.
          </p>
        </div>
      </div>
    );
  }

  const tileUrls = {
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  };

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sacred Stops
          </h2>

          {/* Map Style Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map Style
            </label>
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="street">Street Map</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Topographic</option>
            </select>
          </div>

          {/* Stops List */}
          <div className="space-y-2">
            {stopsList.map((stop) => (
              <button
                key={stop.id}
                onClick={() => setSelectedStop(stop.id)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedStop === stop.id
                    ? "bg-saffron-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      selectedStop === stop.id
                        ? "bg-white text-saffron-500"
                        : "bg-saffron-500 text-white"
                    }`}
                  >
                    {stop.stage_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{stop.name}</div>
                    <div className="text-sm opacity-75">
                      {stop.altitude_meters}m
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[30.42, 79.63]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url={tileUrls[mapStyle]} />

          {/* Route Line */}
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: "#E8650A",
              weight: 4,
              opacity: 0.8,
              dashArray: "10, 10",
            }}
          />

          {/* Markers */}
          {stopsList.map((stop) => (
            <Marker
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
              icon={L.divIcon({
                className: "custom-marker",
                html: `<div style="width:40px;height:40px;background:${selectedStop === stop.id ? "#DC2626" : "#E8650A"};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;box-shadow:0 4px 8px rgba(0,0,0,0.3);">${stop.stage_number}</div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
              })}
              eventHandlers={{ click: () => setSelectedStop(stop.id) }}
            >
              <Popup>
                <div className="p-3 min-w-[280px]">
                  <h3 className="font-bold text-lg text-saffron-600 mb-2">
                    {stop.name}
                  </h3>
                  {stop.name_hindi && (
                    <p className="text-sm text-gray-600 mb-3">
                      {stop.name_hindi}
                    </p>
                  )}
                  <div className="space-y-2 text-sm border-b pb-3 mb-3">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Stage:</span>
                      <span className="font-semibold">{stop.stage_number}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Altitude:</span>
                      <span className="font-semibold">
                        {stop.altitude_meters.toLocaleString()}m
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Distance from prev:</span>
                      <span className="font-semibold">
                        {stop.distance_from_previous_km}km
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Cumulative:</span>
                      <span className="font-semibold">
                        {stop.cumulative_km}km
                      </span>
                    </p>
                  </div>
                  {stop.description && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Description
                      </p>
                      <p className="text-gray-700 text-xs leading-relaxed">
                        {stop.description}
                      </p>
                    </div>
                  )}
                  {stop.significance && (
                    <div>
                      <p className="text-xs font-semibold text-saffron-600 mb-1">
                        Significance
                      </p>
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

        {/* Info Card Overlay */}
        {selectedStopData && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-[1000] max-h-[70vh] overflow-y-auto">
            <h3 className="font-bold text-xl text-saffron-600 mb-1">
              {selectedStopData.name}
            </h3>
            {selectedStopData.name_hindi && (
              <p className="text-sm text-gray-600 mb-3">
                {selectedStopData.name_hindi}
              </p>
            )}
            <div className="space-y-2 text-sm mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-gray-600" />
                <span>
                  Altitude:{" "}
                  <strong>
                    {selectedStopData.altitude_meters.toLocaleString()}m
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gray-600" />
                <span>
                  From prev:{" "}
                  <strong>
                    {selectedStopData.distance_from_previous_km}km
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span>
                  Total: <strong>{selectedStopData.cumulative_km}km</strong>
                </span>
              </div>
            </div>
            {selectedStopData.description && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Description
                </p>
                <p className="text-gray-700 text-xs leading-relaxed">
                  {selectedStopData.description}
                </p>
              </div>
            )}
            {selectedStopData.significance && (
              <div>
                <p className="text-xs font-semibold text-saffron-600 mb-1">
                  Significance
                </p>
                <p className="text-gray-700 text-xs leading-relaxed">
                  {selectedStopData.significance}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
