"use client";

import React from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Minus, Droplets, Waves, Gauge, FlaskConical, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MeasurementType, SensorType } from "@/lib/types/iot.types";
import { cn } from "@/lib/utils/cn";

interface SensorCardProps {
  type: SensorType;
  title: string;
  value: number | null;
  unit: string;
  measurementType: MeasurementType;
  status?: "normal" | "warning" | "critical" | "offline" | "unavailable";
  targetRange?: string;
  lastUpdated?: string | null;
  trend?: "up" | "down" | "stable";
  calculatedExplanation?: string;
  isDOUnavailable?: boolean;
}

const iconMap = {
  ph: FlaskConical,
  turbidity: Waves,
  flow_rate: Gauge,
  total_flow: Droplets,
  dissolved_oxygen: Activity,
};

export function SensorCard({
  type,
  title,
  value,
  unit,
  measurementType,
  status = "normal",
  targetRange,
  lastUpdated,
  trend = "stable",
  calculatedExplanation,
  isDOUnavailable = false,
}: SensorCardProps) {
  const Icon = iconMap[type] || Activity;

  const statusColors = {
    normal: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
    warning: "text-amber-300 bg-amber-500/10 border-amber-500/30",
    critical: "text-rose-300 bg-rose-500/10 border-rose-500/30",
    offline: "text-neutral-400 bg-white/5 border-white/10",
    unavailable: "text-purple-300 bg-purple-500/10 border-purple-500/30",
  };

  const hasData = value !== null && value !== undefined && !isDOUnavailable;

  return (
    <Card hoverable className="flex flex-col justify-between relative overflow-hidden group">
      {/* Background Subtle Water Caustic Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/[0.04] rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/[0.08] transition-all duration-500" />

      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/15 flex items-center justify-center text-cyan-300 shadow-sm">
              <Icon className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
              {targetRange && (
                <p className="text-[11px] text-neutral-400 font-mono">Target: {targetRange}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {measurementType === "MEASURED" && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                MEASURED
              </span>
            )}
            {measurementType === "DERIVED" && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-400/30">
                DERIVED
              </span>
            )}
            {measurementType === "CALCULATED" && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-400/30">
                CALCULATED
              </span>
            )}
          </div>
        </div>

        {/* Value Display */}
        <div className="my-3">
          {hasData ? (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white font-mono">
                {value.toFixed(value < 10 && type === "ph" ? 2 : 1)}
              </span>
              <span className="text-sm font-medium text-cyan-300 font-mono">{unit}</span>

              {trend === "up" && (
                <span className="flex items-center text-xs font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" /> +
                </span>
              )}
              {trend === "down" && (
                <span className="flex items-center text-xs font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  <ArrowDownRight className="w-3 h-3 mr-0.5" /> -
                </span>
              )}
              {trend === "stable" && (
                <span className="flex items-center text-xs font-mono text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded">
                  <Minus className="w-3 h-3" />
                </span>
              )}
            </div>
          ) : isDOUnavailable || type === "dissolved_oxygen" ? (
            <div className="py-2">
              <div className="flex items-center gap-2 text-purple-300 text-xs mb-1 font-medium">
                <Info className="w-4 h-4 shrink-0" />
                <span>Calculated DO Unavailable</span>
              </div>
              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                Dissolved oxygen calculation unavailable with current sensor inputs.
              </p>
            </div>
          ) : (
            <div className="py-2">
              <span className="text-2xl font-mono text-neutral-400 font-light">--</span>
              <p className="text-xs text-neutral-400 mt-1 font-light">Waiting for real sensor data</p>
            </div>
          )}
        </div>

        {type === "dissolved_oxygen" && calculatedExplanation && hasData && (
          <div className="mt-2 p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200/90 leading-snug">
            {calculatedExplanation}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3.5 mt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", hasData ? "bg-cyan-400 animate-pulse" : "bg-neutral-600")} />
          <span className="font-mono text-[11px]">
            {lastUpdated ? `Updated ${lastUpdated}` : "No packets received"}
          </span>
        </div>
        
        {hasData && (
          <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border", statusColors[status])}>
            {status}
          </span>
        )}
      </div>
    </Card>
  );
}
