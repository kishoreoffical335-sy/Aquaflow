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
  AlertTriangle,
  RotateCw,
  X,
  AlertCircle,
} from "lucide-react";

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [selectedDeviceForRotate, setSelectedDeviceForRotate] = useState<any | null>(null);

  // Form states with canonical defaults
  const [newDeviceName, setNewDeviceName] = useState("AQUAFLOW");
  const [newDeviceId, setNewDeviceId] = useState("PROD-NODE-01");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deviceAlreadyExists, setDeviceAlreadyExists] = useState(false);

  // Token output state (stored only in memory, never persisted to localStorage)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatedForDevice, setGeneratedForDevice] = useState<string>("PROD-NODE-01");
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

  const handleCreateDevice = async (e?: React.FormEvent, rotate: boolean = false) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setDeviceAlreadyExists(false);

    const targetName = (newDeviceName || "AQUAFLOW").trim();
    const targetId = (newDeviceId || "PROD-NODE-01").trim().toUpperCase();

    try {
      const res = await fetch("/api/v1/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_name: targetName,
          device_id: targetId,
          device_uid: targetId,
          rotate,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.apiKey) {
        setGeneratedKey(json.apiKey);
        setGeneratedForDevice(targetId);
        setShowAddModal(false);
        setShowRotateModal(false);
        setSelectedDeviceForRotate(null);
        await fetchDevices();
      } else if (res.status === 409 || json.exists) {
        setDeviceAlreadyExists(true);
        setFormError(
          json.message || `Device "${targetId}" is already registered. Choose "Rotate Token" to generate a new key for this node.`
        );
      } else {
        setFormError(json.error || json.message || "Failed to provision device. Please verify database connection.");
      }
    } catch (err: any) {
      setFormError(err.message || "Network error while provisioning device.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRotateFromCard = (device: any) => {
    setSelectedDeviceForRotate(device);
    setNewDeviceName(device.device_name || "AQUAFLOW");
    setNewDeviceId(device.device_id || device.device_uid || "PROD-NODE-01");
    setFormError(null);
    setShowRotateModal(true);
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
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Sync
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setNewDeviceName("AQUAFLOW");
              setNewDeviceId("PROD-NODE-01");
              setFormError(null);
              setDeviceAlreadyExists(false);
              setShowAddModal(true);
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Register Device
          </Button>
        </div>
      </div>

      {/* Generated Token Success Screen */}
      {generatedKey && (
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/20 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-semibold text-white">
                API Token Generated for <span className="font-mono text-cyan-300">{generatedForDevice}</span>
              </h3>
            </div>
            <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SHA-256 Hashed in Database
            </span>
          </div>

          <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
            Copy this secret device API token now. Paste it into your ESP32 C++ firmware file{" "}
            <code className="px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-mono text-[11px]">
              firmware/esp32_water_monitor/esp32_water_monitor.ino
            </code>{" "}
            as <code className="text-emerald-300 font-mono">DEVICE_API_KEY</code>.
            <br />
            <span className="text-amber-400 font-medium">
              &bull; For security, this plaintext token will only be shown once and cannot be recovered later.
            </span>
          </p>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-black/70 border border-white/15 font-mono text-xs text-emerald-300">
            <span className="flex-1 select-all break-all tracking-wider font-semibold">{generatedKey}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => copyToClipboard(generatedKey)}
              icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? "Copied!" : "Copy Token"}
            </Button>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <a
              href="/dashboard/hardware"
              className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1 font-medium"
            >
              View ESP32 Hardware Pin Configuration &rarr;
            </a>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setGeneratedKey(null)}
            >
              Done &amp; Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Provision New ESP32 Node Modal */}
      {showAddModal && !generatedKey && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 border border-white/15 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Provision New ESP32 Node
            </h3>
            <p className="text-xs text-neutral-400 mb-5">
              Generate a cryptographically secure device API credential pair for your microcontroller.
            </p>

            {/* Error / Conflict Alert */}
            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex flex-col gap-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{formError}</span>
                </div>
                {deviceAlreadyExists && (
                  <div className="pt-2 border-t border-rose-500/20 flex items-center justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                      onClick={() => handleCreateDevice(undefined, true)}
                      disabled={submitting}
                      icon={<RotateCw className={`w-3.5 h-3.5 ${submitting ? "animate-spin" : ""}`} />}
                    >
                      {submitting ? "Rotating..." : `Rotate Token for ${newDeviceId}`}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={(e) => handleCreateDevice(e, false)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Device Name
                </label>
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="AQUAFLOW"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Device ID (Identifier)
                </label>
                <input
                  type="text"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value.toUpperCase())}
                  placeholder="PROD-NODE-01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  required
                  disabled={submitting}
                />
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                  Canonical production node: PROD-NODE-01
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  icon={submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                >
                  {submitting ? "Provisioning..." : "Create & Generate Token"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Rotate Key Confirmation Modal */}
      {showRotateModal && selectedDeviceForRotate && !generatedKey && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 border border-white/15 shadow-2xl relative">
            <button
              onClick={() => {
                setShowRotateModal(false);
                setSelectedDeviceForRotate(null);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-amber-400" />
              Rotate API Key for {selectedDeviceForRotate.device_id || selectedDeviceForRotate.device_uid}
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Rotating credentials will invalidate the existing API token for this microcontroller and generate a new one.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">
                {formError}
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 mb-6 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                After rotating, you must update <code className="text-white font-mono">DEVICE_API_KEY</code> in the ESP32 firmware before the physical node can submit telemetry.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRotateModal(false);
                  setSelectedDeviceForRotate(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                onClick={() => handleCreateDevice(undefined, true)}
                disabled={submitting}
                icon={submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
              >
                {submitting ? "Rotating Token..." : "Confirm & Rotate Token"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Devices List or Empty State */}
      {devices.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No monitoring devices connected"
          description="Register your canonical ESP32 node (PROD-NODE-01) to generate its secure API key and begin receiving real telemetry."
          badgeText="Device Registry"
          actionText="Provision PROD-NODE-01"
          onAction={() => {
            setNewDeviceName("AQUAFLOW");
            setNewDeviceId("PROD-NODE-01");
            setFormError(null);
            setDeviceAlreadyExists(false);
            setShowAddModal(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device: any) => {
            const { relative } = formatDateTime(device.last_seen_at);

            return (
              <Card key={device.id} className="p-6 flex flex-col justify-between hover:border-white/20 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
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

                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <a href="/dashboard/hardware" className="text-xs text-cyan-400 hover:underline">
                    Hardware Pin Map &rarr;
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRotateFromCard(device)}
                    icon={<RotateCw className="w-3 h-3 text-neutral-400" />}
                    className="text-xs text-neutral-300 hover:text-white"
                  >
                    Rotate Key
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
