import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateStr: string | null | undefined): { date: string; time: string; relative: string } {
  if (!dateStr) {
    return { date: "--", time: "--", relative: "Never" };
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: "--", time: "--", relative: "Invalid Date" };
    
    const date = d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    
    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    let relative = "Just now";
    if (diffSec >= 60 && diffSec < 3600) {
      relative = `${Math.floor(diffSec / 60)}m ago`;
    } else if (diffSec >= 3600 && diffSec < 86400) {
      relative = `${Math.floor(diffSec / 3600)}h ago`;
    } else if (diffSec >= 86400) {
      relative = `${Math.floor(diffSec / 86400)}d ago`;
    } else if (diffSec > 0) {
      relative = `${diffSec}s ago`;
    }

    return { date, time, relative };
  } catch {
    return { date: "--", time: "--", relative: "Unknown" };
  }
}
