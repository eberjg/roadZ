import { DEFAULT_AVERAGE_SPEED_MPH } from "@/services/fuel/fuelMath";
import { formatDriveTime } from "@/services/trip/calculateTrip";
import type { WeatherTimelineEntry, WeatherZone } from "./types";

function isSevereZone(zone: WeatherZone): boolean {
  return (
    zone.condition === "thunderstorm" ||
    zone.condition === "snow" ||
    zone.visibilityMiles <= 2 ||
    zone.windMph >= 40 ||
    zone.precipitationMm >= 20
  );
}

export function buildWeatherTimeline(
  routeZones: WeatherZone[],
  completedDistanceMiles: number,
  current: WeatherZone,
  averageSpeedMph: number = DEFAULT_AVERAGE_SPEED_MPH,
): WeatherTimelineEntry[] {
  const entries: WeatherTimelineEntry[] = [
    {
      id: "weather-now",
      label: `Current · ${current.summary}`,
      mileMarker: completedDistanceMiles,
      timeLabel: "Now",
      condition: current.condition,
      icon: current.icon,
      temperatureF: current.temperatureF,
      isSevere: isSevereZone(current),
      completed: true,
    },
  ];

  for (const zone of routeZones) {
    if (zone.mileStart <= completedDistanceMiles) {
      continue;
    }

    entries.push({
      id: `weather-${zone.id}`,
      label: `${zone.city} · ${zone.summary}`,
      mileMarker: zone.mileStart,
      timeLabel: formatDriveTime((zone.mileStart - completedDistanceMiles) / averageSpeedMph),
      condition: zone.condition,
      icon: zone.icon,
      temperatureF: zone.temperatureF,
      isSevere: isSevereZone(zone),
      completed: zone.mileStart <= completedDistanceMiles,
    });
  }

  return entries;
}
