import { NextRequest, NextResponse } from "next/server";
import { TelemetryInputSchema } from "@/lib/telemetry/validator";
import { hashApiKey } from "@/lib/telemetry/auth";
import { calculateDissolvedOxygen } from "@/lib/telemetry/do-calculator";
import { evaluateTelemetryAlerts } from "@/lib/telemetry/alert-engine";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * AUTHORITATIVE ESP32 TELEMETRY INGESTION ENDPOINT
 * POST /api/telemetry
 */
export async function POST(req: NextRequest) {
  try {
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // 1. Validate Schema
    const parseResult = TelemetryInputSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid telemetry: Malformed schema or out-of-range parameters",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const payload = parseResult.data;
    const deviceId = (payload.device_id || payload.device_uid) as string;

    // 2. Authenticate Device via Header
    const apiKey =
      req.headers.get("x-device-key") ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Missing x-device-key header or Authorization token",
        },
        { status: 401 }
      );
    }

    const keyHash = hashApiKey(apiKey);
    const supabase: any = createAdminClient();

    // Verify device in DB (check both device_id and legacy device_uid column)
    const { data: device, error: deviceErr } = await supabase
      .from("devices")
      .select("id, user_id, device_id, device_uid, status, offline_timeout_seconds")
      .or(`device_id.eq.${deviceId},device_uid.eq.${deviceId}`)
      .eq("api_key_hash", keyHash)
      .single();

    if (deviceErr || !device) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid device_id or API key credential",
        },
        { status: 401 }
      );
    }

    const receivedAt = new Date().toISOString();

    // 3. Normalized Sensor Fields (Separation of Measured vs Calibrated vs Derived vs Calculated)
    const phVal = payload.ph !== undefined ? payload.ph : null;
    const turbidityRaw = payload.turbidity_raw !== undefined ? payload.turbidity_raw : null;
    const turbidityNtu = payload.turbidity_ntu !== undefined ? payload.turbidity_ntu : (payload.turbidity !== undefined ? payload.turbidity : null);
    
    const waterLevelRaw = payload.water_level_raw !== undefined ? payload.water_level_raw : null;
    const waterLevelPercent = payload.water_level_percent !== undefined ? payload.water_level_percent : null;
    
    const flowPulses = payload.flow_pulses !== undefined ? payload.flow_pulses : null;
    const flowLpm = payload.flow_lpm !== undefined ? payload.flow_lpm : (payload.flow_rate !== undefined ? payload.flow_rate : null);
    
    const accVolume = payload.accumulated_volume_liters !== undefined ? payload.accumulated_volume_liters : (payload.total_flow !== undefined ? payload.total_flow : null);
    
    // Dissolved oxygen from payload or calculate from backend model
    let doValue = payload.dissolved_oxygen_mg_l !== undefined ? payload.dissolved_oxygen_mg_l : (payload.dissolved_oxygen !== undefined ? payload.dissolved_oxygen : null);
    
    let doResult = null;
    if (doValue === null && phVal !== null && (flowLpm !== null || flowPulses !== null)) {
      doResult = calculateDissolvedOxygen({
        ph: phVal,
        turbidity: turbidityNtu ?? 0,
        flow_rate: flowLpm ?? 0,
      });
      doValue = doResult.value;
    }

    // 4. Store in Authoritative Telemetry Table
    const { data: telemetryRow, error: insertErr } = await supabase
      .from("telemetry")
      .insert({
        device_id: deviceId,
        timestamp: payload.timestamp,
        ph: phVal,
        turbidity_raw: turbidityRaw,
        turbidity_ntu: turbidityNtu,
        water_level_raw: waterLevelRaw,
        water_level_percent: waterLevelPercent,
        flow_pulses: flowPulses,
        flow_lpm: flowLpm,
        accumulated_volume_liters: accVolume,
        dissolved_oxygen_mg_l: doValue,
        received_at: receivedAt,
        raw_payload: payload as any,
      })
      .select("id")
      .single();

    // Also sync to legacy sensor_readings for table backwards compatibility if present
    try {
      await supabase.from("sensor_readings").insert({
        device_id: device.id,
        recorded_at: payload.timestamp,
        ph: phVal,
        turbidity: turbidityNtu,
        flow_rate: flowLpm,
        total_flow: accVolume,
        dissolved_oxygen: doValue,
        do_calculation_meta: doResult as any,
        raw_payload: payload as any,
      });
    } catch {
      // Non-blocking sync
    }

    if (insertErr) {
      console.error("Telemetry insert error:", insertErr);
      return NextResponse.json(
        { success: false, message: "Database error storing telemetry record" },
        { status: 500 }
      );
    }

    // 5. Evaluate Threshold Alerts
    const { data: thresholdsList } = await supabase
      .from("thresholds")
      .select("*")
      .eq("user_id", device.user_id);

    const thresholdsMap: Record<string, any> = {};
    if (thresholdsList && thresholdsList.length > 0) {
      thresholdsList.forEach((t: any) => {
        thresholdsMap[t.parameter] = t;
      });
    }

    const alertsToTrigger = evaluateTelemetryAlerts(
      deviceId,
      {
        ph: phVal ?? 7.0,
        turbidity: turbidityNtu ?? (turbidityRaw ? turbidityRaw / 100 : 0),
        flow_rate: flowLpm ?? 0,
        dissolved_oxygen: doValue,
      },
      thresholdsMap
    );

    // Deduplicate & save active alerts
    if (alertsToTrigger.length > 0) {
      for (const alert of alertsToTrigger) {
        const { data: activeAlert } = await supabase
          .from("alerts")
          .select("id, occurrence_count")
          .eq("device_id", device.id)
          .eq("dedup_key", alert.dedupKey)
          .eq("status", "ACTIVE")
          .single();

        if (activeAlert) {
          await supabase
            .from("alerts")
            .update({
              occurrence_count: activeAlert.occurrence_count + 1,
              last_occurred_at: receivedAt,
              current_value: alert.currentValue,
            })
            .eq("id", activeAlert.id);
        } else {
          await supabase.from("alerts").insert({
            user_id: device.user_id,
            device_id: device.id,
            parameter: alert.parameter,
            severity: alert.severity,
            alert_type: alert.alertType,
            current_value: alert.currentValue,
            threshold_value: alert.thresholdValue,
            message: alert.message,
            status: "ACTIVE",
            dedup_key: alert.dedupKey,
            occurrence_count: 1,
            last_occurred_at: receivedAt,
          });
        }
      }
    }

    // 6. Update Device Heartbeat and Status
    await supabase
      .from("devices")
      .update({
        status: alertsToTrigger.some((a) => a.severity === "CRITICAL") ? "fault" : "online",
        last_seen: receivedAt,
        last_seen_at: receivedAt,
        firmware_version: payload.firmware_version ?? "1.0.0",
      })
      .eq("id", device.id);

    return NextResponse.json(
      {
        success: true,
        message: "Telemetry received",
        reading_id: telemetryRow?.id,
        received_at: receivedAt,
        do_status: doValue !== null ? "Calculated" : "Unavailable",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Telemetry API exception:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET documentation & health check
 */
export async function GET() {
  return NextResponse.json({
    service: "AquaFlow ESP32 Telemetry Ingestion API",
    status: "online",
    endpoint: "/api/telemetry",
    expected_hardware_mapping: {
      ph: "UART2 (RX: GPIO16, TX: GPIO17, 9600 Baud)",
      turbidity: "Analog ADC (GPIO32)",
      water_level: "Analog ADC (GPIO34)",
      flow: "Interrupt Pulse (GPIO27)",
      lcd: "I2C (SDA: GPIO21, SCL: GPIO22, Addr: 0x27)",
      buzzer: "Digital Output (GPIO25)",
    },
    data_classification: {
      measured: ["ph", "turbidity_raw (0-4095)", "water_level_raw (0-4095)", "flow_pulses"],
      calibrated: ["turbidity_ntu", "water_level_percent", "flow_lpm"],
      derived: ["accumulated_volume_liters"],
      calculated: ["dissolved_oxygen_mg_l (backend aeration model)"],
    },
    auth_header: "x-device-key: <device_secret_token>",
  });
}
