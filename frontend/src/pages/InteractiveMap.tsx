
import { useState, useEffect } from "react";
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
  const [mapStyle, setMapStyle] = useState<"street" | "satellite" | "terrain">("satellite");
  const { data: stops, isLoading, isError } = useStops();

  // --- THE NUCLEAR OPTION: MutationObserver ---
  useEffect(() => {
    const hideGlobalNav = () => {
      // Search all major layout containers
      const elements = document.querySelectorAll('header, nav, div');
      
      elements.forEach((el) => {
        // Identify the top navbar by checking for its unique text links
        if (
          el.textContent?.includes('DASHBOARD') &&
          el.textContent?.includes('COMMUNITY') &&
          el.tagName !== 'BODY' &&
          el.tagName !== 'HTML' &&
          el.tagName !== 'MAIN' &&
          // Prevent accidentally hiding the main left sidebar
          !el.textContent.includes('RAG Pipeline')
        ) {
          (el as HTMLElement).style.setProperty('display', 'none', 'important');
        }
      });
    };

    // 1. Run immediately just in case it's already there
    hideGlobalNav();

    // 2. Set up an observer to watch the DOM and hide it the microsecond it renders
    const observer = new MutationObserver(() => {
      hideGlobalNav();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup: Stop observing and restore the navbar when leaving the Map page
    return () => {
      observer.disconnect();
      const elements = document.querySelectorAll('header, nav, div');
      elements.forEach((el) => {
        if (el.textContent?.includes('DASHBOARD') && el.textContent?.includes('COMMUNITY') && el.tagName !== 'BODY') {
          (el as HTMLElement).style.removeProperty('display');
        }
      });
    };
  }, []);
  // --------------------------------------------

  const stopsList = (stops || []) as YatraStop[];
  const selectedStopData = selectedStop
    ? stopsList.find((s) => s.id === selectedStop)
    : null;

  const routeCoordinates = [...stopsList]
    .sort((a, b) => a.stage_number - b.stage_number)
    .map((stop) => [stop.latitude, stop.longitude] as [number, number]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-10rem)] w-full flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Spinner size="large" />
          <p className="mt-4 text-slate-400">Loading yatra stops...</p>
        </div>
      </div>
    );
  }

  if (isError || stopsList.length === 0) {
    return (
      <div className="h-[calc(100vh-10rem)] w-full flex items-center justify-center bg-slate-950">
        <div className="text-center p-6 bg-red-950/20 border border-red-900/50 rounded-xl max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-200 mb-2">
            Failed to load stops
          </h2>
          <p className="text-slate-400 text-sm">
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
    <div className="h-[calc(100vh-6rem)] w-full flex overflow-hidden border border-slate-800/60 rounded-xl shadow-2xl">
      
      {/* Sidebar - Sleek dark panels */}
      <div className="w-80 bg-slate-900/50 border-r border-slate-800/60 flex flex-col overflow-y-auto backdrop-blur-sm z-20 shrink-0">
        <div className="p-6 flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Sacred Stops
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Explore the route layout and terrain profiles
            </p>
          </div>

          {/* Map Style Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Map Style
            </label>
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-sky-500 transition"
            >
              <option value="satellite">Satellite</option>
              <option value="terrain">Topographic</option>
              <option value="street">Street Map</option>
            </select>
          </div>

          {/* Stops List */}
          <div className="space-y-2.5">
            {stopsList.map((stop) => (
              <button
                key={stop.id}
                onClick={() => setSelectedStop(stop.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                  selectedStop === stop.id
                    ? "bg-slate-800/80 border-slate-700 shadow-md"
                    : "bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      selectedStop === stop.id
                        ? "bg-sky-500 text-slate-950"
                        : "bg-slate-800 text-slate-300 border border-slate-700/50"
                    }`}
                  >
                    {stop.stage_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium text-sm truncate ${
                        selectedStop === stop.id ? "text-sky-400" : "text-slate-200"
                      }`}
                    >
                      {stop.name}
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5">
                      {stop.altitude_meters.toLocaleString()}m
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 h-full relative bg-slate-950 z-10">
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
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800/80 rounded-xl shadow-2xl p-5 max-w-sm z-[1000] max-h-[80vh] overflow-y-auto backdrop-blur-md">
            <div className="mb-3.5">
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold tracking-widest uppercase rounded-md">
                Stage {selectedStopData.stage_number}
              </span>
              <h3 className="font-bold text-lg text-slate-100 mt-1.5">
                {selectedStopData.name}
              </h3>
              {selectedStopData.name_hindi && (
                <p className="text-xs text-slate-400 font-medium">
                  {selectedStopData.name_hindi}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-800/80 text-xs">
              <div className="flex flex-col items-center p-2 bg-slate-950/50 rounded-lg border border-slate-800/40">
                <Mountain className="w-3.5 h-3.5 text-amber-500 mb-1" />
                <span className="text-[10px] text-slate-400">Altitude</span>
                <strong className="text-slate-200 mt-0.5">
                  {selectedStopData.altitude_meters.toLocaleString()}m
                </strong>
              </div>
              <div className="flex flex-col items-center p-2 bg-slate-950/50 rounded-lg border border-slate-800/40">
                <Ruler className="w-3.5 h-3.5 text-amber-500 mb-1" />
                <span className="text-[10px] text-slate-400">From Prev</span>
                <strong className="text-slate-200 mt-0.5">
                  {selectedStopData.distance_from_previous_km}km
                </strong>
              </div>
              <div className="flex flex-col items-center p-2 bg-slate-950/50 rounded-lg border border-slate-800/40">
                <MapPin className="w-3.5 h-3.5 text-amber-500 mb-1" />
                <span className="text-[10px] text-slate-400">Total Dist</span>
                <strong className="text-slate-200 mt-0.5">
                  {selectedStopData.cumulative_km}km
                </strong>
              </div>
            </div>

            {selectedStopData.description && (
              <div className="mb-3.5">
                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
                  Description
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedStopData.description}
                </p>
              </div>
            )}
            {selectedStopData.significance && (
              <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg">
                <p className="text-[11px] font-semibold tracking-wider text-amber-500 uppercase mb-1">
                  Significance
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
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