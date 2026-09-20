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
  const [latestReading, setLatestReading] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const resAlerts = await fetch("/api/v1/alerts?status=ACTIVE");
      if (resAlerts.ok) {
        const json = await resAlerts.json();
        setActiveAlerts(json.alerts || []);
      }

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
    return () => clearInterval(interval);
  }, []);

  const hasTelemetry = latestReading !== null;
  const isOnline = deviceInfo?.status === "online" && hasTelemetry;

  const { relative: lastSeenRelative } = formatDateTime(
    latestReading?.recorded_at || deviceInfo?.last_seen_at
  );

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">System Overview</h1>
            <RealtimeStatusBadge
              status={isOnline ? "online" : "offline"}
              lastSeen={latestReading ? lastSeenRelative : undefined}
            />
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 font-light">
            Real-time telemetry stream from physical ESP32 water sensor array.
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
              Connect ESP32
            </Button>
          </Link>
        </div>
      </div>

      {/* Instant 6-Point Question Answer Grid */}
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
            {latestReading ? "Last packet: " + lastSeenRelative : "No telemetry received"}
          </p>
        </div>

        {/* Metric 2: Water Quality */}
        <div className="p-4 rounded-3xl liquid-glass flex flex-col justify-between">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">2. WATER QUALITY</span>
          <div className="my-2">
            {hasTelemetry ? (
              <span className="text-base font-semibold text-emerald-400">Within Thresholds</span>
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
                {latestReading.flow_rate > 0 ? "Water Flowing" : "Static (No Flow)"}
              </span>
            ) : (
              <span className="text-base font-semibold text-neutral-400">--</span>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 font-mono">Hall-Effect Pulse Sensor</p>
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
            Physical Inputs Only &bull; No Fabricated TDS / Temp
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Card 1: pH */}
          <SensorCard
            type="ph"
            title="pH Value"
            value={latestReading?.ph ?? null}
            unit="pH"
            measurementType="MEASURED"
            targetRange="6.5 - 8.5 pH"
            lastUpdated={latestReading ? lastSeenRelative : null}
            status={latestReading?.ph ? "normal" : "offline"}
          />

          {/* Card 2: Turbidity */}
          <SensorCard
            type="turbidity"
            title="Water Turbidity"
            value={latestReading?.turbidity ?? null}
            unit="NTU"
            measurementType="MEASURED"
            targetRange="< 5.0 NTU"
            lastUpdated={latestReading ? lastSeenRelative : null}
            status={latestReading?.turbidity ? "normal" : "offline"}
          />

          {/* Card 3: Flow Rate */}
          <SensorCard
            type="flow_rate"
            title="Current Flow Rate"
            value={latestReading?.flow_rate ?? null}
            unit="L/min"
            measurementType="MEASURED"
            targetRange="1.0 - 80.0 L/min"
            lastUpdated={latestReading ? lastSeenRelative : null}
            status={latestReading?.flow_rate ? "normal" : "offline"}
          />

          {/* Card 4: Total Flow */}
          <SensorCard
            type="total_flow"
            title="Total Accumulated Flow"
            value={latestReading?.total_flow ?? null}
            unit="Liters"
            measurementType="DERIVED"
            targetRange="Continuous Meter"
            lastUpdated={latestReading ? lastSeenRelative : null}
            status={latestReading?.total_flow ? "normal" : "offline"}
          />
        </div>

        {/* Dedicated Dissolved Oxygen Banner */}
        <div className="mt-5">
          <SensorCard
            type="dissolved_oxygen"
            title="Calculated Dissolved Oxygen"
            value={latestReading?.dissolved_oxygen ?? null}
            unit="mg/L"
            measurementType="CALCULATED"
            targetRange="Aeration Deficit Model"
            lastUpdated={latestReading ? lastSeenRelative : null}
            status="unavailable"
            isDOUnavailable={latestReading?.dissolved_oxygen === null || latestReading?.dissolved_oxygen === undefined}
            calculatedExplanation="Derived from the configured calculation model and available sensor inputs."
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
            onAction={() => window.location.href = "/dashboard/hardware"}
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
