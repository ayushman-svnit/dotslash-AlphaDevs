"use client";

import { ShieldAlert, Map, AlertTriangle, Activity } from "lucide-react";
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
      <div className="w-[420px] bg-[#f5f2e9] border-r-2 border-green-900/10 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -ml-10 -mb-10" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border border-green-100 rotate-3">
             <Map className="w-12 h-12 text-[#166534]" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#166534]/40 mb-3">Intelligence Hub</p>
          <h2 className="text-3xl font-black text-[#166534] tracking-tighter uppercase leading-none">Select<br />A Region</h2>
          <p className="text-sm text-slate-500 mt-6 font-medium leading-relaxed max-w-[240px]">
            Target a marked corridor zone on the interface to initiate environmental impact diagnostics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[480px] bg-[#f5f2e9] border-r-2 border-green-900/10 overflow-y-auto flex flex-col relative dashboard-scrollbar shadow-2xl z-40">
      {/* Section A: Region Overview Card */}
      <div className="p-8 border-b border-green-900/5">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#166534] opacity-50 mb-1">Environmental Baseline</p>
            <h2 className="text-2xl font-black tracking-tighter text-[#166534] uppercase">Region Stats</h2>
          </div>
          <div className="w-10 h-10 bg-[#166534] rounded-xl flex items-center justify-center text-[#4ade80] shadow-lg">
             <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Forest Cover" value="78%" color="text-[#166534]" />
          <StatBox label="Eco Health" value="92/100" color="text-[#166534]" />
          <StatBox label="Migration Flux" value="High" color="text-amber-600" />
          <StatBox label="Risk Index" value="14%" color="text-slate-500" />
        </div>
      </div>

      {/* Section B: Road Impact Summary */}
      {analysisState === "loading" && (
        <div className="p-12 mb-auto flex flex-col items-center justify-center space-y-6">
          <div className="relative">
             <div className="w-20 h-20 border-4 border-[#166534]/10 rounded-full" />
             <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-6 h-6 text-[#166534] animate-pulse" />
             </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-[#166534] uppercase tracking-widest mb-1">Simulating Impact</p>
            <p className="text-xs font-bold text-slate-400">Generative AI is evaluating corridor alternatives...</p>
          </div>
        </div>
      )}

      {analysisState === "complete" && result && (
        <>
          <div className="p-8 border-b border-green-900/5 bg-white/40">
             <div className="flex flex-col items-center justify-center mb-10">
               <div className="relative">
                 {/* Decorative rotating ring */}
                 <div className="absolute -inset-4 border-2 border-dashed border-[#166534]/10 rounded-full animate-[spin_20s_linear_infinite]" />
                 
                 <div className={`w-40 h-40 rounded-full border-8 shadow-2xl flex flex-col items-center justify-center bg-white transition-all duration-500 ${selectedAltId ? 'border-[#4ade80]' : 'border-rose-500'}`}>
                    <span className={`text-5xl font-black tracking-tighter ${selectedAltId ? 'text-green-900' : 'text-rose-600'}`}>
                      {selectedAltId ? result.alternatives.find((a: any) => a.id === selectedAltId)?.impact_score : result.primary_impact_score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Impact Score</span>
                 </div>
               </div>

               <div className={`mt-8 px-6 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] inline-flex items-center gap-2 border shadow-lg transition-all uppercase ${selectedAltId ? 'bg-green-100 text-green-700 border-green-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                {selectedAltId ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {selectedAltId ? "OPTIMIZED TRAJECTORY" : result.damage_classification}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/60 p-5 rounded-2xl border border-white flex justify-between items-center shadow-sm">
                 <span className="text-xs font-black uppercase tracking-widest text-[#166534]">Affected Species</span>
                 <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">{result.affected_species?.join(", ") || "None"}</span>
              </div>
            </div>
          </div>

          {/* Section: AI Suggested Alternatives */}
          <div className="p-8 border-b border-green-900/5">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#166534] mb-6 flex items-center gap-3">
               <div className="w-6 h-6 rounded-lg bg-[#4ade80] flex items-center justify-center text-green-900"><Activity className="w-3.5 h-3.5" /></div>
               Generative Alternatives
            </h2>
            <div className="space-y-4">
               <button 
                 onClick={() => onSelectAlt?.(null)}
                 className={`w-full p-6 bg-white rounded-3xl border-2 text-left transition-all relative overflow-hidden group shadow-xl ${!selectedAltId ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-100 opacity-60 hover:opacity-100 hover:border-rose-200'}`}
               >
                 {!selectedAltId && <div className="absolute top-0 right-0 p-3"><AlertTriangle className="w-4 h-4 text-rose-500" /></div>}
                 <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-sm uppercase tracking-tight text-slate-900">Manual Alignment</span>
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">{result.primary_impact_score}</span>
                 </div>
                 <p className="text-xs text-slate-500 font-medium opacity-80">Baseline trajectory as currently proposed by planning department.</p>
               </button>

               {result.alternatives?.map((alt: any) => (
                 <button 
                   key={alt.id}
                   onClick={() => onSelectAlt?.(alt.id)}
                   className={`w-full p-6 bg-white rounded-3xl border-2 text-left transition-all relative group shadow-xl ${selectedAltId === alt.id ? 'border-[#4ade80] ring-4 ring-green-900/5 scale-[1.02]' : 'border-slate-100 hover:border-green-200'}`}
                 >
                   {selectedAltId === alt.id && <div className="absolute top-0 right-0 p-3"><ShieldAlert className="w-4 h-4 text-[#4ade80]" /></div>}
                   <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-sm uppercase tracking-tight text-slate-900">{alt.name}</span>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-green-100">{alt.impact_score}</span>
                   </div>
                   <p className="text-xs text-slate-600 font-medium mb-3 opacity-90 leading-relaxed">{alt.description}</p>
                   <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      <div className="text-[10px] font-black text-[#166534] uppercase tracking-widest opacity-60">Estimated Budget</div>
                      <div className="text-[11px] font-black text-green-900 bg-[#4ade80]/10 px-3 py-1 rounded-full">+ {alt.cost_increase}%</div>
                   </div>
                 </button>
               ))}
            </div>
          </div>

          <div className="p-8 bg-white/30">
             <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Segment Risk Analysis</h2>
             <div className="h-40 w-full bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChartData}>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} fontWeight={800} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} fontWeight={800} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800 }}
                       cursor={{ fill: "#f1f5f9" }} 
                    />
                    <Bar dataKey="risk" fill={selectedAltId ? "#4ade80" : "#fb7185"} radius={[6, 6, 0, 0]} barSize={24} />
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
    <div className="bg-white border-2 border-white p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
      <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 opacity-70">{label}</div>
      <div className={`text-2xl font-black tracking-tighter ${color} group-hover:scale-105 transition-transform origin-left`}>{value}</div>
    </div>
  );
}


