"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import {
  History,
  Download,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

export default function HistoricalDataPage() {
  const [filterPeriod, setFilterPeriod] = useState<"today" | "24h" | "7d" | "10d" | "30d" | "custom">("10d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    async function fetchHistoricalData() {
      setLoading(true);
      try {
        const supabase: any = createClient();

        let start = new Date();
        if (filterPeriod === "today") {
          start.setHours(0, 0, 0, 0);
        } else if (filterPeriod === "24h") {
          start.setHours(start.getHours() - 24);
        } else if (filterPeriod === "7d") {
          start.setDate(start.getDate() - 7);
        } else if (filterPeriod === "10d") {
          start.setDate(start.getDate() - 10);
        } else if (filterPeriod === "30d") {
          start.setDate(start.getDate() - 30);
        } else if (filterPeriod === "custom" && startDate) {
          start = new Date(startDate);
        }

        let query = supabase
          .from("telemetry")
          .select("*", { count: "exact" })
          .gte("timestamp", start.toISOString())
          .order("timestamp", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (filterPeriod === "custom" && endDate) {
          query = query.lte("timestamp", new Date(endDate).toISOString());
        }

        const { data } = await query;
        setRecords(data || []);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistoricalData();
  }, [filterPeriod, startDate, endDate, page]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Historical Data</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Digital Passbook Ledger: verifiable, chronological telemetry records.
          </p>
        </div>

        <a href={`/api/v1/export?days=${filterPeriod === "10d" ? 10 : 30}`}>
          <Button size="sm" variant="primary" icon={<Download className="w-3.5 h-3.5" />}>
            Export to Excel (.xlsx)
          </Button>
        </a>
      </div>

      {/* Date Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["today", "24h", "7d", "10d", "30d", "custom"] as const).map((period) => (
            <button
              key={period}
              onClick={() => {
                setFilterPeriod(period);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filterPeriod === period
                  ? "bg-cyan-400 text-white shadow-md shadow-cyan-400/20"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {period === "today"
                ? "Today"
                : period === "24h"
                ? "Last 24 Hours"
                : period === "7d"
                ? "Last 7 Days"
                : period === "10d"
                ? "Last 10 Days"
                : period === "30d"
                ? "Last 30 Days"
                : "Custom Range"}
            </button>
          ))}
        </div>

        {filterPeriod === "custom" && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
            />
            <span className="text-neutral-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}
      </div>

      {/* Passbook Ledger Table or Empty State */}
      {records.length === 0 ? (
        <EmptyState
          icon={History}
          title="No historical readings available"
          description="No stored telemetry packets found for the selected date range. As real sensor readings are received from the ESP32, they will be archived here."
          badgeText="Digital Passbook"
        />
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.03] border-b border-white/10 text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">pH (UART2)</th>
                  <th className="py-3 px-4">Turbidity (GPIO32)</th>
                  <th className="py-3 px-4">Water Level (GPIO34)</th>
                  <th className="py-3 px-4">Flow (GPIO27)</th>
                  <th className="py-3 px-4">Total Vol (L)</th>
                  <th className="py-3 px-4">Calculated DO</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                {records.map((row: any) => {
                  const { date, time } = formatDateTime(row.timestamp || row.received_at);
                  const isAbnormal =
                    (row.ph !== null && (row.ph < 6.5 || row.ph > 8.5)) ||
                    (row.turbidity_ntu !== null && row.turbidity_ntu > 5.0);

                  return (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-white block">{date}</span>
                        <span className="text-neutral-400 text-[10px]">{time}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white block font-sans font-medium">
                          {row.device_id || "PROD-NODE-01"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-cyan-400">
                        {row.ph !== null ? Number(row.ph).toFixed(2) : "--"}
                      </td>
                      <td className="py-3 px-4 text-sky-300">
                        {row.turbidity_raw !== null ? `${row.turbidity_raw} ADC` : "--"}
                        {row.turbidity_ntu !== null ? ` (${Number(row.turbidity_ntu).toFixed(1)} NTU)` : ""}
                      </td>
                      <td className="py-3 px-4 text-indigo-300">
                        {row.water_level_raw !== null ? `${row.water_level_raw} ADC` : "--"}
                        {row.water_level_percent !== null ? ` (${Number(row.water_level_percent).toFixed(1)}%)` : ""}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {row.flow_pulses !== null ? `${row.flow_pulses} pls` : "--"}
                        {row.flow_lpm !== null ? ` (${Number(row.flow_lpm).toFixed(1)} L/m)` : ""}
                      </td>
                      <td className="py-3 px-4 text-blue-400">
                        {row.accumulated_volume_liters !== null ? Number(row.accumulated_volume_liters).toFixed(1) : "--"}
                      </td>
                      <td className="py-3 px-4 text-purple-400">
                        {row.dissolved_oxygen_mg_l !== null ? Number(row.dissolved_oxygen_mg_l).toFixed(2) : "--"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                            isAbnormal
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isAbnormal ? "Warning" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
            <span>Page {page}</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={records.length < pageSize}
                onClick={() => setPage(page + 1)}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
