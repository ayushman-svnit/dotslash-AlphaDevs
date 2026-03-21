"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/features/authority/components/TopBar";
import { LeftPanel } from "@/features/authority/components/LeftPanel";
import { LegendBar } from "@/features/authority/components/LegendBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapArea = dynamic(() => import("@/features/authority/components/MapArea").then(m => m.MapArea), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f5f2e9] h-full">
      <Loader2 className="w-8 h-8 animate-spin text-[#166534] mb-4" />
      <span className="text-[#166534] font-black uppercase tracking-widest text-[10px]">Booting Systems...</span>
    </div>
  ),
});

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [roadPoints, setRoadPoints] = useState<{ lat: number, lng: number }[]>([]);
  const [analysisState, setAnalysisState] = useState<"idle" | "loading" | "complete">("idle");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedAltId, setSelectedAltId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "AUTHORITY") {
        router.push("/citizen"); // Fallback for wrong role
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "AUTHORITY") {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Authority Intelligence...</div>;
  }

  const handleReset = () => {
    setSelectedRegion(null);
    setRoadPoints([]);
    setAnalysisState("idle");
    setAnalysisResult(null);
    setSelectedAltId(null);
  };

  const handleAnalyse = async () => {
    setAnalysisState("loading");
    try {
      const response = await fetch("http://localhost:8000/api/v1/authority/road-planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: roadPoints.map(p => [p.lat, p.lng]),
          zone_id: selectedRegion
        })
      });
      const data = await response.json();
      setAnalysisResult(data);
      setAnalysisState("complete");
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisState("idle");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f5f2e9] font-sans">
      <TopBar 
        selectedRegion={selectedRegion}
        roadDrawn={roadPoints.length > 1}
        onReset={handleReset}
        onAnalyse={handleAnalyse}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <LeftPanel 
          selectedRegion={selectedRegion}
          analysisState={analysisState}
          result={analysisResult}
          selectedAltId={selectedAltId}
          onSelectAlt={setSelectedAltId}
        />
        <div className="flex-1 relative p-4 md:p-8">
           <div className="w-full h-full rounded-[3rem] overflow-hidden border-4 border-[#166534] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] bg-white flex flex-col relative">
              <MapArea 
                selectedRegion={selectedRegion}
                onSelectRegion={(region) => {
                  if (analysisState === "idle") {
                      setSelectedRegion(region);
                      setRoadPoints([]); 
                  }
                }}
                roadPoints={roadPoints}
                onAddRoadPoint={(point) => {
                  if (analysisState === "idle") setRoadPoints(prev => [...prev, point]);
                }}
                analysisState={analysisState}
                alternatives={analysisResult?.alternatives || []}
                selectedAltId={selectedAltId}
              />
           </div>
        </div>
      </div>
      
      <LegendBar />
    </div>
  );
}
