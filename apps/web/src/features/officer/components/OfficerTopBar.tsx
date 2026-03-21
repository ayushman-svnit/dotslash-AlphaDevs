"use client";

import { Shield, Radio, Map as MapIcon, LogOut } from "lucide-react";
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
    <div className="h-16 w-full bg-[#1a2f23] text-white flex items-center justify-between px-6 shadow-md z-10 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <Shield className="text-emerald-400 h-6 w-6" />
        <h1 className="text-xl font-bold tracking-wide text-emerald-50">PATROL COMMAND</h1>
        <span className="text-slate-500 mx-2">|</span>
        <div className="flex items-center space-x-2 bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-100">ON-DUTY</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-4 text-xs font-bold text-emerald-200 uppercase tracking-widest">
          <div className="flex items-center space-x-1">
            <Radio className="h-3 w-3" />
            <span>HQ Comms: Active</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapIcon className="h-3 w-3" />
            <span>Patrol Zone: Central Corridor</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
          title="Logout"
        >
          <LogOut className="h-5 h-5" />
        </button>
      </div>
    </div>
  );
}
