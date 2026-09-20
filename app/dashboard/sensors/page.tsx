"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { MeasurementTypeBadge } from "@/components/ui/Badge";
import { FlaskConical, Waves, Gauge, Droplets, Activity, CheckCircle2, AlertCircle } from "lucide-react";

export default function SensorsMatrixPage() {
  const sensorMatrix = [
    {
      name: "pH Glass Electrode",
      type: "ph",
      unit: "pH",
      classification: "MEASURED" as const,
      interface: "Analog ADC (GPIO 34)",
      range: "0.00 -- 14.00 pH",
      sampling: "Continuous 10s packet",
      description: "Direct analog potential measurement calibrated with 4.01, 7.00, and 10.01 pH standard buffer solutions.",
      icon: FlaskConical,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      name: "Optical Turbidity Sensor",
      type: "turbidity",
      unit: "NTU",
      classification: "MEASURED" as const,
      interface: "Analog ADC (GPIO 35)",
      range: "0 -- 4000 NTU",
      sampling: "Continuous 10s packet",
      description: "Optical light-scattering detector measuring suspended matter. Calibrated against Formazin Nephelometric standards.",
      icon: Waves,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      name: "Hall-Effect Flow Meter",
      type: "flow_rate",
      unit: "L/min",
      classification: "MEASURED" as const,
      interface: "Interrupt Pulse (GPIO 27)",
      range: "1.0 -- 80.0 L/min",
      sampling: "Continuous pulse accumulator",
      description: "Turbine rotor pulse counting. Measures instantaneous flow velocity.",
      icon: Gauge,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Accumulated Water Volume",
      type: "total_flow",
      unit: "Liters",
      classification: "DERIVED" as const,
      interface: "Derived from Flow Pulse Integration",
      range: "0 -- 9,999,999 L",
      sampling: "Continuous integration",
      description: "Derived mathematically from flow velocity over elapsed measurement intervals.",
      icon: Droplets,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Calculated Dissolved Oxygen",
      type: "dissolved_oxygen",
      unit: "mg/L",
      classification: "CALCULATED" as const,
      interface: "Backend Aeration Deficit Model",
      range: "0.0 -- 20.0 mg/L",
      sampling: "On-demand model execution",
      description: "Calculated conditionally from water flow aeration dynamics. Strictly labeled as Calculated, never Measured.",
      icon: Activity,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-white/5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Sensor Infrastructure</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Detailed technical specifications for physical hardware sensors and calculated parameters.
        </p>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sensorMatrix.map((sensor, idx) => {
          const Icon = sensor.icon;
          return (
            <Card key={idx} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${sensor.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{sensor.name}</h3>
                      <p className="text-xs font-mono text-neutral-400">{sensor.unit} Unit</p>
                    </div>
                  </div>
                  <MeasurementTypeBadge type={sensor.classification} />
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                  {sensor.description}
                </p>

                <div className="space-y-2 text-xs font-mono text-neutral-400 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between">
                    <span>Hardware Interface</span>
                    <span className="text-white">{sensor.interface}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Range</span>
                    <span className="text-white">{sensor.range}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sampling Cadence</span>
                    <span className="text-white">{sensor.sampling}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for Hardware Telemetry</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
