import type { YatraStop } from '@/types';
import { Mountain, ChevronRight } from 'lucide-react';

interface StopSidebarProps {
  stops: YatraStop[];
  selectedStop: YatraStop | null;
  onSelect: (stop: YatraStop) => void;
}

const TYPE_DOT: Record<string, string> = {
  start:       'bg-saffron-500',
  camp:        'bg-indigo-400',
  bugyal:      'bg-green-400',
  destination: 'bg-pink-400',
};

const TYPE_LABEL: Record<string, string> = {
  start:       'Start',
  camp:        'Camp',
  bugyal:      'Bugyal',
  destination: 'End',
};

export default function StopSidebar({ stops, selectedStop, onSelect }: StopSidebarProps) {
  const sorted = [...stops].sort((a, b) => a.stage_number - b.stage_number);
  const totalKm = sorted[sorted.length - 1]?.cumulative_km ?? 0;

  return (
    <div className="w-64 bg-mountain-900/95 border-r border-mountain-700/50 flex flex-col overflow-hidden shrink-0">

      <div className="p-4 border-b border-mountain-700/50">
        <div className="flex items-center gap-2 mb-1">
          <Mountain className="w-4 h-4 text-saffron-400" />
          <span className="font-sans text-xs text-saffron-400 uppercase tracking-widest">
            Route
          </span>
        </div>
        <h2 className="font-display text-sm text-stone-100">Nauti → Homkund</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-sans text-xs text-stone-500">
            {sorted.length} stops
          </span>
          <span className="w-px h-3 bg-mountain-700" />
          <span className="font-sans text-xs text-stone-500">
            ~{totalKm}km total
          </span>
        </div>
      </div>

      
      <div className="px-4 py-2 border-b border-mountain-700/30 flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(TYPE_DOT).map(([type, cls]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cls}`} />
            <span className="font-sans text-[10px] text-stone-500 capitalize">
              {TYPE_LABEL[type]}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {sorted.map((stop, idx) => {
          const isSelected = selectedStop?.id === stop.id;
          const isLast = idx === sorted.length - 1;

          return (
            <div key={stop.id} className="relative">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-[27px] top-8 bottom-0 w-px bg-mountain-700/50 z-0" />
              )}

              <button
                onClick={() => onSelect(stop)}
                className={`relative z-10 w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150
                            ${isSelected
                              ? 'bg-saffron-500/10 border-r-2 border-saffron-500'
                              : 'hover:bg-mountain-800/50'
                            }`}
              >
                
                <div className={`w-5 h-5 rounded-full border-2 border-mountain-600 flex items-center justify-center shrink-0
                                 ${isSelected ? 'border-saffron-500' : ''}
                                 ${TYPE_DOT[stop.stop_type] ?? 'bg-indigo-400'}`}>
                  <span className="text-[8px] text-white font-bold font-sans">
                    {stop.stage_number}
                  </span>
                </div>

                
                <div className="flex-1 min-w-0">
                  <p className={`font-sans text-xs font-medium truncate
                                 ${isSelected ? 'text-saffron-300' : 'text-stone-300'}`}>
                    {stop.name}
                  </p>
                  <p className="font-sans text-[10px] text-stone-600">
                    {stop.altitude_meters.toLocaleString()}m · {stop.cumulative_km}km
                  </p>
                </div>

                {isSelected && (
                  <ChevronRight className="w-3.5 h-3.5 text-saffron-400 shrink-0" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}