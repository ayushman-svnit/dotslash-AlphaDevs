'use client';

import React from 'react';
import { AuthorityDashboard } from '@/features/authority';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthorityPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) return <div className="p-8">Loading...</div>;

  if (!user) {
    router.push('/login?role=authority');
    return null;
  }

  if (user.role && user.role !== 'AUTHORITY' && user.user_metadata?.role !== 'authority') {
     // strict check if needed, but for now just render
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">ECO-ROUTE AI | Authority</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm border flex items-center bg-blue-800 border-blue-700 px-3 py-1 rounded">
            {user.email} (Higher Authority)
          </span>
          <button onClick={signOut} className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm font-semibold transition">
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1">
        <AuthorityDashboard />
      </main>
    </div>
  );
}
