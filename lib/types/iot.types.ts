export type MeasurementType = "MEASURED" | "DERIVED" | "CALCULATED";

export type SensorType =
  | "ph"
  | "turbidity"
  | "water_level"
  | "flow_rate"
  | "total_flow"
  | "dissolved_oxygen";

export type CalibrationStatus = "UNCALIBRATED" | "CALIBRATED" | "CALIBRATION_REQUIRED";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type AlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";

/**
 * Authoritative Telemetry Payload Schema
 * Real readings sent by the ESP32 physical prototype.
 */
export interface TelemetryPayload {
  device_id: string;
  device_uid?: string; // Backwards compatibility alias
  timestamp: string;

  // pH (Measured via UART2)
  ph: number | null;

  // Turbidity (Measured Raw ADC + Calibrated NTU)
  turbidity_raw: number | null;
  turbidity_ntu: number | null;

  // Water Level (Measured Raw ADC + Calibrated Percentage)
  water_level_raw: number | null;
  water_level_percent: number | null;

  // Flow (Measured Pulses + Calibrated LPM)
  flow_pulses: number | null;
  flow_lpm: number | null;

  // Accumulated Volume (Derived)
  accumulated_volume_liters: number | null;

  // Dissolved Oxygen (Calculated Backend Model)
  dissolved_oxygen_mg_l: number | null;

  // Server-assigned timestamp
  received_at?: string;

  // Optional hardware diagnostic flags
  battery_level?: number;
  rssi?: number;
  firmware_version?: string;
}

export interface DOCalculationResult {
  isAvailable: boolean;
  value: number | null;
  unit: string;
  model: string;
  reason?: string;
  inputsUsed: {
    ph?: number | null;
    turbidity_raw?: number | null;
    turbidity_ntu?: number | null;
    flow_lpm?: number | null;
    temperature_assumed?: number;
  };
  calculatedAt: string;
}

export interface SensorCardData {
  id: string;
  type: SensorType;
  title: string;
  rawValue?: number | null;
  calibratedValue?: number | null;
  displayValue: string | number | null;
  unit: string;
  measurementType: MeasurementType;
  calibrationStatus: CalibrationStatus;
  status: "normal" | "warning" | "critical" | "offline" | "unavailable";
  hardwareInterface: string;
  gpioPin?: string | number;
  rangeMin?: number;
  rangeMax?: number;
  lastUpdated: string | null;
  trend?: "up" | "down" | "stable";
  subtitle?: string;
}

export interface TelemetryStats {
  recordCount: number;
  avgPh: number | null;
  minPh: number | null;
  maxPh: number | null;
  avgTurbidityRaw: number | null;
  avgTurbidityNtu: number | null;
  avgWaterLevelRaw: number | null;
  avgWaterLevelPercent: number | null;
  totalFlowPulses: number | null;
  avgFlowLpm: number | null;
  totalWaterVolumeLiters: number | null;
  avgDO: number | null;
  alertCount: number;
  uptimePercentage: number;
  lastReadingTime: string | null;
}
