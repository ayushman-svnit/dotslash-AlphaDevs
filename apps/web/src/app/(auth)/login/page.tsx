"use client";

import { useState, Suspense } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { Leaf, Lock, Mail, AlertCircle, Loader2, ChevronRight, ShieldCheck, Map, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ── Floating shape helpers ── */
function Blob({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{ y: [0, -24, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      style={style}
    />
  );
}

function LoginForm() {
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const displayName = userCredential.user.displayName || "";
      const [, roleStr] = displayName.split("|");
      const role = (roleStr || "CITIZEN").toUpperCase();
      if (role === "OFFICER") router.push("/officer");
      else if (role === "AUTHORITY") router.push("/authority");
      else router.push("/citizen");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-11 pr-4 py-3.5 bg-green-950/40 border border-green-700/50 rounded-2xl text-sm text-white placeholder:text-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-green-900/60 transition-all font-medium";

  return (
    <div className="min-h-screen flex font-sans overflow-hidden bg-[#166534]">

      {/* ── LEFT PANEL (hero side) ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-14 relative overflow-hidden">
        {/* Background abstract shapes */}
        <Blob className="w-80 h-80 bg-green-500/20 blur-3xl -top-20 -left-20" />
        <Blob className="w-64 h-64 bg-lime-400/15 blur-2xl bottom-20 right-10" style={{ animationDelay: "2s" }} />

        {/* SVG curves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 900" fill="none">
          <motion.path d="M-40 200 Q200 80 450 280 T900 180" stroke="white" strokeWidth="2" fill="none" opacity="0.15"
            animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 9, repeat: Infinity }} />
          <motion.path d="M100 700 Q350 520 600 680 T950 580" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.2"
            animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 2 }} />
          <motion.circle cx="700" cy="100" r="120" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.2"
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 6, repeat: Infinity }} />
          <motion.circle cx="60" cy="780" r="90" stroke="white" strokeWidth="1.5" fill="none" opacity="0.12"
            animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 8, repeat: Infinity, delay: 1 }} />
        </svg>

        {/* Geometric 3D-style shapes */}
        <motion.div animate={{ y: [0, -16, 0], rotate: [0, 4, 0] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 right-10 w-28 h-28" style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.4))" }}>
          <svg viewBox="0 0 112 112" fill="none">
            <rect x="8" y="8" width="96" height="96" rx="24" fill="#4ade80" opacity="0.9" />
            <rect x="24" y="24" width="64" height="64" rx="16" fill="#166534" opacity="0.5" />
          </svg>
        </motion.div>
        <motion.div animate={{ y: [0, 14, 0], rotate: [-3, 3, -3] }} transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute bottom-36 right-8"
          style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.35))" }}>
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
            <polygon points="0,100 60,10 120,100" fill="#a3e635" opacity="0.85" />
            <polygon points="20,100 60,30 100,100" fill="#166534" opacity="0.6" />
          </svg>
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          className="absolute top-1/2 left-8 w-16 h-16 rounded-2xl bg-orange-400"
          style={{ boxShadow: "5px 5px 0px #0f0f0f" }} />

        {/* Branding content */}
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4ade80] rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-900" />
          </div>
          <span className="font-black text-xl tracking-tight text-white uppercase">ECO-ROUTE AI</span>
        </Link>

        <div className="relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xs font-black uppercase tracking-[0.4em] text-green-300 mb-4">
            Intelligence Platform
          </motion.p>
          <motion.h2 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.7, ease: [0.22,1,0.36,1] }}
            className="text-5xl xl:text-6xl font-black tracking-tighter leading-[0.88] text-white mb-6">
            WELCOME<br /><span className="text-[#4ade80]">BACK.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-green-200/70 font-medium leading-relaxed max-w-sm">
            Sign in to access your role-specific dashboard — real-time wildlife intelligence, corridor mapping, and eco-routing at your fingertips.
          </motion.p>

          {/* Role chips */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex gap-3 mt-8 flex-wrap">
            {[
              { label: "Authority", icon: <ShieldCheck className="w-3.5 h-3.5" />, bg: "#fef08a", fg: "#1a1a1a" },
              { label: "Officer", icon: <Map className="w-3.5 h-3.5" />, bg: "#4ade80", fg: "#052e16" },
              { label: "Citizen", icon: <Users className="w-3.5 h-3.5" />, bg: "#22d3ee", fg: "#0c1a1a" },
            ].map((r) => (
              <span key={r.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black" style={{ background: r.bg, color: r.fg }}>
                {r.icon}{r.label}
              </span>
            ))}
          </motion.div>
        </div>

        <p className="relative z-10 text-green-500/50 text-xs font-bold uppercase tracking-widest">
          © 2026 ECO-ROUTE AI • Environmental Intelligence
        </p>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 lg:max-w-lg flex items-center justify-center p-6 md:p-12 bg-[#0f3d20] relative overflow-hidden">
        <Blob className="w-64 h-64 bg-green-600/20 blur-3xl -top-10 -right-10" />
        <Blob className="w-48 h-48 bg-lime-400/10 blur-2xl bottom-10 left-5" style={{ animationDelay: "3s" }} />

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

          <h1 className="text-3xl font-black tracking-tighter text-white mb-1">Sign In</h1>
          <p className="text-green-300/70 font-medium text-sm mb-8">Access your intelligence dashboard</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-green-300 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-green-400/60 w-5 h-5" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className={inputCls} placeholder="ranger@ecoroute.ai" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-green-300 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-green-400/60" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className={inputCls} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-0 rounded-full border-2 border-green-400 overflow-hidden font-bold text-base transition-all group shadow-lg disabled:opacity-60 mt-2"
            >
              <span className="flex-1 py-3.5 text-center text-white">{loading ? "Authenticating..." : "Sign In Securely"}</span>
              <span className="w-14 h-14 flex items-center justify-center bg-[#4ade80] group-hover:bg-green-300 transition-colors shrink-0">
                {loading ? <Loader2 className="w-5 h-5 text-green-900 animate-spin" /> : <ChevronRight className="w-5 h-5 text-green-900" />}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-green-400/60">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#4ade80] hover:text-green-300 font-black transition-colors">
              Create Account →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#166534]">
        <Loader2 className="animate-spin w-8 h-8 text-[#4ade80]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
