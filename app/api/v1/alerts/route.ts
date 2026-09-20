import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase: any = createClient();
  const status = req.nextUrl.searchParams.get("status");

  let query = supabase
    .from("alerts")
    .select("*, devices ( device_name, device_uid )")
    .order("created_at", { ascending: false });

  if (status && ["ACTIVE", "ACKNOWLEDGED", "RESOLVED"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data: alerts, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alerts: alerts || [] });
}

export async function PATCH(req: NextRequest) {
  const supabase: any = createClient();
  const { id, action } = await req.json();

  if (!id || !["ACKNOWLEDGE", "RESOLVE"].includes(action)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const updateData: any = {
    status: action === "ACKNOWLEDGE" ? "ACKNOWLEDGED" : "RESOLVED",
  };

  if (action === "ACKNOWLEDGE") {
    updateData.acknowledged_at = new Date().toISOString();
  } else {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("alerts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, alert: data });
}
