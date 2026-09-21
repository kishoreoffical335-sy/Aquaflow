"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { MeasurementTypeBadge } from "@/components/ui/Badge";
import {
  FlaskConical,
  Waves,
  Gauge,
  Droplets,
  Activity,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Volume2,
} from "lucide-react";
import { hardwareConfig } from "@/lib/hardware/config";

export default function SensorsMatrixPage() {
  const sensorMatrix = [
    {
      name: "pH Glass Electrode + 4-in-1 UART Module",
      type: "ph",
      unit: "pH",
      classification: "MEASURED" as const,
      interface: "UART2 (HardwareSerial2)",
      pinConfig: "RX: GPIO16 | TX: GPIO17 | 9600 Baud",
      range: "0.00 — 14.00 pH",
      sampling: "Continuous UART stream (10s sync)",
      calibration: "pH standard buffer calibration support (4.01, 7.00, 10.01)",
      description: "4-in-1 UART multi-sensor module. ESP32 parses the 'PH:' field from ASCII packet 'PH:7.31, W:1, L:74, T:59,'. Never connected to ADC GPIO34.",
      icon: FlaskConical,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      name: "Optical Turbidity Sensor",
      type: "turbidity",
      unit: "Raw ADC (0-4095) / NTU",
      classification: "MEASURED" as const,
      interface: "Analog ADC1",
      pinConfig: "GPIO32 (DO NOT use GPIO35)",
      range: "0 — 4095 ADC (0 — 4000 NTU)",
      sampling: "Continuous analogRead(32)",
      calibration: "Required for NTU conversion; returns null if uncalibrated",
      description: "Light-scattering optical clarity detector. Connected strictly to ADC1 GPIO32. Initially stores raw ADC value. NTU calibration required for engineering units.",
      icon: Waves,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      name: "Water Level Sensor",
      type: "water_level",
      unit: "Raw ADC (0-4095) / %",
      classification: "MEASURED" as const,
      interface: "Analog ADC1",
      pinConfig: "GPIO34 (Dedicated to Level Sensor)",
      range: "0 — 4095 ADC (0 — 100%)",
      sampling: "Continuous analogRead(34)",
      calibration: "Required for percentage conversion; returns null if uncalibrated",
      description: "Analog water level depth sensor. Uses ADC1 GPIO34. Initially stores raw ADC. Percentage calibration required for engineering units.",
      icon: Droplets,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      name: "Hall-Effect Flow Meter",
      type: "flow_rate",
      unit: "Pulses / L/min",
      classification: "MEASURED" as const,
      interface: "Hardware Interrupt Pulse",
      pinConfig: "GPIO27 (Interrupt)",
      range: "1.0 — 80.0 L/min",
      sampling: "Interrupt accumulator (10s delta)",
      calibration: "Required for L/min conversion; returns null if uncalibrated",
      description: "Turbine rotor pulse counter via GPIO27 hardware interrupt. Stores raw flow_pulses. Does not invent arbitrary pulses-per-liter factors without calibration.",
      icon: Gauge,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Accumulated Water Volume",
      type: "total_flow",
      unit: "Liters",
      classification: "DERIVED" as const,
      interface: "Flow Pulse Integration",
      pinConfig: "Derived Mathematically",
      range: "0 — 9,999,999 L",
      sampling: "Discrete interval integration",
      calibration: "Depends on valid physical flow calibration coefficient",
      description: "Derived mathematically by integrating calibrated flow volume over elapsed measurement windows.",
      icon: Droplets,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Calculated Dissolved Oxygen",
      type: "dissolved_oxygen",
      unit: "mg/L",
      classification: "CALCULATED" as const,
      interface: "Backend Aeration Deficit Model",
      pinConfig: "No Physical Sensor",
      range: "0.0 — 20.0 mg/L",
      sampling: "Server model execution",
      calibration: "Returns null / 'Calculation unavailable' when inputs insufficient",
      description: "Calculated strictly from water flow velocity and aeration models. There is no physical DO sensor. Never misrepresented as Measured.",
      icon: Activity,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  const peripheralOutputs = [
    {
      name: "16x2 Character LCD Display",
      interface: "I2C Bus (SDA: GPIO21, SCL: GPIO22)",
      address: "0x27 (PCF8574 Backpack)",
      role: "Real-time local parameter display (pH, raw ADC, flow pulses, system state)",
      icon: Monitor,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      name: "Active / Passive Alarm Buzzer",
      interface: "Digital Output (GPIO25)",
      address: "Active High",
      role: "Audible notification on critical threshold violations, water burst anomaly, or system faults",
      icon: Volume2,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-white/5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Sensor Infrastructure</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Authoritative technical specifications and data classifications for physical hardware sensors and calculated parameters.
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
                      <p className="text-xs font-mono text-neutral-400">{sensor.unit}</p>
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
                    <span className="text-white font-semibold">{sensor.interface}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pin Assignment</span>
                    <span className="text-cyan-300 font-semibold">{sensor.pinConfig}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Range</span>
                    <span className="text-white">{sensor.range}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calibration Rule</span>
                    <span className="text-amber-300 text-[11px]">{sensor.calibration}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Synchronized with Central Hardware Config</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Output Peripherals Matrix */}
      <div>
        <h2 className="text-lg font-semibold text-white tracking-tight mb-4">Hardware Output Peripherals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {peripheralOutputs.map((out, idx) => {
            const Icon = out.icon;
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${out.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{out.name}</h3>
                    <p className="text-xs font-mono text-cyan-300">{out.interface}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{out.role}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
