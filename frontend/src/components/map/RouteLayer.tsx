import { Polyline } from "react-leaflet";
import type { YatraStop } from "@/types";

interface RouteLayerProps {
  stops: YatraStop[];
}

export default function RouteLayer({ stops: rawStops }: RouteLayerProps) {
  const stops = [...rawStops].sort((a, b) => a.stage_number - b.stage_number);
  const coords = stops.map(
    (s) => [s.latitude, s.longitude] as [number, number],
  );

  return (
    <Polyline
      positions={coords}
      pathOptions={{
        color: "#f97316",
        weight: 4,
        opacity: 0.9,
        dashArray: "4 2",
      }}
    />
  );
}
