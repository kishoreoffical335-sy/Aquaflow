"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sliders, ShieldCheck, Check, Save, RefreshCw } from "lucide-react";
import { DEFAULT_THRESHOLDS, ThresholdConfig } from "@/lib/telemetry/alert-engine";

export default function SettingsPage() {
  const [thresholds, setThresholds] = useState<Record<string, ThresholdConfig>>(DEFAULT_THRESHOLDS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadThresholds() {
      try {
        const res = await fetch("/api/v1/thresholds");
        if (res.ok) {
          const json = await res.json();
          if (json.thresholds && json.thresholds.length > 0) {
            const map: Record<string, ThresholdConfig> = {};
            json.thresholds.forEach((t: any) => {
              map[t.parameter] = t;
            });
            setThresholds((prev) => ({ ...prev, ...map }));
          }
        }
      } catch (err) {
        console.error("Thresholds fetch error:", err);
      }
    }
    loadThresholds();
  }, []);

  const handleUpdate = (param: string, field: keyof ThresholdConfig, value: any) => {
    setThresholds((prev) => ({
      ...prev,
      [param]: {
        ...prev[param],
        [field]: value,
      },
    }));
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      for (const param of Object.keys(thresholds)) {
        await fetch("/api/v1/thresholds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(thresholds[param]),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Threshold save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configure threshold limits, alert engine cooldowns, and hardware offline timeouts.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleSaveAll}
          isLoading={loading}
          icon={saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
        >
          {saved ? "Thresholds Saved" : "Save All Changes"}
        </Button>
      </div>

      {/* Threshold Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* pH Thresholds */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">pH Thresholds</h3>
              <p className="text-xs font-mono text-cyan-400">Acidity / Alkalinity Scale</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={thresholds.ph.enabled}
                onChange={(e) => handleUpdate("ph", "enabled", e.target.checked)}
                className="rounded bg-white/10 border-white/20 text-cyan-400"
              />
              Alerts Enabled
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">Warning Low (pH)</label>
              <input
                type="number"
                step="0.1"
                value={thresholds.ph.warning_low ?? 6.5}
                onChange={(e) => handleUpdate("ph", "warning_low", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Warning High (pH)</label>
              <input
                type="number"
                step="0.1"
                value={thresholds.ph.warning_high ?? 8.5}
                onChange={(e) => handleUpdate("ph", "warning_high", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Critical Low (pH)</label>
              <input
                type="number"
                step="0.1"
                value={thresholds.ph.critical_low ?? 5.5}
                onChange={(e) => handleUpdate("ph", "critical_low", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Critical High (pH)</label>
              <input
                type="number"
                step="0.1"
                value={thresholds.ph.critical_high ?? 9.5}
                onChange={(e) => handleUpdate("ph", "critical_high", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Turbidity Thresholds */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Turbidity Thresholds</h3>
              <p className="text-xs font-mono text-sky-400">Suspended Particulate Clarity (NTU)</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={thresholds.turbidity.enabled}
                onChange={(e) => handleUpdate("turbidity", "enabled", e.target.checked)}
                className="rounded bg-white/10 border-white/20 text-cyan-400"
              />
              Alerts Enabled
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">Warning High (NTU)</label>
              <input
                type="number"
                step="0.5"
                value={thresholds.turbidity.warning_high ?? 5.0}
                onChange={(e) => handleUpdate("turbidity", "warning_high", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Critical High (NTU)</label>
              <input
                type="number"
                step="0.5"
                value={thresholds.turbidity.critical_high ?? 15.0}
                onChange={(e) => handleUpdate("turbidity", "critical_high", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Flow Rate Thresholds */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Flow Rate Limits</h3>
              <p className="text-xs font-mono text-emerald-400">Pipe Velocity &amp; Burst Detection</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={thresholds.flow_rate.enabled}
                onChange={(e) => handleUpdate("flow_rate", "enabled", e.target.checked)}
                className="rounded bg-white/10 border-white/20 text-cyan-400"
              />
              Alerts Enabled
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">Warning High (L/min)</label>
              <input
                type="number"
                step="1"
                value={thresholds.flow_rate.warning_high ?? 80.0}
                onChange={(e) => handleUpdate("flow_rate", "warning_high", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Critical Burst Ceiling (L/min)</label>
              <input
                type="number"
                step="1"
                value={thresholds.flow_rate.critical_high ?? 120.0}
                onChange={(e) => handleUpdate("flow_rate", "critical_high", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Hardware Communication Settings */}
        <Card className="p-6">
          <div className="pb-4 border-b border-white/10 mb-4">
            <h3 className="text-sm font-semibold text-white">Hardware Connection Settings</h3>
            <p className="text-xs font-mono text-neutral-400">Heartbeat &amp; Offline Detection</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 mb-1">Offline Timeout (Seconds)</label>
              <input
                type="number"
                defaultValue={60}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Flag device as Offline if no telemetry packet received within this window.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
