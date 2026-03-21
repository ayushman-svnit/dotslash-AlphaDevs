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
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <header className="bg-amber-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">ECO-ROUTE AI | Citizen</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm border flex items-center bg-amber-800 border-amber-700 px-3 py-1 rounded">
            {user.email} (Citizen)
          </span>
          <button onClick={signOut} className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm font-semibold transition">
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1">
        <CitizenDashboard />
      </main>
    </div>
  );
}
