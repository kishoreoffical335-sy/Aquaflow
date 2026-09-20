import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_THRESHOLDS } from "@/lib/telemetry/alert-engine";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase: any = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ thresholds: Object.values(DEFAULT_THRESHOLDS) });
  }

  const { data: dbThresholds, error } = await supabase
    .from("thresholds")
    .select("*")
    .eq("user_id", user.id);

  if (error || !dbThresholds || dbThresholds.length === 0) {
    return NextResponse.json({ thresholds: Object.values(DEFAULT_THRESHOLDS) });
  }

  return NextResponse.json({ thresholds: dbThresholds });
}

export async function POST(req: NextRequest) {
  const supabase: any = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { parameter, minimum_value, maximum_value, warning_low, warning_high, critical_low, critical_high, enabled, unit } = body;

    const { data, error } = await supabase
      .from("thresholds")
      .upsert(
        {
          user_id: user.id,
          parameter,
          minimum_value,
          maximum_value,
          warning_low,
          warning_high,
          critical_low,
          critical_high,
          enabled: enabled ?? true,
          unit,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,parameter" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, threshold: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
