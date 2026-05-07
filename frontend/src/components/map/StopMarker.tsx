import { Marker } from "react-leaflet";
import L from "leaflet";
import type { YatraStop } from "@/types";

interface StopMarkerProps {
  stop: YatraStop;
  isSelected: boolean;
  onClick: (stop: YatraStop) => void;
}

const TYPE_COLORS: Record<string, string> = {
  start: "#f97316",
  camp: "#6366f1",
  bugyal: "#22c55e",
  destination: "#ec4899",
};

export default function StopMarker({
  stop,
  isSelected,
  onClick,
}: StopMarkerProps) {
  const color = TYPE_COLORS[stop.stop_type] ?? "#6366f1";
  const sizePx = stop.stop_type === "camp" ? 14 : 20;

  const scale = isSelected ? 1.35 : 1;

  const labelHtml =
    stop.stop_type === "start" ||
    stop.stop_type === "destination" ||
    stop.stop_type === "bugyal"
      ? `<div style="position:absolute; left:50%; top:-34px; transform:translateX(-50%); white-space:nowrap; background:rgba(17,24,39,0.9); color:white; font-size:10px; padding:3px 6px; border-radius:8px; border-bottom:2px solid ${color};">${stop.name}</div>`
      : "";

  const markerHtml = `
    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
      ${labelHtml}
      <div style="width:${sizePx}px; height:${sizePx}px; background:${color}; border:2px solid #fff; border-radius:50%; box-shadow:0 4px 8px rgba(0,0,0,0.15); transform:scale(${scale});"></div>
    </div>
  `;

  const icon = L.divIcon({
    html: markerHtml,
    className: "",
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2],
  });

  return (
    <Marker
      position={[stop.latitude, stop.longitude]}
      icon={icon}
      eventHandlers={{
        click: (e: any) => {
          e?.originalEvent?.stopPropagation?.();
          onClick(stop);
        },
      }}
    />
  );
}
