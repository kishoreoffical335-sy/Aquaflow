"use client";

import React, { useState, useEffect } from "react";
import { RealtimeStatusBadge } from "@/components/dashboard/RealtimeStatusBadge";
import { PhChart, TurbidityChart, FlowChart, TotalFlowChart, DoChart } from "@/components/charts/TelemetryCharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { Radio, RefreshCw, Terminal, Activity, Layers } from "lucide-react";

export default function LiveMonitoringPage() {
  const [readings, setReadings] = useState<any[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<"online" | "offline">("offline");
  const [lastPacketTime, setLastPacketTime] = useState<string | null>(null);

  useEffect(() => {
    const supabase: any = createClient();

    // 1. Initial fetch of latest readings (up to 30)
    async function loadInitialReadings() {
      const { data } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(30);

      if (data && data.length > 0) {
        setReadings(data.reverse());
        setDeviceStatus("online");
        setLastPacketTime(data[data.length - 1].recorded_at);
      }
    }
    loadInitialReadings();

    // 2. Set up Supabase Realtime channel for zero-refresh updates
    const channel = supabase
      .channel("live_telemetry_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        (payload: any) => {
          const newReading = (payload as any).new;
          setReadings((prev) => [...prev.slice(-49), newReading]);
          setDeviceStatus("online");
          setLastPacketTime(newReading.recorded_at);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const chartData = readings.map((r: any) => {
    const { time } = formatDateTime(r.recorded_at);
    return {
      recorded_at: r.recorded_at,
      timeLabel: time,
      ph: r.ph !== null ? Number(r.ph) : null,
      turbidity: r.turbidity !== null ? Number(r.turbidity) : null,
      flow_rate: r.flow_rate !== null ? Number(r.flow_rate) : null,
      total_flow: r.total_flow !== null ? Number(r.total_flow) : null,
      dissolved_oxygen: r.dissolved_oxygen !== null ? Number(r.dissolved_oxygen) : null,
    };
  });

  const { relative: relativeTime } = formatDateTime(lastPacketTime);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Live Monitoring</h1>
            <RealtimeStatusBadge
              status={deviceStatus}
              lastSeen={lastPacketTime ? relativeTime : undefined}
            />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Zero-refresh WebSocket stream subscribed directly to PostgreSQL telemetry pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.location.reload()}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Feed
          </Button>
          <a href="/dashboard/hardware">
            <Button size="sm" variant="primary" icon={<Terminal className="w-3.5 h-3.5" />}>
              Hardware Setup
            </Button>
          </a>
        </div>
      </div>

      {readings.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="Waiting for live telemetry stream"
          description="The dashboard is actively listening for incoming ESP32 packets. Connect your hardware to start live charts."
          badgeText="Realtime WebSocket Active"
          actionText="View Hardware Connection Guide"
          onAction={() => window.location.href = "/dashboard/hardware"}
        />
      ) : (
        <div className="space-y-8">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PhChart data={chartData} />
            <TurbidityChart data={chartData} />
            <FlowChart data={chartData} />
            <TotalFlowChart data={chartData} />
          </div>

          {/* Dissolved Oxygen Chart (Only if values exist) */}
          {chartData.some((d) => d.dissolved_oxygen !== null) && (
            <div className="mt-6">
              <DoChart data={chartData} />
            </div>
          )}

          {/* Live Packet Log Stream */}
          <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Live Incoming Packets</h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {readings.length} Packets Buffered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 pb-2">
                    <th className="py-2">Time (UTC)</th>
                    <th>pH</th>
                    <th>Turbidity (NTU)</th>
                    <th>Flow (L/min)</th>
                    <th>Total Flow (L)</th>
                    <th>Calculated DO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {readings.slice(-10).reverse().map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 text-neutral-400">{row.recorded_at}</td>
                      <td className="text-cyan-400 font-semibold">{row.ph?.toFixed(2) ?? "--"}</td>
                      <td className="text-sky-300">{row.turbidity?.toFixed(2) ?? "--"}</td>
                      <td className="text-emerald-400">{row.flow_rate?.toFixed(2) ?? "--"}</td>
                      <td className="text-blue-400">{row.total_flow?.toFixed(1) ?? "--"}</td>
                      <td className="text-purple-400">{row.dissolved_oxygen?.toFixed(2) ?? "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
