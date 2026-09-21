import { NextRequest, NextResponse } from "next/server";
import { generateDeviceApiKey } from "@/lib/telemetry/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase: any = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ devices: [] });
  }

  const { data: devices, error } = await supabase
    .from("devices")
    .select("id, device_name, device_id, device_uid, status, last_seen, last_seen_at, firmware_version, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Normalize device_id and last_seen
  const normalized = (devices || []).map((d: any) => ({
    ...d,
    device_id: d.device_id || d.device_uid,
    device_uid: d.device_uid || d.device_id,
    last_seen_at: d.last_seen || d.last_seen_at,
  }));

  return NextResponse.json({ devices: normalized });
}

export async function POST(req: NextRequest) {
  const supabase: any = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const deviceName = body.device_name;
    const deviceId = (body.device_id || body.device_uid || "PROD-NODE-01").trim().toUpperCase();

    if (!deviceName) {
      return NextResponse.json({ error: "device_name is required" }, { status: 400 });
    }

    const { apiKey, keyHash } = generateDeviceApiKey();

    const { data: device, error } = await supabase
      .from("devices")
      .insert({
        user_id: user.id,
        device_name: deviceName,
        device_id: deviceId,
        device_uid: deviceId,
        api_key_hash: keyHash,
        status: "offline",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("sensors").insert([
      {
        device_id: device.id,
        sensor_type: "ph",
        sensor_name: "pH 4-in-1 UART Module",
        unit: "pH",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: device.id,
        sensor_type: "turbidity",
        sensor_name: "Optical Turbidity Sensor (GPIO32)",
        unit: "Raw ADC / NTU",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: device.id,
        sensor_type: "water_level",
        sensor_name: "Water Level Sensor (GPIO34)",
        unit: "Raw ADC / %",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: device.id,
        sensor_type: "flow_rate",
        sensor_name: "Hall-Effect Flow Meter (GPIO27)",
        unit: "Pulses / L/min",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: device.id,
        sensor_type: "total_flow",
        sensor_name: "Accumulated Water Volume",
        unit: "Liters",
        measurement_type: "DERIVED",
        status: "active",
      },
      {
        device_id: device.id,
        sensor_type: "dissolved_oxygen",
        sensor_name: "Calculated Dissolved Oxygen",
        unit: "mg/L",
        measurement_type: "CALCULATED",
        status: "active",
      },
    ]);

    return NextResponse.json({
      success: true,
      device,
      apiKey,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
