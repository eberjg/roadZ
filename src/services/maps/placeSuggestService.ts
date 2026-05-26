import { isMapboxConfigured, MapboxClientError, suggestPlaces as mapboxSuggestPlaces } from "./mapboxClient";
import type { PlaceSuggestion } from "./types";

const MOCK_PLACES: PlaceSuggestion[] = [
  {
    id: "mock-33301",
    label: "33301, Fort Lauderdale, Florida, United States",
    lng: -80.1373,
    lat: 26.1224,
  },
  {
    id: "mock-98402",
    label: "98402, Tacoma, Washington, United States",
    lng: -122.4598,
    lat: 47.2529,
  },
  {
    id: "mock-miami",
    label: "Miami, Florida, United States",
    lng: -80.1918,
    lat: 25.7617,
  },
  {
    id: "mock-tacoma",
    label: "Tacoma, Washington, United States",
    lng: -122.4443,
    lat: 47.2529,
  },
];

function shouldUseMockSuggestions(): boolean {
  return process.env.PLACES_FORCE_MOCK === "true" || process.env.ROUTE_FORCE_FALLBACK === "true";
}

function mockSuggestPlaces(query: string): PlaceSuggestion[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) {
    return [];
  }
  return MOCK_PLACES.filter(
    (place) =>
      place.label.toLowerCase().includes(needle) ||
      place.id.toLowerCase().includes(needle.replace(/\s/g, "")),
  ).slice(0, 5);
}

export async function suggestPlaces(query: string): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  if (shouldUseMockSuggestions() || !isMapboxConfigured()) {
    return mockSuggestPlaces(trimmed);
  }

  try {
    return await mapboxSuggestPlaces(trimmed);
  } catch (error) {
    if (error instanceof MapboxClientError) {
      return mockSuggestPlaces(trimmed);
    }
    throw error;
  }
}
