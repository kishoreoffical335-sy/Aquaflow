"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Droplets, Menu, X, ArrowRight, Activity, ShieldCheck, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isPublic = !pathname.startsWith("/dashboard");

  // Scroll-linked interpolation for floating frosted glass
  const { scrollY } = useScroll();
  const headerScale = useTransform(scrollY, [0, 120], [1, 0.96]);
  const headerOpacity = useTransform(scrollY, [0, 120], [0.85, 0.95]);
  const headerY = useTransform(scrollY, [0, 120], [0, 6]);

  return (
    <motion.header
      style={{ y: headerY }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 pointer-events-auto">
        <motion.nav
          style={{ scale: headerScale, opacity: headerOpacity }}
          className="liquid-glass-header rounded-full px-6 py-3.5 flex items-center justify-between transition-all duration-300 shadow-header-glass"
        >
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-aqua-500 to-blue-600 flex items-center justify-center shadow-liquid-glow group-hover:scale-105 transition-transform">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-sm pointer-events-none" />
              <Droplets className="w-4 h-4 text-white relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5 font-sans">
                AquaFlow
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                  IoT
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isPublic && (
            <div className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-300">
              <a href="#overview" className="hover:text-cyan-300 transition-colors">Overview</a>
              <a href="#parameters" className="hover:text-cyan-300 transition-colors">Parameters</a>
              <a href="#flow" className="hover:text-cyan-300 transition-colors">Flow Dynamics</a>
              <a href="#architecture" className="hover:text-cyan-300 transition-colors">Architecture</a>
              <a href="#alerts" className="hover:text-cyan-300 transition-colors">Alerts</a>
              <a href="#hardware" className="hover:text-cyan-300 transition-colors">Hardware</a>
            </div>
          )}

          {/* Right Action: Login / Dashboard */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <span className="text-xs font-medium text-neutral-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer">
                Sign In
              </span>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" variant="primary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Launch Console
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 liquid-glass rounded-3xl flex flex-col gap-2.5 animate-fade-in text-sm font-medium border border-white/15 shadow-2xl">
            <a href="#overview" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-200 hover:text-cyan-300 hover:bg-white/5 rounded-xl">Overview</a>
            <a href="#parameters" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-200 hover:text-cyan-300 hover:bg-white/5 rounded-xl">Water Parameters</a>
            <a href="#flow" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-200 hover:text-cyan-300 hover:bg-white/5 rounded-xl">Flow Dynamics</a>
            <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-200 hover:text-cyan-300 hover:bg-white/5 rounded-xl">Architecture Pipeline</a>
            <a href="#alerts" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-200 hover:text-cyan-300 hover:bg-white/5 rounded-xl">Intelligent Alerts</a>
            <a href="#hardware" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-neutral-200 hover:text-cyan-300 hover:bg-white/5 rounded-xl">ESP32 Integration</a>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="secondary" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="primary" className="w-full">
                  Launch Console
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
