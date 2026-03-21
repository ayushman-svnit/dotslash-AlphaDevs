"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface Point {
  lat: number;
  lng: number;
}

interface MapAreaProps {
  selectedRegion: string | null;
  onSelectRegion: (region: string) => void;
  roadPoints: Point[];
  onAddRoadPoint: (point: Point) => void;
  analysisState: "idle" | "loading" | "complete";
  alternatives?: any[];
  selectedAltId?: string | null;
}

// Leaflet requires window, so we must disable SSR for this component
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#e9f2eb] h-full">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
      <span className="text-emerald-700 font-medium">Booting GIS Engine...</span>
    </div>
  ),
});

export function MapArea({ alternatives, selectedAltId, ...props }: MapAreaProps) {
  return (
    <div className="flex-1 relative z-0">
      <LeafletMap alternatives={alternatives} selectedAltId={selectedAltId} {...props} />
      
      {/* Contextual instruction tooltip */}
      {props.selectedRegion && props.analysisState === "idle" && props.roadPoints.length === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl pointer-events-none animate-bounce z-[999]">
          Click inside the map to draw your proposed road alignment.
        </div>
      )}
    </div>
  );
}
