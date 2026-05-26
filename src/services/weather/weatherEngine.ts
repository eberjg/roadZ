import { getZoneAtMile, getZonesForRoute } from "@/data/mockWeatherZones";
import {
  fetchOpenWeatherForZip,
  getMockRouteWeather,
  shouldUseMockWeather,
} from "./weatherClient";
import { buildRoadRiskAssessment } from "./riskEngine";
import { buildWeatherTimeline } from "./weatherTimeline";
import type { SevereWeatherAlert, WeatherIntelligence, WeatherRequest, WeatherZone } from "./types";

function buildSevereAlerts(
  routeZones: WeatherZone[],
  completedDistanceMiles: number,
): SevereWeatherAlert[] {
  const alerts: SevereWeatherAlert[] = [];

  for (const zone of routeZones) {
    if (zone.mileEnd <= completedDistanceMiles) {
      continue;
    }

    if (zone.condition === "thunderstorm") {
      alerts.push({
        id: `alert-storm-${zone.id}`,
        code: "THUNDERSTORM",
        message: `Thunderstorms near ${zone.city} around mile ${zone.mileStart}.`,
        severity: "HIGH_RISK",
        mileMarker: zone.mileStart,
      });
    }
    if (zone.precipitationMm >= 18 && zone.condition === "rain") {
      alerts.push({
        id: `alert-flood-${zone.id}`,
        code: "FLOODING",
        message: `Heavy rain and possible flooding near ${zone.city}.`,
        severity: "HIGH_RISK",
        mileMarker: zone.mileStart,
      });
    }
    if (zone.condition === "snow") {
      alerts.push({
        id: `alert-snow-${zone.id}`,
        code: "SNOW_ICE",
        message: `Snow and ice risk near ${zone.city}.`,
        severity: "CRITICAL",
        mileMarker: zone.mileStart,
      });
    }
    if (zone.visibilityMiles <= 2) {
      alerts.push({
        id: `alert-visibility-${zone.id}`,
        code: "LOW_VISIBILITY",
        message: `Low visibility (${zone.visibilityMiles} mi) near ${zone.city}.`,
        severity: "HIGH_RISK",
        mileMarker: zone.mileStart,
      });
    }
    if (zone.windMph >= 40) {
      alerts.push({
        id: `alert-wind-${zone.id}`,
        code: "HIGH_WINDS",
        message: `High winds (${zone.windMph} mph) near ${zone.city}.`,
        severity: "CAUTION",
        mileMarker: zone.mileStart,
      });
    }
    if (zone.temperatureF >= 100 || zone.condition === "extreme_heat") {
      alerts.push({
        id: `alert-heat-${zone.id}`,
        code: "EXTREME_HEAT",
        message: `Extreme heat (${zone.temperatureF}°F) near ${zone.city}.`,
        severity: "CAUTION",
        mileMarker: zone.mileStart,
      });
    }
  }

  return alerts;
}

export async function buildWeatherIntelligence(
  request: WeatherRequest,
): Promise<WeatherIntelligence> {
  const completed = Math.max(0, request.completedDistanceMiles);
  const fatigueStatus = request.fatigueStatus ?? "NORMAL";
  const drivingSessionHours = request.drivingSessionHours ?? completed / 60;

  let current: WeatherZone;
  let routeZones: WeatherZone[];
  let source: WeatherIntelligence["source"] = "mock";

  if (shouldUseMockWeather()) {
    const mock = getMockRouteWeather(request.totalDistanceMiles, completed);
    current = getZoneAtMile(completed, request.totalDistanceMiles);
    routeZones = mock.routeZones;
  } else {
    const live = await fetchOpenWeatherForZip(request.startZip);
    if (live) {
      current = { ...live, mileStart: completed, mileEnd: completed + 50 };
      routeZones = getZonesForRoute(request.totalDistanceMiles);
      source = "openweather";
    } else {
      current = getZoneAtMile(completed, request.totalDistanceMiles);
      routeZones = getZonesForRoute(request.totalDistanceMiles);
    }
  }

  const upcomingZones = routeZones.filter((zone) => zone.mileStart >= completed);
  const longSegmentAhead = upcomingZones.some(
    (zone) => zone.mileEnd - zone.mileStart > 250 && zone.condition !== "clear",
  );

  const risk = buildRoadRiskAssessment({
    current,
    upcomingZones,
    fatigueStatus,
    drivingSessionHours,
    longSegmentAhead,
  });

  const severeAlerts = buildSevereAlerts(routeZones, completed);
  const timeline = buildWeatherTimeline(routeZones, completed, current);

  return {
    source,
    completedMile: completed,
    current,
    routeZones,
    severeAlerts,
    timeline,
    risk,
  };
}
