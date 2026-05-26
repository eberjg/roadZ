import { getRuntimeDiagnostics } from "@/services/vehicle/envDiagnostics";
import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics = getRuntimeDiagnostics();
  const healthy = diagnostics.mapboxServerConfigured || diagnostics.routeForceFallback;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      diagnostics,
    },
    { status: healthy ? 200 : 503 },
  );
}
