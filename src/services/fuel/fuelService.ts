import {
  DEFAULT_STARTING_FUEL_PERCENT,
  DEFAULT_TANK_CAPACITY_GALLONS,
  fuelSafetyBufferMiles,
  gallonsPerMile,
  HIGH_FUEL_PRICE_THRESHOLD,
  LOW_MPG_THRESHOLD,
  rangeMilesFromGallons,
  startingFuelGallons,
  usableGallons,
} from "./fuelMath";
import { getRecommendedNextStop, getRemainingDriveMiles, planStops } from "./stopPlanner";
import type { FuelIntelligence, FuelPlanInput, FuelWarning } from "./types";

function buildWarnings(
  input: FuelPlanInput,
  segmentWarnings: FuelWarning[],
  estimatedRangeMiles: number,
): FuelWarning[] {
  const warnings: FuelWarning[] = [...segmentWarnings];

  if (input.vehicleMpg < LOW_MPG_THRESHOLD) {
    warnings.push({
      code: "LOW_MPG",
      message: `Low MPG (${input.vehicleMpg}). Expect higher fuel burn and more stops.`,
      severity: "warning",
    });
  }

  if (input.userGasPrice >= HIGH_FUEL_PRICE_THRESHOLD) {
    warnings.push({
      code: "HIGH_FUEL_COST",
      message: `High fuel price ($${input.userGasPrice.toFixed(2)}/gal) increases trip cost.`,
      severity: "warning",
    });
  }

  const startingPercent = input.startingFuelPercent ?? DEFAULT_STARTING_FUEL_PERCENT;
  if (startingPercent < 30) {
    warnings.push({
      code: "DANGEROUS_RANGE",
      message: `Starting fuel at ${startingPercent}% — refuel soon.`,
      severity: "critical",
    });
  }

  if (estimatedRangeMiles < 120 && input.totalDistanceMiles > estimatedRangeMiles) {
    warnings.push({
      code: "DANGEROUS_RANGE",
      message: "Estimated range is low for this trip length.",
      severity: "critical",
    });
  }

  const seen = new Set<string>();
  return warnings.filter((warning) => {
    const key = `${warning.code}-${warning.message}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function buildFuelIntelligence(input: FuelPlanInput): FuelIntelligence {
  const tankCapacity = input.tankCapacityGallons ?? DEFAULT_TANK_CAPACITY_GALLONS;
  const startingPercent = input.startingFuelPercent ?? DEFAULT_STARTING_FUEL_PERCENT;
  const startingFuel = startingFuelGallons(tankCapacity, startingPercent);
  const usable = usableGallons(startingFuel, tankCapacity);
  const estimatedRangeMiles = rangeMilesFromGallons(usable, input.vehicleMpg);
  const safetyBufferMiles = fuelSafetyBufferMiles(tankCapacity, input.vehicleMpg);

  const { plannedStops, segments, segmentWarnings } = planStops(input);
  const recommendedNextStop = getRecommendedNextStop(plannedStops);
  const remainingDriveMiles = getRemainingDriveMiles(input.totalDistanceMiles);

  const warnings = buildWarnings(input, segmentWarnings, estimatedRangeMiles);

  return {
    totalGallonsRequired: input.totalGallonsRequired,
    totalFuelCost: input.totalFuelCost,
    estimatedRangeMiles: Math.round(estimatedRangeMiles),
    estimatedFuelRemainingGallons: Math.round(usable * 10) / 10,
    remainingDriveMiles,
    fuelSafetyBufferMiles: Math.round(safetyBufferMiles),
    fuelSafetyBufferGallons: Math.round(tankCapacity * 0.15 * 10) / 10,
    fuelBurnRateGallonsPerMile: Math.round(gallonsPerMile(input.vehicleMpg) * 1000) / 1000,
    recommendedNextStop,
    plannedStops,
    segments,
    warnings,
  };
}
