"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { WaterBackground } from "@/components/ui/WaterBackground";
import { Droplets, Menu, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020813] text-white flex relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      <WaterBackground />

      {/* Desktop Liquid Glass Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top App Bar */}
        <header className="h-16 border-b border-white/10 bg-[#020813]/60 backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl liquid-glass text-neutral-300 hover:text-white"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-tight hidden sm:inline-block">
                AquaFlow Telemetry Console
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/25">
                PROD-NODE-01
              </span>
            </div>
          </div>

          {/* Quick Actions and Notification Center */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard/hardware">
              <Button size="sm" variant="outline" className="hidden sm:inline-flex text-xs py-1.5" icon={<Terminal className="w-3.5 h-3.5" />}>
                ESP32 Guide
              </Button>
            </Link>
            <NotificationCenter />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">AquaFlow IoT</span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2 text-sm font-medium">
                <Link href="/dashboard" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Overview</Link>
                <Link href="/dashboard/live" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Live Monitoring</Link>
                <Link href="/dashboard/history" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Historical Data</Link>
                <Link href="/dashboard/analytics" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Analytics</Link>
                <Link href="/dashboard/alerts" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Alerts</Link>
                <Link href="/dashboard/devices" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Devices</Link>
                <Link href="/dashboard/sensors" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Sensors</Link>
                <Link href="/dashboard/hardware" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Hardware Integration</Link>
                <Link href="/dashboard/reports" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Reports / Export</Link>
                <Link href="/dashboard/settings" onClick={() => setMobileNavOpen(false)} className="p-3 rounded-xl hover:bg-white/5">Settings</Link>
              </div>
            </div>
          </div>
        )}

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
