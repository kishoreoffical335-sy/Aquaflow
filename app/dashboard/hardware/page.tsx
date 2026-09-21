"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Copy,
  Check,
  Terminal,
  Cpu,
  ShieldCheck,
  Code2,
  Globe,
  Send,
  AlertTriangle,
  CheckCircle2,
  Layers,
  FileCode,
} from "lucide-react";
import { hardwareConfig, EXPECTED_HARDWARE_PINS, verifyHardwareIntegrity } from "@/lib/hardware/config";

export default function HardwareIntegrationPage() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  // Hardware Integrity Verification Test
  const integrityResult = verifyHardwareIntegrity(hardwareConfig);

  const samplePayload = {
    device_id: "PROD-NODE-01",
    timestamp: new Date().toISOString(),
    ph: 7.31,
    turbidity_raw: 820,
    turbidity_ntu: null,
    water_level_raw: 3810,
    water_level_percent: null,
    flow_pulses: 49,
    flow_lpm: null,
    accumulated_volume_liters: null,
    dissolved_oxygen_mg_l: null,
  };

  const productionEndpoint = "https://aquaflow-is5f-pqu0op0fz-kishore-65ee.vercel.app/api/telemetry";

  const curlCommand = `curl -X POST "${productionEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-device-key: YOUR_DEVICE_API_KEY" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`;

  const firmwarePath = "firmware/esp32_water_monitor/esp32_water_monitor.ino";

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-white/5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          ESP32 Hardware Integration &amp; Pin Mapping
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Authoritative pin configuration, diagnostic integrity engine, and firmware specifications for physical validation.
        </p>
      </div>

      {/* 1. HARDWARE INTEGRITY DIAGNOSTIC REPORT */}
      <Card className="p-6 border-l-4 border-l-cyan-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            {integrityResult.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <h3 className="text-sm font-semibold text-white">
                Hardware Integrity Diagnostic:{" "}
                <span className={integrityResult.isValid ? "text-emerald-400" : "text-rose-400"}>
                  {integrityResult.isValid ? "VERIFIED & SYNCHRONIZED" : "HARDWARE CONFIGURATION MISMATCH"}
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Single Source of Truth Pin Mapping Verification Engine
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
            Validated at {new Date(integrityResult.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {integrityResult.issues.length > 0 ? (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1 text-xs text-rose-300 font-mono">
            {integrityResult.issues.map((issue, idx) => (
              <p key={idx}>&bull; {issue}</p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-300">
            All configured software interfaces match the physical ESP32 breadboard wiring. GPIO35 and pH analog ADC are completely deprecated.
          </p>
        )}
      </Card>

      {/* 2. CRITICAL AUTHORITATIVE PIN TABLE (SECTION 19) */}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-4">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Authoritative ESP32 Pin Mapping Table</h3>
            <p className="text-xs text-neutral-400 font-mono">Single Source of Truth across Frontend, API, and Microcontroller</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/[0.03] border-b border-white/10 text-neutral-400">
              <tr>
                <th className="py-2.5 px-4">Component</th>
                <th className="py-2.5 px-4">Interface Type</th>
                <th className="py-2.5 px-4">ESP32 Pin / Channel</th>
                <th className="py-2.5 px-4">Classification</th>
                <th className="py-2.5 px-4">Operational Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">pH Sensor (4-in-1 Module)</td>
                <td className="py-3 px-4 text-cyan-400">UART2 Serial</td>
                <td className="py-3 px-4 font-bold text-cyan-300">RX: GPIO16 | TX: GPIO17 (9600 Baud)</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">MEASURED</span></td>
                <td className="py-3 px-4 text-neutral-400">Parses &apos;PH:xx.xx&apos; from UART packet</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Optical Turbidity Sensor</td>
                <td className="py-3 px-4 text-sky-400">Analog ADC1</td>
                <td className="py-3 px-4 font-bold text-sky-300">GPIO32</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">MEASURED</span></td>
                <td className="py-3 px-4 text-neutral-400">Raw ADC (0-4095); NTU requires calibration</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Water Level Sensor</td>
                <td className="py-3 px-4 text-indigo-400">Analog ADC1</td>
                <td className="py-3 px-4 font-bold text-indigo-300">GPIO34</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">MEASURED</span></td>
                <td className="py-3 px-4 text-neutral-400">Raw ADC (0-4095); % requires calibration</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Hall-Effect Flow Meter</td>
                <td className="py-3 px-4 text-emerald-400">Interrupt Pulse</td>
                <td className="py-3 px-4 font-bold text-emerald-300">GPIO27</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">MEASURED</span></td>
                <td className="py-3 px-4 text-neutral-400">Pulse counting ISR; L/min requires calibration</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">16x2 Character LCD</td>
                <td className="py-3 px-4 text-amber-400">I2C Bus</td>
                <td className="py-3 px-4 font-bold text-amber-300">SDA: GPIO21 | SCL: GPIO22 (Addr: 0x27)</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/20 text-[10px]">OUTPUT</span></td>
                <td className="py-3 px-4 text-neutral-400">Real-time local parameter display</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Piezo Alarm Buzzer</td>
                <td className="py-3 px-4 text-rose-400">Digital Output</td>
                <td className="py-3 px-4 font-bold text-rose-300">GPIO25</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/20 text-[10px]">OUTPUT</span></td>
                <td className="py-3 px-4 text-neutral-400">Audible alert on threshold breach</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Accumulated Water Volume</td>
                <td className="py-3 px-4 text-blue-400">Integration</td>
                <td className="py-3 px-4 font-bold text-blue-300">Derived from Flow</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px]">DERIVED</span></td>
                <td className="py-3 px-4 text-neutral-400">Total liters aggregated over time intervals</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">Dissolved Oxygen (DO)</td>
                <td className="py-3 px-4 text-purple-400">Model Engine</td>
                <td className="py-3 px-4 font-bold text-purple-300">Backend Aeration Model</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px]">CALCULATED</span></td>
                <td className="py-3 px-4 text-neutral-400">Evaluated on server; null if uncalibrated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. FIRMWARE SPECIFICATION & FILE REFERENCE */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                ESP32 C++ Microcontroller Firmware
              </h3>
              <p className="text-xs text-neutral-400">
                ESP32 firmware implementing the verified physical hardware configuration and prepared for end-to-end validation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-neutral-300">
              {firmwarePath}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs text-neutral-300">
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 font-mono space-y-2">
            <p className="text-cyan-400 font-bold">// ESP32 FIRMWARE CONFIGURATION (In {firmwarePath}):</p>
            <p className="text-neutral-400">#define PH_UART_RX       16</p>
            <p className="text-neutral-400">#define PH_UART_TX       17</p>
            <p className="text-neutral-400">#define FLOW_PIN         27</p>
            <p className="text-neutral-400">#define TURBIDITY_PIN    32</p>
            <p className="text-neutral-400">#define WATER_LEVEL_PIN  34</p>
            <p className="text-neutral-400">#define LCD_SDA          21</p>
            <p className="text-neutral-400">#define LCD_SCL          22</p>
            <p className="text-neutral-400">#define BUZZER_PIN       25</p>
            <div className="pt-2 border-t border-white/10">
              <p className="text-neutral-300">const char* WIFI_SSID     = &quot;YOUR_WIFI_SSID&quot;;</p>
              <p className="text-neutral-300">const char* WIFI_PASSWORD = &quot;YOUR_WIFI_PASSWORD&quot;;</p>
              <p className="text-cyan-300">const char* API_URL       = &quot;{productionEndpoint}&quot;;</p>
              <p className="text-neutral-300">const char* DEVICE_ID     = &quot;PROD-NODE-01&quot;;</p>
              <p className="text-neutral-300">const char* DEVICE_API_KEY = &quot;wq_YOUR_PROVISIONED_DEVICE_TOKEN&quot;;</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block">Security &amp; Secret Isolation Policy:</span>
              <span>
                Never place <code>SUPABASE_SERVICE_ROLE_KEY</code> in the ESP32 firmware. Microcontrollers authenticate solely via <code>x-device-key</code> against the Next.js API.
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. PHYSICAL END-TO-END VERIFICATION SEQUENCE (SECTION 18) */}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-4">
          <Layers className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Physical End-To-End Verification Sequence</h3>
            <p className="text-xs text-neutral-400">Step-by-step physical validation pipeline</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {[
            { step: "TEST 1", title: "ESP32 Boots & Peripherals Init", desc: "LCD shows boot screen; Buzzer emits 100ms startup confirmation beep." },
            { step: "TEST 2", title: "Wi-Fi Association & NTP Sync", desc: "ESP32 connects to 2.4GHz Wi-Fi and synchronizes UTC time from pool.ntp.org." },
            { step: "TEST 3", title: "UART2 pH Packet Parsing", desc: "HardwareSerial2 (RX16/TX17) parses 'PH:7.31, W:1, L:74, T:59,' at 9600 baud." },
            { step: "TEST 4", title: "GPIO32 Turbidity ADC Read", desc: "Samples raw ADC integer (0-4095) from optical turbidity receiver." },
            { step: "TEST 5", title: "GPIO34 Water Level ADC Read", desc: "Samples raw ADC integer (0-4095) from analog water depth probe." },
            { step: "TEST 6", title: "GPIO27 Flow Pulse Accumulator", desc: "Interrupt counter tallies Hall-effect pulses over 10-second sampling window." },
            { step: "TEST 7", title: "JSON Assembly & HTTPS Post", desc: "Sends non-blocking POST to /api/telemetry with x-device-key header." },
            { step: "TEST 8", title: "Vercel Ingestion & Zod Validation", desc: "API authenticates SHA-256 token hash and appends server received_at timestamp." },
            { step: "TEST 9", title: "Supabase Realtime Feed Delivery", desc: "PostgreSQL telemetry row triggers WebSocket update on Live Monitoring dashboard." },
            { step: "TEST 10", title: "Physical Stimulus Confirmation", desc: "Adjust probe in liquid buffer -> Dashboard values update in real-time without refresh." },
          ].map((t, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 text-[10px] font-bold shrink-0">
                {t.step}
              </span>
              <div>
                <p className="font-semibold text-white">{t.title}</p>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 5. TEST CURL COMMAND */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Production cURL Telemetry Ingestion Command</h3>
              <p className="text-xs text-neutral-400">Simulate incoming hardware telemetry to production Vercel deployment</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyCurl}
            icon={copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedCurl ? "Copied" : "Copy cURL"}
          </Button>
        </div>

        <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto">
          <code>{curlCommand}</code>
        </pre>
      </Card>
    </div>
  );
}
