import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AquaFlow | IoT Water Quality & Flow Monitoring System",
  description: "Production-ready, Liquid Glass IoT web platform for real-time monitoring of pH, Turbidity, Water Flow, and Calculated Dissolved Oxygen via ESP32.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-black text-foreground antialiased selection:bg-cyan-400 selection:text-white">
        {children}
      </body>
    </html>
  );
}
