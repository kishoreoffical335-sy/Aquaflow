import { NextRequest, NextResponse } from "next/server";
import { TelemetryInputSchema } from "@/lib/telemetry/validator";
import { hashApiKey } from "@/lib/telemetry/auth";
import { calculateDissolvedOxygen } from "@/lib/telemetry/do-calculator";
import { evaluateTelemetryAlerts } from "@/lib/telemetry/alert-engine";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * ESP32 TELEMETRY INGESTION ENDPOINT
 * POST /api/v1/telemetry
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validate Schema
    const parseResult = TelemetryInputSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed: Malformed telemetry payload",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const payload = parseResult.data;

    // 2. Authenticate Device via Header or Body
    const apiKey =
      req.headers.get("x-device-key") ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Missing x-device-key header or Authorization token",
        },
        { status: 401 }
      );
    }

    const keyHash = hashApiKey(apiKey);
    const supabase: any = createAdminClient();

    // Verify device in DB
    const { data: device, error: deviceErr } = await supabase
      .from("devices")
      .select("id, user_id, device_uid, status, offline_timeout_seconds")
      .eq("device_uid", payload.device_uid)
      .eq("api_key_hash", keyHash)
      .single();

    if (deviceErr || !device) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid Device UID or API Key credential",
        },
        { status: 401 }
      );
    }

    // 3. Prevent duplicate packet (Idempotency check)
    const { data: existingPacket } = await supabase
      .from("sensor_readings")
      .select("id")
      .eq("device_id", device.id)
      .eq("recorded_at", payload.timestamp)
      .single();

    if (existingPacket) {
      return NextResponse.json(
        {
          success: true,
          message: "Duplicate packet ignored (idempotent)",
          reading_id: existingPacket.id,
        },
        { status: 200 }
      );
    }

    // 4. Calculate Derived / Conditional Values (Dissolved Oxygen)
    const doResult = calculateDissolvedOxygen({
      ph: payload.ph,
      turbidity: payload.turbidity,
      flow_rate: payload.flow_rate,
    });

    // 5. Fetch user thresholds or fall back to defaults
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

    // 6. Evaluate Alerts Engine
    const alertsToTrigger = evaluateTelemetryAlerts(
      payload.device_uid,
      {
        ph: payload.ph,
        turbidity: payload.turbidity,
        flow_rate: payload.flow_rate,
        dissolved_oxygen: doResult.value,
      },
      thresholdsMap
    );

    // 7. Store Real Reading
    const { data: reading, error: insertErr } = await supabase
      .from("sensor_readings")
      .insert({
        device_id: device.id,
        recorded_at: payload.timestamp,
        ph: payload.ph,
        turbidity: payload.turbidity,
        flow_rate: payload.flow_rate,
        total_flow: payload.total_flow ?? null,
        dissolved_oxygen: doResult.value,
        do_calculation_meta: doResult as any,
        raw_payload: payload as any,
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json(
        { success: false, error: "Database error storing reading" },
        { status: 500 }
      );
    }

    // 8. Process Deduplicated Alerts
    if (alertsToTrigger.length > 0) {
      for (const alert of alertsToTrigger) {
        // Check if an active alert already exists with this dedup key
        const { data: activeAlert } = await supabase
          .from("alerts")
          .select("id, occurrence_count")
          .eq("device_id", device.id)
          .eq("dedup_key", alert.dedupKey)
          .eq("status", "ACTIVE")
          .single();

        if (activeAlert) {
          // Deduplicate: increment count and update last_occurred_at
          await supabase
            .from("alerts")
            .update({
              occurrence_count: activeAlert.occurrence_count + 1,
              last_occurred_at: new Date().toISOString(),
              current_value: alert.currentValue,
            })
            .eq("id", activeAlert.id);
        } else {
          // Insert new active alert
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
            last_occurred_at: new Date().toISOString(),
          });
        }
      }
    }

    // 9. Check for resolved alerts (Recovery detection)
    const triggeredParams = new Set(alertsToTrigger.map((a) => a.parameter));
    for (const param of ["ph", "turbidity", "flow_rate", "dissolved_oxygen"]) {
      if (!triggeredParams.has(param)) {
        await supabase
          .from("alerts")
          .update({
            status: "RESOLVED",
            resolved_at: new Date().toISOString(),
          })
          .eq("device_id", device.id)
          .eq("parameter", param)
          .eq("status", "ACTIVE");
      }
    }

    // 10. Update Device Heartbeat and Status
    await supabase
      .from("devices")
      .update({
        status: alertsToTrigger.some((a) => a.severity === "CRITICAL") ? "fault" : "online",
        last_seen_at: new Date().toISOString(),
        firmware_version: payload.firmware_version ?? "1.0.0",
      })
      .eq("id", device.id);

    return NextResponse.json(
      {
        success: true,
        message: "Telemetry received",
        reading_id: reading?.id,
        do_status: doResult.isAvailable ? "Calculated" : "Unavailable",
        alerts_evaluated: alertsToTrigger.length,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET documentation & health check
 */
export async function GET() {
  return NextResponse.json({
    service: "Water Quality & Flow Telemetry Ingestion API",
    status: "online",
    version: "v1.0",
    accepted_measurements: {
      measured: ["ph (0-14)", "turbidity (NTU)", "flow_rate (L/min)"],
      derived: ["total_flow (Liters)"],
      calculated: ["dissolved_oxygen (mg/L, backend model evaluated)"],
    },
    auth_methods: ["Header 'x-device-key: <key>'", "Header 'Authorization: Bearer <key>'"],
  });
}
