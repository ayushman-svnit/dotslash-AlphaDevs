"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface Point {
  lat: number;
  lng: number;
}

interface MapAreaProps {
  mode: "PLANNING" | "ECO_ROUTE";
  roadPoints: Point[];
  onAddRoadPoint: (point: Point) => void;
  analysisState: "idle" | "loading" | "complete";
  alternatives?: any[];
  ecoRoute?: any;
  ecoPositions?: [number, number][];
  selectedAltId?: string | null;
}

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#e9f2eb] h-full">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
      <span className="text-emerald-700 font-medium">Booting GIS Engine...</span>
    </div>
  ),
});

export function MapArea({ alternatives, selectedAltId, ecoRoute, ecoPositions, mode, ...props }: MapAreaProps) {
  return (
    <div className="flex-1 relative z-0">
      <LeafletMap 
        mode={mode}
        alternatives={alternatives} 
        selectedAltId={selectedAltId} 
        ecoRoute={ecoRoute}
        ecoPositions={ecoPositions}
        {...props} 
      />

      {/* Contextual instruction tooltips */}
      {props.analysisState === "idle" && mode === "PLANNING" && props.roadPoints.length === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl pointer-events-none animate-bounce z-[999]">
          Click on India to draw your proposed road alignment nodes.
        </div>
      )}

      {props.analysisState === "idle" && mode === "ECO_ROUTE" && props.roadPoints.length < 2 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.3)] pointer-events-none animate-[pulse_2s_infinite] z-[999]">
          Select your {props.roadPoints.length === 0 ? "STARTING POINT" : "DESTINATION"} point.
        </div>
      )}
    </div>
  );
}
