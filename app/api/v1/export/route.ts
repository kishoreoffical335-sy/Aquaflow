import { NextRequest, NextResponse } from "next/server";
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
    .from("sensor_readings")
    .select(`
      id,
      recorded_at,
      ph,
      turbidity,
      flow_rate,
      total_flow,
      dissolved_oxygen,
      devices (
        device_name,
        device_uid,
        status
      )
    `)
    .gte("recorded_at", startDate.toISOString())
    .lte("recorded_at", endDate.toISOString())
    .order("recorded_at", { ascending: false });

  if (error) {
    console.error("Export query error:", error);
  }

  const exportRecords: ExportRecord[] = (readings || []).map((r: any) => ({
    recorded_at: r.recorded_at,
    device_name: r.devices?.device_name || "Unknown Device",
    device_uid: r.devices?.device_uid || "--",
    ph: r.ph !== null ? Number(r.ph) : null,
    turbidity: r.turbidity !== null ? Number(r.turbidity) : null,
    flow_rate: r.flow_rate !== null ? Number(r.flow_rate) : null,
    total_flow: r.total_flow !== null ? Number(r.total_flow) : null,
    dissolved_oxygen: r.dissolved_oxygen !== null ? Number(r.dissolved_oxygen) : null,
    device_status: r.devices?.status || "offline",
  }));

  const buffer = await generateTelemetryExcel(exportRecords, {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="WaterQuality_Telemetry_${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
