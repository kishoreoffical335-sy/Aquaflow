export type MeasurementType = "MEASURED" | "DERIVED" | "CALCULATED";

export type SensorType = "ph" | "turbidity" | "flow_rate" | "total_flow" | "dissolved_oxygen";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type AlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";

export interface TelemetryPayload {
  device_uid: string;
  timestamp: string;
  ph: number;
  turbidity: number;
  flow_rate: number;
  total_flow?: number;
  // Optional hardware status or diagnostic flags
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
    ph?: number;
    turbidity?: number;
    flow_rate?: number;
    temperature_assumed?: number;
  };
  calculatedAt: string;
}

export interface SensorCardData {
  id: string;
  type: SensorType;
  title: string;
  value: number | null;
  unit: string;
  measurementType: MeasurementType;
  status: "normal" | "warning" | "critical" | "offline" | "unavailable";
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
  avgTurbidity: number | null;
  minTurbidity: number | null;
  maxTurbidity: number | null;
  avgFlow: number | null;
  minFlow: number | null;
  maxFlow: number | null;
  totalWaterFlow: number | null;
  avgDO: number | null;
  alertCount: number;
  uptimePercentage: number;
  lastReadingTime: string | null;
}
