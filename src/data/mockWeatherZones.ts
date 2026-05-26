import type { WeatherCondition, WeatherZone } from "@/services/weather/types";

export const MOCK_WEATHER_ZONES: WeatherZone[] = [
  {
    id: "zone-fl",
    mileStart: 0,
    mileEnd: 450,
    city: "South Florida",
    condition: "clear",
    temperatureF: 82,
    precipitationMm: 0,
    windMph: 12,
    visibilityMiles: 10,
    summary: "Clear and warm",
    icon: "☀️",
  },
  {
    id: "zone-ga",
    mileStart: 450,
    mileEnd: 750,
    city: "Georgia",
    condition: "rain",
    temperatureF: 68,
    precipitationMm: 8,
    windMph: 18,
    visibilityMiles: 4,
    summary: "Steady rain showers",
    icon: "🌧️",
  },
  {
    id: "zone-tn",
    mileStart: 750,
    mileEnd: 1100,
    city: "Tennessee",
    condition: "thunderstorm",
    temperatureF: 62,
    precipitationMm: 22,
    windMph: 32,
    visibilityMiles: 2,
    summary: "Thunderstorms with heavy rain",
    icon: "⛈️",
  },
  {
    id: "zone-ar",
    mileStart: 1100,
    mileEnd: 1550,
    city: "Arkansas",
    condition: "rain",
    temperatureF: 58,
    precipitationMm: 14,
    windMph: 22,
    visibilityMiles: 3,
    summary: "Heavy rain bands",
    icon: "🌧️",
  },
  {
    id: "zone-tx",
    mileStart: 1550,
    mileEnd: 2050,
    city: "Texas Panhandle",
    condition: "wind",
    temperatureF: 95,
    precipitationMm: 0,
    windMph: 45,
    visibilityMiles: 6,
    summary: "Extreme heat with high winds",
    icon: "💨",
  },
  {
    id: "zone-nm",
    mileStart: 2050,
    mileEnd: 2550,
    city: "New Mexico",
    condition: "snow",
    temperatureF: 28,
    precipitationMm: 12,
    windMph: 28,
    visibilityMiles: 1,
    summary: "Snow and ice on passes",
    icon: "❄️",
  },
  {
    id: "zone-or",
    mileStart: 2550,
    mileEnd: 4000,
    city: "Pacific Northwest",
    condition: "fog",
    temperatureF: 48,
    precipitationMm: 5,
    windMph: 14,
    visibilityMiles: 1,
    summary: "Dense fog and low visibility",
    icon: "🌫️",
  },
];

export function getZonesForRoute(totalDistanceMiles: number): WeatherZone[] {
  return MOCK_WEATHER_ZONES.filter((zone) => zone.mileStart < totalDistanceMiles);
}

export function getZoneAtMile(mile: number, totalDistanceMiles: number): WeatherZone {
  const zones = getZonesForRoute(totalDistanceMiles);
  const match = zones.find((zone) => mile >= zone.mileStart && mile < zone.mileEnd);
  return match ?? zones[zones.length - 1] ?? MOCK_WEATHER_ZONES[0];
}

export function getConditionSeverity(condition: WeatherCondition): number {
  const map: Record<WeatherCondition, number> = {
    clear: 0,
    extreme_heat: 12,
    wind: 15,
    rain: 20,
    fog: 25,
    thunderstorm: 35,
    snow: 40,
  };
  return map[condition] ?? 10;
}
