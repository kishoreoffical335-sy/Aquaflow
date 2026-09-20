"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { LineChart, Droplets, Waves, Gauge, Activity, ShieldAlert, Cpu, CheckCircle } from "lucide-react";

interface MetricStat {
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<{
    ph: MetricStat;
    turbidity: MetricStat;
    flow: MetricStat;
    totalFlowAccumulated: number | null;
    doStat: MetricStat;
    totalReadings: number;
    alertCount: number;
  }>({
    ph: { avg: null, min: null, max: null, count: 0 },
    turbidity: { avg: null, min: null, max: null, count: 0 },
    flow: { avg: null, min: null, max: null, count: 0 },
    totalFlowAccumulated: null,
    doStat: { avg: null, min: null, max: null, count: 0 },
    totalReadings: 0,
    alertCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function computeStats() {
      try {
        const supabase: any = createClient();
        const { data: readings } = await supabase
          .from("sensor_readings")
          .select("ph, turbidity, flow_rate, total_flow, dissolved_oxygen");

        const { count: alertCount } = await supabase
          .from("alerts")
          .select("*", { count: "exact", head: true });

        if (readings && readings.length > 0) {
          const validPh = readings.filter((r: any) => r.ph !== null).map((r: any) => Number(r.ph));
          const validTurb = readings.filter((r: any) => r.turbidity !== null).map((r: any) => Number(r.turbidity));
          const validFlow = readings.filter((r: any) => r.flow_rate !== null).map((r: any) => Number(r.flow_rate));
          const validDO = readings.filter((r: any) => r.dissolved_oxygen !== null).map((r: any) => Number(r.dissolved_oxygen));
          const totalFlows = readings.filter((r: any) => r.total_flow !== null).map((r: any) => Number(r.total_flow));

          const calc = (arr: number[]): MetricStat => {
            if (arr.length === 0) return { avg: null, min: null, max: null, count: 0 };
            const sum = arr.reduce((a, b) => a + b, 0);
            return {
              avg: Number((sum / arr.length).toFixed(2)),
              min: Number(Math.min(...arr).toFixed(2)),
              max: Number(Math.max(...arr).toFixed(2)),
              count: arr.length,
            };
          };

          setStats({
            ph: calc(validPh),
            turbidity: calc(validTurb),
            flow: calc(validFlow),
            totalFlowAccumulated: totalFlows.length > 0 ? Math.max(...totalFlows) : null,
            doStat: calc(validDO),
            totalReadings: readings.length,
            alertCount: alertCount || 0,
          });
        }
      } catch (err) {
        console.error("Analytics computation error:", err);
      } finally {
        setLoading(false);
      }
    }

    computeStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-white/5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Statistical Analytics</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Aggregates computed strictly from real stored database readings. Zero fabricated metrics.
        </p>
      </div>

      {stats.totalReadings === 0 ? (
        <EmptyState
          icon={LineChart}
          title="Not enough data to calculate metrics"
          description="Analytics require telemetry readings from your physical ESP32 sensors. Connect your device to start generating real statistical distributions."
          badgeText="Analytics Engine Standby"
        />
      ) : (
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="p-5">
              <span className="text-[11px] font-mono text-neutral-400 uppercase">TELEMETRY PACKETS STORED</span>
              <p className="text-3xl font-bold font-mono text-white mt-2">{stats.totalReadings}</p>
              <p className="text-xs text-neutral-400 mt-1">Authentic hardware records</p>
            </Card>

            <Card className="p-5">
              <span className="text-[11px] font-mono text-neutral-400 uppercase">TOTAL WATER VOLUME</span>
              <p className="text-3xl font-bold font-mono text-cyan-400 mt-2">
                {stats.totalFlowAccumulated !== null ? `${stats.totalFlowAccumulated.toFixed(1)} L` : "--"}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Accumulated flow meter count</p>
            </Card>

            <Card className="p-5">
              <span className="text-[11px] font-mono text-neutral-400 uppercase">RECORDED INCIDENTS</span>
              <p className="text-3xl font-bold font-mono text-rose-400 mt-2">{stats.alertCount}</p>
              <p className="text-xs text-neutral-400 mt-1">Deduplicated alert events</p>
            </Card>
          </div>

          {/* Detailed Parameter Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* pH Analytics */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">pH Distribution</h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">MEASURED</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">AVERAGE</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.ph.avg ?? "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MINIMUM</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.ph.min ?? "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MAXIMUM</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.ph.max ?? "--"}</p>
                </div>
              </div>
            </Card>

            {/* Turbidity Analytics */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-semibold text-white">Turbidity Distribution</h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">MEASURED</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">AVERAGE</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.turbidity.avg ? `${stats.turbidity.avg} NTU` : "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MINIMUM</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.turbidity.min ? `${stats.turbidity.min} NTU` : "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MAXIMUM</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.turbidity.max ? `${stats.turbidity.max} NTU` : "--"}</p>
                </div>
              </div>
            </Card>

            {/* Flow Analytics */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Flow Rate Distribution</h3>
                </div>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">DERIVED</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">AVERAGE</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.flow.avg ? `${stats.flow.avg} L/m` : "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MINIMUM</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.flow.min ? `${stats.flow.min} L/m` : "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MAXIMUM</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.flow.max ? `${stats.flow.max} L/m` : "--"}</p>
                </div>
              </div>
            </Card>

            {/* Calculated DO Analytics */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-white">Calculated Dissolved Oxygen</h3>
                </div>
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">CALCULATED</span>
              </div>
              {stats.doStat.count === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-400">
                  Calculation unavailable with current physical sensor inputs.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-neutral-400 font-mono">AVERAGE</span>
                    <p className="text-lg font-bold font-mono text-white mt-1">{stats.doStat.avg ? `${stats.doStat.avg} mg/L` : "--"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-neutral-400 font-mono">MINIMUM</span>
                    <p className="text-lg font-bold font-mono text-white mt-1">{stats.doStat.min ? `${stats.doStat.min} mg/L` : "--"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <span className="text-[10px] text-neutral-400 font-mono">MAXIMUM</span>
                    <p className="text-lg font-bold font-mono text-white mt-1">{stats.doStat.max ? `${stats.doStat.max} mg/L` : "--"}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
