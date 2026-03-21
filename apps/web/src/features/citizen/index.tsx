'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { MapComponent } from '@/features/eco-routing/MapComponent';
import { TwoTapReporter } from '@/features/reporting/TwoTapReporter';
import { CriticalAlertOverlay } from '@/features/alerts/CriticalAlertOverlay';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  // Fallback to a static ID if the user context is missing during tests
  const userId = user?.uid || 'user-123';

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50 flex flex-col md:flex-row">
      <CriticalAlertOverlay userId={userId} />
      
      {/* Map View takes up majority of the screen */}
      <div className="flex-1 h-[60vh] md:h-auto p-4 md:p-8">
        <MapComponent />
      </div>

      {/* Side panel / Bottom panel for controls */}
      <div className="w-full md:w-96 bg-white shadow-xl border-l border-slate-200 flex flex-col items-center justify-center p-6 shrink-0 relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 self-start">Control Panel</h2>
        
        <TwoTapReporter userId={userId} />

        <div className="mt-8 p-4 bg-amber-50 rounded-xl text-amber-900 border border-amber-200 text-sm w-full">
          <p className="font-semibold mb-1">How it works:</p>
          <ul className="list-disc pl-5 space-y-1 opacity-90">
            <li>The map displays standard routes minimizing wildlife collision probability.</li>
            <li>Drive safely! If you exceed 20km/h, the reporter switches to Driver Mode.</li>
            <li>Alerts will pop up universally if a crossing is detected ahead.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
