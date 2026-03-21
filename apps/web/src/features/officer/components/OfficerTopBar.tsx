"use client";

import { Shield, Radio, Map as MapIcon, LogOut, Leaf } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function OfficerTopBar() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="h-20 w-full bg-[#166534] text-white flex items-center justify-between px-8 shadow-2xl z-50 flex-shrink-0 relative overflow-hidden">
      {/* Subtle patterns */}
      <div className="absolute top-0 right-0 h-full w-96 opacity-10 pointer-events-none">
        <svg viewBox="0 0 400 80" fill="none" className="h-full w-full">
           <path d="M0 60 Q100 20 200 60 T400 60" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-10 h-10 bg-[#4ade80] rounded-xl flex items-center justify-center">
          <Leaf className="text-green-900 h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter leading-none uppercase">PATROL COMMAND</h1>
          <p className="text-[10px] font-black tracking-[0.3em] text-green-400 mt-1 uppercase opacity-80">Field Intelligence</p>
        </div>
        <div className="w-px h-8 bg-white/10 mx-4" />
        <div className="flex items-center gap-2 bg-green-900/60 px-4 py-2 rounded-full border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
          <span className="text-[10px] font-black text-green-100 uppercase tracking-widest">On-Duty Patrol</span>
        </div>
      </div>

      <div className="flex items-center gap-8 relative z-10">
        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black uppercase tracking-widest text-green-300 opacity-50 flex items-center gap-1.5"><Radio className="w-2.5 h-2.5" /> HQ Status</span>
             <span className="text-xs font-bold text-white">Active Comms</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black uppercase tracking-widest text-green-300 opacity-50 flex items-center gap-1.5"><MapIcon className="w-2.5 h-2.5" /> Sector</span>
             <span className="text-xs font-bold text-white">Central Corridor</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full transition-all text-white group"
          title="Logout"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
