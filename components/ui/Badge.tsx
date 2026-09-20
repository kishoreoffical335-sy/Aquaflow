import React from "react";
import { cn } from "@/lib/utils/cn";
import { MeasurementType } from "@/lib/types/iot.types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "measured" | "calculated" | "derived" | "success" | "warning" | "danger" | "outline" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const base = "inline-flex items-center font-medium rounded-full tracking-wide transition-colors";
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const variantClasses = {
    default: "bg-white/10 text-neutral-300 border border-white/10",
    measured: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono",
    calculated: "bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono",
    derived: "bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/25",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/25",
    outline: "bg-transparent text-neutral-400 border border-neutral-700",
    neutral: "bg-neutral-800 text-neutral-400 border border-neutral-700/50",
  };

  return (
    <span className={cn(base, sizeClasses[size], variantClasses[variant], className)}>
      {children}
    </span>
  );
}

export function MeasurementTypeBadge({ type }: { type: MeasurementType }) {
  if (type === "MEASURED") {
    return <Badge variant="measured">MEASURED</Badge>;
  }
  if (type === "CALCULATED") {
    return <Badge variant="calculated">CALCULATED</Badge>;
  }
  return <Badge variant="derived">DERIVED</Badge>;
}
