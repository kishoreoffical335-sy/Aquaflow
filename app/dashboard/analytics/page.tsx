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
    turbidityRaw: MetricStat;
    turbidityNtu: MetricStat;
    waterLevelRaw: MetricStat;
    flowPulses: MetricStat;
    flowLpm: MetricStat;
    totalFlowAccumulated: number | null;
    doStat: MetricStat;
    totalReadings: number;
    alertCount: number;
  }>({
    ph: { avg: null, min: null, max: null, count: 0 },
    turbidityRaw: { avg: null, min: null, max: null, count: 0 },
    turbidityNtu: { avg: null, min: null, max: null, count: 0 },
    waterLevelRaw: { avg: null, min: null, max: null, count: 0 },
    flowPulses: { avg: null, min: null, max: null, count: 0 },
    flowLpm: { avg: null, min: null, max: null, count: 0 },
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
          .from("telemetry")
          .select("ph, turbidity_raw, turbidity_ntu, water_level_raw, water_level_percent, flow_pulses, flow_lpm, accumulated_volume_liters, dissolved_oxygen_mg_l");

        const { count: alertCount } = await supabase
          .from("alerts")
          .select("*", { count: "exact", head: true });

        if (readings && readings.length > 0) {
          const validPh = readings.filter((r: any) => r.ph !== null).map((r: any) => Number(r.ph));
          const validTurbRaw = readings.filter((r: any) => r.turbidity_raw !== null).map((r: any) => Number(r.turbidity_raw));
          const validTurbNtu = readings.filter((r: any) => r.turbidity_ntu !== null).map((r: any) => Number(r.turbidity_ntu));
          const validLevelRaw = readings.filter((r: any) => r.water_level_raw !== null).map((r: any) => Number(r.water_level_raw));
          const validPulses = readings.filter((r: any) => r.flow_pulses !== null).map((r: any) => Number(r.flow_pulses));
          const validFlowLpm = readings.filter((r: any) => r.flow_lpm !== null).map((r: any) => Number(r.flow_lpm));
          const validDO = readings.filter((r: any) => r.dissolved_oxygen_mg_l !== null).map((r: any) => Number(r.dissolved_oxygen_mg_l));
          const totalFlows = readings.filter((r: any) => r.accumulated_volume_liters !== null).map((r: any) => Number(r.accumulated_volume_liters));

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
            turbidityRaw: calc(validTurbRaw),
            turbidityNtu: calc(validTurbNtu),
            waterLevelRaw: calc(validLevelRaw),
            flowPulses: calc(validPulses),
            flowLpm: calc(validFlowLpm),
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
          Aggregates computed strictly from real stored telemetry records. Zero fabricated metrics.
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
                  <h3 className="text-sm font-semibold text-white">pH Distribution (UART2)</h3>
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
                  <h3 className="text-sm font-semibold text-white">Turbidity Distribution (GPIO32)</h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">MEASURED</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">AVG RAW ADC</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.turbidityRaw.avg ? `${stats.turbidityRaw.avg}` : "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MIN ADC</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.turbidityRaw.min ?? "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MAX ADC</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.turbidityRaw.max ?? "--"}</p>
                </div>
              </div>
            </Card>

            {/* Water Level Analytics */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Water Level (GPIO34)</h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">MEASURED</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">AVG RAW ADC</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.waterLevelRaw.avg ? `${stats.waterLevelRaw.avg}` : "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MIN ADC</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.waterLevelRaw.min ?? "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MAX ADC</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.waterLevelRaw.max ?? "--"}</p>
                </div>
              </div>
            </Card>

            {/* Flow Analytics */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Flow Pulses (GPIO27)</h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">MEASURED</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">AVG PULSES</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.flowPulses.avg ? `${stats.flowPulses.avg}` : "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MIN PULSES</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.flowPulses.min ?? "--"}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <span className="text-[10px] text-neutral-400 font-mono">MAX PULSES</span>
                  <p className="text-lg font-bold font-mono text-white mt-1">{stats.flowPulses.max ?? "--"}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
