import type { MockFuelStop } from "@/data/mockFuelStops";
import { getStopsAlongRoute } from "@/data/mockFuelStops";
import {
  DEFAULT_AVERAGE_SPEED_MPH,
  DEFAULT_STARTING_FUEL_PERCENT,
  DEFAULT_TANK_CAPACITY_GALLONS,
  FATIGUE_SEGMENT_HOURS,
  FATIGUE_SEGMENT_MILES,
  formatSegmentDriveTime,
  fuelSafetyBufferMiles,
  gallonsForDistance,
  LONG_SEGMENT_MILES,
  rangeMilesFromGallons,
  usableGallons,
} from "./fuelMath";
import type { FuelPlanInput, FuelWarning, RecommendedStop, TripSegment } from "./types";

const MIN_STOP_INTERVAL_MILES = 150;
const CRITICAL_RANGE_MILES = 100;

function buildRecommendedStop(
  station: MockFuelStop,
  fromMile: number,
  reason: string,
  averageSpeedMph: number,
): RecommendedStop {
  const stopDistanceMiles = station.mileMarker - fromMile;
  const foodRestSuggestion = station.foodAvailable
    ? "Food and restroom break recommended for solo-driver recovery."
    : "Restroom available — consider a short walk break.";

  return {
    station,
    mileMarker: station.mileMarker,
    stopDistanceMiles,
    estimatedTimingLabel: formatSegmentDriveTime(stopDistanceMiles, averageSpeedMph),
    reason,
    foodRestSuggestion,
  };
}

function pickCheapestPracticalStop(
  candidates: MockFuelStop[],
  milesSinceLastStop: number,
  usableRangeMiles: number,
): MockFuelStop | null {
  if (candidates.length === 0) {
    return null;
  }

  const allowCloserStop = usableRangeMiles < CRITICAL_RANGE_MILES;
  const eligible = candidates.filter(
    () => milesSinceLastStop >= MIN_STOP_INTERVAL_MILES || allowCloserStop,
  );
  const pool = eligible.length > 0 ? eligible : candidates;

  return [...pool].sort((a, b) => a.gasPrice - b.gasPrice)[0];
}

export function planStops(input: FuelPlanInput): {
  plannedStops: RecommendedStop[];
  segments: TripSegment[];
  segmentWarnings: FuelWarning[];
} {
  const tankCapacity = input.tankCapacityGallons ?? DEFAULT_TANK_CAPACITY_GALLONS;
  const startingPercent = input.startingFuelPercent ?? DEFAULT_STARTING_FUEL_PERCENT;
  const averageSpeed = input.averageSpeedMph ?? DEFAULT_AVERAGE_SPEED_MPH;
  const startingFuel = (tankCapacity * startingPercent) / 100;

  const routeStops = getStopsAlongRoute(input.totalDistanceMiles);
  const plannedStops: RecommendedStop[] = [];
  const segments: TripSegment[] = [];
  const segmentWarnings: FuelWarning[] = [];

  let currentMile = 0;
  let fuelGallons = startingFuel;
  let lastStopMile = 0;
  let segmentIndex = 1;

  while (currentMile < input.totalDistanceMiles - 0.5) {
    const usable = usableGallons(fuelGallons, tankCapacity);
    const usableRange = rangeMilesFromGallons(usable, input.vehicleMpg);
    const maxReachMile = currentMile + usableRange;
    const milesSinceLastStop = currentMile - lastStopMile;

    if (usableRange < 5) {
      segmentWarnings.push({
        code: "DANGEROUS_RANGE",
        message: "Fuel range is critically low. Refuel immediately.",
        severity: "critical",
      });
      break;
    }

    const candidates = routeStops.filter(
      (stop) => stop.mileMarker > currentMile && stop.mileMarker <= maxReachMile,
    );
    const chosen = pickCheapestPracticalStop(candidates, milesSinceLastStop, usableRange);

    if (chosen) {
      const distanceMiles = chosen.mileMarker - currentMile;
      const segmentHours = distanceMiles / averageSpeed;

      segments.push({
        id: `segment-${segmentIndex}`,
        label: `Leg ${segmentIndex}`,
        startMile: currentMile,
        endMile: chosen.mileMarker,
        distanceMiles,
        estimatedDriveTimeLabel: formatSegmentDriveTime(distanceMiles, averageSpeed),
        endsAtStop: chosen.name,
        hasRestStop: chosen.foodAvailable,
      });

      if (
        distanceMiles > FATIGUE_SEGMENT_MILES &&
        segmentHours > FATIGUE_SEGMENT_HOURS &&
        !chosen.foodAvailable
      ) {
        segmentWarnings.push({
          code: "LONG_SEGMENT",
          message: `Long stretch (${distanceMiles} mi) before ${chosen.name}. Take breaks to reduce fatigue.`,
          severity: "warning",
        });
      }

      if (distanceMiles > LONG_SEGMENT_MILES) {
        segmentWarnings.push({
          code: "LONG_SEGMENT",
          message: `No fuel stop for ${distanceMiles} miles on this leg.`,
          severity: "warning",
        });
      }

      plannedStops.push(
        buildRecommendedStop(
          chosen,
          currentMile,
          `Cheapest practical fuel in range ($${chosen.gasPrice.toFixed(2)}/gal).`,
          averageSpeed,
        ),
      );

      fuelGallons -= gallonsForDistance(distanceMiles, input.vehicleMpg);
      currentMile = chosen.mileMarker;
      lastStopMile = chosen.mileMarker;
      fuelGallons = tankCapacity;
      segmentIndex += 1;
      continue;
    }

    const endMile = Math.min(maxReachMile, input.totalDistanceMiles);
    const distanceMiles = endMile - currentMile;

    if (distanceMiles <= 0) {
      segmentWarnings.push({
        code: "DANGEROUS_RANGE",
        message: "No fuel stop available before reserve limit.",
        severity: "critical",
      });
      break;
    }

    segments.push({
      id: `segment-${segmentIndex}`,
      label: `Leg ${segmentIndex}`,
      startMile: currentMile,
      endMile: endMile,
      distanceMiles,
      estimatedDriveTimeLabel: formatSegmentDriveTime(distanceMiles, averageSpeed),
      endsAtStop: endMile >= input.totalDistanceMiles ? "Destination" : null,
      hasRestStop: false,
    });

    if (distanceMiles > LONG_SEGMENT_MILES) {
      segmentWarnings.push({
        code: "LONG_SEGMENT",
        message: `Long no-stop segment (${Math.round(distanceMiles)} mi) ahead.`,
        severity: "warning",
      });
    }

    fuelGallons -= gallonsForDistance(distanceMiles, input.vehicleMpg);
    currentMile = endMile;
    segmentIndex += 1;

    if (currentMile >= input.totalDistanceMiles - 0.5) {
      break;
    }

    if (usableRange < CRITICAL_RANGE_MILES) {
      segmentWarnings.push({
        code: "DANGEROUS_RANGE",
        message: "Unable to reach next fuel stop within safe reserve.",
        severity: "critical",
      });
      break;
    }
  }

  return { plannedStops, segments, segmentWarnings };
}

export function getRecommendedNextStop(
  plannedStops: RecommendedStop[],
): RecommendedStop | null {
  return plannedStops[0] ?? null;
}

export function getRemainingDriveMiles(
  totalDistanceMiles: number,
  currentMile: number = 0,
): number {
  return Math.max(0, totalDistanceMiles - currentMile);
}

export { fuelSafetyBufferMiles };
