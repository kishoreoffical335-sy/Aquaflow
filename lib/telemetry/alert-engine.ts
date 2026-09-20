import { AlertSeverity, AlertStatus } from "@/lib/types/iot.types";

export interface ThresholdConfig {
  parameter: "ph" | "turbidity" | "flow_rate" | "dissolved_oxygen";
  minimum_value: number;
  maximum_value: number;
  warning_low?: number | null;
  warning_high?: number | null;
  critical_low?: number | null;
  critical_high?: number | null;
  enabled: boolean;
  unit: string;
}

export interface AlertEvaluationResult {
  triggered: boolean;
  parameter: string;
  severity: AlertSeverity;
  alertType: "THRESHOLD_BREACH" | "SENSOR_COMM_FAILURE" | "ESP32_OFFLINE" | "TELEMETRY_MALFORMED" | "FLOW_ANOMALY" | "CALCULATION_UNAVAILABLE";
  currentValue: number | null;
  thresholdValue: number | null;
  message: string;
  dedupKey: string;
  isRecovery?: boolean;
}

/**
 * Standard baseline drinking water / environmental thresholds if none configured in DB
 */
export const DEFAULT_THRESHOLDS: Record<string, ThresholdConfig> = {
  ph: {
    parameter: "ph",
    minimum_value: 0,
    maximum_value: 14,
    warning_low: 6.5,
    warning_high: 8.5,
    critical_low: 5.5,
    critical_high: 9.5,
    enabled: true,
    unit: "pH",
  },
  turbidity: {
    parameter: "turbidity",
    minimum_value: 0,
    maximum_value: 4000,
    warning_high: 5.0,     // 5 NTU WHO guideline
    critical_high: 15.0,
    enabled: true,
    unit: "NTU",
  },
  flow_rate: {
    parameter: "flow_rate",
    minimum_value: 0,
    maximum_value: 1000,
    warning_low: 1.0,
    warning_high: 80.0,
    critical_high: 120.0,
    enabled: true,
    unit: "L/min",
  },
  dissolved_oxygen: {
    parameter: "dissolved_oxygen",
    minimum_value: 0,
    maximum_value: 20,
    warning_low: 5.0,
    critical_low: 3.0,
    enabled: false,
    unit: "mg/L",
  },
};

/**
 * Evaluates real incoming readings against configured thresholds
 */
