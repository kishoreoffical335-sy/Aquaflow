import React from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-aqua-400/50";
  
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5 font-mono",
    md: "px-5 py-2.5 text-xs gap-2 font-medium tracking-wide",
    lg: "px-7 py-3.5 text-sm gap-2.5 font-semibold tracking-wide",
  };

  const variantClasses = {
    primary: "liquid-btn-primary text-white font-medium",
    secondary: "liquid-btn-secondary text-white",
    outline: "bg-transparent text-neutral-300 hover:text-white border border-white/15 hover:border-cyan-400/40 hover:bg-white/[0.04]",
    danger: "bg-rose-600/90 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30 border border-rose-400/30",
    ghost: "bg-transparent text-neutral-400 hover:text-white hover:bg-white/[0.06]",
  };

  return (
    <button
      className={cn(base, sizeClasses[size], variantClasses[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
