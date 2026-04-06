import { Marker } from 'react-map-gl';
import type { YatraStop } from '@/types';

interface StopMarkerProps {
  stop: YatraStop;
  isSelected: boolean;
  onClick: (stop: YatraStop) => void;
}

const TYPE_COLORS: Record<string, string> = {
  start:       '#f97316',  
  camp:        '#6366f1',  
  bugyal:      '#22c55e',  
  destination: '#ec4899',  
};

const TYPE_SIZE: Record<string, string> = {
  start:       'w-5 h-5',
  camp:        'w-3.5 h-3.5',
  bugyal:      'w-4 h-4',
  destination: 'w-5 h-5',
};

export default function StopMarker({ stop, isSelected, onClick }: StopMarkerProps) {
  const color = TYPE_COLORS[stop.stop_type] ?? '#6366f1';
  const size  = TYPE_SIZE[stop.stop_type]  ?? 'w-3.5 h-3.5';

  return (
    <Marker
      longitude={stop.longitude}
      latitude={stop.latitude}
      anchor="center"
      onClick={(e:any) => { e.originalEvent.stopPropagation(); onClick(stop); }}
    >
      <div
        className={`relative cursor-pointer transition-transform duration-150
                    ${isSelected ? 'scale-150 z-10' : 'hover:scale-125'}`}
        title={stop.name}
      >
        
        {isSelected && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-60"
            style={{ backgroundColor: color, transform: 'scale(1.8)' }}
          />
        )}

        
        <div
          className={`${size} rounded-full border-2 border-white shadow-lg`}
          style={{ backgroundColor: color }}
        />

        
        {(stop.stop_type === 'start' || stop.stop_type === 'destination' || stop.stop_type === 'bugyal') && (
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-mountain-900/90 text-white text-[10px] font-sans font-medium px-1.5 py-0.5 rounded pointer-events-none shadow-lg"
            style={{ borderBottom: `2px solid ${color}` }}
          >
            {stop.name}
          </div>
        )}
      </div>
    </Marker>
  );
}