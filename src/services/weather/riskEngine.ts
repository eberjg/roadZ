import { getConditionSeverity } from "@/data/mockWeatherZones";
import type { OperationalStatus } from "@/services/operations/types";
import type { RoadRiskAssessment, WeatherZone } from "./types";

const statusOrder: OperationalStatus[] = ["NORMAL", "CAUTION", "HIGH_RISK", "CRITICAL"];

function scoreToLevel(score: number): OperationalStatus {
  if (score >= 75) {
    return "CRITICAL";
  }
  if (score >= 50) {
    return "HIGH_RISK";
  }
  if (score >= 25) {
    return "CAUTION";
  }
  return "NORMAL";
}

function visibilityRiskLevel(visibilityMiles: number): RoadRiskAssessment["visibilityRisk"] {
  if (visibilityMiles <= 2) {
    return "high";
  }
  if (visibilityMiles <= 5) {
    return "moderate";
  }
  return "low";
}

export function buildRoadRiskAssessment(input: {
  current: WeatherZone;
  upcomingZones: WeatherZone[];
  fatigueStatus: OperationalStatus;
  drivingSessionHours: number;
  longSegmentAhead: boolean;
}): RoadRiskAssessment {
  let score = getConditionSeverity(input.current.condition);
  const factors: string[] = [`Current: ${input.current.summary}`];

  if (input.current.visibilityMiles <= 3) {
    score += 20;
    factors.push("Low visibility");
  }
  if (input.current.precipitationMm >= 15) {
    score += 15;
    factors.push("Heavy precipitation");
  }
  if (input.current.windMph >= 35) {
    score += 12;
    factors.push("High winds");
  }
  if (input.current.temperatureF >= 100) {
    score += 12;
    factors.push("Extreme heat");
  }
  if (input.current.temperatureF <= 32 && input.current.condition === "snow") {
    score += 18;
    factors.push("Snow/ice hazard");
  }

  const severeAhead = input.upcomingZones.some(
    (zone) =>
      zone.mileStart > input.current.mileStart &&
      (zone.condition === "thunderstorm" ||
        zone.condition === "snow" ||
        zone.visibilityMiles <= 2),
  );
  if (severeAhead) {
    score += 15;
    factors.push("Severe weather zone ahead");
  }

  if (input.longSegmentAhead && severeAhead) {
    score += 12;
    factors.push("Long isolated segment through storm");
  }

  if (input.fatigueStatus === "HIGH_RISK") {
    score += 15;
    factors.push("Fatigue and weather overlap");
  }
  if (input.fatigueStatus === "CRITICAL") {
    score += 25;
    factors.push("Critical fatigue with weather exposure");
  }

  if (
    input.drivingSessionHours >= 10 &&
    input.current.visibilityMiles <= 4
  ) {
    score += 18;
    factors.push("Night-style low visibility on long session");
  }

  if (input.drivingSessionHours >= 12 && input.current.condition !== "clear") {
    score += 10;
    factors.push("Overnight weather danger");
  }

  const finalScore = Math.min(100, Math.round(score));
  const level = scoreToLevel(finalScore);

  let combinedMessage = "Weather and driver state are within normal range.";
  if (level === "CAUTION") {
    combinedMessage = "Weather conditions warrant extra caution.";
  }
  if (level === "HIGH_RISK") {
    combinedMessage = "Elevated combined fatigue and weather risk. Slow down and plan stops.";
  }
  if (level === "CRITICAL") {
    combinedMessage = "Critical combined risk. Consider pausing travel.";
  }

  if (
    statusOrder.indexOf(input.fatigueStatus) >= statusOrder.indexOf("HIGH_RISK") &&
    finalScore >= 50
  ) {
    combinedMessage = "High fatigue plus adverse weather. Stop as soon as safe.";
  }

  return {
    score: finalScore,
    level,
    visibilityRisk: visibilityRiskLevel(input.current.visibilityMiles),
    combinedFatigueWeatherRisk: combinedMessage,
    factors,
  };
}
