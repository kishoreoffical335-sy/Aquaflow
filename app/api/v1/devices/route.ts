import { NextRequest, NextResponse } from "next/server";
import { generateDeviceApiKey } from "@/lib/telemetry/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Helper to get an authoritative database client for server API routes.
 * Prefers createAdminClient() (using SUPABASE_SERVICE_ROLE_KEY) to bypass RLS for provisioning,
 * and gracefully falls back to createClient() if service role is not configured.
 */
function getServerDbClient(): { client: any; isAdmin: boolean } {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { client: createAdminClient() as any, isAdmin: true };
    }
  } catch (err) {
    console.warn("Could not initialize Supabase Admin Client, falling back to standard client:", err);
  }
  return { client: createClient() as any, isAdmin: false };
}

export async function GET() {
  const { client: db } = getServerDbClient();

  try {
    const { data: devices, error } = await db
      .from("devices")
      .select("id, device_name, device_id, device_uid, status, last_seen, last_seen_at, firmware_version, offline_timeout_seconds, created_at, user_id")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize device_id and last_seen_at
    const normalized = (devices || []).map((d: any) => ({
      ...d,
      device_id: d.device_id || d.device_uid || "PROD-NODE-01",
      device_uid: d.device_uid || d.device_id || "PROD-NODE-01",
      last_seen_at: d.last_seen_at || d.last_seen,
    }));

    return NextResponse.json({ success: true, devices: normalized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch devices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { client: db, isAdmin } = getServerDbClient();

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const deviceName = (body.device_name || "AQUAFLOW").trim();
    const deviceId = (body.device_id || body.device_uid || "PROD-NODE-01").trim().toUpperCase();
    const shouldRotate = Boolean(body.rotate);

    if (!deviceName) {
      return NextResponse.json({ error: "device_name is required" }, { status: 400 });
    }

    if (!deviceId) {
      return NextResponse.json({ error: "device_id is required" }, { status: 400 });
    }

    // Attempt to identify user session if available
    let userId: string | null = null;
    try {
      const userClient = createClient();
      const { data: { user } } = await userClient.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // Direct console / operator mode without session
    }

    // If userId not found, try to grab the first user profile or registered user
    if (!userId && isAdmin) {
      try {
        const { data: profiles } = await (db as any).from("profiles").select("id").limit(1);
        if (profiles && profiles.length > 0) {
          userId = (profiles as any[])[0]?.id || null;
        }
      } catch {
        // Fall back to null if profiles query fails
      }
    }

    // Check if device already exists
    const { data: existingDevice } = await (db as any)
      .from("devices")
      .select("*")
      .or(`device_id.eq.${deviceId},device_uid.eq.${deviceId}`)
      .maybeSingle();

    // 1. If device exists and rotation was NOT explicitly requested:
    if (existingDevice && !shouldRotate) {
      return NextResponse.json(
        {
          success: false,
          exists: true,
          error: `Device "${deviceId}" already exists.`,
          message: `Device "${deviceId}" is already registered. If you need a new API key, choose "Rotate Token".`,
          device: {
            ...existingDevice,
            device_id: existingDevice.device_id || existingDevice.device_uid,
          },
        },
        { status: 409 }
      );
    }

    // Generate fresh cryptographically secure API key
    const { apiKey, keyHash } = generateDeviceApiKey();

    // 2. If device exists and rotation IS requested:
    if (existingDevice && shouldRotate) {
      const { data: updatedDevice, error: updateError } = await db
        .from("devices")
        .update({
          device_name: deviceName || existingDevice.device_name,
          api_key_hash: keyHash,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDevice.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      // Ensure default sensors exist
      await ensureSensorsExist(db, existingDevice.id);

      return NextResponse.json({
        success: true,
        isRotated: true,
        message: `API key for device "${deviceId}" rotated successfully.`,
        device: updatedDevice,
        apiKey, // Plaintext returned ONLY ONCE upon generation/rotation
      });
    }

    // 3. Device does not exist: Create new device
    const insertPayload: any = {
      device_name: deviceName,
      device_id: deviceId,
      device_uid: deviceId,
      api_key_hash: keyHash,
      status: "offline",
      firmware_version: "1.0.0",
      offline_timeout_seconds: 60,
    };

    if (userId) {
      insertPayload.user_id = userId;
    }

    const { data: newDevice, error: insertError } = await db
      .from("devices")
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      // If error is foreign key violation on user_id, retry without user_id if table permits
      if (insertError.code === "23503" || insertError.message?.includes("user_id")) {
        delete insertPayload.user_id;
        const { data: retryDevice, error: retryError } = await db
          .from("devices")
          .insert(insertPayload)
          .select()
          .single();

        if (retryError) {
          return NextResponse.json(
            { error: `Database error: ${retryError.message}` },
            { status: 400 }
          );
        }

        await ensureSensorsExist(db, retryDevice.id);

        return NextResponse.json(
          {
            success: true,
            isCreated: true,
            message: `Device "${deviceId}" provisioned successfully.`,
            device: retryDevice,
            apiKey,
          },
          { status: 201 }
        );
      }

      return NextResponse.json(
        { error: `Failed to provision device: ${insertError.message}` },
        { status: 400 }
      );
    }

    // Seed default sensor channels
    await ensureSensorsExist(db, newDevice.id);

    return NextResponse.json(
      {
        success: true,
        isCreated: true,
        message: `Device "${deviceId}" provisioned successfully.`,
        device: newDevice,
        apiKey, // Plaintext returned ONLY ONCE
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error during provisioning" },
      { status: 500 }
    );
  }
}

/**
 * Seed sensor channels for a provisioned device if not present
 */
async function ensureSensorsExist(db: any, deviceUuid: string) {
  try {
    const defaultSensors = [
      {
        device_id: deviceUuid,
        sensor_type: "ph",
        sensor_name: "pH 4-in-1 UART Module (GPIO16/17)",
        unit: "pH",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: deviceUuid,
        sensor_type: "turbidity",
        sensor_name: "Optical Turbidity Sensor (GPIO32)",
        unit: "Raw ADC / NTU",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: deviceUuid,
        sensor_type: "water_level",
        sensor_name: "Water Level Sensor (GPIO34)",
        unit: "Raw ADC / %",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: deviceUuid,
        sensor_type: "flow_rate",
        sensor_name: "Hall-Effect Flow Meter (GPIO27)",
        unit: "Pulses / L/min",
        measurement_type: "MEASURED",
        status: "active",
      },
      {
        device_id: deviceUuid,
        sensor_type: "total_flow",
        sensor_name: "Accumulated Water Volume",
        unit: "Liters",
        measurement_type: "DERIVED",
        status: "active",
      },
      {
        device_id: deviceUuid,
        sensor_type: "dissolved_oxygen",
        sensor_name: "Calculated Dissolved Oxygen",
        unit: "mg/L",
        measurement_type: "CALCULATED",
        status: "active",
      },
    ];

    for (const sensor of defaultSensors) {
      await db
        .from("sensors")
        .upsert(sensor, { onConflict: "device_id,sensor_type" })
        .catch(() => {});
    }
  } catch {
    // Non-blocking sensor seeding
  }
}
