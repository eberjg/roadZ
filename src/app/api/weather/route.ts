import { buildWeatherIntelligence } from "@/services/weather/weatherEngine";
import type { WeatherRequest } from "@/services/weather/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: WeatherRequest;

  try {
    body = (await request.json()) as WeatherRequest;
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  if (!body.totalDistanceMiles || body.totalDistanceMiles <= 0) {
    return NextResponse.json({ error: "Valid trip distance is required." }, { status: 400 });
  }

  try {
    const intelligence = await buildWeatherIntelligence({
      startZip: body.startZip?.trim() ?? "",
      destinationZip: body.destinationZip?.trim() ?? "",
      totalDistanceMiles: body.totalDistanceMiles,
      completedDistanceMiles: body.completedDistanceMiles ?? 0,
      fatigueStatus: body.fatigueStatus,
      drivingSessionHours: body.drivingSessionHours,
    });
    return NextResponse.json(intelligence);
  } catch {
    return NextResponse.json({ error: "Weather unavailable." }, { status: 503 });
  }
}
