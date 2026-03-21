"use client";

import { Leaf, RefreshCcw, Activity } from "lucide-react";
import clsx from "clsx";

interface TopBarProps {
  selectedRegion: string | null;
  roadDrawn: boolean;
  onReset: () => void;
  onAnalyse: () => void;
}

export function TopBar({ selectedRegion, roadDrawn, onReset, onAnalyse }: TopBarProps) {
  return (
    <div className="h-16 w-full bg-[#1e3a29] text-white flex items-center justify-between px-6 shadow-md z-10 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <Leaf className="text-emerald-400 h-6 w-6" />
        <h1 className="text-xl font-bold tracking-wide">ECO-ROUTE AI</h1>
        <span className="text-slate-400 mx-2">|</span>
        <span className="text-emerald-100 font-medium">
          {selectedRegion ? `Region: ${selectedRegion}` : "No Region Selected"}
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/10"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="text-sm font-semibold">Reset</span>
        </button>

        <button
          onClick={onAnalyse}
          disabled={!roadDrawn}
          className={clsx(
            "flex items-center space-x-2 shadow-sm px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
            roadDrawn
              ? "bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer hover:-translate-y-0.5"
              : "bg-slate-600/50 text-slate-400 cursor-not-allowed opacity-60"
          )}
        >
          <Activity className="h-4 w-4" />
          <span>Analyse Impact</span>
        </button>
      </div>
    </div>
  );
}
