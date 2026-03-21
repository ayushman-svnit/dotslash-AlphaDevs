export function LegendBar() {
  return (
    <div className="h-12 w-full bg-white border-t border-slate-200 flex items-center justify-center space-x-6 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex-shrink-0 text-sm font-medium text-slate-600">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
        <span>Low ecological risk</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
        <span>Moderate risk</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
        <span>High risk</span>
      </div>
      <div className="h-4 w-[1px] bg-slate-300 mx-2" />
      <div className="flex items-center space-x-2">
        <div className="w-4 h-1 rounded-full bg-blue-500" />
        <span>Proposed Road</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 rounded-sm bg-slate-400/30 border border-slate-400 border-dashed" />
        <span>Impact Buffer</span>
      </div>
    </div>
  );
}
