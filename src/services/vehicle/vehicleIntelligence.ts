import type { OperationalState } from "@/services/operations/types";
import type { WeatherIntelligence } from "@/services/weather/types";
import type {
  DrivingConditions,
  VehicleIntelligenceSnapshot,
  VehicleProfile,
} from "./types";
import { computeDrivingEfficiency } from "./drivingEfficiency";
import { resolvePlanningFillGallons } from "./planningFuel";
import { buildVehicleEfficiencyProfile } from "./vehicleEfficiency";

export type LiveTripIntelligenceInput = {
  profile: VehicleProfile;
  /** MPG from trip planner overrides database baseline for live efficiency */
  plannerMpg?: number;
  totalDistanceMiles: number;
  completedDistanceMiles: number;
  gasPrice: number;
  operational?: OperationalState | null;
  weather?: WeatherIntelligence | null;
  averageSpeedMph?: number;
  idleMinutes?: number;
  stopGoFactor?: number;
  startingFuelGallons?: number;
};

export function buildVehicleIntelligence(profile: VehicleProfile): VehicleIntelligenceSnapshot {
  const vehicle = buildVehicleEfficiencyProfile(profile);
  const live = computeDrivingEfficiency({
    profile: vehicle,
    conditions: { averageSpeedMph: 65 },
    remainingDistanceMiles: 0,
    gasPrice: 3.85,
    startingFuelGallons: vehicle.tankGallons * 0.75,
  });

  const summary = vehicle.isElectric
    ? `${profile.year} ${profile.make} ${profile.model} · EV · ~${vehicle.rangeMiles} mi range`
    : `${profile.year} ${profile.make} ${profile.model} · ${vehicle.highwayMpg} hwy / ${vehicle.cityMpg} city MPG · ${vehicle.tankGallons} gal`;

  return { vehicle, live, summary };
}

function conditionsFromTrip(input: LiveTripIntelligenceInput): DrivingConditions {
  const fatigueScore = input.operational?.fatigue.score ?? 0;
  const current = input.weather?.current;
  const elevationRisk = Boolean(
    input.weather?.risk.factors.some((f) => f.toLowerCase().includes("mountain")),
  );
  const speedMph = input.averageSpeedMph ?? 65;
  const idleMinutes = input.idleMinutes ?? 0;

  return {
    averageSpeedMph: speedMph,
    weatherCondition: current?.condition,
    precipitationMm: current?.precipitationMm,
    fatigueScore,
    elevationRisk,
    idleMinutes,
    stopGoFactor:
      input.stopGoFactor ??
      (speedMph < 45 ? 0.55 : speedMph < 55 ? 0.35 : speedMph > 75 ? 0.05 : 0.12),
  };
}

function vehicleWithPlannerMpg(
  profile: VehicleProfile,
  plannerMpg?: number,
): ReturnType<typeof buildVehicleEfficiencyProfile> {
  const vehicle = buildVehicleEfficiencyProfile(profile);
  if (!plannerMpg || plannerMpg <= 0) {
    return vehicle;
  }
  return {
    ...vehicle,
    highwayMpg: plannerMpg,
    cityMpg: Math.round(plannerMpg * 0.85),
    blendedMpg: plannerMpg,
    rangeMiles: vehicle.isElectric
      ? vehicle.rangeMiles
      : Math.round(plannerMpg * vehicle.tankGallons),
  };
}

export function buildLiveTripIntelligence(
  input: LiveTripIntelligenceInput,
): VehicleIntelligenceSnapshot {
  const vehicle = vehicleWithPlannerMpg(input.profile, input.plannerMpg);
  const remainingDistanceMiles = Math.max(
    0,
    input.totalDistanceMiles - input.completedDistanceMiles,
  );

  const planningFill =
    input.startingFuelGallons ?? resolvePlanningFillGallons(input.profile);

  const live = computeDrivingEfficiency({
    profile: vehicle,
    conditions: conditionsFromTrip(input),
    remainingDistanceMiles,
    gasPrice: input.gasPrice,
    startingFuelGallons: planningFill,
  });

  const summary = vehicle.isElectric
    ? `Efficiency ${live.efficiencyScore} · ~${live.remainingRangeMiles} mi range left`
    : `Efficiency ${live.efficiencyScore} · ${live.effectiveMpg} MPG live · ~${live.remainingRangeMiles} mi range`;

  return { vehicle, live, summary };
}
