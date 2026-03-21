"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { Leaf, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Mock role-based routing logic
      if (email.includes("officer")) {
        router.push("/officer");
      } else if (email.includes("citizen")) {
        router.push("/citizen");
      } else {
        router.push("/authority");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        
        {/* Header Label */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Leaf className="text-emerald-600 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ECO-ROUTE AI</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Sign in to the Intelligence Platform</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                placeholder="authority@ecoroute.ai"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a29] hover:bg-emerald-800 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Authenticating..." : "Sign In Securely"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-emerald-600 hover:text-emerald-500 hover:underline transition-all">
            Request Access
          </Link>
        </div>
      </div>
    </div>
  );
}
