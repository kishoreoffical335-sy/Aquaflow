"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RealtimeStatusBadge } from "@/components/dashboard/RealtimeStatusBadge";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils/cn";
import { PhChart, TurbidityChart } from "@/components/charts/TelemetryCharts";
import { createClient } from "@/lib/supabase/client";
import {
  Radio,
  Activity,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  RefreshCw,
  Clock,
  ArrowRight,
  Droplets,
  Layers,
} from "lucide-react";

export default function DashboardOverview() {
  const [latestTelemetry, setLatestTelemetry] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const supabase: any = createClient();

      // 1. Fetch latest telemetry row from authoritative table
      const { data: telemetryRows } = await supabase
        .from("telemetry")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(20);

      if (telemetryRows && telemetryRows.length > 0) {
        setLatestTelemetry(telemetryRows[0]);
        const formatted = telemetryRows.slice().reverse().map((r: any) => {
          const { time } = formatDateTime(r.timestamp);
          return {
            recorded_at: r.timestamp,
            timeLabel: time,
            ph: r.ph !== null ? Number(r.ph) : null,
            turbidity: r.turbidity_ntu !== null ? Number(r.turbidity_ntu) : (r.turbidity_raw !== null ? Number(r.turbidity_raw) : null),
            flow_rate: r.flow_lpm !== null ? Number(r.flow_lpm) : (r.flow_pulses !== null ? Number(r.flow_pulses) : null),
            total_flow: r.accumulated_volume_liters !== null ? Number(r.accumulated_volume_liters) : null,
            dissolved_oxygen: r.dissolved_oxygen_mg_l !== null ? Number(r.dissolved_oxygen_mg_l) : null,
          };
        });
        setChartData(formatted);
      }

      // 2. Fetch active alerts
      const resAlerts = await fetch("/api/v1/alerts?status=ACTIVE");
      if (resAlerts.ok) {
        const json = await resAlerts.json();
        setActiveAlerts(json.alerts || []);
      }

      // 3. Fetch device info
      const resDevices = await fetch("/api/v1/devices");
      if (resDevices.ok) {
        const json = await resDevices.json();
        if (json.devices && json.devices.length > 0) {
          setDeviceInfo(json.devices[0]);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);

    // Supabase Realtime channel subscription for live updates
    const supabase: any = createClient();
    const channel = supabase
      .channel("overview_telemetry_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telemetry" },
        (payload: any) => {
          const newRow = payload.new;
          setLatestTelemetry(newRow);
          const { time } = formatDateTime(newRow.timestamp);
          setChartData((prev) => [
            ...prev.slice(-19),
            {
              recorded_at: newRow.timestamp,
              timeLabel: time,
              ph: newRow.ph !== null ? Number(newRow.ph) : null,
              turbidity: newRow.turbidity_ntu !== null ? Number(newRow.turbidity_ntu) : (newRow.turbidity_raw !== null ? Number(newRow.turbidity_raw) : null),
              flow_rate: newRow.flow_lpm !== null ? Number(newRow.flow_lpm) : (newRow.flow_pulses !== null ? Number(newRow.flow_pulses) : null),
              total_flow: newRow.accumulated_volume_liters !== null ? Number(newRow.accumulated_volume_liters) : null,
              dissolved_oxygen: newRow.dissolved_oxygen_mg_l !== null ? Number(newRow.dissolved_oxygen_mg_l) : null,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const hasTelemetry = latestTelemetry !== null;

  // Real-time online check: device is online ONLY if actual telemetry arrived within timeout (default 60s)
  const timeoutMs = (deviceInfo?.offline_timeout_seconds || 60) * 1000;
  const lastPacketDate = latestTelemetry?.received_at || latestTelemetry?.timestamp || deviceInfo?.last_seen || deviceInfo?.last_seen_at;
  const isWithinTimeout = lastPacketDate
    ? Date.now() - new Date(lastPacketDate).getTime() < timeoutMs
    : false;
  const isOnline = hasTelemetry && isWithinTimeout;

  const { relative: lastSeenRelative } = formatDateTime(lastPacketDate);

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">System Overview</h1>
            <RealtimeStatusBadge
              status={isOnline ? "online" : "offline"}
              lastSeen={lastPacketDate ? lastSeenRelative : undefined}
            />
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 font-light">
            Authoritative real-time telemetry stream from physical ESP32 prototype.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchDashboardData}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync Telemetry
          </Button>
          <Link href="/dashboard/hardware">
            <Button size="sm" variant="primary" icon={<Terminal className="w-3.5 h-3.5" />}>
              Hardware Guide
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Point System State Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: System Link */}
        <div className="p-4 rounded-3xl liquid-glass flex flex-col justify-between">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">1. SYSTEM LINK</span>
          <div className="my-2">
            <span className={isOnline ? "text-base font-semibold text-cyan-300" : "text-base font-semibold text-neutral-400"}>
              {isOnline ? "Online & Active" : "Waiting for Hardware"}
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 font-mono">
            {lastPacketDate ? "Last packet: " + lastSeenRelative : "No telemetry received"}
          </p>
        </div>

        {/* Metric 2: Water Quality */}
        <div className="p-4 rounded-3xl liquid-glass flex flex-col justify-between">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">2. WATER QUALITY</span>
          <div className="my-2">
            {hasTelemetry && latestTelemetry.ph !== null ? (
              <span className="text-base font-semibold text-emerald-400">
                pH {latestTelemetry.ph.toFixed(2)} (UART2)
              </span>
            ) : (
              <span className="text-base font-semibold text-neutral-400">--</span>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 font-mono">pH &amp; Turbidity Guard</p>
        </div>

        {/* Metric 3: Flow State */}
        <div className="p-4 rounded-3xl liquid-glass flex flex-col justify-between">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">3. FLOW STATE</span>
          <div className="my-2">
            {hasTelemetry ? (
              <span className="text-base font-semibold text-cyan-300">
                {latestTelemetry.flow_pulses > 0 ? `${latestTelemetry.flow_pulses} Pulses` : "Static (No Flow)"}
              </span>
            ) : (
              <span className="text-base font-semibold text-neutral-400">--</span>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 font-mono">GPIO27 Pulse Interrupt</p>
        </div>

        {/* Metric 4: Active Alerts */}
        <div className="p-4 rounded-3xl liquid-glass flex flex-col justify-between">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">4. ACTIVE INCIDENTS</span>
          <div className="my-2">
            {activeAlerts.length > 0 ? (
              <span className="text-base font-semibold text-rose-400">
                {activeAlerts.length} Active Incident{activeAlerts.length > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-base font-semibold text-emerald-400">0 Active Alerts</span>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 font-mono">Deduplicated in Realtime</p>
        </div>
      </div>

      {/* Sensor Cards Matrix */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white tracking-tight">Active Sensor Matrix</h2>
          <span className="text-xs font-mono text-cyan-300">
            Physical Hardware Channels &bull; Zero Fabricated Readings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Card 1: pH (UART2 RX16/TX17) */}
          <SensorCard
            type="ph"
            title="pH Value (UART2)"
            calibratedValue={latestTelemetry?.ph ?? null}
            unit="pH"
            measurementType="MEASURED"
            targetRange="6.50 - 8.50 pH"
            lastUpdated={latestTelemetry ? lastSeenRelative : null}
            status={latestTelemetry?.ph ? "normal" : "offline"}
          />

          {/* Card 2: Turbidity (ADC GPIO32) */}
          <SensorCard
            type="turbidity"
            title="Water Turbidity (GPIO32)"
            rawValue={latestTelemetry?.turbidity_raw ?? null}
            calibratedValue={latestTelemetry?.turbidity_ntu ?? null}
            unit="NTU"
            rawUnit="ADC"
            measurementType="MEASURED"
            targetRange="< 5.0 NTU"
            requiresCalibration={latestTelemetry?.turbidity_ntu === null && latestTelemetry?.turbidity_raw !== null}
            lastUpdated={latestTelemetry ? lastSeenRelative : null}
            status={latestTelemetry?.turbidity_raw ? "normal" : "offline"}
          />

          {/* Card 3: Water Level (ADC GPIO34) */}
          <SensorCard
            type="water_level"
            title="Water Level (GPIO34)"
            rawValue={latestTelemetry?.water_level_raw ?? null}
            calibratedValue={latestTelemetry?.water_level_percent ?? null}
            unit="%"
            rawUnit="ADC"
            measurementType="MEASURED"
            targetRange="0 - 100%"
            requiresCalibration={latestTelemetry?.water_level_percent === null && latestTelemetry?.water_level_raw !== null}
            lastUpdated={latestTelemetry ? lastSeenRelative : null}
            status={latestTelemetry?.water_level_raw ? "normal" : "offline"}
          />

          {/* Card 4: Flow Meter (Interrupt GPIO27) */}
          <SensorCard
            type="flow_rate"
            title="Flow Meter (GPIO27)"
            rawValue={latestTelemetry?.flow_pulses ?? null}
            calibratedValue={latestTelemetry?.flow_lpm ?? null}
            unit="L/min"
            rawUnit="Pulses"
            measurementType="MEASURED"
            targetRange="1.0 - 80.0 L/min"
            requiresCalibration={latestTelemetry?.flow_lpm === null && latestTelemetry?.flow_pulses !== null}
            lastUpdated={latestTelemetry ? lastSeenRelative : null}
            status={latestTelemetry?.flow_pulses !== null && latestTelemetry?.flow_pulses !== undefined ? "normal" : "offline"}
          />
        </div>

        {/* Derived & Calculated Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Card 5: Accumulated Volume (DERIVED) */}
          <SensorCard
            type="total_flow"
            title="Accumulated Water Volume"
            calibratedValue={latestTelemetry?.accumulated_volume_liters ?? null}
            unit="Liters"
            measurementType="DERIVED"
            targetRange="Continuous Integration"
            lastUpdated={latestTelemetry ? lastSeenRelative : null}
            status={latestTelemetry?.accumulated_volume_liters ? "normal" : "offline"}
          />

          {/* Card 6: Dissolved Oxygen (CALCULATED) */}
          <SensorCard
            type="dissolved_oxygen"
            title="Calculated Dissolved Oxygen"
            calibratedValue={latestTelemetry?.dissolved_oxygen_mg_l ?? null}
            unit="mg/L"
            measurementType="CALCULATED"
            targetRange="Backend Aeration Model"
            lastUpdated={latestTelemetry ? lastSeenRelative : null}
            status="unavailable"
            isDOUnavailable={latestTelemetry?.dissolved_oxygen_mg_l === null || latestTelemetry?.dissolved_oxygen_mg_l === undefined}
            calculatedExplanation="Evaluated dynamically on backend model. Returns 'Calculation unavailable' if sensor parameters are uncalibrated."
          />
        </div>
      </section>

      {/* Live Visual Section / Empty State */}
      <section className="pt-2">
        {!hasTelemetry ? (
          <EmptyState
            icon={Radio}
            title="Waiting for sensor data"
            description="Connect your ESP32 monitoring device to begin receiving live measurements. No simulated or fabricated readings are displayed."
            badgeText="Hardware Link Standby"
            actionText="Open ESP32 Setup Guide"
            onAction={() => (window.location.href = "/dashboard/hardware")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PhChart data={chartData} />
            <TurbidityChart data={chartData} />
          </div>
        )}
      </section>
    </div>
  );
}
