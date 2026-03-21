export function LegendBar() {
  return (
    <div className="h-14 w-full bg-[#f5f2e9] border-t-2 border-green-900/10 flex items-center justify-center gap-10 px-8 z-50 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Low Risk Zone</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Moderate Warning</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Critical Habitat</span>
      </div>
      <div className="w-px h-6 bg-slate-300 mx-2" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-1 rounded-full bg-blue-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proposed Alignment</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-md bg-slate-400/10 border-2 border-slate-400/30 border-dashed" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Impact Buffer Area</span>
      </div>
    </div>
  );
}
