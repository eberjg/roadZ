import { suggestPlaces } from "@/services/maps/placeSuggestService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await suggestPlaces(query);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json(
      { error: "Address suggestions are unavailable.", suggestions: [] },
      { status: 503 },
    );
  }
}
