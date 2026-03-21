"use client";

import { useState } from "react";
import { TopBar } from "@/features/authority/components/TopBar";
import { LeftPanel } from "@/features/authority/components/LeftPanel";
import { MapArea } from "@/features/authority/components/MapArea";
import { LegendBar } from "@/features/authority/components/LegendBar";

export default function DashboardPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [roadPoints, setRoadPoints] = useState<{ lat: number, lng: number }[]>([]);
  const [analysisState, setAnalysisState] = useState<"idle" | "loading" | "complete">("idle");

  const handleReset = () => {
    setSelectedRegion(null);
    setRoadPoints([]);
    setAnalysisState("idle");
  };

  const handleAnalyse = () => {
    setAnalysisState("loading");
    // Simulate complex AI/GIS processing
    setTimeout(() => {
      setAnalysisState("complete");
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <TopBar 
        selectedRegion={selectedRegion}
        roadDrawn={roadPoints.length > 1}
        onReset={handleReset}
        onAnalyse={handleAnalyse}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel 
          selectedRegion={selectedRegion}
          analysisState={analysisState}
        />
        <MapArea 
          selectedRegion={selectedRegion}
          onSelectRegion={(region) => {
            if (analysisState === "idle") {
                setSelectedRegion(region);
                setRoadPoints([]); // clear old drawing if switching regions
            }
          }}
          roadPoints={roadPoints}
          onAddRoadPoint={(point) => {
            if (analysisState === "idle") setRoadPoints(prev => [...prev, point]);
          }}
          analysisState={analysisState}
        />
      </div>
      
      <LegendBar />
    </div>
  );
}
