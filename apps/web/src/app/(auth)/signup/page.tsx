"use client";

import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile, signOut, updateCurrentUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Leaf, Lock, Mail, AlertCircle, Building,
  ChevronRight, Loader2, ShieldCheck, Map, Users, TreePine,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ── Floating blob ── */
function Blob({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{ y: [0, -20, 0], scale: [1, 1.04, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={style}
    />
  );
}

const ROLES = [
  { value: "citizen",   label: "Citizen",    icon: <Users className="w-4 h-4" />,       desc: "Public eco-route navigation", bg: "#22d3ee", fg: "#0c1a1a" },
  { value: "officer",   label: "Officer",    icon: <Map className="w-4 h-4" />,          desc: "Field ranger & alert dispatch", bg: "#4ade80", fg: "#052e16" },
  { value: "authority", label: "Authority",  icon: <ShieldCheck className="w-4 h-4" />, desc: "Policy & corridor governance",  bg: "#fef08a", fg: "#1a1a1a" },
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("citizen");
  const [department, setDepartment] = useState("");
  const [officerLat, setOfficerLat] = useState("");
  const [officerLng, setOfficerLng] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (auth.currentUser) await signOut(auth);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = role === "officer" && officerLat && officerLng
        ? `${fullName}|${role.toUpperCase()}|${officerLat}|${officerLng}`
        : `${fullName}|${role.toUpperCase()}`;
      await updateProfile(userCredential.user, { displayName });
      // Re-set current user to force onAuthStateChanged to re-fire with updated profile
      await updateCurrentUser(auth, userCredential.user);
      router.push(`/${role}`);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full pl-11 pr-4 py-3.5 bg-green-950/40 border border-green-700/50 rounded-2xl text-sm text-white placeholder:text-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-green-900/60 transition-all font-medium";
  const inputClsBase =
    "w-full px-4 py-3.5 bg-green-950/40 border border-green-700/50 rounded-2xl text-sm text-white placeholder:text-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-green-900/60 transition-all font-medium";

  const selectedRole = ROLES.find(r => r.value === role)!;

  return (
    <div className="min-h-screen flex font-sans overflow-hidden bg-[#166534]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between px-20 py-14 relative overflow-hidden">
        <Blob className="w-72 h-72 bg-green-500/20 blur-3xl -top-16 -left-16" />
        <Blob className="w-56 h-56 bg-lime-400/15 blur-2xl bottom-20 right-6" style={{ animationDelay: "3s" }} />

        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 900" fill="none">
          <motion.path d="M-60 250 Q200 60 500 300 T950 200" stroke="white" strokeWidth="2" fill="none" opacity="0.12"
            animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 10, repeat: Infinity }} />
          <motion.path d="M0 700 Q300 500 600 650 T980 560" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.2"
            animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 13, repeat: Infinity, delay: 2 }} />
          <motion.circle cx="720" cy="80" r="130" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.18"
            animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 7, repeat: Infinity }} />
        </svg>

        {/* 3D Shapes */}
        <motion.div animate={{ y: [0, -18, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-16 right-10 w-32 h-32"
          style={{ filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.4))" }}>
          <svg viewBox="0 0 128 128" fill="none">
            <circle cx="64" cy="64" r="56" fill="#4ade80" opacity="0.85" />
            <circle cx="64" cy="64" r="36" fill="#166534" opacity="0.5" />
            <circle cx="64" cy="64" r="16" fill="#4ade80" opacity="0.9" />
          </svg>
        </motion.div>
        <motion.div animate={{ y: [0, 12, 0], rotate: [-2, 2, -2] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          className="absolute bottom-40 right-6"
          style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.35))" }}>
          <svg width="110" height="90" viewBox="0 0 110 90" fill="none">
            <polygon points="0,90 55,8 110,90" fill="#a3e635" opacity="0.9" />
            <polygon points="20,90 55,28 90,90" fill="#166534" opacity="0.6" />
          </svg>
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.8 }}
          className="absolute top-1/2 right-10 w-14 h-14 rounded-2xl bg-pink-500"
          style={{ boxShadow: "4px 4px 0px #0f0f0f" }} />
        <motion.div animate={{ y: [0, 14, 0], rotate: [3, -3, 3] }} transition={{ duration: 9, repeat: Infinity, delay: 0.4 }}
          className="absolute bottom-28 right-8 w-20 h-10 rounded-xl bg-orange-400"
          style={{ boxShadow: "4px 5px 0px #0f0f0f" }} />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4ade80] rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-900" />
          </div>
          <span className="font-black text-xl tracking-tight text-white uppercase">ECO-ROUTE AI</span>
        </Link>

        {/* Hero text */}
        <div className="relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xs font-black uppercase tracking-[0.4em] text-green-300 mb-4">
            Join the Platform
          </motion.p>
          <motion.h2 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl xl:text-6xl font-black tracking-tighter leading-[0.88] text-white mb-6">
            PROTECT<br /><span className="text-[#4ade80]">THE WILD.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-green-200/70 font-medium leading-relaxed max-w-sm">
            Create your account and choose your role. Authority, Officer, or Citizen — every person drives real ecological impact.
          </motion.p>

          {/* Feature chips */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-col gap-3 mt-8">
            {[
              { icon: <ShieldCheck className="w-4 h-4" />, text: "AI corridor impact simulation" },
              { icon: <Map className="w-4 h-4" />, text: "Real-time wildlife heatmaps" },
              { icon: <TreePine className="w-4 h-4" />, text: "Deforestation radar & alerts" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-green-200/80 font-medium">
                <div className="w-8 h-8 rounded-xl bg-green-700/50 flex items-center justify-center text-green-300 shrink-0">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </motion.div>
        </div>

        <p className="relative z-10 text-green-500/50 text-xs font-bold uppercase tracking-widest">
          © 2026 ECO-ROUTE AI · Environmental Intelligence
        </p>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 lg:max-w-lg flex items-center justify-center p-6 md:p-10 bg-[#0f3d20] relative overflow-hidden">
        <Blob className="w-56 h-56 bg-green-600/20 blur-3xl -top-10 -right-10" />
        <Blob className="w-40 h-40 bg-lime-400/10 blur-2xl bottom-10 left-5" style={{ animationDelay: "4s" }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-[#4ade80] rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-green-900" />
            </div>
            <span className="font-black text-lg text-white uppercase tracking-tight">ECO-ROUTE AI</span>
          </Link>

          <h1 className="text-3xl font-black tracking-tighter text-white mb-1">Create Account</h1>
          <p className="text-green-300/70 font-medium text-sm mb-8">Join the environmental intelligence platform</p>

          {/* Floating Popup Error Toast */}
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6">
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={error ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -40, scale: 0.9 }}
              className={clsx(
                "p-4 bg-red-600 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(220,38,38,0.4)] flex items-center gap-4 border border-white/20 backdrop-blur-md transition-all",
                !error && "pointer-events-none"
              )}
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Registration Error</p>
                <p className="text-xs font-bold leading-tight">{error}</p>
              </div>
              <button onClick={() => setError("")} className="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors">
                ×
              </button>
            </motion.div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-black text-green-300 uppercase tracking-widest mb-2">Full Name</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                className={inputClsBase} placeholder="John Doe" />
            </div>

            {/* Role selector — visual cards */}
            <div>
              <label className="block text-xs font-black text-green-300 uppercase tracking-widest mb-3">Select Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <button type="button" key={r.value} onClick={() => setRole(r.value)}
                    className={`relative rounded-2xl p-3 text-left transition-all border-2 ${role === r.value ? "border-white scale-105" : "border-transparent scale-100"}`}
                    style={{ background: r.bg, color: r.fg }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center mb-2">{r.icon}</div>
                    <p className="font-black text-xs">{r.label}</p>
                    <p className="text-[10px] opacity-60 font-medium leading-tight mt-0.5">{r.desc}</p>
                    {role === r.value && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-black/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-black/60" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Officer Location — only shown when Officer role is selected */}
            {role === "officer" && (
              <div>
                <label className="block text-xs font-black text-green-300 uppercase tracking-widest mb-2">
                  Posted Location <span className="text-green-500/50 normal-case font-medium">(lat, lng of your patrol zone)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number" step="any" value={officerLat}
                    onChange={e => setOfficerLat(e.target.value)}
                    className={inputClsBase} placeholder="Latitude e.g. 22.33"
                  />
                  <input
                    type="number" step="any" value={officerLng}
                    onChange={e => setOfficerLng(e.target.value)}
                    className={inputClsBase} placeholder="Longitude e.g. 80.61"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-black text-green-300 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-green-400/60" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className={inputCls} placeholder="ranger@ecoroute.ai" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-black text-green-300 uppercase tracking-widest mb-2">Department Code <span className="text-green-500/50 normal-case font-medium">(optional)</span></label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3.5 w-5 h-5 text-green-400/60" />
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
                  className={inputCls} placeholder="E.g. FOREST-DPT-11" />
              </div>
            </div>

            {/* Officer-specific Posting Location */}
            {role === "officer" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Map className="w-4 h-4 text-green-400" />
                  <span className="text-[10px] font-black text-green-300 uppercase tracking-widest">Duty Posting Location</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input 
                      type="number" step="0.0001" required 
                      placeholder="Lat (e.g. 26.91)" 
                      value={postingLat} onChange={e => setPostingLat(e.target.value)}
                      className={inputClsBase}
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="number" step="0.0001" required 
                      placeholder="Lng (e.g. 75.81)" 
                      value={postingLng} onChange={e => setPostingLng(e.target.value)}
                      className={inputClsBase}
                    />
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setPostingLat(pos.coords.latitude.toFixed(4));
                      setPostingLng(pos.coords.longitude.toFixed(4));
                    });
                  }}
                  className="w-full py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-[10px] font-black text-green-400 uppercase tracking-widest hover:bg-green-500/20 transition-all"
                >
                  📍 Use Current Location
                </button>
              </motion.div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-green-300 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-green-400/60" />
                <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls} placeholder="Min. 6 characters" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-0 rounded-full border-2 border-green-400 overflow-hidden font-bold text-base transition-all group shadow-lg disabled:opacity-60 mt-2"
            >
              <span className="flex-1 py-3.5 text-center text-white">{loading ? "Creating Account..." : "Create My Account"}</span>
              <span className="w-14 h-14 flex items-center justify-center bg-[#4ade80] group-hover:bg-green-300 transition-colors shrink-0">
                {loading ? <Loader2 className="w-5 h-5 text-green-900 animate-spin" /> : <ChevronRight className="w-5 h-5 text-green-900" />}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-green-400/60">
            Already registered?{" "}
            <Link href="/login" className="text-[#4ade80] hover:text-green-300 font-black transition-colors">
              Sign In →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
