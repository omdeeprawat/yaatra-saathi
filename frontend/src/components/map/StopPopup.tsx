import { Popup } from 'react-map-gl';
import { X, Mountain, TrendingUp, Route } from 'lucide-react';
import type { YatraStop } from '@/types';

interface StopPopupProps {
  stop: YatraStop;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  start:       '🏁 Starting Point',
  camp:        '⛺ Camp',
  bugyal:      '🌿 Alpine Meadow',
  destination: '🏔 Sacred Destination',
};

const TYPE_COLORS: Record<string, string> = {
  start:       'text-saffron-400 bg-saffron-500/10 border-saffron-500/30',
  camp:        'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  bugyal:      'text-green-400 bg-green-500/10 border-green-500/30',
  destination: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
};

export default function StopPopup({ stop, onClose }: StopPopupProps) {
  return (
    <Popup
      longitude={stop.longitude}
      latitude={stop.latitude}
      anchor="top"
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      maxWidth="320px"
      className="yatra-popup"
    >
      <div className="bg-mountain-900 border border-mountain-600/60 rounded-xl shadow-2xl overflow-hidden w-72">

        
        <div className="flex items-start justify-between p-4 pb-3 border-b border-mountain-700/50">
          <div>
            <div className={`inline-flex items-center gap-1.5 text-xs font-sans font-medium px-2 py-0.5 rounded-full border mb-2
                             ${TYPE_COLORS[stop.stop_type]}`}>
              {TYPE_LABELS[stop.stop_type]}
            </div>
            <h3 className="font-display text-base text-stone-100 leading-tight">
              {stop.name}
            </h3>
            {stop.name_hindi && (
              <p className="font-sans text-sm text-stone-500">{stop.name_hindi}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-300 transition-colors ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

       
        <div className="grid grid-cols-3 divide-x divide-mountain-700/50 border-b border-mountain-700/50">
          {[
            { icon: Mountain, label: 'Altitude', value: `${stop.altitude_meters.toLocaleString()}m` },
            { icon: TrendingUp, label: 'Stage', value: `Day ${stop.stage_number}` },
            { icon: Route, label: 'Total km', value: `${stop.cumulative_km}km` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center py-3 gap-0.5">
              <Icon className="w-3.5 h-3.5 text-saffron-400 mb-0.5" />
              <span className="font-sans text-xs font-semibold text-stone-200">{value}</span>
              <span className="font-sans text-[10px] text-stone-600 uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        
        {stop.description && (
          <div className="p-4 pb-3">
            <p className="font-body text-xs text-stone-300 leading-relaxed">
              {stop.description}
            </p>
          </div>
        )}

        
        {stop.significance && (
          <div className="px-4 pb-4">
            <div className="p-3 rounded-lg bg-saffron-500/5 border border-saffron-500/20">
              <p className="font-sans text-[10px] text-saffron-300 uppercase tracking-wider font-medium mb-1">
                Significance
              </p>
              <p className="font-body text-xs text-stone-400 leading-relaxed">
                {stop.significance}
              </p>
            </div>
          </div>
        )}

        
        {stop.distance_from_previous_km > 0 && (
          <div className="px-4 pb-4 flex items-center gap-2">
            <span className="font-sans text-xs text-stone-500">
              {stop.distance_from_previous_km}km from previous stop
            </span>
          </div>
        )}
      </div>
    </Popup>
  );
}