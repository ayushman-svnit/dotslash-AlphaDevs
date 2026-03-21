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
  
  // App Modes: PLANNING (Standard multiple points) vs ECO_ROUTE (Start to End prediction)
  const [operationMode, setOperationMode] = useState<"PLANNING" | "ECO_ROUTE">("PLANNING");
  
  // States for Road Planning
  const [roadPoints, setRoadPoints] = useState<{ lat: number, lng: number }[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedAltId, setSelectedAltId] = useState<string | null>(null);

  // States for Eco-Route Prediction
  const [ecoPoints, setEcoPoints] = useState<{ lat: number, lng: number }[]>([]);
  const [ecoRouteResult, setEcoRouteResult] = useState<any>(null);

  const [analysisState, setAnalysisState] = useState<"idle" | "loading" | "complete">("idle");

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === "OFFICER") {
        router.push("/officer");
      } else if (user.role === "CITIZEN") {
        router.push("/citizen");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "AUTHORITY") {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading Authority Intelligence...</div>;
  }

  const handleReset = () => {
    setRoadPoints([]);
    setEcoPoints([]);
    setAnalysisState("idle");
    setAnalysisResult(null);
    setEcoRouteResult(null);
    setSelectedAltId(null);
  };

  const handleAnalyse = async () => {
    setAnalysisState("loading");
    try {
      if (operationMode === "PLANNING") {
        if (roadPoints.length === 0) {
          alert("Please click the map to draw at least one point to analyze!");
          setAnalysisState("idle");
          return;
        }

        const res = await fetch("/api/authority/road-planning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: roadPoints.map(pt => [pt.lat, pt.lng]) })
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);
        const result = await res.json();
        setAnalysisResult(result);
      } else {
        // ECO_ROUTE Prediction Logic
        if (ecoPoints.length < 2) {
          alert("Eco-Route requires both a START and END point. Please select two locations on the map.");
          setAnalysisState("idle");
          return;
        }

        const res = await fetch("/api/authority/eco-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start: ecoPoints[0],
            end: ecoPoints[1]
          })
        });

        if (!res.ok) {
           const err = await res.json();
           throw new Error(err.error || `ML Engine Error ${res.status}`);
        }
        
        const result = await res.json();
        console.log("[EcoRoute] Result received:", result.status, "| points:", result.positions?.length ?? 0, "| sample:", result.positions?.slice(0, 2));
        setEcoRouteResult(result);
      }
      
      setAnalysisState("complete");
    } catch (error: any) {
      console.error("[EcoRoute] Full Error JSON:", JSON.stringify(error, null, 2));
      console.error("[EcoRoute] Source stack:", error.stack);
      alert(`ML Routing failed: ${error.message || "Request Error"}. Check console for details.`);
      setAnalysisState("idle");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f5f2e9] font-sans">
      <TopBar
        mode={operationMode}
        onSetMode={(m) => {
          handleReset();
          setOperationMode(m);
        }}
        roadDrawn={operationMode === "PLANNING" ? roadPoints.length > 0 : ecoPoints.length >= 2}
        pointCount={operationMode === "PLANNING" ? roadPoints.length : ecoPoints.length}
        onReset={handleReset}
        onAnalyse={handleAnalyse}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <LeftPanel
          mode={operationMode}
          analysisState={analysisState}
          result={operationMode === "PLANNING" ? analysisResult : ecoRouteResult}
          selectedAltId={selectedAltId}
          onSelectAlt={setSelectedAltId}
        />
        <div className="flex-1 relative p-4 md:p-8">
           <div className="w-full h-full rounded-[3rem] overflow-hidden border-4 border-[#166534] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] bg-white flex flex-col relative">
              <MapArea
                mode={operationMode}
                roadPoints={operationMode === "PLANNING" ? roadPoints : ecoPoints}
                onAddRoadPoint={(point) => {
                  if (analysisState !== "idle") return;
                  if (operationMode === "PLANNING") {
                    setRoadPoints(prev => [...prev, point]);
                  } else {
                    if (ecoPoints.length < 2) setEcoPoints(prev => [...prev, point]);
                  }
                }}
                analysisState={analysisState}
                alternatives={analysisResult?.alternatives || []}
                ecoRoute={ecoRouteResult?.geojson}
                ecoPositions={ecoRouteResult?.positions}
                selectedAltId={selectedAltId}
              />
           </div>
        </div>
      </div>

      <LegendBar />
    </div>
  );
}
