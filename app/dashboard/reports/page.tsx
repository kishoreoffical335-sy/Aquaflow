"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, FileSpreadsheet, Calendar, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

export default function ReportsExportPage() {
  const [range, setRange] = useState<"10d" | "30d" | "custom">("10d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState(false);

  const getExportUrl = () => {
    if (range === "custom" && startDate && endDate) {
      return `/api/v1/export?start=${startDate}&end=${endDate}`;
    }
    return `/api/v1/export?days=${range === "10d" ? 10 : 30}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-white/5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Telemetry Reports &amp; Export</h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Export verified telemetry logs directly to styled, frozen-header Microsoft Excel (.xlsx) workbooks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Export Configuration Card */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Generate Excel (.xlsx) Report</h3>
              <p className="text-xs text-neutral-400">Standardized plant telemetry export with water assessment</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-neutral-300 mb-3">
                1. Select Time Range
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setRange("10d")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    range === "10d"
                      ? "bg-cyan-400/10 border-cyan-400 text-white"
                      : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold block">Last 10 Days</span>
                  <span className="text-[10px] text-neutral-400">Standard Shift Review</span>
                </button>

                <button
                  onClick={() => setRange("30d")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    range === "30d"
                      ? "bg-cyan-400/10 border-cyan-400 text-white"
                      : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold block">Last 30 Days</span>
                  <span className="text-[10px] text-neutral-400">Monthly Compliance</span>
                </button>

                <button
                  onClick={() => setRange("custom")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    range === "custom"
                      ? "bg-cyan-400/10 border-cyan-400 text-white"
                      : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold block">Custom Range</span>
                  <span className="text-[10px] text-neutral-400">Specific Dates</span>
                </button>
              </div>
            </div>

            {range === "custom" && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <a href={getExportUrl()} download>
                <Button size="lg" variant="primary" className="w-full text-xs" icon={<Download className="w-4 h-4" />}>
                  Download Microsoft Excel File (.xlsx)
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* Export Column Specifications Card */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Included Telemetry Fields</h3>
          <p className="text-xs text-neutral-400 mb-4">
            In compliance with strict data integrity rules, the generated file includes real sensor channels only:
          </p>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-neutral-300">Date &amp; Time (UTC)</span>
              <span className="text-neutral-400 text-[10px]">ISO 8601</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-cyan-400 font-medium">pH Reading</span>
              <span className="text-neutral-400 text-[10px]">0--14 pH</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-sky-400 font-medium">Turbidity Index</span>
              <span className="text-neutral-400 text-[10px]">NTU</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-emerald-400 font-medium">Flow Velocity</span>
              <span className="text-neutral-400 text-[10px]">L/min</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-blue-400 font-medium">Total Accumulated Flow</span>
              <span className="text-neutral-400 text-[10px]">Liters</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-purple-400 font-medium">Calculated DO</span>
              <span className="text-neutral-400 text-[10px]">mg/L (or &ldquo;--&rdquo;)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-neutral-300 font-medium">Quality Assessment</span>
              <span className="text-emerald-400 text-[10px]">Normal/Warning</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
