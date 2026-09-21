/*
 * =====================================================================================
 * AQUAFLOW ESP32 WATER QUALITY & FLOW MONITORING FIRMWARE
 * =====================================================================================
 * ESP32 firmware implementing the verified physical hardware configuration and
 * prepared for end-to-end validation.
 *
 * REPOSITORY: kishoreoffical335-sy/Aquaflow
 * PRODUCTION ENDPOINT: https://aquaflow-is5f-pqu0op0fz-kishore-65ee.vercel.app/api/telemetry
 *
 * AUTHORITATIVE HARDWARE PIN MAP:
 * - 4-in-1 Module (pH): UART2 (RX: GPIO16, TX: GPIO17, Baud: 9600)
 * - Turbidity Sensor:   Analog ADC (GPIO32)
 * - Water Level Sensor: Analog ADC (GPIO34)
 * - Flow Meter:         Interrupt Pulse (GPIO27)
 * - 16x2 I2C LCD:       I2C Bus (SDA: GPIO21, SCL: GPIO22, Address: 0x27)
 * - Alarm Buzzer:       Digital Output (GPIO25)
 * =====================================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <time.h>

// =====================================================================================
// 1. HARDWARE PIN DEFINITIONS (EXACT SPECIFICATION)
// =====================================================================================
#define PH_UART_RX       16    // UART2 RX (Connects to 4-in-1 TX)
#define PH_UART_TX       17    // UART2 TX (Connects to 4-in-1 RX)
#define FLOW_PIN         27    // Hardware Interrupt (Hall-Effect Flow Sensor Signal)
#define TURBIDITY_PIN    32    // Analog ADC1 (Optical Turbidity Sensor AO)
#define WATER_LEVEL_PIN  34    // Analog ADC1 (Water Level Sensor Signal)
#define LCD_SDA          21    // I2C Data (LCD SDA)
#define LCD_SCL          22    // I2C Clock (LCD SCL)
#define BUZZER_PIN       25    // Digital Output (Active / Passive Alarm Buzzer)

// =====================================================================================
// 2. DEVICE & CLOUD CONFIGURATION (USER ADJUSTABLE)
// =====================================================================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Production Vercel Ingestion API Endpoint
const char* API_URL       = "https://aquaflow-is5f-pqu0op0fz-kishore-65ee.vercel.app/api/telemetry";

// Provisioned Device Credentials (from Web Dashboard Device Registry)
const char* DEVICE_ID     = "PROD-NODE-01";
const char* DEVICE_API_KEY = "wq_YOUR_DEVICE_SECRET_TOKEN";

// Telemetry Transmission Interval (milliseconds)
const unsigned long TELEMETRY_INTERVAL_MS = 10000; // 10 seconds

// =====================================================================================
// 3. HARDWARE PERIPHERAL INSTANCES
// =====================================================================================
HardwareSerial SerialSensor(2);              // UART2 instance for 4-in-1 Sensor Module
LiquidCrystal_I2C lcd(0x27, 16, 2);          // 16x2 Character LCD on I2C (Address 0x27)

// =====================================================================================
// 4. SENSOR STATE VARIABLES
// =====================================================================================
// Flow Meter Pulse Counter
volatile unsigned long flowPulseCount = 0;
unsigned long lastPulseSampleTime = 0;

// Parsed 4-in-1 Module Readings
float latestPh = -1.0;                       // Parsed from 4-in-1 UART packet
int latestRawW = -1;                         // Raw W field (water flag from 4-in-1)
int latestRawL = -1;                         // Raw L field (light sensor from 4-in-1)
int latestRawT = -1;                         // Raw T field (temperature/raw from 4-in-1)
bool phPacketReceived = false;

// Direct Analog ADC Channels
int latestTurbidityRaw = 0;                 // 0 - 4095 ADC (GPIO32)
int latestWaterLevelRaw = 0;                // 0 - 4095 ADC (GPIO34)

// Calibration Flags (Strictly false until physical calibration curves are configured)
bool isFlowCalibrated = false;
float flowPulsesPerLiter = 450.0;           // Pulses per Liter coefficient

bool isTurbidityCalibrated = false;         // Set true when physical curve calibrated
bool isWaterLevelCalibrated = false;        // Set true when vessel depth calibrated

unsigned long lastTelemetrySentTime = 0;

// Interrupt Service Routine for Hall-Effect Flow Sensor
void IRAM_ATTR flowPulseISR() {
  flowPulseCount++;
}

// =====================================================================================
// 5. HELPER: UTC ISO 8601 TIMESTAMP
// =====================================================================================
String getIsoTimestamp() {
  time_t now;
  time(&now);
  struct tm timeinfo;
  if (!gmtime_r(&now, &timeinfo) || now < 100000) {
    return "2026-09-21T00:00:00Z";
  }
  char buf[30];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buf);
}

// =====================================================================================
// 6. HELPER: PARSE 4-in-1 SENSOR UART PACKET
// Packet Format Example: "PH:7.31, W:1, L:74, T:59,"
// =====================================================================================
void read4In1UartPacket() {
  while (SerialSensor.available() > 0) {
    String line = SerialSensor.readStringUntil('\n');
    line.trim();

    if (line.indexOf("PH:") != -1) {
      // 1. Extract pH
      int phIndex = line.indexOf("PH:");
      int comma1 = line.indexOf(',', phIndex);
      if (phIndex != -1 && comma1 != -1) {
        String phStr = line.substring(phIndex + 3, comma1);
        phStr.trim();
        float parsed = phStr.toFloat();
        if (parsed >= 0.0 && parsed <= 14.0) {
          latestPh = parsed;
          phPacketReceived = true;
        }
      }

      // 2. Extract W field if present
      int wIndex = line.indexOf("W:");
      if (wIndex != -1) {
        int comma2 = line.indexOf(',', wIndex);
        if (comma2 != -1) {
          latestRawW = line.substring(wIndex + 2, comma2).toInt();
        }
      }

      // 3. Extract L field if present
      int lIndex = line.indexOf("L:");
      if (lIndex != -1) {
        int comma3 = line.indexOf(',', lIndex);
        if (comma3 != -1) {
          latestRawL = line.substring(lIndex + 2, comma3).toInt();
        }
      }

      // 4. Extract T field if present
      int tIndex = line.indexOf("T:");
      if (tIndex != -1) {
        int comma4 = line.indexOf(',', tIndex);
        if (comma4 != -1) {
          latestRawT = line.substring(tIndex + 2, comma4).toInt();
        }
      }

      Serial.printf("[UART2] 4-in-1 -> pH: %.2f | W: %d | L: %d | T: %d (raw: %s)\n",
                    latestPh, latestRawW, latestRawL, latestRawT, line.c_str());
    }
  }
}

// =====================================================================================
// 7. SETUP INITIALIZATION
// =====================================================================================
void setup() {
  // 1. Initialize Debug Serial (115200 Baud)
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=======================================================");
  Serial.println("  AQUAFLOW ESP32 WATER MONITORING FIRMWARE BOOT");
  Serial.println("  Target: https://aquaflow-is5f-pqu0op0fz-kishore-65ee.vercel.app");
  Serial.println("=======================================================");

  // 2. Initialize GPIO Modes
  pinMode(TURBIDITY_PIN, INPUT);
  pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(FLOW_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // 3. Attach Hardware Interrupt for Flow Sensor
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), flowPulseISR, RISING);

  // 4. Initialize I2C and LCD
  Wire.begin(LCD_SDA, LCD_SCL);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("AquaFlow Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");

  // 5. Initialize UART2 for 4-in-1 Sensor Module (RX=16, TX=17, 9600 Baud)
  SerialSensor.begin(9600, SERIAL_8N1, PH_UART_RX, PH_UART_TX);
  Serial.printf("[UART2] Initialized on RX:%d, TX:%d at 9600 baud.\n", PH_UART_RX, PH_UART_TX);

  // 6. Connect to Wi-Fi
  Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);
  lcd.setCursor(0, 1);
  lcd.print("WiFi Connecting ");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    lcd.setCursor(0, 1);
    lcd.print("WiFi Connected  ");

    // Sync NTP Time for UTC ISO Timestamps
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    struct tm timeinfo;
    if (getLocalTime(&timeinfo, 3000)) {
      Serial.println("[NTP] Time Synchronized successfully.");
    }
  } else {
    Serial.println("\n[WiFi] Connection failed. Sensor acquisition will proceed offline.");
    lcd.setCursor(0, 1);
    lcd.print("WiFi Offline    ");
  }

  // Startup beep
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);

  lastPulseSampleTime = millis();
  lastTelemetrySentTime = millis();
}

// =====================================================================================
// 8. MAIN LOOP (NON-BLOCKING CONTINUOUS SAMPLING)
// =====================================================================================
void loop() {
  // 1. Continually read incoming UART packets from 4-in-1 sensor
  read4In1UartPacket();

  unsigned long currentMillis = millis();

  // 2. Periodic Telemetry Package Assembly & Transmission (Every 10 seconds)
  if (currentMillis - lastTelemetrySentTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetrySentTime = currentMillis;

    // A. Read Analog ADC Channels
    latestTurbidityRaw = analogRead(TURBIDITY_PIN);
    latestWaterLevelRaw = analogRead(WATER_LEVEL_PIN);

    // B. Capture and reset flow pulse accumulator safely
    detachInterrupt(digitalPinToInterrupt(FLOW_PIN));
    unsigned long pulses = flowPulseCount;
    flowPulseCount = 0;
    attachInterrupt(digitalPinToInterrupt(FLOW_PIN), flowPulseISR, RISING);

    // C. Evaluate Buzzer Alarm on Critical Water Conditions
    if (phPacketReceived && (latestPh < 5.5 || latestPh > 9.5)) {
      // Critical pH threshold breach: brief alarm beep
      digitalWrite(BUZZER_PIN, HIGH);
      delay(80);
      digitalWrite(BUZZER_PIN, LOW);
    }

    // D. Update Local LCD Display
    lcd.clear();
    lcd.setCursor(0, 0);
    if (phPacketReceived && latestPh >= 0) {
      lcd.printf("pH:%.2f T:%d", latestPh, latestTurbidityRaw);
    } else {
      lcd.printf("pH:-- T:%d", latestTurbidityRaw);
    }
    lcd.setCursor(0, 1);
    lcd.printf("Lvl:%d Pls:%lu", latestWaterLevelRaw, pulses);

    // E. Build Telemetry JSON Payload (Strict Data Classification)
    StaticJsonDocument<512> doc;
    doc["device_id"] = DEVICE_ID;
    doc["timestamp"] = getIsoTimestamp();

    // pH (Measured via UART2)
    if (phPacketReceived && latestPh >= 0) {
      doc["ph"] = round(latestPh * 100.0) / 100.0;
    } else {
      doc["ph"] = nullptr;
    }

    // Turbidity (Measured Raw ADC; NTU null unless calibrated)
    doc["turbidity_raw"] = latestTurbidityRaw;
    if (isTurbidityCalibrated) {
      // doc["turbidity_ntu"] = calibratedNtu;
      doc["turbidity_ntu"] = nullptr;
    } else {
      doc["turbidity_ntu"] = nullptr; // Calibration Required
    }

    // Water Level (Measured Raw ADC; Percent null unless calibrated)
    doc["water_level_raw"] = latestWaterLevelRaw;
    if (isWaterLevelCalibrated) {
      // doc["water_level_percent"] = calibratedPercent;
      doc["water_level_percent"] = nullptr;
    } else {
      doc["water_level_percent"] = nullptr; // Calibration Required
    }

    // Flow (Measured Pulses; L/min null unless calibrated)
    doc["flow_pulses"] = pulses;
    if (isFlowCalibrated && flowPulsesPerLiter > 0) {
      float lpm = (pulses / flowPulsesPerLiter) * (60.0 / (TELEMETRY_INTERVAL_MS / 1000.0));
      doc["flow_lpm"] = round(lpm * 100.0) / 100.0;
    } else {
      doc["flow_lpm"] = nullptr; // Calibration Required
    }

    doc["accumulated_volume_liters"] = nullptr; // Derived on backend
    doc["dissolved_oxygen_mg_l"] = nullptr;     // Calculated on backend model

    String jsonBuffer;
    serializeJson(doc, jsonBuffer);

    Serial.println("\n[Telemetry] Outgoing Payload:");
    Serial.println(jsonBuffer);

    // F. Send Telemetry via HTTPS/HTTP POST
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClientSecure client;
      client.setInsecure(); // Allow HTTPS without bundling root CA

      HTTPClient http;
      if (http.begin(client, API_URL)) {
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-device-key", DEVICE_API_KEY);
        http.setTimeout(5000);

        int httpResponseCode = http.POST(jsonBuffer);

        if (httpResponseCode > 0) {
          String responseBody = http.getString();
          Serial.printf("[HTTP POST] Success (%d): %s\n", httpResponseCode, responseBody.c_str());
        } else {
          Serial.printf("[HTTP POST] Error code: %d (%s)\n", httpResponseCode, http.errorToString(httpResponseCode).c_str());
        }
        http.end();
      } else {
        Serial.println("[HTTP] Unable to connect to API endpoint.");
      }
    } else {
      Serial.println("[WiFi] Offline: Telemetry skipped for this window. Acquisition continues.");
      // Attempt background reconnect
      WiFi.reconnect();
    }
  }

  // Brief yield for RTOS scheduler
  delay(10);
}
