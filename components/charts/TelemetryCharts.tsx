"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { LineChart, Activity, Waves, Gauge, Droplets } from "lucide-react";

interface TelemetryPoint {
  recorded_at: string;
  timeLabel: string;
  ph: number | null;
  turbidity: number | null;
  flow_rate: number | null;
  total_flow: number | null;
  dissolved_oxygen: number | null;
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  data: TelemetryPoint[];
  dataKey: keyof TelemetryPoint;
  unit: string;
  color: string;
  gradientId: string;
  yDomain?: [number, number];
  icon?: any;
}

export function SingleMetricChart({
  title,
  subtitle,
  data,
  dataKey,
  unit,
  color,
  gradientId,
  yDomain,
  icon: Icon = Activity,
}: ChartCardProps) {
  const validPoints = data.filter((d) => d[dataKey] !== null && d[dataKey] !== undefined);

  return (
    <div className="liquid-glass-card p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 shadow-sm"
            style={{ backgroundColor: `${color}18`, color: color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-neutral-400 font-mono">{subtitle}</p>
          </div>
        </div>
        {validPoints.length > 0 && (
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/25">
            {validPoints.length} Packets
          </span>
        )}
      </div>

      <div className="h-64 w-full mt-2">
        {validPoints.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <LineChart className="w-8 h-8 text-neutral-500 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-neutral-300">No telemetry available for this period</p>
            <p className="text-[11px] text-neutral-400 mt-0.5 font-light">
              Live SVG area charts will stream once physical ESP32 data is received.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={yDomain || ["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(4, 14, 32, 0.85)",
                  borderColor: "rgba(56, 216, 244, 0.3)",
                  borderRadius: "16px",
                  fontSize: "12px",
                  boxShadow: "0 15px 35px -5px rgba(0,0,0,0.7)",
                  backdropFilter: "blur(20px)",
                  color: "#f8fafc",
                }}
                formatter={(val: any) => [`${val} ${unit}`, title]}
                labelStyle={{ color: "#38d8f4", marginBottom: "4px", fontFamily: "monospace" }}
              />
              <Area
                type="monotone"
                dataKey={dataKey as string}
                stroke={color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function PhChart({ data }: { data: TelemetryPoint[] }) {
  return (
    <SingleMetricChart
      title="pH Dynamics Over Time"
      subtitle="Acidity & Alkalinity Scale (0-14 pH)"
      data={data}
      dataKey="ph"
      unit="pH"
      color="#00c4ec"
      gradientId="phGradient"
      yDomain={[4, 10]}
      icon={Activity}
    />
  );
}

export function TurbidityChart({ data }: { data: TelemetryPoint[] }) {
  return (
    <SingleMetricChart
      title="Turbidity Index Over Time"
      subtitle="Suspended Particulate Clarity (NTU)"
      data={data}
      dataKey="turbidity"
      unit="NTU"
      color="#38bdf8"
      gradientId="turbGradient"
      icon={Waves}
    />
  );
}

export function FlowChart({ data }: { data: TelemetryPoint[] }) {
  return (
    <SingleMetricChart
      title="Instantaneous Water Flow"
      subtitle="Pipe Velocity in Liters/Minute"
      data={data}
      dataKey="flow_rate"
      unit="L/min"
      color="#34d399"
      gradientId="flowGradient"
      icon={Gauge}
    />
  );
}

export function TotalFlowChart({ data }: { data: TelemetryPoint[] }) {
  return (
    <SingleMetricChart
      title="Accumulated Volume Flow"
      subtitle="Total Dispensed Volume in Liters"
      data={data}
      dataKey="total_flow"
      unit="L"
      color="#60a5fa"
      gradientId="totalFlowGradient"
      icon={Droplets}
    />
  );
}

export function DoChart({ data }: { data: TelemetryPoint[] }) {
  return (
    <SingleMetricChart
      title="Calculated Dissolved Oxygen"
      subtitle="Aeration Deficit Model (mg/L)"
      data={data}
      dataKey="dissolved_oxygen"
      unit="mg/L"
      color="#c084fc"
      gradientId="doGradient"
      icon={Activity}
    />
  );
}
