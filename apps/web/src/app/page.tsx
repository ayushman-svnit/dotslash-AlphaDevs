import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50 text-gray-800">
      <main className="text-center p-10 bg-white rounded-3xl shadow-xl max-w-4xl border border-emerald-100">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-800 mb-6 drop-shadow-sm">
          ECO-ROUTE AI 🌍🐾
        </h1>
        <p className="text-2xl font-semibold text-emerald-800 mb-4">
          Multi-Stakeholder Environmental Intelligence
        </p>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Empowering governments to plan sustainably, forest officers to protect wildlife efficiently, and citizens to travel safely and responsibly.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
          {/* Authority Card */}
          <div className="p-6 border-2 border-slate-200 hover:border-blue-500 rounded-2xl bg-slate-50 transition drop-shadow-sm">
            <h3 className="text-xl font-bold mb-3 text-blue-900">🏛️ Policy Makers</h3>
            <p className="text-sm text-gray-600 mb-4 h-20">Access corridor intelligence, track deforestation, and use AI to evaluate the impact of new roads before they are built.</p>
            <Link href="/login?role=authority" className="block text-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              Authority Login
            </Link>
          </div>

          {/* Officer Card */}
          <div className="p-6 border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl bg-emerald-50 transition drop-shadow-sm">
            <h3 className="text-xl font-bold mb-3 text-emerald-900">🌲 Forest Officers</h3>
            <p className="text-sm text-gray-600 mb-4 h-20">View real-time movement heatmaps, manage roadkill alerts, and respond to citizen reports to protect wildlife in the field.</p>
            <Link href="/login?role=officer" className="block text-center w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">
              Ranger Login
            </Link>
          </div>

          {/* Citizen Card */}
          <div className="p-6 border-2 border-amber-200 hover:border-amber-500 rounded-2xl bg-amber-50 transition drop-shadow-sm">
            <h3 className="text-xl font-bold mb-3 text-amber-900">🚗 Citizens</h3>
            <p className="text-sm text-gray-600 mb-4 h-20">Navigate using eco-safe mapping, receive crossing alerts, and instantly report animal sightings to help conservation efforts.</p>
            <Link href="/login?role=citizen" className="block text-center w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition">
              Citizen Login
            </Link>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-6">
          <Link href="/signup" className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition shadow-lg">
            Create an Account
          </Link>
        </div>
      </main>
    </div>
  );
}
