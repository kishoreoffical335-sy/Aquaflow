import { NextRequest } from "next/server";
import { POST as handleTelemetryPost, GET as handleTelemetryGet } from "@/app/api/telemetry/route";

export const dynamic = "force-dynamic";

/**
 * Route handler for /api/v1/telemetry
 * Delegates to centralized /api/telemetry handler
 */
export async function POST(req: NextRequest) {
  return handleTelemetryPost(req);
}

export async function GET() {
  return handleTelemetryGet();
}
