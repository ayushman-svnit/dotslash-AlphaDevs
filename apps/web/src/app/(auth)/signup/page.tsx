"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { Leaf, Lock, Mail, AlertCircle, UserPlus, Building } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("citizen");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Remove any lingering user session data first before signing up new
      if (auth.currentUser) {
        await signOut(auth);
      }

      // Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Define schema: store Role onto the DisplayName for the AuthContext to read, 
      // preventing the need for a separate db roundtrip
      await updateProfile(userCredential.user, {
        displayName: `${fullName}|${role.toUpperCase()}`
      });
      
      router.push(`/${role}`);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Email may be in use.");
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
            <UserPlus className="text-emerald-600 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Join ECO-ROUTE AI</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Register for Environmental Access</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Role Status</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              >
                <option value="citizen">Citizen</option>
                <option value="officer">Officer</option>
                <option value="authority">Authority</option>
              </select>
            </div>
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                placeholder="ranger@ecoroute.ai"
              />
            </div>
          </div>

          {/* Department Code - Mock */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Department Code (Optional)</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                placeholder="E.g., FOREST-DPT-11"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                placeholder="Min. 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a29] hover:bg-emerald-800 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-500 hover:underline transition-all">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
