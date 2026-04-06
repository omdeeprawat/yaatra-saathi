import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type{ YatraStop } from '@/types';

interface ElevationProfileProps {
  stops: YatraStop[];
  selectedStop: YatraStop | null;
  onSelect: (stop: YatraStop) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: YatraStop }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const stop = payload[0].payload;
  return (
    <div className="bg-mountain-900 border border-mountain-600/60 rounded-lg
                    px-3 py-2 shadow-xl text-xs font-sans">
      <p className="text-stone-200 font-medium">{stop.name}</p>
      <p className="text-saffron-400">{stop.altitude_meters.toLocaleString()}m altitude</p>
      <p className="text-stone-500">{stop.cumulative_km}km from Nauti</p>
    </div>
  );
}

export default function ElevationProfile({ stops, selectedStop, onSelect }: ElevationProfileProps) {
  const sorted = [...stops].sort((a, b) => a.stage_number - b.stage_number);

  return (
    <div className="h-28 bg-mountain-900/90 border-t border-mountain-700/50 px-4 pt-2 pb-1">
      <p className="font-sans text-[10px] text-stone-600 uppercase tracking-widest mb-1">
        Elevation Profile
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={sorted}
          onClick={d => d?.activePayload?.[0] && onSelect(d.activePayload[0].payload)}
          style={{ cursor: 'pointer' }}
        >
          <defs>
            <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: '#6B7280', fontFamily: 'DM Sans' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="altitude_meters"
            domain={[1000, 4500]}
            tick={{ fontSize: 9, fill: '#6B7280', fontFamily: 'DM Sans' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${(v/1000).toFixed(1)}k`}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} />

          
          {selectedStop && (
            <ReferenceLine
              x={selectedStop.name}
              stroke="#f97316"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}

          <Area
            type="monotone"
            dataKey="altitude_meters"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#elevGrad)"
            dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 1.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}