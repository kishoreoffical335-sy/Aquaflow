"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { RealtimeStatusBadge } from "@/components/dashboard/RealtimeStatusBadge";
import { formatDateTime } from "@/lib/utils/cn";
import {
  Cpu,
  Plus,
  Key,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Trash2,
} from "lucide-react";

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceId, setNewDeviceId] = useState("PROD-NODE-01");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/devices");
      if (res.ok) {
        const json = await res.json();
        setDevices(json.devices || []);
      }
    } catch (err) {
      console.error("Device fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_name: newDeviceName,
          device_id: newDeviceId,
          device_uid: newDeviceId,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setGeneratedKey(json.apiKey);
        fetchDevices();
      }
    } catch (err) {
      console.error("Device creation error:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Device Management</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Provision ESP32 nodes, manage API credentials, and monitor hardware heartbeats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchDevices}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Register Device
          </Button>
        </div>
      </div>

      {/* Device Credentials Generated Modal */}
      {generatedKey && (
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/20 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Key className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Device Secret Generated</h3>
          </div>
          <p className="text-xs text-neutral-300 mb-4">
            Copy this API Key now and paste into <code>firmware/esp32_water_monitor/esp32_water_monitor.ino</code> as <code>DEVICE_API_KEY</code>. For security, it is stored as a SHA-256 hash and cannot be viewed again.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-300">
            <span className="flex-1 select-all break-all">{generatedKey}</span>
            <button
              onClick={() => copyToClipboard(generatedKey)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => setGeneratedKey(null)}
            className="mt-4 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white"
          >
            Done
          </button>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddModal && !generatedKey && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-1">Provision New ESP32 Node</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Create a cryptographic API credential pair for your microcontroller.
            </p>

            <form onSubmit={handleCreateDevice} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Device Name
                </label>
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="Main Water Prototype Node"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Device ID (Identifier)
                </label>
                <input
                  type="text"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  placeholder="PROD-NODE-01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create &amp; Generate Token
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Devices List or Empty State */}
      {devices.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No monitoring devices connected"
          description="Register your first ESP32 node to generate its secure API key and begin receiving real telemetry."
          badgeText="Device Registry"
          actionText="Register ESP32 Device"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device: any) => {
            const { relative } = formatDateTime(device.last_seen_at);

            return (
              <Card key={device.id} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{device.device_name}</h3>
                        <span className="text-[11px] font-mono text-cyan-400">{device.device_id || device.device_uid}</span>
                      </div>
                    </div>
                    <RealtimeStatusBadge
                      status={device.status}
                      lastSeen={device.last_seen_at ? relative : undefined}
                    />
                  </div>

                  <div className="my-4 space-y-2 text-xs text-neutral-400 font-mono">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span>Firmware</span>
                      <span className="text-neutral-200">v{device.firmware_version || "1.0.0"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span>Last Telemetry</span>
                      <span className="text-neutral-200">{device.last_seen_at ? relative : "Never"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span>Security Mode</span>
                      <span className="text-emerald-400">SHA-256 Hashed Token</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <a href="/dashboard/hardware" className="text-xs text-cyan-400 hover:underline">
                    View Hardware Pin Mapping &rarr;
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
