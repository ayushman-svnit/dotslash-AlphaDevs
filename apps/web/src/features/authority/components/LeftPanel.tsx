"use client";

import { ShieldCheck, Map, AlertTriangle, Activity, Navigation, Info, TrendingDown } from "lucide-react";

interface LeftPanelProps {
  mode: "PLANNING" | "ECO_ROUTE";
  analysisState: "idle" | "loading" | "complete";
  result?: any;
  selectedAltId?: string | null;
  onSelectAlt?: (id: string | null) => void;
}

export function LeftPanel({ 
  mode,
  analysisState, 
  result, 
  selectedAltId, 
  onSelectAlt 
}: LeftPanelProps) {
  
  if (analysisState === "idle") {
    return (
      <div className="w-[420px] bg-[#f5f2e9] border-r-2 border-green-900/10 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border border-green-100 rotate-3">
             <Map className={`w-12 h-12 ${mode === "PLANNING" ? 'text-[#166534]' : 'text-blue-600'}`} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#166534]/40 mb-3">
            {mode === "PLANNING" ? "Infrastructure Intelligence" : "AI Eco-Corridor Hub"}
          </p>
          <h2 className="text-3xl font-black text-[#166534] tracking-tighter uppercase leading-none">
            {mode === "PLANNING" ? "Draw Road" : "Select Path"}
          </h2>
          <p className="text-sm text-slate-500 mt-6 font-medium leading-relaxed max-w-[240px]">
            {mode === "PLANNING" ? 
              "Click map to drop nodes for your road alignment proposal." : 
              "Select a START and END point on the map to find the safest eco-path."}
          </p>
        </div>
      </div>
    );
  }

  if (analysisState === "loading") {
    return (
      <div className="w-[480px] bg-[#0c120c] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden z-20 transition-all duration-700">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] -mr-20 -mt-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col items-center w-full">
           <div className="mb-12 relative">
             <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
             <div className="w-48 h-48 rounded-full border-[10px] border-emerald-900/30 flex items-center justify-center relative">
                <div className="absolute inset-0 border-t-8 border-green-500 rounded-full animate-spin" />
                <Activity className="w-16 h-16 text-green-500 animate-pulse" />
             </div>
           </div>

           <p className="text-xs font-black uppercase tracking-[0.5em] text-green-500 mb-4 animate-pulse">
             Cognitive AI Sync
           </p>
           <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-8">
             Analyzing <br/> Movement <br/> Patterns
           </h2>

           <div className="w-full h-2 bg-emerald-900/40 rounded-full overflow-hidden mb-4 border border-emerald-800/30">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 w-[65%] animate-[progress_3s_ease-in-out_infinite]" />
           </div>

           <div className="space-y-2 w-full">
              {["Mapping Biodiversity Nodes...", "Calculating Connectivity Loss...", "Optimizing Corridor Detours..."].map((s, i) => (
                <div key={i} className={`text-[10px] font-bold uppercase tracking-widest ${i === 1 ? 'text-white' : 'text-emerald-800'}`}>
                   {s}
                </div>
              ))}
           </div>
        </div>
        
        <style jsx>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  // ECO_ROUTE Results Section
  if (mode === "ECO_ROUTE" && analysisState === "complete" && result) {
    const meta = result.metadata || {};
    return (
      <div className="w-[480px] bg-[#f5f2e9] border-r-2 border-green-900/10 overflow-y-auto flex flex-col relative shadow-2xl z-40">
        <div className="p-8 border-b border-green-900/5">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">AI Predictive Intelligence</p>
           <h2 className="text-2xl font-black tracking-tighter text-[#166534] uppercase">Safest Trail Result</h2>
        </div>

        <div className="p-8 border-b border-green-900/5 bg-white/40">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="relative">
              <div className="absolute -inset-4 border-2 border-dashed border-blue-400/20 rounded-full animate-[spin_25s_linear_infinite]" />
              <div className="w-40 h-40 rounded-full border-8 border-blue-500 shadow-2xl flex flex-col items-center justify-center bg-white">
                 <span className="text-5xl font-black tracking-tighter text-blue-700">{meta.best_composite_score?.toFixed(2)}</span>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Safety Index</span>
              </div>
            </div>
            <div className="mt-8 px-6 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] bg-blue-100 text-blue-700 border border-blue-200 shadow-lg uppercase inline-flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              ECO-SAFE AI PATH V2
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/60 p-4 rounded-2xl border border-white">
               <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">Total Distance</span>
               <span className="text-lg font-black text-slate-900">{(meta.total_route_distance_m / 1000).toFixed(2)} km</span>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-white">
               <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">Analysis Points</span>
               <span className="text-lg font-black text-slate-900">{meta.total_points}</span>
            </div>
          </div>

          <div className="bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-50"><Navigation className="w-8 h-8 rotate-45" /></div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Primary Zone Verdict</p>
             <h3 className="text-2xl font-black tracking-tighter uppercase mb-4">{meta.best_overall_zone}</h3>
             <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-tight uppercase tracking-tight">AI chose this detour to avoid high-risk segments identified at 100m resolution.</p>
             </div>
          </div>
        </div>

        <div className="p-8">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 inline-flex items-center gap-2">
             <TrendingDown size={14} className="text-green-600" />
             Biodiversity Cost Mitigation
           </h3>
           <div className="space-y-3">
             {["Forest Canopy Preservation", "Migratory Gap Integrity", "Sound Pollution Buffer"].map((feat, i) => (
                <div key={i} className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-slate-50 shadow-sm">
                   <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">{feat}</span>
                   <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase">OPTIMIZED</span>
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // PLANNING Results Section
  if (mode === "PLANNING" && analysisState === "complete" && result) {
    return (
      <div className="w-[480px] bg-[#f5f2e9] border-r-2 border-green-900/10 overflow-y-auto flex flex-col relative shadow-2xl z-40">
        <div className="p-8 border-b border-green-900/5">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-1">GIS Spatial Audit</p>
           <h2 className="text-2xl font-black tracking-tighter text-[#166534] uppercase">Impact Assessment</h2>
        </div>

        <div className="p-8 border-b border-green-900/5 bg-white/40">
          <div className="flex items-center gap-6 mb-8">
            <div className={`w-28 h-28 rounded-3xl flex flex-col items-center justify-center border-4 ${
              parseInt(result.primary_impact_score) > 50 ? 'border-rose-500 bg-rose-50' : 'border-emerald-500 bg-emerald-50'
            }`}>
               <span className="text-4xl font-black tracking-tighter text-slate-900">{result.primary_impact_score}</span>
               <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Impact</span>
            </div>
            <div>
               <h3 className={`text-xl font-black uppercase tracking-tight ${
                  result.damage_classification.includes('CRITICAL') ? 'text-rose-600' : 'text-emerald-700'
               }`}>
                 {result.damage_classification}
               </h3>
               <p className="text-[10px] font-bold text-slate-500 max-w-[200px] leading-tight mt-1 uppercase">
                 This score measures potential biodiversity loss and corridor fragmentation.
               </p>
            </div>
          </div>

          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Affected Endangered Species</h4>
          <div className="flex flex-wrap gap-2 mb-8">
            {result.affected_species?.length > 0 ? (
              result.affected_species.map((sp: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 uppercase">
                  {sp}
                </span>
              ))
            ) : (
              <span className="text-[10px] font-bold text-emerald-600 italic">No critical sightings identified in this radius.</span>
            )}
          </div>
        </div>

        <div className="p-8">
           <h3 className="text-xs font-black uppercase tracking-widest text-[#166534] mb-4">Mitigation Alternatives</h3>
           <div className="space-y-4">
             {result.alternatives?.map((alt: any) => (
                <button 
                  key={alt.id}
                  onClick={() => onSelectAlt?.(selectedAltId === alt.id ? null : alt.id)}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-all ${
                    selectedAltId === alt.id 
                      ? 'bg-[#166534] border-[#166534] text-white shadow-xl scale-[1.02]' 
                      : 'bg-white border-white hover:border-emerald-500 shadow-sm'
                  }`}
                >
                   <div className="flex justify-between items-start mb-2">
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                       selectedAltId === alt.id ? 'bg-white/20' : 'bg-emerald-50 text-emerald-700'
                     }`}>{alt.id.replace('_', ' ')}</span>
                     <span className={`text-xs font-black ${selectedAltId === alt.id ? 'text-green-300' : 'text-emerald-600'}`}>Score: {alt.impact_score}</span>
                   </div>
                   <h4 className="text-sm font-black uppercase tracking-tight mb-1">{alt.name}</h4>
                   <p className={`text-[10px] font-medium leading-tight mb-3 ${selectedAltId === alt.id ? 'text-white/70' : 'text-slate-500'}`}>{alt.description}</p>
                   <div className="flex items-center justify-between text-[10px] font-black uppercase">
                      <span className={selectedAltId === alt.id ? 'text-green-200' : 'text-rose-500'}>Cost +{alt.cost_increase}%</span>
                      {selectedAltId === alt.id && <span className="animate-pulse">Active on Map</span>}
                   </div>
                </button>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return <div className="w-[420px] bg-[#f5f2e9] border-r-2 border-green-900/10" />;
}
