'use client';

import React from 'react';
import { CitizenDashboard } from '@/features/citizen';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CitizenPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-8 h-screen w-screen flex items-center justify-center bg-emerald-50 text-emerald-800">Loading Citizen Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#f5f2e9] flex flex-col font-sans">
      <header className="bg-[#166534] text-white p-5 flex justify-between items-center shadow-2xl relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#4ade80] rounded-xl flex items-center justify-center">
            <React.Suspense fallback={<div />}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-900"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8h-5l-3 3 3 3h5c0 4.18-1 6.18-2 8-2-2.48-3.5-3-9.2-4.1Z"/><path d="m14 13-3-3"/><path d="m14 17-3-3"/></svg>
            </React.Suspense>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">ECO-ROUTE AI</h1>
            <p className="text-[10px] font-black tracking-[0.3em] text-green-400 mt-1 opacity-80 uppercase">Citizen Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-xs font-black text-green-300 uppercase tracking-widest leading-none mb-1">Authenticated</span>
             <span className="text-sm font-bold text-white opacity-80">{user.email}</span>
          </div>
          <button 
            onClick={signOut} 
            className="px-6 py-2.5 bg-red-500/10 border-2 border-red-500/50 hover:bg-red-500 hover:text-white text-red-400 font-black text-xs uppercase tracking-widest rounded-full transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1">
        <CitizenDashboard />
      </main>
    </div>
  );
}
