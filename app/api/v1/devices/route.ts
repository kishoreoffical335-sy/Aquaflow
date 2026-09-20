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
    .select("id, device_name, device_uid, status, last_seen_at, firmware_version, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ devices: devices || [] });
}

export async function POST(req: NextRequest) {
  const supabase: any = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { device_name, device_uid } = await req.json();
    if (!device_name || !device_uid) {
      return NextResponse.json({ error: "device_name and device_uid are required" }, { status: 400 });
    }

    const { apiKey, keyHash } = generateDeviceApiKey();

    const { data: device, error } = await supabase
      .from("devices")
      .insert({
        user_id: user.id,
        device_name,
        device_uid: device_uid.trim().toUpperCase(),
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
        sensor_name: "pH Probe",
        unit: "pH",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: device.id,
        sensor_type: "turbidity",
        sensor_name: "Turbidity Sensor",
        unit: "NTU",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: device.id,
        sensor_type: "flow_rate",
        sensor_name: "Hall-Effect Flow Meter",
        unit: "L/min",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: device.id,
        sensor_type: "total_flow",
        sensor_name: "Accumulated Water Volume",
        unit: "L",
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
