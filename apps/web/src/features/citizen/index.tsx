'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Leaf } from 'lucide-react';
import { MapComponent } from '@/features/eco-routing/MapComponent';
import { TwoTapReporter } from '@/features/reporting/TwoTapReporter';
import { CriticalAlertOverlay } from '@/features/alerts/CriticalAlertOverlay';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  // Fallback to a static ID if the user context is missing during tests
  const userId = user?.uid || 'user-123';

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#f5f2e9] flex flex-col md:flex-row">
      <CriticalAlertOverlay userId={userId} />

      {/* Map View - Glass Container */}
      <div className="flex-1 h-[60vh] md:h-auto p-4 md:p-8 relative">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-[#166534] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] bg-white relative flex flex-col">
           <MapComponent />
           {/* Abstract floating doodles on map interface corners */}
           <div className="absolute top-6 left-6 pointer-events-none opacity-40">
             <div className="w-16 h-16 rounded-3xl bg-[#ec4899] rotate-12 shadow-[4px_4px_0px_#052e16]" />
           </div>
        </div>
      </div>

      {/* Sidebar - Neo-Brutalist Panel */}
      <div className="w-full md:w-[420px] bg-[#166534] flex flex-col p-8 relative z-10 text-white shadow-[-20px_0_50px_rgba(0,0,0,0.25)]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <Leaf className="w-32 h-32 rotate-12" />
        </div>

        <div className="relative z-10 mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-300 mb-2">Live Controls</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">Control<br /><span className="text-[#4ade80]">Center</span></h2>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-8">
           <TwoTapReporter userId={userId} />
        </div>

        <div className="mt-auto bg-[#4ade80] rounded-[2rem] p-5 text-green-950 shadow-[10px_10px_0px_rgba(0,0,0,0.2)]">
          <h3 className="text-sm font-black uppercase tracking-tight mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-green-900/10 flex items-center justify-center font-black text-xs">?</span>
            Protocols
          </h3>
          <ul className="space-y-2 font-semibold text-xs leading-snug opacity-90">
            <li className="flex gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-900 mt-1.5 shrink-0" />
               Map shows live IUCN-classified wildlife hotspots across India.
            </li>
            <li className="flex gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-900 mt-1.5 shrink-0" />
               Speed &gt;20km/h switches Reporter to Driver Mode automatically.
            </li>
            <li className="flex gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-900 mt-1.5 shrink-0" />
               Real-time alerts fire when a verified crossing is detected near you.
            </li>
            <li className="flex gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-900 mt-1.5 shrink-0" />
               Photos are AI-verified before rangers are notified via SMS.
            </li>
            <li className="flex gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-900 mt-1.5 shrink-0" />
               Offline reports sync automatically when connection is restored.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
