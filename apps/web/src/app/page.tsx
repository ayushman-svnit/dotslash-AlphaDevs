"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Leaf, ShieldCheck, Map as MapIcon, Users, ChevronRight, TreePine, Zap, Globe, BarChart4, Radar, Layers } from 'lucide-react';

/* ─────────────────────── TICKER BELT (Ribbon Style) ───────── */
function TickerBelt({ items, speed = 30, reverse = false, rotate = '-3deg', cream = false }: any) {
  const doubled = [...items, ...items, ...items];
  if (cream) {
    // Cream ribbon belt — like in the Shardeum reference image
    return (
      <div
        className="relative overflow-hidden z-20"
        style={{
          transform: `rotate(${rotate}) scaleX(1.08)`,
          boxShadow: '0 8px 40px 0 rgba(0,0,0,0.38)',
        }}
      >
        {/* Gradient fade on left and right edges */}
        <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #f5f2d0, transparent)' }} />
        <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #f5f2d0, transparent)' }} />
        <div style={{ background: 'linear-gradient(135deg, #f5f2d0 0%, #ece9c8 50%, #f5f2d0 100%)' }} className="py-5">
          <motion.div
            className="flex gap-16 whitespace-nowrap"
            animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
          >
            {doubled.map((item: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-5 shrink-0"
                style={{ color: '#166534', fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
                <Leaf className="w-6 h-6 shrink-0 opacity-70" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }
  // Solid color belt
  return (
    <div style={{ transform: `rotate(${rotate}) scaleX(1.05)`, background: '#4ade80', color: '#052e16', boxShadow: '0 6px 30px rgba(0,0,0,0.25)' }} className="overflow-hidden py-4 z-10 relative">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
      >
        {doubled.map((item: string, i: number) => (
          <span key={i} className="inline-flex items-center gap-4 text-lg md:text-2xl font-black uppercase tracking-widest shrink-0">
            <Leaf className="w-5 h-5 shrink-0" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────── ANIMATED COUNTER ─────────────────── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let t0 = 0;
      const step = (ts: number) => {
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / 1400, 1);
        setVal(Math.floor(p * end));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.disconnect();
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─────────────────────── ABSTRACT 3D HERO SHAPES ──────────── */
function HeroShapes() {
  return (
    <>
      {/* SVG curves — freehand doodle lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
        <motion.path d="M-60 280 Q300 80 650 320 T1480 200" stroke="white" strokeWidth="2.5" fill="none" opacity="0.2"
          animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.path d="M100 750 Q450 560 820 700 T1600 600" stroke="white" strokeWidth="2" fill="none" opacity="0.12"
          animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
        <motion.path d="M800 50 Q1000 200 1200 80 T1500 180" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.4"
          animate={{ pathLength: [0, 1, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} />
        {/* Top-right big circle outline */}
        <motion.circle cx="1360" cy="90" r="160" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.25"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
        <motion.circle cx="60" cy="820" r="100" stroke="#86efac" strokeWidth="2" fill="none" opacity="0.18"
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, delay: 1 }} />
      </svg>

      {/* 3D Geometric shape — top right corner floating blocks */}
      <motion.div
        className="absolute top-16 right-10 md:right-24"
        animate={{ y: [0, -18, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        {/* Cylinder/ellipse shape — like the pink dome in reference */}
        <div className="relative w-28 md:w-36">
          <div className="w-28 md:w-36 h-8 rounded-full bg-[#86efac] shadow-2xl shadow-green-900/50" />
          <div className="w-28 md:w-36 h-20 md:h-28 bg-[#4ade80] shadow-inner" />
          <div className="w-28 md:w-36 h-8 rounded-full bg-[#86efac] -mt-1 opacity-70" />
        </div>
      </motion.div>

      {/* Triangle roof shapes — left side */}
      <motion.div
        className="absolute bottom-32 left-6 md:left-16"
        animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.4))' }}
      >
        <svg width="160" height="140" viewBox="0 0 160 140" className="md:w-48">
          {/* Left triangle — lime green */}
          <polygon points="0,140 80,20 80,140" fill="#a3e635" />
          {/* Right triangle — cyan */}
          <polygon points="80,140 80,20 160,140" fill="#22d3ee" />
          {/* Horizontal dark accent on top */}
          <rect x="55" y="8" width="50" height="14" rx="3" fill="#0f0f0f" opacity="0.7" />
        </svg>
      </motion.div>

      {/* Orange/coral floating rectangle — right bottom corner */}
      <motion.div
        className="absolute bottom-40 right-8 md:right-20 w-32 md:w-48 h-16 md:h-20 rounded-2xl"
        style={{ background: '#f97316', boxShadow: '6px 8px 0px #0f0f0f' }}
        animate={{ y: [0, 16, 0], rotate: [2, -2, 2] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />

      {/* Small pink rounded block — floating near center-right */}
      <motion.div
        className="absolute top-1/3 right-6 md:right-16 w-14 h-14 rounded-2xl"
        style={{ background: '#ec4899', boxShadow: '4px 4px 0px #0f0f0f' }}
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
      />

      {/* Bottom-center — big dark base rectangle (like the box base in reference) */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-40 md:w-64 h-10 md:h-16 rounded-xl"
        style={{ background: '#052e16', opacity: 0.6 }}
        animate={{ scaleX: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </>
  );
}

/* ─────────────────────── FEATURE CAROUSEL + CHART ─────────── */
const FEATURES = [
  { icon: <Radar className="w-9 h-9" />, title: 'AI Species Detection', desc: '99.2% accurate image-based species recognition from citizen uploads and field cameras.', bg: '#166534', fg: 'white', stat: 99 },
  { icon: <BarChart4 className="w-9 h-9" />, title: 'Impact Simulation', desc: 'ML-powered corridor evaluation for every infrastructure proposal before ground breaks.', bg: '#fef08a', fg: '#1a1a1a', stat: 87 },
  { icon: <Zap className="w-9 h-9" />, title: 'Instant Ranger Alerts', desc: 'SMS + push dispatch to field officers within 8 seconds of an AI-confirmed sighting.', bg: '#ec4899', fg: 'white', stat: 94 },
  { icon: <Globe className="w-9 h-9" />, title: 'Eco-Safe Routing', desc: 'Navigation overlay that guides drivers around live and seasonal wildlife crossing zones.', bg: '#4ade80', fg: '#052e16', stat: 78 },
  { icon: <Layers className="w-9 h-9" />, title: 'Corridor Heatmaps', desc: 'Real-time density visualization across monitored buffer zones and migration paths.', bg: '#22d3ee', fg: '#0c1a1a', stat: 91 },
  { icon: <TreePine className="w-9 h-9" />, title: 'Deforestation Radar', desc: 'Satellite-fed AI that flags unauthorized clearing in protected wildlife corridors instantly.', bg: '#0f172a', fg: 'white', stat: 83 },
];

const FEATURE_IMPORTANCE_DATA = [
  { label: 'risk_sq', value: 25.6, color: '#03045e' },
  { label: 'risk_interaction', value: 24.7, color: '#480ca8' },
  { label: 'Rf_sq', value: 13.1, color: '#7209b7' },
  { label: 'Rf', value: 11.5, color: '#b5179e' },
  { label: 'spatial_risk', value: 9.2, color: '#f72585' },
  { label: 'rf_dominance', value: 7.7, color: '#e05780' },
  { label: 'rw_dominance', value: 4.0, color: '#ee6c4d' },
  { label: 'rw_rf_ratio', value: 2.2, color: '#f9844a' },
  { label: 'Rw', value: 1.1, color: '#f9c74f' },
  { label: 'Rw_sq', value: 0.9, color: '#f9f74f' },
];

function FeatureImportanceChart() {
  const W = 600; const H = 320; 
  const PAD = { t: 40, r: 20, b: 80, l: 50 };
  const IW = W - PAD.l - PAD.r; const IH = H - PAD.t - PAD.b;
  const maxVal = 30; // 30% to give some headroom
  
  const barWidth = (IW / FEATURE_IMPORTANCE_DATA.length) * 0.8;
  const gap = (IW / FEATURE_IMPORTANCE_DATA.length) * 0.2;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto font-sans">
        {/* Grid lines */}
        {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((v, i) => (
          <g key={i}>
            <line 
              x1={PAD.l} 
              y1={PAD.t + IH - (v * 100 / maxVal) * IH} 
              x2={W - PAD.r} 
              y2={PAD.t + IH - (v * 100 / maxVal) * IH} 
              stroke="#e2e8f0" 
              strokeWidth="1" 
              strokeDasharray="4,4" 
            />
            <text 
              x={PAD.l - 10} 
              y={PAD.t + IH - (v * 100 / maxVal) * IH + 4} 
              textAnchor="end" 
              fontSize="10" 
              className="fill-slate-400 font-bold"
            >
              {v.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Y-axis Label */}
        <text 
          transform={`rotate(-90, 15, ${PAD.t + IH/2})`} 
          x="15" 
          y={PAD.t + IH/2} 
          textAnchor="middle" 
          fontSize="11" 
          className="fill-slate-600 font-black uppercase tracking-widest"
        >
          Importance Score
        </text>

        {/* Bars */}
        {FEATURE_IMPORTANCE_DATA.map((d, i) => {
          const x = PAD.l + i * (barWidth + gap) + gap/2;
          const barHeight = (d.value / maxVal) * IH;
          const y = PAD.t + IH - barHeight;

          return (
            <g key={i} className="group cursor-help">
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                fill={d.color}
                rx="4"
                className="transition-all duration-300 hover:brightness-110"
              />
              <text 
                x={x + barWidth/2} 
                y={y - 8} 
                textAnchor="middle" 
                fontSize="10" 
                className="fill-slate-900 font-black"
              >
                {d.value}%
              </text>
              <text 
                x={x + barWidth/2} 
                y={PAD.t + IH + 15} 
                textAnchor="end" 
                fontSize="10" 
                className="fill-slate-500 font-bold" 
                transform={`rotate(-45, ${x + barWidth/2}, ${PAD.t + IH + 15})`}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}




function FeatureCarouselAndChart() {
  const [active, setActive] = useState(0);
  const total = FEATURES.length;

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % total), 3200);
    return () => clearInterval(t);
  }, [total]);

  const f = FEATURES[active];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

      {/* ── LEFT: Carousel ── */}
      <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col gap-6">
        {/* Big card */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.45, ease: 'circOut' }}
          className="rounded-3xl p-10 min-h-[280px] flex flex-col justify-between"
          style={{ background: f.bg, color: f.fg }}
        >
          <div className="flex justify-between items-start">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">{f.icon}</div>
            <span className="text-6xl font-black opacity-20">{String(active + 1).padStart(2, '0')}</span>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">{f.title}</h3>
            <p className="font-bold opacity-75 text-lg leading-relaxed">{f.desc}</p>
          </div>
          {/* Mini progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-60 mb-2">
              <span>Efficiency Score</span><span>{f.stat}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${f.stat}%` }}
                transition={{ duration: 0.8, ease: 'circOut' }}
                className="h-full rounded-full bg-white/70"
              />
            </div>
          </div>
        </motion.div>

        {/* Dot indicators + arrows */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {FEATURES.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className="transition-all rounded-full"
                style={{
                  width: i === active ? 32 : 10,
                  height: 10,
                  background: i === active ? '#166534' : '#cbd5e1',
                }}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActive(p => (p - 1 + total) % total)} className="w-10 h-10 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-green-600 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180 text-slate-600" />
            </button>
            <button onClick={() => setActive(p => (p + 1) % total)} className="w-10 h-10 rounded-full bg-[#166534] flex items-center justify-center hover:bg-green-700 transition-colors">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Mini strip of next cards */}
        <div className="grid grid-cols-3 gap-3">
          {FEATURES.filter((_, i) => i !== active).slice(0, 3).map((ft, i) => (
            <button key={i} onClick={() => setActive(FEATURES.indexOf(ft))}
              className="rounded-2xl p-4 text-left transition-transform hover:scale-105 opacity-80 hover:opacity-100"
              style={{ background: ft.bg, color: ft.fg }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2">{ft.icon}</div>
              <p className="text-xs font-black leading-tight">{ft.title}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── RIGHT: Graph ── */}
      <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
        className="bg-white rounded-3xl p-8 border border-green-100 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Feature Importance</h3>
            <p className="text-slate-400 font-medium text-sm mt-1">Drives Model Predictions</p>
          </div>
          <div className="flex flex-col gap-1.5 text-xs font-bold text-right">
             <span className="text-slate-400 uppercase tracking-widest">Model: Eco-Forest V2</span>
             <span className="text-green-600 font-black">Top 10 Attributes</span>
          </div>
        </div>
        <FeatureImportanceChart />

        {/* Summary stats below chart */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-green-50">
          {[
            { label: 'Primary Driver', value: 'risk_sq', color: '#03045e' },
            { label: 'Cumulative Impact', value: '89.4%', color: '#f72585' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

      </motion.div>

    </div>
  );
}


function PillButton({ href, label, dark = false }: { href: string; label: string; dark?: boolean }) {
  return (
    <Link href={href}
      className={`inline-flex items-center gap-0 rounded-full border-2 overflow-hidden font-bold text-base md:text-lg 
        ${dark ? 'border-white text-white hover:border-green-300' : 'border-green-800 text-green-900 bg-white hover:bg-green-50'}
        transition-all group shadow-lg`}
    >
      <span className="px-6 py-3">{label}</span>
      <span className={`w-12 h-12 flex items-center justify-center ${dark ? 'bg-[#4ade80]' : 'bg-[#4ade80]'} group-hover:bg-green-300 transition-colors shrink-0`}>
        <ChevronRight className="w-5 h-5 text-green-900" />
      </span>
    </Link>
  );
}

/* ═══════════════════════ PAGE ══════════════════════════════ */
export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], ['0%', '20%']);

  return (
    <div className="bg-[#f5f2e9] text-[#0f0f0f] font-sans overflow-x-hidden selection:bg-green-200">

      {/* ── NAV ───────────────────────────────────── */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'circOut' }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-7xl"
      >
        <div className="bg-[#166534]/90 backdrop-blur-xl rounded-full border border-green-700/40 px-6 py-3 flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#4ade80] rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-green-900" />
            </div>
            <span className="font-black text-xl tracking-tight text-white uppercase">ECO-ROUTE AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-green-200 uppercase tracking-widest">
            <a href="#impact" className="hover:text-white transition-colors">Platform</a>
            <a href="#roles" className="hover:text-white transition-colors">Roles</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
          <Link href="/login" className="px-5 py-2 bg-[#4ade80] text-green-900 rounded-full font-black text-sm hover:bg-green-300 transition-all shadow-md">Sign In</Link>
        </div>
      </motion.nav>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#166534] flex flex-col items-center justify-center text-white overflow-hidden pt-24 pb-0">
        <HeroShapes />
        <motion.div style={{ y: heroY }} className="relative z-10 text-center px-6 max-w-6xl mx-auto flex flex-col items-center flex-1 justify-center w-full">

          {/* small label */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-sm font-black uppercase tracking-[0.4em] text-green-300 mb-6"
          >
            ECO-ROUTE AI
          </motion.p>

          {/* Giant text */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: 140 }} animate={{ y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="text-[clamp(60px,13vw,160px)] font-black leading-[0.85] tracking-tighter"
            >
              NATURE MEETS
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ y: 140 }} animate={{ y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.36 }}
              className="text-[clamp(60px,13vw,160px)] font-black leading-[0.85] tracking-tighter text-[#4ade80]"
            >
              INTELLIGENCE
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-lg md:text-2xl text-green-100/80 max-w-2xl text-center mb-10 font-medium leading-relaxed"
          >
            AI-powered wildlife corridor mapping for governments, rangers, and citizens. Protect biodiversity before roads destroy it.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex flex-col sm:flex-row gap-5 items-center mb-48">
            <PillButton href="/signup" label="Sign Up" />
            <a href="#roles" className="text-green-200 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors underline underline-offset-4">Explore Roles →</a>
          </motion.div>
        </motion.div>

        {/* HERO BASE cream ribbon ticker — sits below hero content */}
        <div className="w-full mt-auto">
          <TickerBelt
            items={['Wildlife AI', 'Corridor Mapping', 'Forest Intelligence', 'Eco Routing', 'Species Tracking', 'Ranger Alerts', 'Impact Simulation']}
            speed={25} cream rotate="-2deg"
          />
        </div>
      </section>

      {/* ── STATS / IMPACT ─────────────────────────── */}
      <section id="impact" className="bg-[#f5f2e9] pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">The Eco<br/><span className="text-[#166534] not-italic">Impact Engine</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-6">Real-world results powered by field-validated intelligence</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {[
              { num: 70, suf: '%', label: 'Biodiversity Loss', bg: '#ec4899', desc: 'AI predicts and flags habitat fragmentation in real-time before infrastructure locks in damage.' },
              { num: 98.7, suf: '', label: 'OOB R² Score', bg: '#03045e', desc: 'High-fidelity model validation ensuring that corridor predictions match real-world movement patterns.' },
              { num: 1200, suf: '+', label: 'Species Protected', bg: '#22d3ee', desc: 'Continuous movement-pattern tracking across protected corridors for over 1,200 species nationwide.' },
           
            ].map((s, i) => (

              <motion.div
                key={i}
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: 'circOut' }}
                className="flex flex-col items-center text-center"
              >
                {/* Numbered bubble */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl text-white mb-6"
                  style={{ background: s.bg }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                {/* Abstract geometric shape */}
                <motion.div
                  animate={{ rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
                  transition={{ duration: 5 + i, repeat: Infinity }}
                  className="w-32 h-32 mb-8 rounded-3xl"
                  style={{ background: s.bg, opacity: 0.85 }}
                />
                <div className="text-6xl font-black tracking-tighter mb-3">
                  <Counter end={s.num} suffix={s.suf} />
                </div>
                <h3 className="text-2xl font-black mb-3">{s.label}</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MID TICKER (cream ribbon, reversed direction) ── */}
      <div className="relative z-10 -my-4">
        <TickerBelt
          items={['Protect Corridors', 'Deploy Rangers', 'Predict Impact', 'Stop Fragmentation', 'Save Species', 'Eco Intelligence']}
          speed={22} reverse cream rotate="2deg"
        />
      </div>

      {/* ── ROLES ─────────────────────────────────── */}
      <section id="roles" className="bg-[#166534] py-36 text-white overflow-hidden relative">
        {/* Abstract blobs */}
        <motion.div animate={{ y: [0, -40, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-0 right-0 w-72 h-72 bg-[#4ade80]/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              Three Roles.<br /><span className="text-[#4ade80]">One Mission.</span>
            </h2>
            <p className="text-green-200 font-medium max-w-sm leading-relaxed">A unified platform for environmental governance, field protection, and citizen safety — each role with its own tailored intelligence layer.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck className="w-9 h-9" />, title: 'Authority', sub: 'Policy Makers', desc: 'Simulate AI road impact scores. Evaluate every infrastructure proposal against live corridor data.', bg: '#fef08a', fg: '#1a1a1a' },
              { icon: <MapIcon className="w-9 h-9" />, title: 'Officer', sub: 'Forest Rangers', desc: 'Real-time heatmaps, roadkill hotspots, and alert dispatch. Intelligence-led field patrol, always.', bg: '#4ade80', fg: '#052e16' },
              { icon: <Users className="w-9 h-9" />, title: 'Citizen', sub: 'Public Users', desc: 'Navigate safely around wildlife crossings. Report sightings that power the AI data engine.', bg: '#22d3ee', fg: '#0c1a1a' },
            ].map((r, i) => (
              <motion.div
                key={i}
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.65, ease: 'circOut' }}
                whileHover={{ y: -10 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: r.bg, color: r.fg }}
              >
                <div className="p-8 md:p-10 min-h-[360px] flex flex-col">
                  <div className="flex justify-between items-start mb-auto">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-2">{r.sub}</p>
                      <h3 className="text-4xl font-black tracking-tighter">{r.title}</h3>
                    </div>
                    <div className="opacity-70">{r.icon}</div>
                  </div>
                  <div className="mt-12">
                    <div className="h-px bg-current opacity-20 mb-6" />
                    <p className="font-bold opacity-70 leading-relaxed mb-6">{r.desc}</p>
                    <Link href="/login" className="inline-flex items-center gap-2 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all">
                      Enter Dashboard <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES: CAROUSEL + GRAPH ─────────────── */}
      <section id="features" className="bg-[#f5f2e9] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Platform<br /><span className="italic text-[#166534]">Intelligence</span></h2>
          </motion.div>
          <FeatureCarouselAndChart />
        </div>
      </section>




      {/* ── BIG CTA CARDS ─────────────────────────── */}

      <section className="bg-[#f5f2e9] pb-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: 'For Authority', sub: 'Evaluate & Govern', desc: 'Use AI intelligence to shape infrastructure policy that protects biological corridors.', href: '/signup', bg: '#4ade80', fg: '#052e16', icon: <ShieldCheck className="w-10 h-10" /> },
            { title: 'For Officers', sub: 'Protect the Wild', desc: 'React faster with real-time motion mapping and intelligent dispatch at your fingertips.', href: '/signup', bg: '#166534', fg: 'white', icon: <MapIcon className="w-10 h-10" /> },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: 'circOut' }}
              whileHover={{ y: -6 }}
              className="rounded-3xl p-10 md:p-14 flex flex-col gap-4"
              style={{ background: c.bg, color: c.fg }}
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">{c.sub}</p>
                <div className="opacity-60">{c.icon}</div>
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter">{c.title}</h3>
              <div className="h-px bg-current opacity-20 my-2" />
              <p className="font-bold opacity-70 leading-relaxed max-w-sm">{c.desc}</p>
              <div className="mt-4"><PillButton href={c.href} label="Get Started" dark={c.fg === 'white'} /></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA BELT ────────────────────────── */}
      <div className="-my-6 z-10 relative">
        <TickerBelt
          items={['Deploy Platform', 'Protect Wildlife', 'Predict Impact', 'Join ECO-ROUTE AI', 'Save Corridors', 'Real-time Intelligence']}
          speed={18} bg="#4ade80" fg="#052e16" rotate="-1.5deg"
        />
      </div>

      {/* ── FINAL SECTION ─────────────────────────── */}
      <section className="bg-[#166534] py-40 text-white text-center relative overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#4ade80] blur-[80px]" />
        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-12">
            THE<br />
            <motion.span animate={{ color: ['#4ade80', '#86efac', '#4ade80'] }} transition={{ duration: 3, repeat: Infinity }}>
              ECO-REVOLUTION
            </motion.span><br />
            IS NOW.
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <PillButton href="/signup" label="Create Account" />
            <PillButton href="/login" label="Member Login" />
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────── */}
      <footer className="bg-[#0a2e1a] text-white py-14 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4ade80] rounded-xl flex items-center justify-center"><Leaf className="w-5 h-5 text-green-900" /></div>
            <span className="font-black text-xl tracking-tighter uppercase italic">ECO-ROUTE AI</span>
          </div>
          <p className="text-green-500 font-bold text-xs uppercase tracking-widest">© 2026 Environmental Intelligence Research</p>
          <div className="flex gap-8 font-black uppercase text-sm text-green-400">
            <a href="#" className="hover:text-white transition-colors">Github</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="#" className="hover:text-white transition-colors">Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
