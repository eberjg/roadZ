import { getRoute, RouteServiceError } from "@/services/maps/routeService";
import type { RouteRequest } from "@/services/maps/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: RouteRequest;

  try {
    body = (await request.json()) as RouteRequest;
  } catch {
    return NextResponse.json(
      { error: "Malformed request body.", code: "MALFORMED" },
      { status: 400 },
    );
  }

  const startZip = body.startZip?.trim() ?? "";
  const destinationZip = body.destinationZip?.trim() ?? "";

  if (!startZip || !destinationZip) {
    return NextResponse.json(
      { error: "Start and destination ZIP codes are required.", code: "MALFORMED" },
      { status: 400 },
    );
  }

  try {
    const route = await getRoute(startZip, destinationZip);
    return NextResponse.json(route);
  } catch (error) {
    if (error instanceof RouteServiceError) {
      const status =
        error.code === "INVALID_ZIP" ? 400 : error.code === "TIMEOUT" ? 504 : 503;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    return NextResponse.json(
      { error: "Route is unavailable.", code: "UNAVAILABLE" },
      { status: 503 },
    );
  }
}
