import { getZoneAtMile, getZonesForRoute } from "@/data/mockWeatherZones";
import type { OpenWeatherResponse, WeatherZone } from "./types";

const REQUEST_TIMEOUT_MS = 10_000;

function getApiKey(): string | undefined {
  return process.env.OPENWEATHER_API_KEY?.trim();
}

export function shouldUseMockWeather(): boolean {
  return (
    process.env.WEATHER_FORCE_MOCK === "true" || !getApiKey()
  );
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeoutId);
  }
}

function mapOpenWeatherToZone(
  data: OpenWeatherResponse,
  mile: number,
  city: string,
): WeatherZone {
  const main = data.weather[0]?.main?.toLowerCase() ?? "clear";
  let condition: WeatherZone["condition"] = "clear";
  if (main.includes("thunder")) {
    condition = "thunderstorm";
  } else if (main.includes("rain") || main.includes("drizzle")) {
    condition = "rain";
  } else if (main.includes("snow")) {
    condition = "snow";
  } else if (main.includes("fog") || main.includes("mist")) {
    condition = "fog";
  }

  const temp = data.main?.temp ?? 70;
  if (temp >= 100) {
    condition = "extreme_heat";
  }

  const windMph = Math.round((data.wind?.speed ?? 0) * 2.237);
  if (windMph >= 40 && condition === "clear") {
    condition = "wind";
  }

  return {
    id: "zone-live",
    mileStart: mile,
    mileEnd: mile + 100,
    city,
    condition,
    temperatureF: Math.round(temp),
    precipitationMm: condition === "rain" || condition === "thunderstorm" ? 10 : 0,
    windMph,
    visibilityMiles: Math.round((data.visibility ?? 10000) / 1609),
    summary: data.weather[0]?.description ?? "Current conditions",
    icon: condition === "clear" ? "☀️" : "🌧️",
  };
}

export async function fetchOpenWeatherForZip(zip: string): Promise<WeatherZone | null> {
  const key = getApiKey();
  if (!key) {
    return null;
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?zip=${encodeURIComponent(zip)},US&appid=${key}&units=imperial`;

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as OpenWeatherResponse;
    return mapOpenWeatherToZone(data, 0, `ZIP ${zip}`);
  } catch {
    return null;
  }
}

export function getMockRouteWeather(
  totalDistanceMiles: number,
  completedDistanceMiles: number,
): { current: WeatherZone; routeZones: WeatherZone[] } {
  const routeZones = getZonesForRoute(totalDistanceMiles);
  const current = getZoneAtMile(completedDistanceMiles, totalDistanceMiles);
  return { current, routeZones };
}
