import React from "react";
import { LucideIcon, Radio } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  badgeText?: string;
}

export function EmptyState({
  icon: Icon = Radio,
  title,
  description,
  actionText,
  onAction,
  className,
  badgeText = "Awaiting ESP32 Telemetry",
}: EmptyStateProps) {
  return (
    <div className={cn("liquid-glass rounded-3xl p-12 text-center flex flex-col items-center justify-center relative overflow-hidden", className)}>
      {/* Background Water Bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl liquid-glass border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-liquid-glow">
          <Icon className="w-8 h-8 stroke-[1.5]" />
        </div>
      </div>
      
      {badgeText && (
        <span className="mb-3 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-400/25">
          {badgeText}
        </span>
      )}

      <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-neutral-300 max-w-md mb-6 leading-relaxed font-light">{description}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="liquid-btn-secondary px-6 py-2 rounded-full text-xs font-medium text-white transition-all active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
