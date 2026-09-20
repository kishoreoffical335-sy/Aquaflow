import React from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ children, className, hoverable = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "liquid-glass-card rounded-3xl p-6 relative overflow-hidden",
        hoverable && "transition-all duration-300 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {/* Subtle Specular Rim Light */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
