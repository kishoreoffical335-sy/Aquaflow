"use client";

import React from "react";
import { Cpu, Wifi, Server, Database, Activity, LayoutDashboard, ShieldCheck, CheckCircle2 } from "lucide-react";

export function ArchitectureDiagram() {
  const steps = [
    {
      step: "01",
      title: "Real Sensors",
      subtitle: "pH Probe, Turbidity Sensor, Hall-Effect Flow Meter",
      icon: Activity,
      color: "from-cyan-500 to-blue-600",
      description: "Direct analog & pulse measurement of real water conditions in real-time.",
    },
    {
      step: "02",
      title: "ESP32 Hardware",
      subtitle: "Firmware Ingestion & Formatting",
      icon: Cpu,
      color: "from-blue-600 to-indigo-600",
      description: "Samples analog voltages, computes flow pulse counts, and serializes ISO 8601 JSON packets.",
    },
    {
      step: "03",
      title: "Secure Telemetry API",
      subtitle: "POST /api/v1/telemetry",
      icon: ShieldCheck,
      color: "from-indigo-600 to-purple-600",
      description: "Authenticates Device UID and SHA-256 API token with strict Zod range validation.",
    },
    {
      step: "04",
      title: "PostgreSQL & Alert Engine",
      subtitle: "Supabase DB & RLS Security",
      icon: Database,
      color: "from-purple-600 to-pink-600",
      description: "Stores real readings, evaluates threshold rules, executes DO model, and dedupes alerts.",
    },
    {
      step: "05",
      title: "Realtime Dashboard",
      subtitle: "Supabase Realtime WebSocket",
      icon: LayoutDashboard,
      color: "from-pink-600 to-emerald-500",
      description: "Zero-refresh telemetry stream, live SVG charting, and digital passbook ledger.",
    },
  ];

  return (
    <div className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all duration-300"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-white transition-colors">
                    {item.step}
                  </span>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md shadow-black/50`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1 tracking-tight">{item.title}</h4>
                <p className="text-[11px] font-mono text-cyan-400 mb-2">{item.subtitle}</p>
                <p className="text-xs text-neutral-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[10px] text-neutral-400 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1.5" />
                Verified Pipeline
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
