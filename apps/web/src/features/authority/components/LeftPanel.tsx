"use client";

import { ShieldAlert, Map, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface LeftPanelProps {
  selectedRegion: string | null;
  analysisState: "idle" | "loading" | "complete";
}

const mockChartData = [
  { name: "Seg 1", risk: 20 },
  { name: "Seg 2", risk: 80 },
  { name: "Seg 3", risk: 45 },
  { name: "Seg 4", risk: 90 },
];

export function LeftPanel({ selectedRegion, analysisState }: LeftPanelProps) {
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
    <div className="w-[420px] bg-white border-r border-slate-200 overflow-y-auto flex flex-col">
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
          <p className="text-sm font-medium text-slate-500">Running Impact Simulation...</p>
        </div>
      )}

      {analysisState === "complete" && (
        <>
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Impact Summary</h2>
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-32 h-32 rounded-full border-8 border-rose-500 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-rose-600">84</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Impact Score</span>
              </div>
              <div className="mt-4 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-black inline-flex items-center space-x-1 border border-rose-200 shadow-sm">
                <AlertTriangle className="w-3 h-3" />
                <span>HIGH ECOLOGICAL DAMAGE</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Forest Area Affected</span>
                <span className="text-slate-800 font-bold">12.4 km²</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">High Risk Segments</span>
                <span className="text-rose-600 font-bold inline-flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> 4 segments</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Wildlife Corridors Cut</span>
                <span className="text-rose-600 font-bold inline-flex items-center"><ShieldAlert className="w-3 h-3 mr-1" /> 2 paths</span>
              </div>
            </div>
          </div>

          {/* Section C: Charts Area */}
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Segment Risk Distribution</h2>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData}>
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="risk" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section D: Smart Recommendation */}
          <div className="p-6 bg-amber-50/50">
            <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
              <div className="flex space-x-3">
                <AlertTriangle className="text-amber-500 shrink-0 w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">AI Recommendation</h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Proposed alignment intersects a high-density elephant migration habitat.
                    Consider shifting the alignment <strong>2km South</strong> or allocating budget for a <strong>Wildlife Underpass</strong> at Segment 2 and 4.
                  </p>
                </div>
              </div>
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
