import type { MockFuelStop } from "@/data/mockFuelStops";

export type FuelWarningCode =
  | "LOW_MPG"
  | "HIGH_FUEL_COST"
  | "DANGEROUS_RANGE"
  | "LONG_SEGMENT";

export type FuelWarningSeverity = "info" | "warning" | "critical";

export type FuelWarning = {
  code: FuelWarningCode;
  message: string;
  severity: FuelWarningSeverity;
};

export type RecommendedStop = {
  station: MockFuelStop;
  mileMarker: number;
  stopDistanceMiles: number;
  estimatedTimingLabel: string;
  reason: string;
  foodRestSuggestion: string | null;
};

export type TripSegment = {
  id: string;
  label: string;
  startMile: number;
  endMile: number;
  distanceMiles: number;
  estimatedDriveTimeLabel: string;
  endsAtStop: string | null;
  hasRestStop: boolean;
};

export type FuelIntelligence = {
  totalGallonsRequired: number;
  totalFuelCost: number;
  estimatedRangeMiles: number;
  estimatedFuelRemainingGallons: number;
  remainingDriveMiles: number;
  fuelSafetyBufferMiles: number;
  fuelSafetyBufferGallons: number;
  fuelBurnRateGallonsPerMile: number;
  recommendedNextStop: RecommendedStop | null;
  plannedStops: RecommendedStop[];
  segments: TripSegment[];
  warnings: FuelWarning[];
};

export type FuelPlanInput = {
  totalDistanceMiles: number;
  vehicleMpg: number;
  userGasPrice: number;
  totalFuelCost: number;
  totalGallonsRequired: number;
  averageSpeedMph?: number;
  tankCapacityGallons?: number;
  startingFuelPercent?: number;
};
