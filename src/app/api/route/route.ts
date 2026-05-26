import { getRoute, RouteServiceError } from "@/services/maps/routeService";
import type { RouteRequest } from "@/services/maps/types";
import { logRuntimeDiagnostics } from "@/services/vehicle/envDiagnostics";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  logRuntimeDiagnostics("api/route");
  let body: RouteRequest;

  try {
    body = (await request.json()) as RouteRequest;
  } catch {
    return NextResponse.json(
      { error: "Malformed request body.", code: "MALFORMED" },
      { status: 400 },
    );
  }

  const start = (body.start ?? body.startZip ?? "").trim();
  const destination = (body.destination ?? body.destinationZip ?? "").trim();

  if (!start || !destination) {
    return NextResponse.json(
      { error: "Start and destination are required (address or ZIP).", code: "MALFORMED" },
      { status: 400 },
    );
  }

  try {
    const route = await getRoute(start, destination);
    return NextResponse.json(route);
  } catch (error) {
    if (error instanceof RouteServiceError) {
      const status =
        error.code === "INVALID_ZIP" || error.code === "INVALID_PLACE"
          ? 400
          : error.code === "TIMEOUT"
            ? 504
            : 503;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    return NextResponse.json(
      { error: "Route is unavailable.", code: "UNAVAILABLE" },
      { status: 503 },
    );
  }
}
