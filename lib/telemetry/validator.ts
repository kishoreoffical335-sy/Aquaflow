import { z } from "zod";

/**
 * Strict telemetry schema matching physical ESP32 measurements and data classification
 * - pH: Measured via UART2 (0-14) or null
 * - Turbidity: Measured raw ADC (0-4095); NTU null unless calibrated
 * - Water Level: Measured raw ADC (0-4095); percent null unless calibrated
 * - Flow: Measured pulses (>= 0); LPM null unless calibrated
 * - Accumulated Volume: Derived Liters or null
 * - Dissolved Oxygen: Calculated mg/L or null
 */
export const TelemetryInputSchema = z.object({
  device_id: z.string().min(2, "Device ID must be at least 2 characters").max(64).optional(),
  device_uid: z.string().min(2).max(64).optional(), // Compatibility alias
  timestamp: z.string().datetime({ message: "Timestamp must be a valid ISO 8601 string" }),

  ph: z.number().min(0, "pH must be >= 0").max(14, "pH must be <= 14").nullable().optional(),

  turbidity_raw: z.number().int().min(0, "Raw Turbidity ADC must be >= 0").max(4095, "Raw Turbidity ADC must be <= 4095").nullable().optional(),
  turbidity_ntu: z.number().min(0).max(4000).nullable().optional(),
  turbidity: z.number().nullable().optional(), // Compatibility alias

  water_level_raw: z.number().int().min(0, "Raw Water Level ADC must be >= 0").max(4095, "Raw Water Level ADC must be <= 4095").nullable().optional(),
  water_level_percent: z.number().min(0).max(100).nullable().optional(),

  flow_pulses: z.number().int().min(0, "Flow pulse count must be >= 0").nullable().optional(),
  flow_lpm: z.number().min(0).max(1000).nullable().optional(),
  flow_rate: z.number().nullable().optional(), // Compatibility alias

  accumulated_volume_liters: z.number().min(0).nullable().optional(),
  total_flow: z.number().nullable().optional(), // Compatibility alias

  dissolved_oxygen_mg_l: z.number().min(0).max(20).nullable().optional(),
  dissolved_oxygen: z.number().nullable().optional(), // Compatibility alias

  // Optional diagnostics
  battery_level: z.number().min(0).max(100).optional(),
  rssi: z.number().min(-120).max(0).optional(),
  firmware_version: z.string().max(32).optional(),
}).refine((data) => data.device_id || data.device_uid, {
  message: "Either device_id or device_uid must be provided",
  path: ["device_id"],
});

export type ValidatedTelemetryPayload = z.infer<typeof TelemetryInputSchema>;
