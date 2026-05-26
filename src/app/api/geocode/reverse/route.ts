import { resolveAddressFromCoordinates } from "@/services/maps/reverseGeocodeService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng are required." }, { status: 400 });
  }

  try {
    const place = await resolveAddressFromCoordinates(lat, lng);
    return NextResponse.json(place);
  } catch {
    return NextResponse.json({ error: "Reverse geocode unavailable." }, { status: 503 });
  }
}
