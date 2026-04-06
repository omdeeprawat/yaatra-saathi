import { Source, Layer } from 'react-map-gl';
import type{ YatraStop } from '@/types';

interface RouteLayerProps {
  stops: YatraStop[];
}

export default function RouteLayer({ stops: rawStops }: RouteLayerProps) {
  // Sort stops by stage_number to draw the line in order
  const stops = [...rawStops].sort((a, b) => a.stage_number - b.stage_number);

  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: stops.map(s => [s.longitude, s.latitude]),
        },
      },
    ],
  };

  return (
    <Source id="route" type="geojson" data={geojson}>
      
      <Layer
        id="route-glow"
        type="line"
        paint={{
          'line-color': '#f97316',
          'line-width': 8,
          'line-opacity': 0.15,
          'line-blur': 4,
        }}
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
      />

      
      <Layer
        id="route-line"
        type="line"
        paint={{
          'line-color': '#f97316',
          'line-width': 2.5,
          'line-opacity': 0.9,
          'line-dasharray': [4, 2],
        }}
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
      />
    </Source>
  );
}