export function evaluateTelemetryAlerts(
  deviceUid: string,
  readings: {
    ph: number;
    turbidity: number;
    flow_rate: number;
    dissolved_oxygen?: number | null;
  },
  thresholdsMap: Record<string, ThresholdConfig> = DEFAULT_THRESHOLDS
): AlertEvaluationResult[] {
  const alerts: AlertEvaluationResult[] = [];

  // 1. Evaluate pH
  const phConfig = thresholdsMap.ph || DEFAULT_THRESHOLDS.ph;
  if (phConfig.enabled) {
    const val = readings.ph;
    if (phConfig.critical_low !== undefined && phConfig.critical_low !== null && val <= phConfig.critical_low) {
      alerts.push({
        triggered: true,
        parameter: "ph",
        severity: "CRITICAL",
        alertType: "THRESHOLD_BREACH",
        currentValue: val,
        thresholdValue: phConfig.critical_low,
        message: `Critical low pH level (${val.toFixed(2)} pH) below safe minimum threshold of ${phConfig.critical_low} pH. Severe acidity detected.`,
        dedupKey: `${deviceUid}:ph:CRITICAL_LOW`,
      });
    } else if (phConfig.critical_high !== undefined && phConfig.critical_high !== null && val >= phConfig.critical_high) {
      alerts.push({
        triggered: true,
        parameter: "ph",
        severity: "CRITICAL",
        alertType: "THRESHOLD_BREACH",
        currentValue: val,
        thresholdValue: phConfig.critical_high,
        message: `Critical high pH level (${val.toFixed(2)} pH) above safe ceiling of ${phConfig.critical_high} pH. Severe alkalinity detected.`,
        dedupKey: `${deviceUid}:ph:CRITICAL_HIGH`,
      });
    } else if (phConfig.warning_low !== undefined && phConfig.warning_low !== null && val < phConfig.warning_low) {
      alerts.push({
        triggered: true,
        parameter: "ph",
        severity: "WARNING",
        alertType: "THRESHOLD_BREACH",
        currentValue: val,
        thresholdValue: phConfig.warning_low,
        message: `Warning: pH level (${val.toFixed(2)} pH) is slightly below the recommended target range (${phConfig.warning_low} pH).`,
        dedupKey: `${deviceUid}:ph:WARNING_LOW`,
      });
    } else if (phConfig.warning_high !== undefined && phConfig.warning_high !== null && val > phConfig.warning_high) {
      alerts.push({
        triggered: true,
        parameter: "ph",
        severity: "WARNING",
        alertType: "THRESHOLD_BREACH",
        currentValue: val,
        thresholdValue: phConfig.warning_high,
        message: `Warning: pH level (${val.toFixed(2)} pH) exceeds recommended target range (${phConfig.warning_high} pH).`,
        dedupKey: `${deviceUid}:ph:WARNING_HIGH`,
      });
    }
  }

  // 2. Evaluate Turbidity
  const turbConfig = thresholdsMap.turbidity || DEFAULT_THRESHOLDS.turbidity;
  if (turbConfig.enabled) {
    const val = readings.turbidity;
    if (turbConfig.critical_high !== undefined && turbConfig.critical_high !== null && val >= turbConfig.critical_high) {
      alerts.push({
        triggered: true,
        parameter: "turbidity",
        severity: "CRITICAL",
        alertType: "THRESHOLD_BREACH",
        currentValue: val,
        thresholdValue: turbConfig.critical_high,
        message: `Critical turbidity level (${val.toFixed(2)} NTU) exceeds limit of ${turbConfig.critical_high} NTU. Significant particulate contamination.`,
        dedupKey: `${deviceUid}:turbidity:CRITICAL_HIGH`,
      });
    } else if (turbConfig.warning_high !== undefined && turbConfig.warning_high !== null && val > turbConfig.warning_high) {
      alerts.push({
        triggered: true,
        parameter: "turbidity",
        severity: "WARNING",
        alertType: "THRESHOLD_BREACH",
        currentValue: val,
        thresholdValue: turbConfig.warning_high,
        message: `Warning: Turbidity (${val.toFixed(2)} NTU) is above standard clarity threshold (${turbConfig.warning_high} NTU).`,
        dedupKey: `${deviceUid}:turbidity:WARNING_HIGH`,
      });
    }
  }

  // 3. Evaluate Flow Rate
  const flowConfig = thresholdsMap.flow_rate || DEFAULT_THRESHOLDS.flow_rate;
  if (flowConfig.enabled) {
    const val = readings.flow_rate;
    if (flowConfig.critical_high !== undefined && flowConfig.critical_high !== null && val >= flowConfig.critical_high) {
      alerts.push({
        triggered: true,
        parameter: "flow_rate",
        severity: "CRITICAL",
        alertType: "FLOW_ANOMALY",
        currentValue: val,
        thresholdValue: flowConfig.critical_high,
        message: `Surge flow anomaly detected: ${val.toFixed(2)} L/min exceeds maximum pipe limit (${flowConfig.critical_high} L/min). Potential burst/leak.`,
        dedupKey: `${deviceUid}:flow_rate:CRITICAL_HIGH`,
      });
    } else if (flowConfig.warning_high !== undefined && flowConfig.warning_high !== null && val > flowConfig.warning_high) {
      alerts.push({
        triggered: true,
        parameter: "flow_rate",
        severity: "WARNING",
        alertType: "FLOW_ANOMALY",
        currentValue: val,
        thresholdValue: flowConfig.warning_high,
        message: `High flow warning: ${val.toFixed(2)} L/min above threshold (${flowConfig.warning_high} L/min).`,
        dedupKey: `${deviceUid}:flow_rate:WARNING_HIGH`,
      });
    }
  }

  // 4. Evaluate Calculated Dissolved Oxygen (ONLY if calculated value exists)
  if (readings.dissolved_oxygen !== null && readings.dissolved_oxygen !== undefined) {
    const doConfig = thresholdsMap.dissolved_oxygen || DEFAULT_THRESHOLDS.dissolved_oxygen;
    if (doConfig.enabled) {
      const val = readings.dissolved_oxygen;
      if (doConfig.critical_low !== undefined && doConfig.critical_low !== null && val <= doConfig.critical_low) {
        alerts.push({
          triggered: true,
          parameter: "dissolved_oxygen",
          severity: "CRITICAL",
          alertType: "THRESHOLD_BREACH",
          currentValue: val,
          thresholdValue: doConfig.critical_low,
          message: `Calculated Dissolved Oxygen (${val.toFixed(2)} mg/L) dropped below critical threshold (${doConfig.critical_low} mg/L). Hypoxic condition.`,
          dedupKey: `${deviceUid}:dissolved_oxygen:CRITICAL_LOW`,
        });
      }
    }
  }

  return alerts;
}
