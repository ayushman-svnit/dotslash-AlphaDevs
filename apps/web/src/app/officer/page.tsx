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

export default function OfficerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "OFFICER") {
        router.push("/citizen"); 
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
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white font-sans">
      <OfficerTopBar />
      <div className="flex flex-1 overflow-hidden">
        <OfficerLeftPanel />
        <div className="flex-1 relative">
          <OfficerMap />
        </div>
      </div>
    </div>
  );
}
