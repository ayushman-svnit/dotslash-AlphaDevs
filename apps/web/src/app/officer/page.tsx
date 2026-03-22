"use client";

import dynamic from "next/dynamic";
import { OfficerTopBar } from "@/features/officer/components/OfficerTopBar";
import { OfficerLeftPanel } from "@/features/officer/components/OfficerLeftPanel";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const OfficerMap = dynamic(() => import("@/features/officer/components/OfficerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f7f9f7] h-full">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
      <span className="text-emerald-700 font-medium">Loading Field Intelligence...</span>
    </div>
  ),
});

import { NotificationPanel } from "@/features/officer/components/NotificationPanel";
import { PostingPanel } from "@/features/officer/components/PostingPanel";
import React, { useState } from "react";

export default function OfficerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const syncPosting = async () => {
      if (!user || !user.postingLat || !user.postingLng) return;
      
      try {
        const token = await user.getIdToken(); 
        const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000";
        await fetch(`${apiBase}/api/v1/officer/posting`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            officer_id: user.uid,
            name: user.name || "Field Ranger",
            lat: user.postingLat,
            lng: user.postingLng
          })
        });
      } catch (err) {
        console.error("Auto-sync posting failed:", err);
      }
    };

    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "OFFICER") {
        router.push("/citizen"); 
      } else {
        syncPosting();
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "OFFICER") {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f7f9f7] text-emerald-700 font-medium">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        Loading Field Intelligence...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#121212] font-sans">
      <OfficerTopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <OfficerLeftPanel 
          centerLat={user.postingLat} 
          centerLng={user.postingLng} 
        />
        
        {/* Main Tactical Map Area */}
        <div className="flex-1 relative p-4 md:p-8">
           <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-[#166534] shadow-2xl relative bg-black/20 flex flex-col">
              <OfficerMap />
           </div>
        </div>

        {/* RIght Sidebar: Tactical Alerts */}
        <NotificationPanel officerId={user.uid || "OFFICER-DEFAULT"} />
      </div>
    </div>
  );
}
