"use client";

import React from "react";
import { motion } from "framer-motion";

export function WaterBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020813]">
      {/* Deep Ocean Ambient Light 1 */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.5, 0.35],
          x: ["0%", "4%", "0%"],
          y: ["0%", "-3%", "0%"],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[15%] left-[15%] w-[850px] h-[850px] rounded-full bg-gradient-to-tr from-cyan-600/25 via-aqua-500/15 to-transparent blur-[140px]"
      />

      {/* Deep Ocean Ambient Light 2 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.4, 0.25],
          x: ["0%", "-5%", "0%"],
          y: ["0%", "4%", "0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[35%] -right-[10%] w-[900px] h-[900px] rounded-full bg-gradient-to-bl from-blue-600/20 via-cyan-500/15 to-transparent blur-[160px]"
      />

      {/* Deep Ocean Ambient Light 3 (Bottom Caustic) */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute -bottom-[20%] left-[25%] w-[1000px] h-[700px] rounded-full bg-gradient-to-t from-teal-500/15 via-blue-600/10 to-transparent blur-[150px]"
      />

      {/* Water Caustics / Refraction Grid lines (Extremely subtle) */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #38d8f4 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
