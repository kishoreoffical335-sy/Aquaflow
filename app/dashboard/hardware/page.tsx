"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Copy, Check, Terminal, Cpu, ShieldCheck, Code2, Globe, Send } from "lucide-react";

export default function HardwareIntegrationPage() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const samplePayload = {
    device_uid: "ESP32-NODE-01",
    timestamp: new Date().toISOString(),
    ph: 7.24,
    turbidity: 2.15,
    flow_rate: 4.80,
    total_flow: 125.60,
  };

  const curlCommand = `curl -X POST "${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/v1/telemetry" \\
  -H "Content-Type: application/json" \\
  -H "x-device-key: YOUR_DEVICE_API_KEY" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`;

  const arduinoCode = `/*
 * AQUAFLOW ESP32 WATER QUALITY & FLOW TELEMETRY CLIENT
 * Sensors: pH (Analog), Turbidity (Analog), Flow Meter (Pulse Interrupt)
 * Production-ready C++ firmware for Arduino IDE / PlatformIO
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

// --- Network & Cloud Endpoint Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* apiEndpoint = "http://YOUR_SERVER_IP:3000/api/v1/telemetry";
const char* deviceUid = "ESP32-NODE-01";
const char* deviceApiKey = "YOUR_DEVICE_API_KEY";

// --- Pin Assignments ---
const int PIN_PH = 34;          // Analog ADC1 (pH Probe)
const int PIN_TURBIDITY = 35;   // Analog ADC1 (Optical Turbidity)
const int PIN_FLOW = 27;        // Digital Interrupt (Hall-Effect Flow)

// --- Flow Measurement Variables ---
volatile unsigned long pulseCount = 0;
float currentFlowRate = 0.0;    // L/min
float totalAccumulatedFlow = 0.0; // Liters
unsigned long lastSampleTime = 0;
const float FLOW_CALIBRATION_FACTOR = 4.5; // Pulses per second per L/min (adjust per meter)

void IRAM_ATTR pulseCounterISR() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PH, INPUT);
  pinMode(PIN_TURBIDITY, INPUT);
  pinMode(PIN_FLOW, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_FLOW), pulseCounterISR, RISING);

  // Connect to Wi-Fi
  Serial.printf("Connecting to Wi-Fi: %s", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Connected. Syncing NTP Time...");

  // Sync NTP Time for UTC ISO 8601 Timestamps
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    delay(500);
    Serial.print("#");
  }
  Serial.println("\nTime Synchronized.");
}

String getIsoTimestamp() {
  time_t now;
  time(&now);
  char buf[30];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));
  return String(buf);
}

float readPh() {
  int raw = analogRead(PIN_PH);
  float voltage = raw * (3.3 / 4095.0);
  // Standard pH linear conversion (calibrate with buffer 4.01/7.00):
  float ph = 3.5 * voltage + 0.0; // Adjust calibration slope
  return constrain(ph, 0.0, 14.0);
}

float readTurbidity() {
  int raw = analogRead(PIN_TURBIDITY);
  float voltage = raw * (3.3 / 4095.0);
  // Turbidity NTU curve:
  float ntu = -1120.4 * (voltage * voltage) + 5742.3 * voltage - 4352.9;
  return max(0.0f, ntu);
}

void loop() {
  unsigned long now = millis();
  
  // Sample every 10 seconds
  if (now - lastSampleTime >= 10000) {
    detachInterrupt(digitalPinToInterrupt(PIN_FLOW));
    
    // Calculate flow rate: (pulses / calibration) / (elapsed_seconds / 60)
    float elapsedSec = (now - lastSampleTime) / 1000.0;
    currentFlowRate = (pulseCount / FLOW_CALIBRATION_FACTOR) / (elapsedSec / 60.0);
    float litersPassed = (pulseCount / FLOW_CALIBRATION_FACTOR) / 60.0;
    totalAccumulatedFlow += litersPassed;
    pulseCount = 0;
    lastSampleTime = now;
    
    attachInterrupt(digitalPinToInterrupt(PIN_FLOW), pulseCounterISR, RISING);

    float ph = readPh();
    float turbidity = readTurbidity();

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(apiEndpoint);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("x-device-key", deviceApiKey);

      StaticJsonDocument<256> doc;
      doc["device_uid"] = deviceUid;
      doc["timestamp"] = getIsoTimestamp();
      doc["ph"] = serialized(String(ph, 2));
      doc["turbidity"] = serialized(String(turbidity, 2));
      doc["flow_rate"] = serialized(String(currentFlowRate, 2));
      doc["total_flow"] = serialized(String(totalAccumulatedFlow, 2));

      String jsonPayload;
      serializeJson(doc, jsonPayload);

      Serial.println("Posting Telemetry: " + jsonPayload);
      int httpCode = http.POST(jsonPayload);
      
      if (httpCode > 0) {
        String response = http.getString();
        Serial.printf("HTTP %d: %s\n", httpCode, response.c_str());
      } else {
        Serial.printf("HTTP Error: %s\n", http.errorToString(httpCode).c_str());
      }
      http.end();
    }
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleSendTestPacket = async () => {
    try {
      setTesting(true);
      setTestResponse(null);
      const res = await fetch("/api/v1/telemetry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-key": "TEST_KEY_PLACEHOLDER",
        },
        body: JSON.stringify(samplePayload),
      });
      const json = await res.json();
      setTestResponse(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setTestResponse(err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-white/5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          ESP32 Hardware Integration Guide
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Complete developer documentation, REST endpoint specification, and ready-to-flash C++ firmware.
        </p>
      </div>

      {/* 1. API SPECIFICATION OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Globe className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase font-mono">Telemetry Endpoint</h3>
          </div>
          <p className="text-sm font-mono font-bold text-white">POST /api/v1/telemetry</p>
          <p className="text-xs text-neutral-400 mt-1">Accepts JSON payloads with strict validation</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase font-mono">Authentication</h3>
          </div>
          <p className="text-sm font-mono font-bold text-white">x-device-key Header</p>
          <p className="text-xs text-neutral-400 mt-1">SHA-256 hashed cryptographic device token</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Cpu className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase font-mono">Physical Sensors</h3>
          </div>
          <p className="text-sm font-mono font-bold text-white">pH + Turbidity + Flow</p>
          <p className="text-xs text-neutral-400 mt-1">DO evaluated server-side; No fake TDS/Temp</p>
        </Card>
      </div>

      {/* 2. ESP32 ARDUINO C++ FIRMWARE CODE */}
      <Card className="p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Production ESP32 Firmware (C++)</h3>
              <p className="text-xs text-neutral-400">Ready to copy and flash in Arduino IDE or PlatformIO</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyCode}
            icon={copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedCode ? "Copied" : "Copy Sketch"}
          </Button>
        </div>

        <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-neutral-300 overflow-x-auto max-h-96">
          <code>{arduinoCode}</code>
        </pre>
      </Card>

      {/* 3. TEST CURL COMMAND */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">cURL Ingestion Command</h3>
              <p className="text-xs text-neutral-400">Test the ingestion endpoint from terminal</p>
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
