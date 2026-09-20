"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils/cn";
import {
  BellRing,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";

export default function AlertsPage() {
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "ALL">("ACTIVE");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const url = filterStatus === "ALL" ? "/api/v1/alerts" : `/api/v1/alerts?status=${filterStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.alerts || []);
      }
    } catch (err) {
      console.error("Alerts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus]);

  const handleAction = async (id: string, action: "ACKNOWLEDGE" | "RESOLVE") => {
    try {
      const res = await fetch("/api/v1/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (err) {
      console.error("Alert update error:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Alerts &amp; Incidents</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time incident response: deduplicated water breaches and hardware fault alerts.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={fetchAlerts}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Alerts
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        {(["ACTIVE", "ACKNOWLEDGED", "RESOLVED", "ALL"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterStatus === status
                ? "bg-white/10 text-white border border-white/10 shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {status === "ALL" ? "All Incidents" : status}
          </button>
        ))}
      </div>

      {/* Alerts List or Empty State */}
      {alerts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No alerts recorded"
          description="All sensor parameters are within configured thresholds and all ESP32 communication channels are nominal."
          badgeText="System Healthy"
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert: any) => {
            const { date, time, relative } = formatDateTime(alert.created_at);
            const isCritical = alert.severity === "CRITICAL";

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl glass-panel border transition-all ${
                  alert.status === "RESOLVED"
                    ? "border-emerald-500/20 opacity-70"
                    : isCritical
                    ? "border-rose-500/30 bg-rose-950/20"
                    : "border-amber-500/30 bg-amber-950/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase ${
                        isCritical
                          ? "bg-rose-500 text-white"
                          : "bg-amber-500 text-black"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs font-mono font-semibold uppercase text-white">
                      {alert.parameter}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      &bull; {alert.alert_type}
                    </span>
                    {alert.occurrence_count > 1 && (
                      <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-300">
                        {alert.occurrence_count}x deduplicated
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.status === "ACTIVE" && (
                      <>
                        <button
                          onClick={() => handleAction(alert.id, "ACKNOWLEDGE")}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleAction(alert.id, "RESOLVE")}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    {alert.status === "ACKNOWLEDGED" && (
                      <button
                        onClick={() => handleAction(alert.id, "RESOLVE")}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {alert.status === "RESOLVED" && (
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-200 leading-relaxed mb-3">{alert.message}</p>

                <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400 pt-2 border-t border-white/5">
                  <span>Triggered: {date} at {time} ({relative})</span>
                  {alert.threshold_value && (
                    <span>Threshold Limit: {alert.threshold_value}</span>
                  )}
                  {alert.current_value && (
                    <span>Breach Value: {alert.current_value}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
