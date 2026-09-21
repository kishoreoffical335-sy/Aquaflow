import { NextRequest } from "next/server";
import { generateTelemetryExcel, ExportRecord } from "@/lib/export/excel-generator";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase: any = createClient();
  const searchParams = req.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "30", 10);
  const customStart = searchParams.get("start");
  const customEnd = searchParams.get("end");

  let startDate: Date;
  let endDate: Date = new Date();

  if (customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
  }

  const { data: readings, error } = await supabase
    .from("telemetry")
    .select("*")
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString())
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Export query error:", error);
  }

  const exportRecords: ExportRecord[] = (readings || []).map((r: any) => ({
    recorded_at: r.timestamp || r.received_at,
    device_name: "ESP32 Water Monitor",
    device_uid: r.device_id || "PROD-NODE-01",
    ph: r.ph !== null ? Number(r.ph) : null,
    turbidity_raw: r.turbidity_raw !== null ? Number(r.turbidity_raw) : null,
    turbidity_ntu: r.turbidity_ntu !== null ? Number(r.turbidity_ntu) : null,
    water_level_raw: r.water_level_raw !== null ? Number(r.water_level_raw) : null,
    water_level_percent: r.water_level_percent !== null ? Number(r.water_level_percent) : null,
    flow_pulses: r.flow_pulses !== null ? Number(r.flow_pulses) : null,
    flow_lpm: r.flow_lpm !== null ? Number(r.flow_lpm) : null,
    accumulated_volume_liters: r.accumulated_volume_liters !== null ? Number(r.accumulated_volume_liters) : null,
    dissolved_oxygen_mg_l: r.dissolved_oxygen_mg_l !== null ? Number(r.dissolved_oxygen_mg_l) : null,
    device_status: "online",
  }));

  const buffer = await generateTelemetryExcel(exportRecords, {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="AquaFlow_Telemetry_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
