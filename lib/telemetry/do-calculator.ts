import { DOCalculationResult } from "@/lib/types/iot.types";

export interface DOCalculationConfig {
  enabled: boolean;
  model: "NONE" | "FLOW_AERATION_EMPIRICAL_V1" | "ESTIMATED_SATURATION";
  assumedWaterTempCelsius?: number; // e.g. 20.0 C if configured
  atmosphericPressureKPa?: number;  // e.g. 101.325 kPa
}

/**
 * Dedicated Dissolved Oxygen (DO) Calculation Service
 * 
 * Strict scientific rule: DO is NEVER presented as a measured sensor value.
 * If the physical inputs (pH, Turbidity, Flow) are insufficient without a calibrated model,
 * this service returns isAvailable: false with an explicit explanation.
 */
export function calculateDissolvedOxygen(
  inputs: {
    ph?: number | null;
    turbidity?: number | null;
    turbidity_raw?: number | null;
    turbidity_ntu?: number | null;
    flow_rate?: number | null;
    flow_lpm?: number | null;
  },
  config: DOCalculationConfig = { enabled: false, model: "NONE" }
): DOCalculationResult {
  const calculatedAt = new Date().toISOString();
  const phVal = inputs.ph ?? null;
  const turbNtu = inputs.turbidity_ntu ?? inputs.turbidity ?? null;
  const turbRaw = inputs.turbidity_raw ?? null;
  const flowLpm = inputs.flow_lpm ?? inputs.flow_rate ?? null;

  // If calculation model is disabled or not configured
  if (!config.enabled || config.model === "NONE") {
    return {
      isAvailable: false,
      value: null,
      unit: "mg/L",
      model: "NONE",
      reason: "Dissolved oxygen calculation unavailable with current sensor inputs (requires configured temperature/dissolved gas model).",
      inputsUsed: {
        ph: phVal,
        turbidity_raw: turbRaw,
        turbidity_ntu: turbNtu,
        flow_lpm: flowLpm,
      },
      calculatedAt,
    };
  }

  // Model: Flow Aeration Empirical Estimation (Configured only)
  if (config.model === "FLOW_AERATION_EMPIRICAL_V1") {
    const temp = config.assumedWaterTempCelsius ?? 20.0;
    // Standard Henry's law saturation for freshwater at temp T (approx 9.09 mg/L at 20 C)
    const saturationDO = 14.652 - 0.41022 * temp + 0.007991 * Math.pow(temp, 2) - 0.000077774 * Math.pow(temp, 3);
    
    // Aeration factor based on water velocity/flow agitation (min 0.6, max 1.0)
    const flowVal = flowLpm ?? 0;
    const aerationFactor = Math.min(1.0, 0.6 + (flowVal > 0 ? Math.log10(1 + flowVal) * 0.15 : 0));
    
    // Slight deficit penalty for suspended solids / turbidity
    const turbVal = turbNtu ?? 0;
    const turbidityPenalty = Math.max(0, Math.min(1.5, (turbVal / 100) * 0.2));
    
    const calculatedValue = Math.max(0, Number(((saturationDO * aerationFactor) - turbidityPenalty).toFixed(2)));

    return {
      isAvailable: true,
      value: calculatedValue,
      unit: "mg/L",
      model: "FLOW_AERATION_EMPIRICAL_V1",
      inputsUsed: {
        ph: phVal,
        turbidity_raw: turbRaw,
        turbidity_ntu: turbNtu,
        flow_lpm: flowLpm,
        temperature_assumed: temp,
      },
      calculatedAt,
    };
  }

  return {
    isAvailable: false,
    value: null,
    unit: "mg/L",
    model: config.model,
    reason: "Configured DO model unsupported or missing critical physical coefficients.",
    inputsUsed: {
      ph: phVal,
      turbidity_raw: turbRaw,
      turbidity_ntu: turbNtu,
      flow_lpm: flowLpm,
    },
    calculatedAt,
  };
}
