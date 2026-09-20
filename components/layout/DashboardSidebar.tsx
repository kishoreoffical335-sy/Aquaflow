"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  History,
  LineChart,
  BellRing,
  Cpu,
  Binary,
  FileSpreadsheet,
  Settings,
  Terminal,
  LogOut,
  Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Live Monitoring", href: "/dashboard/live", icon: Radio },
  { label: "Historical Data", href: "/dashboard/history", icon: History },
  { label: "Analytics", href: "/dashboard/analytics", icon: LineChart },
  { label: "Alerts", href: "/dashboard/alerts", icon: BellRing },
  { label: "Devices", href: "/dashboard/devices", icon: Cpu },
  { label: "Sensors", href: "/dashboard/sensors", icon: Binary },
  { label: "Hardware Integration", href: "/dashboard/hardware", icon: Terminal },
  { label: "Reports / Export", href: "/dashboard/reports", icon: FileSpreadsheet },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between h-screen sticky top-0 p-4 border-r border-white/10 bg-[#020813]/70 backdrop-blur-2xl">
      <div>
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-3 py-4 mb-4 group">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cyan-400 via-aqua-500 to-blue-600 flex items-center justify-center shadow-liquid-glow group-hover:scale-105 transition-transform">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-white block">AquaFlow</span>
            <span className="text-[10px] font-mono text-cyan-300">IoT Telemetry Node</span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200",
                  isActive
                    ? "liquid-glass text-white shadow-sm border border-cyan-400/30 font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("w-4 h-4 stroke-[1.75]", isActive ? "text-cyan-300" : "text-neutral-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Exit */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-mono text-white shrink-0">
              OP
            </div>
            <div className="truncate">
              <span className="text-xs font-medium text-white block truncate">Plant Operator</span>
              <span className="text-[10px] text-neutral-400 block truncate">ESP32 Secure Link</span>
            </div>
          </div>
          <Link href="/" className="text-neutral-400 hover:text-rose-400 p-1" title="Exit to Landing">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
