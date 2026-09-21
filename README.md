# AquaFlow — Real-Time IoT Water Quality & Flow Monitoring System

AquaFlow is an environmental IoT telemetry web platform designed to ingest, validate, analyze, and visualize real-time water measurements from a physical ESP32 water-quality monitoring prototype. It features a Liquid Glass interface floating above a multi-layered water atmosphere with strict **zero-demo-data integrity**.

---

## 1. Authoritative Hardware Pin Map (Single Source of Truth)

| Component | Interface | ESP32 Pin | Baud / Address | Operational Role |
| :--- | :--- | :--- | :--- | :--- |
| **pH Sensor (4-in-1 Module)** | **UART2** | **RX: GPIO16, TX: GPIO17** | 9600 Baud | Parses `PH:xx.xx` from UART stream (`MEASURED`) |
| **Optical Turbidity Sensor** | **Analog ADC1** | **GPIO32** | 0–4095 ADC | Raw ADC integer; NTU requires physical calibration (`MEASURED`) |
| **Water Level Sensor** | **Analog ADC1** | **GPIO34** | 0–4095 ADC | Raw ADC integer; % requires physical calibration (`MEASURED`) |
| **Hall-Effect Flow Meter** | **Interrupt Pulse** | **GPIO27** | Hardware ISR | Counts raw pulses; L/min requires physical calibration (`MEASURED`) |
| **16x2 Character LCD** | **I2C Bus** | **SDA: GPIO21, SCL: GPIO22** | `0x27` | Real-time local parameter display (`OUTPUT`) |
| **Piezo Alarm Buzzer** | **Digital Output** | **GPIO25** | Active High | Audible alert on threshold breach (`OUTPUT`) |
| **Accumulated Water Volume** | **Integration** | Derived from Flow | -- | Total liters aggregated over time intervals (`DERIVED`) |
| **Dissolved Oxygen (DO)** | **Model Engine** | Backend Aeration Model | -- | Server-side model; null if uncalibrated (`CALCULATED`) |

> [!IMPORTANT]
> - GPIO34 is dedicated exclusively to the **Water Level Sensor** ADC.
> - GPIO35 is completely deprecated and unused.
> - pH is connected via **UART2 (GPIO16 RX / GPIO17 TX)**, not analog ADC.
> - Raw ADC values will never be falsely labeled as NTU or % without valid calibration data.

---

## 2. Telemetry Ingestion API Specification

### Ingestion Endpoint
```http
POST /api/telemetry
Content-Type: application/json
x-device-key: wq_your_device_secret_token
```

### Telemetry JSON Payload Structure
```json
{
  "device_id": "PROD-NODE-01",
  "timestamp": "2026-09-21T20:00:00Z",
  "ph": 7.31,
  "turbidity_raw": 820,
  "turbidity_ntu": null,
  "water_level_raw": 3810,
  "water_level_percent": null,
  "flow_pulses": 49,
  "flow_lpm": null,
  "accumulated_volume_liters": null,
  "dissolved_oxygen_mg_l": null
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Telemetry received",
  "reading_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "received_at": "2026-09-21T20:00:01.120Z",
  "do_status": "Unavailable"
}
```

---

## 3. Microcontroller Firmware

The complete, separate C++ Arduino sketch implementing the verified hardware configuration is located at:

```
firmware/esp32_water_monitor/esp32_water_monitor.ino
```

### Firmware Configuration Block:
```cpp
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL       = "https://<your-vercel-domain>.vercel.app/api/telemetry";
const char* DEVICE_ID     = "PROD-NODE-01";
const char* DEVICE_API_KEY = "wq_YOUR_PROVISIONED_DEVICE_TOKEN";
```

---

## 4. Physical End-To-End Verification Checklist

1. **TEST 1**: ESP32 boots, LCD initializes on I2C (GPIO21/22, 0x27), buzzer beeps on GPIO25.
2. **TEST 2**: ESP32 connects to 2.4GHz Wi-Fi and syncs UTC ISO time via NTP.
3. **TEST 3**: ESP32 HardwareSerial2 reads UART2 on GPIO16/17 and parses `PH:7.31, W:1, L:74, T:59,`.
4. **TEST 4**: ESP32 reads Turbidity raw ADC on GPIO32.
5. **TEST 5**: ESP32 reads Water Level raw ADC on GPIO34.
6. **TEST 6**: ESP32 counts Flow pulses via GPIO27 interrupt.
7. **TEST 7**: ESP32 builds JSON payload and issues HTTPS POST to `/api/telemetry` every 10s.
8. **TEST 8**: Vercel API validates payload schema and authenticates SHA-256 token.
9. **TEST 9**: Supabase stores record in `telemetry` table.
10. **TEST 10**: Website live dashboard receives Realtime WebSocket stream update without page refresh.
11. **TEST 11**: Adjusting physical water sensor conditions reflects live on dashboard.

---

## 5. Development & Deployment

```bash
# Install dependencies
npm install

# Run Next.js development server
npm run dev

# Production build check
npm run build
```

---

## License
MIT License
