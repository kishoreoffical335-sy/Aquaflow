"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Droplets,
  Activity,
  Gauge,
  Waves,
  ShieldCheck,
  Cpu,
  Server,
  Database,
  LayoutDashboard,
  BellRing,
  History,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WaterBackground } from "@/components/ui/WaterBackground";

export function LandingPageStory() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Hero Scroll-Linked Transformations
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0.1]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.92]);

  // Story Sequence Transitions (Water -> Quality -> Flow -> System -> Insight)
  const storyOpacity = useTransform(scrollYProgress, [0.08, 0.14, 0.22, 0.28], [0, 1, 1, 0]);
  const storyScale = useTransform(scrollYProgress, [0.08, 0.15], [0.88, 1]);
  const storyY = useTransform(scrollYProgress, [0.08, 0.15], [50, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#020813] text-white selection:bg-cyan-500 selection:text-black">
      <WaterBackground />

      {/* -------------------------------------------------------------------- */}
      {/* 1. HERO SECTION (Liquid Glass + Water Environment)                  */}
      {/* -------------------------------------------------------------------- */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-36 pb-20 relative max-w-5xl mx-auto z-10">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="flex flex-col items-center"
        >
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-glass text-xs text-neutral-200 mb-8 shadow-liquid-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="font-mono tracking-wide text-cyan-300">Live Telemetry Ingestion Active</span>
            <span className="text-white/20">|</span>
            <span className="text-neutral-400">Zero Fabricated Data</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.05]">
            Know Your Water.
            <br />
            <span className="text-gradient-water">In Real Time.</span>
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Monitor water quality, flow, and system health through a real-time connected monitoring system.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto" icon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Open Console
              </Button>
            </Link>
          </div>

          {/* Floating Liquid Glass Sensor Indicators (Zero Fake Data) */}
          <div className="w-full mt-16 p-6 rounded-3xl liquid-glass text-left relative overflow-hidden shadow-liquid-glass">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono text-white font-semibold">PHYSICAL SENSOR ARRAY CHANNELS</span>
              </div>
              <span className="text-xs font-mono text-cyan-300">ESP32 Secure Link</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">MEASURED CHANNEL</span>
                  <span className="text-[10px] font-mono text-emerald-400">GPIO 34 ADC</span>
                </div>
                <p className="text-sm font-semibold text-white">pH Glass Probe</p>
                <p className="text-xs text-neutral-400 mt-0.5">Acidity &amp; Alkalinity (0-14 pH)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">MEASURED CHANNEL</span>
                  <span className="text-[10px] font-mono text-emerald-400">GPIO 35 ADC</span>
                </div>
                <p className="text-sm font-semibold text-white">Turbidity Sensor</p>
                <p className="text-xs text-neutral-400 mt-0.5">Particulate Clarity (0-4000 NTU)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">MEASURED + DERIVED</span>
                  <span className="text-[10px] font-mono text-emerald-400">GPIO 27 INT</span>
                </div>
                <p className="text-sm font-semibold text-white">Water Flow Meter</p>
                <p className="text-xs text-neutral-400 mt-0.5">Instant Flow (L/min) + Total Vol (L)</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 2. SCROLL-LINKED STORY: "Every reading tells a story."              */}
      {/* -------------------------------------------------------------------- */}
      <section className="py-24 px-4 max-w-5xl mx-auto relative z-10">
        <motion.div
          style={{ opacity: storyOpacity, scale: storyScale, y: storyY }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-3 block">
            Continuous Telemetry Stream
          </span>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Every reading tells a story.
          </h2>
          <p className="text-neutral-300 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            From the microscopic clarity of drinking reservoirs to high-volume industrial pipelines, AquaFlow captures every physical fluid dynamic with scientific integrity.
          </p>
        </motion.div>

        {/* Liquid Glass Storytelling Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
          {[
            { tag: "WATER", desc: "Physical fluid in pipeline", color: "from-blue-500/20 to-cyan-500/20" },
            { tag: "QUALITY", desc: "pH balance & particulate NTU", color: "from-cyan-500/20 to-teal-500/20" },
            { tag: "FLOW", desc: "Velocity & accumulated volume", color: "from-teal-500/20 to-emerald-500/20" },
            { tag: "SYSTEM", desc: "ESP32 node heartbeat & health", color: "from-emerald-500/20 to-indigo-500/20" },
            { tag: "INSIGHT", desc: "Alert deduplication & analytics", color: "from-indigo-500/20 to-purple-500/20" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="liquid-glass p-5 rounded-2xl flex flex-col justify-between hover:border-cyan-400/40 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-mono text-xs font-bold mx-auto mb-3 shadow-liquid-glow">
                0{idx + 1}
              </div>
              <h3 className="text-sm font-mono font-bold text-white mb-1 tracking-wider">{item.tag}</h3>
              <p className="text-[11px] text-neutral-300 font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 3. MONITORING PARAMETERS (Strict Physical Matrix)                    */}
      {/* -------------------------------------------------------------------- */}
      <section id="parameters" className="py-28 px-4 max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-3 block">
            Parameter Matrix
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Calibrated for Physical Sensors.
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base font-light">
            Every card and metric maps strictly to real physical sensor interfaces. No fabricated TDS or temperature gauges are rendered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parameter 1: pH */}
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">pH Value</h3>
                    <p className="text-xs font-mono text-neutral-400">0.00 ? 14.00 pH</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                  MEASURED
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                Direct glass electrode potential measurement. Monitors water acidity and alkalinity with user-configurable warning and critical thresholds.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Sensor Interface: ADC1 (GPIO 34)</span>
              <span className="text-cyan-300">Live Standby</span>
            </div>
          </Card>

          {/* Parameter 2: Turbidity */}
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
                    <Waves className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Turbidity (Clarity)</h3>
                    <p className="text-xs font-mono text-neutral-400">0 ? 4000 NTU</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                  MEASURED
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                Optical light-scattering detector measuring suspended particulate matter in water. Calibrated to detect sediment contamination instantly.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Sensor Interface: ADC1 (GPIO 35)</span>
              <span className="text-sky-300">Live Standby</span>
            </div>
          </Card>

          {/* Parameter 3: Flow & Total Volume */}
          <Card id="flow" className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Flow Rate &amp; Accumulated Volume</h3>
                    <p className="text-xs font-mono text-neutral-400">L/min &amp; Liters</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                  MEASURED + DERIVED
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                Hall-effect turbine pulse integration. Tracks real-time fluid flow velocity, detects unexpected surge anomalies or dry pipe flow, and aggregates total consumed volume.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Sensor Interface: Interrupt (GPIO 27)</span>
              <span className="text-emerald-300">Live Standby</span>
            </div>
          </Card>

          {/* Parameter 4: Calculated Dissolved Oxygen */}
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Calculated Dissolved Oxygen</h3>
                    <p className="text-xs font-mono text-neutral-400">mg/L (Traceable Model)</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-400/30">
                  CALCULATED
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                Calculated strictly when a scientifically valid calculation model and required physical inputs are configured. Never presented as a physical sensor measurement.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs font-mono text-purple-300">
              &ldquo;Dissolved oxygen calculation unavailable with current sensor inputs.&rdquo;
            </div>
          </Card>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 4. LIQUID GLASS ARCHITECTURE DIAGRAM & PIPELINE                      */}
      {/* -------------------------------------------------------------------- */}
      <section id="architecture" className="py-28 px-4 max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-3 block">
            End-To-End Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            From Water to Realtime Console.
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base font-light">
            A resilient telemetry pipeline engineered with SHA-256 device authentication, strict validation, and Supabase Realtime.
          </p>
        </div>

        {/* 5-Step Floating Liquid Glass Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            {
              step: "01",
              title: "Real Water",
              sub: "Physical Fluid Source",
              icon: Droplets,
              desc: "Flowing stream or reservoir containing dissolved ions and particulates.",
            },
            {
              step: "02",
              title: "Physical Sensors",
              sub: "pH, Turbidity, Flow",
              icon: Activity,
              desc: "Analog voltages & pulse interrupts sampled continuously at hardware level.",
            },
            {
              step: "03",
              title: "ESP32 Node",
              sub: "Microcontroller C++",
              icon: Cpu,
              desc: "Digitizes voltages, serializes ISO 8601 JSON packets, and posts via Wi-Fi.",
            },
            {
              step: "04",
              title: "Secure API",
              sub: "POST /api/v1/telemetry",
              icon: ShieldCheck,
              desc: "Verifies SHA-256 API token, validates Zod ranges, and runs alert engine.",
            },
            {
              step: "05",
              title: "Realtime Console",
              sub: "Supabase WebSockets",
              icon: LayoutDashboard,
              desc: "Zero-refresh live telemetry charts, alerts hub, and Excel export.",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="liquid-glass p-5 rounded-2xl flex flex-col justify-between hover:border-cyan-400/40 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-cyan-400">{item.step}</span>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-liquid-glow">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-0.5">{item.title}</h4>
                  <p className="text-[10px] font-mono text-cyan-300 mb-2">{item.sub}</p>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified Link
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 5. INTELLIGENT ALERTS SYSTEM                                         */}
      {/* -------------------------------------------------------------------- */}
      <section id="alerts" className="py-24 px-4 max-w-5xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-3 block">
            Incident Protection
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Deduplicated Alert Engine.
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base font-light">
            Examples of incident categories handled automatically with cooldown windows and recovery detection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="liquid-glass p-5 rounded-2xl border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-rose-400">CRITICAL / THRESHOLD BREACH</span>
              <span className="text-[10px] font-mono text-neutral-400">Alert Type Example</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">pH Threshold Exceeded</h4>
            <p className="text-xs text-neutral-300 font-light">
              Fires when water acidity drops below safe limits (e.g. &lt; 5.5 pH). Deduplicated across subsequent packets until recovery occurs.
            </p>
          </div>

          <div className="liquid-glass p-5 rounded-2xl border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">WARNING / FLOW ANOMALY</span>
              <span className="text-[10px] font-mono text-neutral-400">Alert Type Example</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Surge Flow Velocity Detected</h4>
            <p className="text-xs text-neutral-300 font-light">
              Fires when pipe flow exceeds standard thresholds, indicating potential burst, leak, or valve failure.
            </p>
          </div>

          <div className="liquid-glass p-5 rounded-2xl border-l-4 border-l-cyan-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">HARDWARE / COMM FAILURE</span>
              <span className="text-[10px] font-mono text-neutral-400">Alert Type Example</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Turbidity Sensor Communication Fault</h4>
            <p className="text-xs text-neutral-300 font-light">
              Distinguishes between dirty water (high NTU) and disconnected hardware probe lines.
            </p>
          </div>

          <div className="liquid-glass p-5 rounded-2xl border-l-4 border-l-neutral-400">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-neutral-300">HEARTBEAT / OFFLINE</span>
              <span className="text-[10px] font-mono text-neutral-400">Alert Type Example</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">ESP32 Offline Timeout</h4>
            <p className="text-xs text-neutral-300 font-light">
              Triggers automatically if no telemetry packet is received within the configured offline timeout window (e.g. 60 seconds).
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 6. GOOGLE LOGIN CTA & GET STARTED                                   */}
      {/* -------------------------------------------------------------------- */}
      <section id="hardware" className="py-28 px-4 max-w-4xl mx-auto text-center relative z-10">
        <div className="liquid-glass p-10 sm:p-14 rounded-3xl border border-cyan-400/30 shadow-liquid-glass relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mx-auto mb-6 shadow-liquid-glow">
            <Droplets className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Connect Your ESP32 System.
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed">
            The telemetry ingestion API and database are waiting for real hardware packets. Sign in with Google to provision devices and access your live console.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                Continue with Google
              </Button>
            </Link>
            <Link href="/dashboard/hardware">
              <Button size="lg" variant="secondary">
                ESP32 Integration Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 7. FOOTER                                                            */}
      {/* -------------------------------------------------------------------- */}
      <footer className="py-12 px-4 border-t border-white/10 text-center text-xs text-neutral-400 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">AquaFlow IoT Water Monitoring System</span>
        </div>
        <div className="font-mono text-[11px] text-neutral-400">
          PostgreSQL Realtime &bull; Liquid Glass Design System &bull; Zero Fabricated Readings
        </div>
      </footer>
    </div>
  );
}
