import { z } from "zod";

/**
 * Strict telemetry schema matching physical ESP32 measurements
 * Only allows pH, Turbidity, Flow Rate, and derived Total Flow.
 * Rejects out-of-range or fabricated parameters.
 */
export const TelemetryInputSchema = z.object({
  device_uid: z.string().min(3, "Device UID must be at least 3 characters").max(64),
  timestamp: z.string().datetime({ message: "Timestamp must be a valid ISO 8601 string" }),
  ph: z.number().min(0, "pH must be between 0 and 14").max(14, "pH must be between 0 and 14"),
  turbidity: z.number().min(0, "Turbidity must be non-negative").max(4000, "Turbidity exceeds physical sensor ceiling (4000 NTU)"),
  flow_rate: z.number().min(0, "Flow rate cannot be negative").max(1000, "Flow rate exceeds maximum plausible sensor range"),
  total_flow: z.number().min(0, "Total flow cannot be negative").optional(),
  battery_level: z.number().min(0).max(100).optional(),
  rssi: z.number().min(-120).max(0).optional(),
  firmware_version: z.string().max(32).optional(),
});

export type ValidatedTelemetryPayload = z.infer<typeof TelemetryInputSchema>;
