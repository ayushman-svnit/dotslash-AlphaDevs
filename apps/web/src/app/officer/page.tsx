'use client';

import React from 'react';
import { OfficerDashboard } from '@/features/officer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function OfficerPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) return <div className="p-8">Loading...</div>;

  if (!user) {
    router.push('/login?role=officer');
    return null;
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      <header className="bg-emerald-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">ECO-ROUTE AI | Field Operations</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm border flex items-center bg-emerald-800 border-emerald-700 px-3 py-1 rounded">
            {user.email} (Forest Officer)
          </span>
          <button onClick={signOut} className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm font-semibold transition">
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1">
        <OfficerDashboard />
      </main>
    </div>
  );
}
