import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useStops } from "@/hooks/useStops";
import Spinner from "@/components/ui/Spinner";
import type { YatraStop } from "@/types";

interface ElevationProfileProps {
  selectedStop?: YatraStop | null;
  onSelect?: (stop: YatraStop) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: YatraStop }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const stop = payload[0].payload;
  return (
    <div
      className="bg-white border border-gray-300 rounded-lg
                    px-3 py-2 shadow-lg text-xs font-sans"
    >
      <p className="text-gray-900 font-semibold">{stop.name}</p>
      <p className="text-saffron-600">
        {stop.altitude_meters.toLocaleString()}m
      </p>
      <p className="text-gray-600">{stop.cumulative_km}km from Nauti</p>
    </div>
  );
}

export default function ElevationProfile({
  selectedStop,
  onSelect,
}: ElevationProfileProps) {
  const { data: stops = [], isLoading } = useStops();
  const sorted = [...(stops || [])].sort((a: YatraStop, b: YatraStop) => a.stage_number - b.stage_number);

  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Spinner size="small" />
      </div>
    );
  }

  if (!sorted.length) return null;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-4">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">Elevation Profile</h3>
        <p className="text-xs text-gray-600">Click on the chart to select a stop</p>
      </div>
      
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart
          data={sorted}
          onClick={(d: any) => {
            if (!onSelect) return;
            const activeName = d?.activeLabel;
            if (!activeName) return;
            const stop = sorted.find((s: YatraStop) => s.name === activeName);
            if (stop) onSelect(stop);
          }}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          style={{ cursor: "pointer" }}
        >
          <defs>
            <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            dataKey="altitude_meters"
            domain={[1000, 4500]}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            width={35}
          />
          <Tooltip cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }} content={<CustomTooltip />} />

          {selectedStop && (
            <ReferenceLine
              x={selectedStop.name}
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 3"
            />
          )}

          <Area
            type="monotone"
            dataKey="altitude_meters"
            stroke="#f97316"
            strokeWidth={2.5}
            fill="url(#elevGrad)"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#f97316",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wider">Total Distance</p>
          <p className="text-lg font-semibold text-gray-900">{sorted[sorted.length - 1]?.cumulative_km || 0}km</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wider">Max Altitude</p>
          <p className="text-lg font-semibold text-gray-900">{Math.max(...sorted.map(s => s.altitude_meters)).toLocaleString()}m</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wider">Stops</p>
          <p className="text-lg font-semibold text-gray-900">{sorted.length}</p>
        </div>
        {selectedStop && (
          <div className="text-center">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Selected</p>
            <p className="text-lg font-semibold text-saffron-600">{selectedStop.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}