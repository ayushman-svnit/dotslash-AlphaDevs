'use client';

import React from 'react';
import { AlertOctagon, Timer } from 'lucide-react';
import { useAlertWebSocket } from '@/lib/hooks/useAlertWebSocket';

export const CriticalAlertOverlay = ({ userId = 'user-123' }: { userId?: string }) => {
  const { activeAlerts } = useAlertWebSocket(userId);

  const criticalAlerts = activeAlerts.filter(a => a.urgency_level === 'Critical' || a.time_to_collision_sec < 10);

  if (criticalAlerts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-20 px-4">
      {/* Full screen red pulsing border for massive visibility */}
      <div className="absolute inset-0 border-[12px] border-red-600 animate-pulse pointer-events-none" />
      
      {criticalAlerts.map((alert, idx) => (
        <div 
          key={idx}
          className="bg-red-600 text-white p-6 rounded-2xl shadow-2xl max-w-md w-full border-4 border-white pointer-events-auto transform transition-all animate-bounce"
        >
          <div className="flex items-start gap-4">
            <AlertOctagon size={48} className="animate-pulse" />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider mb-1">
                CRITICAL WARNING
              </h2>
              <p className="text-red-100 font-semibold text-lg mb-3">
                {alert.species_id} detected on your route!
              </p>
              
              <div className="flex items-center gap-2 bg-red-800/50 rounded-lg p-3">
                <Timer size={24} className="text-red-200" />
                <span className="font-mono text-xl font-bold">
                  Time to intersection: {alert.time_to_collision_sec}s
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
