"use client";

import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, AlertCircle, Info, Check, CheckCheck } from "lucide-react";
import { formatDateTime } from "@/lib/utils/cn";

interface AlertItem {
  id: string;
  parameter: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  created_at: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/v1/alerts?status=ACTIVE");
        if (res.ok) {
          const json = await res.json();
          setAlerts(json.alerts || []);
        }
      } catch (err) {
        console.error("Alert fetch failed:", err);
      }
    }
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {activeCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/50">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl z-50 animate-fade-in border border-white/10">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">System Alerts</span>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {activeCount} Active
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                <CheckCheck className="w-8 h-8 mx-auto mb-2 text-emerald-400 stroke-[1.5]" />
                <p className="font-medium text-white">All Systems Nominal</p>
                <p className="text-neutral-400 mt-1">No active hardware or water alerts.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const { relative } = formatDateTime(alert.created_at);
                const isCritical = alert.severity === "CRITICAL";
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs ${
                      isCritical
                        ? "bg-rose-950/30 border-rose-500/30 text-rose-200"
                        : "bg-amber-950/30 border-amber-500/30 text-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-semibold uppercase">{alert.parameter}</span>
                      <span className="text-[10px] opacity-75">{relative}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-300">{alert.message}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
