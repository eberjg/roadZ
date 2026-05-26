export type VehicleDrivetrain = "fwd" | "rwd" | "awd" | "4wd" | "electric";
export type VehicleFuelType = "gas" | "hybrid" | "diesel" | "electric";

export type VehicleProfile = {
  make: string;
  model: string;
  year: number;
  drivetrain?: VehicleDrivetrain;
  fuelType: VehicleFuelType;
  profileComplete: boolean;
  /** EPA fueleconomy.gov vehicle id when trim was selected from catalog */
  epaVehicleId?: string;
  trimLabel?: string;
  /** Cached EPA MPG so estimates work offline after selection */
  highwayMpgOverride?: number;
  cityMpgOverride?: number;
  /** Cached EPA combined MPG (official EPA average) */
  combinedMpgOverride?: number;
  tankGallonsOverride?: number;
};

export type VehicleDatabaseEntry = {
  id: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  drivetrain?: VehicleDrivetrain;
  fuelType: VehicleFuelType;
  highwayMpg: number;
  cityMpg: number;
  tankGallons: number;
  /** Electric range miles when fuelType is electric */
  electricRangeMiles?: number;
  /** kWh per 100 miles for EV efficiency modeling */
  kwhPer100Miles?: number;
};

export type VehicleEstimate = {
  highwayMpg: number;
  cityMpg: number;
  combinedMpg: number;
  tankGallons: number;
  rangeMiles: number;
  suggestedGasPrice: number;
  summary: string;
  isElectric: boolean;
  matchedDatabaseId: string | null;
  /** True when MPG comes from an EPA trim the user selected */
  epaVerified: boolean;
  trimLabel?: string;
};

export type VehicleEfficiencyProfile = {
  highwayMpg: number;
  cityMpg: number;
  blendedMpg: number;
  tankGallons: number;
  rangeMiles: number;
  fuelType: VehicleFuelType;
  isElectric: boolean;
  kwhPer100Miles: number | null;
  databaseId: string | null;
};

export type DrivingConditions = {
  averageSpeedMph: number;
  weatherCondition?: string;
  precipitationMm?: number;
  fatigueScore?: number;
  elevationRisk?: boolean;
  idleMinutes?: number;
  stopGoFactor?: number;
};

export type EfficiencyAdjustment = {
  factor: string;
  impactPercent: number;
};

export type LiveEfficiencyState = {
  baseHighwayMpg: number;
  effectiveMpg: number;
  efficiencyScore: number;
  adjustments: EfficiencyAdjustment[];
  fuelBurnGallonsPerMile: number;
  remainingRangeMiles: number;
  projectedTripGallons: number;
  projectedTripCost: number;
};

export type VehicleIntelligenceSnapshot = {
  vehicle: VehicleEfficiencyProfile;
  live: LiveEfficiencyState;
  summary: string;
};
