"use client";

import { Leaf, RefreshCcw, Activity, MapPin } from "lucide-react";
import clsx from "clsx";

interface TopBarProps {
  roadDrawn: boolean;
  pointCount: number;
  onReset: () => void;
  onAnalyse: () => void;
  mode: "PLANNING" | "ECO_ROUTE";
  onSetMode: (m: "PLANNING" | "ECO_ROUTE") => void;
}

export function TopBar({ roadDrawn, pointCount, onReset, onAnalyse, mode, onSetMode }: TopBarProps) {
  return (
    <div className="h-20 w-full bg-[#166534] text-white flex items-center justify-between px-8 shadow-[0_4px_30px_rgba(0,0,0,0.3)] z-50 flex-shrink-0 relative overflow-hidden">
      {/* Decorative SVG curve in top bar */}
      <div className="absolute top-0 right-0 h-full w-96 opacity-10 pointer-events-none">
        <svg viewBox="0 0 400 80" fill="none" className="h-full w-full">
           <path d="M0 40 Q100 0 200 40 T400 40" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-10 h-10 bg-[#4ade80] rounded-xl flex items-center justify-center">
          <Leaf className="text-green-900 h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter leading-none uppercase">ECO-ROUTE AI</h1>
          <p className="text-[10px] font-black tracking-[0.3em] text-green-400 mt-1 uppercase opacity-80">Authority Intelligence</p>
        </div>
        <div className="w-px h-8 bg-white/10 mx-6" />
        
        {/* MODE SWITCHER */}
        <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5">
           <button 
             onClick={() => onSetMode("PLANNING")}
             className={clsx(
               "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               mode === "PLANNING" ? "bg-white text-green-900 shadow-xl" : "text-white/40 hover:text-white"
             )}
           >
             Structural Planning
           </button>
           <button 
             onClick={() => onSetMode("ECO_ROUTE")}
             className={clsx(
               "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               mode === "ECO_ROUTE" ? "bg-[#4ade80] text-green-900 shadow-xl" : "text-white/40 hover:text-white"
             )}
           >
             AI Predictive Route
           </button>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2 mr-4">
          <MapPin className="h-4 w-4 text-green-300 opacity-70" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-green-300 opacity-60">
              {mode === "PLANNING" ? "Nodes" : "Endpoints"}
            </span>
            <span className="text-sm font-bold">
              {pointCount === 0 ? "None" : `${pointCount} Selected`}
            </span>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Reset
        </button>

        <button
          onClick={onAnalyse}
          disabled={mode === "PLANNING" ? !roadDrawn : pointCount < 2}
          className={clsx(
            "flex items-center gap-3 px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg",
            (mode === "PLANNING" ? roadDrawn : pointCount >= 2)
              ? "bg-[#4ade80] text-green-900 hover:bg-green-300 hover:-translate-y-0.5"
              : "bg-white/5 text-white/30 cursor-not-allowed opacity-40 border border-white/5"
          )}
        >
          <Activity className="h-4 w-4" />
          {mode === "PLANNING" ? "Analyse Impact" : "Predict Eco-Route"}
        </button>
      </div>
    </div>
  );
}
