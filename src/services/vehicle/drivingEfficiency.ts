import type {
  DrivingConditions,
  EfficiencyAdjustment,
  LiveEfficiencyState,
  VehicleEfficiencyProfile,
} from "./types";
import { blendedMpgForSpeed } from "./vehicleEfficiency";

function clampMpg(value: number, floor: number): number {
  return Math.max(floor, Math.round(value * 10) / 10);
}

function scoreFromMpg(effectiveMpg: number, baseHighwayMpg: number): number {
  const ratio = effectiveMpg / baseHighwayMpg;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

export function computeDrivingEfficiency(input: {
  profile: VehicleEfficiencyProfile;
  conditions: DrivingConditions;
  remainingDistanceMiles: number;
  gasPrice: number;
  startingFuelGallons?: number;
}): LiveEfficiencyState {
  const { profile, conditions } = input;
  const baseHighwayMpg = profile.highwayMpg;
  const speedMph = conditions.averageSpeedMph || 65;
  let effectiveMpg = blendedMpgForSpeed(profile, speedMph);
  const adjustments: EfficiencyAdjustment[] = [];

  if (speedMph > 75) {
    const impact = -Math.min(18, Math.round((speedMph - 75) * 0.8));
    adjustments.push({ factor: "High speed", impactPercent: impact });
    effectiveMpg *= 1 + impact / 100;
  } else if (speedMph < 45) {
    const impact = -8;
    adjustments.push({ factor: "Stop/go traffic", impactPercent: impact });
    effectiveMpg *= 1 + impact / 100;
  }

  const precip = conditions.precipitationMm ?? 0;
  if (
    conditions.weatherCondition === "rain" ||
    conditions.weatherCondition === "thunderstorm" ||
    precip >= 5
  ) {
    adjustments.push({ factor: "Rain", impactPercent: -12 });
    effectiveMpg *= 0.88;
  }
  if (conditions.weatherCondition === "snow") {
    adjustments.push({ factor: "Snow/ice", impactPercent: -20 });
    effectiveMpg *= 0.8;
  }
  if (conditions.weatherCondition === "wind" || conditions.weatherCondition === "extreme_heat") {
    adjustments.push({ factor: "Severe weather", impactPercent: -10 });
    effectiveMpg *= 0.9;
  }

  if (conditions.elevationRisk) {
    adjustments.push({ factor: "Mountain terrain", impactPercent: -14 });
    effectiveMpg *= 0.86;
  }

  const fatigue = conditions.fatigueScore ?? 0;
  if (fatigue >= 50) {
    adjustments.push({ factor: "Driver fatigue", impactPercent: -8 });
    effectiveMpg *= 0.92;
  }
  if (fatigue >= 75) {
    adjustments.push({ factor: "Aggressive fatigue driving", impactPercent: -12 });
    effectiveMpg *= 0.88;
  }

  const idle = conditions.idleMinutes ?? 0;
  if (idle >= 20) {
    adjustments.push({ factor: "Long idle", impactPercent: -6 });
    effectiveMpg *= 0.94;
  }

  const stopGo = conditions.stopGoFactor ?? 0;
  if (stopGo > 0.4) {
    adjustments.push({ factor: "Urban stop/go", impactPercent: -10 });
    effectiveMpg *= 0.9;
  }

  const floor = profile.isElectric ? baseHighwayMpg * 0.7 : Math.max(8, baseHighwayMpg * 0.45);
  effectiveMpg = clampMpg(effectiveMpg, floor);

  const fuelBurnGallonsPerMile = profile.isElectric ? 0 : 1 / effectiveMpg;
  const startingFuel =
    input.startingFuelGallons ?? profile.tankGallons * 0.75;
  const remainingRangeMiles = profile.isElectric
    ? profile.rangeMiles
    : Math.round(startingFuel * effectiveMpg);
  const projectedTripGallons = profile.isElectric
    ? 0
    : Math.round((input.remainingDistanceMiles / effectiveMpg) * 10) / 10;
  const projectedTripCost = Math.round(projectedTripGallons * input.gasPrice * 100) / 100;

  return {
    baseHighwayMpg,
    effectiveMpg,
    efficiencyScore: scoreFromMpg(effectiveMpg, baseHighwayMpg),
    adjustments,
    fuelBurnGallonsPerMile: Math.round(fuelBurnGallonsPerMile * 1000) / 1000,
    remainingRangeMiles,
    projectedTripGallons,
    projectedTripCost,
  };
}
