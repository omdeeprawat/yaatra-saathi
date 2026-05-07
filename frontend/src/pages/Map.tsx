import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import InteractiveMap from "@/pages/InteractiveMap";
import ElevationProfile from "@/components/map/ElevationProfile";
import type { YatraStop } from "@/types";

export default function MapPage() {
  const [selectedStop, setSelectedStop] = useState<YatraStop | null>(null);

  return (
    <AppShell
      title="Route Map"
      subtitle="Explore the 22 sacred stops from Nauti to Homkund"
      contentClassName="p-0 lg:p-0"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 overflow-hidden">
          <InteractiveMap />
        </div>

        {/* Elevation Profile */}
        <div className="border-t border-mountain-700">
          <ElevationProfile
            selectedStop={selectedStop}
            onSelect={setSelectedStop}
          />
        </div>
      </div>
    </AppShell>
  );
}
