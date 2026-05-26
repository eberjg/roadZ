export type VehicleDrivetrain = "fwd" | "rwd" | "awd" | "4wd" | "electric";
export type VehicleFuelType = "gas" | "hybrid" | "diesel" | "electric";

export type VehicleProfile = {
  make: string;
  model: string;
  year: number;
  drivetrain?: VehicleDrivetrain;
  fuelType: VehicleFuelType;
  profileComplete: boolean;
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
  tankGallons: number;
  /** Electric range miles when fuelType is electric */
  electricRangeMiles?: number;
};

export type VehicleEstimate = {
  highwayMpg: number;
  tankGallons: number;
  rangeMiles: number;
  suggestedGasPrice: number;
  summary: string;
  isElectric: boolean;
  matchedDatabaseId: string | null;
};
