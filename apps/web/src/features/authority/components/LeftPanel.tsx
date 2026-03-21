"use client";

import { ShieldAlert, Map, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface LeftPanelProps {
  selectedRegion: string | null;
  analysisState: "idle" | "loading" | "complete";
  result?: any;
  selectedAltId?: string | null;
  onSelectAlt?: (id: string | null) => void;
}

const mockChartData = [
  { name: "Seg 1", risk: 20 },
  { name: "Seg 2", risk: 80 },
  { name: "Seg 3", risk: 45 },
  { name: "Seg 4", risk: 90 },
];

export function LeftPanel({ 
  selectedRegion, 
  analysisState, 
  result, 
  selectedAltId, 
  onSelectAlt 
}: LeftPanelProps) {
  if (!selectedRegion) {
    return (
      <div className="w-96 bg-white border-r border-slate-200 p-6 flex flex-col items-center justify-center text-center">
        <Map className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-lg font-semibold text-slate-700">Select a Region</h2>
        <p className="text-sm text-slate-500 mt-2">
          Click on a marked polygon on the map to view environmental statistics and begin road planning.
        </p>
      </div>
    );
  }

  return (
    <div className="w-[420px] bg-white border-r border-slate-200 overflow-y-auto flex flex-col relative">
      {/* Section A: Region Overview Card */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Region Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Forest Cover" value="78%" color="text-emerald-600" />
          <StatBox label="Deforestation Risk" value="Low" color="text-amber-500" />
          <StatBox label="Habitat Quality" value="92/100" color="text-emerald-600" />
          <StatBox label="Existing Risk Index" value="14%" color="text-slate-600" />
        </div>
      </div>

      {/* Section B: Road Impact Summary */}
      {analysisState === "loading" && (
        <div className="p-10 flex flex-col items-center justify-center animate-pulse">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">Running AI Impact Simulation...</p>
        </div>
      )}

      {analysisState === "complete" && result && (
        <>
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Impact Summary</h2>
            <div className="flex flex-col items-center justify-center mb-6">
              <div className={`w-32 h-32 rounded-full border-8 ${selectedAltId ? 'border-emerald-500' : 'border-rose-500'} flex flex-col items-center justify-center shadow-inner transition-colors`}>
                <span className={`text-3xl font-black ${selectedAltId ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedAltId ? result.alternatives.find((a: any) => a.id === selectedAltId)?.impact_score : result.primary_impact_score}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Impact Score</span>
              </div>
              <div className={`mt-4 px-3 py-1 ${selectedAltId ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'} rounded-full text-xs font-black inline-flex items-center space-x-1 border shadow-sm transition-colors`}>
                <AlertTriangle className="w-3 h-3" />
                <span>{selectedAltId ? "OPTIMIZED PATH" : result.damage_classification}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                 <span className="text-slate-800">Affected Species</span>
                 <span className="text-rose-600">{result.affected_species?.join(", ") || "None Identified"}</span>
              </div>
            </div>
          </div>

          {/* Section: AI Suggested Alternatives */}
          <div className="p-6 border-b border-slate-100 bg-emerald-50/30">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center">
               <ShieldAlert className="w-3 h-3 mr-2" /> AI Suggested Alternatives
            </h2>
            <div className="space-y-3">
               <button 
                 onClick={() => onSelectAlt?.(null)}
                 className={`w-full p-4 rounded-xl border text-left transition-all ${!selectedAltId ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200' : 'border-slate-200 bg-white opacity-60 hover:opacity-100'}`}
               >
                 <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm">Proposed Alignment (Original)</span>
                    <span className="text-xs font-black text-rose-600">{result.primary_impact_score} Impact</span>
                 </div>
                 <p className="text-[10px] text-slate-500">The current manually drawn trajectory.</p>
               </button>

               {result.alternatives?.map((alt: any) => (
                 <button 
                   key={alt.id}
                   onClick={() => onSelectAlt?.(alt.id)}
                   className={`w-full p-4 rounded-xl border text-left transition-all ${selectedAltId === alt.id ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                 >
                   <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-slate-800">{alt.name}</span>
                      <span className="text-xs font-black text-emerald-600">{alt.impact_score} Impact</span>
                   </div>
                   <p className="text-[10px] text-slate-600 mb-2">{alt.description}</p>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Cost Index: +{alt.cost_increase}%
                   </div>
                 </button>
               ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50">
             <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Segment Risk Distribution</h2>
             <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChartData}>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Bar dataKey="risk" fill={selectedAltId ? "#10b981" : "#f43f5e"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">{label}</div>
      <div className={`text-lg font-black ${color}`}>{value}</div>
    </div>
  );
}
