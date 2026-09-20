"use client";

import React from "react";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RealtimeStatusBadgeProps {
  status: "online" | "offline" | "warning" | "fault";
  lastSeen?: string | null;
  className?: string;
}

export function RealtimeStatusBadge({ status, lastSeen, className }: RealtimeStatusBadgeProps) {
  const configs = {
    online: {
      dotBg: "bg-cyan-400",
      text: "Online",
      textColor: "text-cyan-300",
      borderColor: "border-cyan-400/30",
      bgColor: "bg-cyan-500/10",
      icon: Wifi,
    },
    warning: {
      dotBg: "bg-amber-400",
      text: "Warning",
      textColor: "text-amber-300",
      borderColor: "border-amber-400/30",
      bgColor: "bg-amber-500/10",
      icon: AlertTriangle,
    },
    fault: {
      dotBg: "bg-rose-400",
      text: "Fault",
      textColor: "text-rose-300",
      borderColor: "border-rose-400/30",
      bgColor: "bg-rose-500/10",
      icon: AlertTriangle,
    },
    offline: {
      dotBg: "bg-neutral-500",
      text: "Awaiting Hardware",
      textColor: "text-neutral-400",
      borderColor: "border-white/10",
      bgColor: "bg-white/5",
      icon: WifiOff,
    },
  };

  const config = configs[status] || configs.offline;
  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium liquid-glass shadow-sm", config.bgColor, config.borderColor, config.textColor, className)}>
      <span className="relative flex h-2 w-2">
        {status === "online" && (
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.dotBg)} />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", config.dotBg)} />
      </span>
      <span className="font-mono tracking-wide">{config.text}</span>
      {lastSeen && (
        <span className="text-neutral-400 text-[10px] pl-1 border-l border-white/10 font-sans">
          {lastSeen}
        </span>
      )}
    </div>
  );
}
