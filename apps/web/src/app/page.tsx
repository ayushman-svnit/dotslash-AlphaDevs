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
        
        <div className="flex flex-col items-center gap-6 mb-12">
          <p className="text-lg text-gray-500 max-w-xl italic">
            "A unified platform for conservation governance, field protection, and citizen safety."
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link 
              href="/login" 
              className="px-10 py-4 bg-[#1e3a29] text-white rounded-full font-bold text-lg hover:bg-emerald-800 transition shadow-xl hover:scale-105 transform transition-all"
            >
              Sign In to Platform
            </Link>
            <Link 
              href="/signup" 
              className="px-10 py-4 bg-white text-emerald-900 border-2 border-emerald-100 rounded-full font-bold text-lg hover:bg-emerald-50 transition shadow-lg hover:scale-105 transform transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 text-left">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">🏛️ Authority</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Strategic road planning and environmental impact analysis using AI.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">🌲 Officers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Real-time field intelligence, heatmaps, and crossing alert management.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">🚗 Citizens</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Eco-safe navigation, real-time alerts, and instant wildlife reporting.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
