import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LandingPageStory } from "@/components/landing/LandingPageStory";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020813]">
      <Navbar />
      <main>
        <LandingPageStory />
      </main>
    </div>
  );
}
