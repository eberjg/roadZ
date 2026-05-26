export type VehicleBodyType = "compact" | "sedan" | "suv" | "truck";
export type VehicleFuelType = "gas" | "hybrid" | "diesel";
export type VehicleAgeBand = "new" | "average" | "older";

export type VehicleProfile = {
  bodyType: VehicleBodyType;
  fuelType: VehicleFuelType;
  ageBand: VehicleAgeBand;
};

export type FuelEstimate = {
  estimatedMpg: number;
  suggestedGasPrice: number;
  summary: string;
};

const BASE_MPG: Record<VehicleBodyType, Record<VehicleAgeBand, number>> = {
  compact: { new: 36, average: 31, older: 28 },
  sedan: { new: 33, average: 28, older: 24 },
  suv: { new: 27, average: 23, older: 19 },
  truck: { new: 22, average: 18, older: 15 },
};

const DEFAULT_GAS_PRICE = 3.85;

export const defaultVehicleProfile: VehicleProfile = {
  bodyType: "sedan",
  fuelType: "gas",
  ageBand: "average",
};

export function estimateFuelFromVehicle(profile: VehicleProfile): FuelEstimate {
  let mpg = BASE_MPG[profile.bodyType][profile.ageBand];

  if (profile.fuelType === "hybrid") {
    mpg = Math.round(mpg * 1.45);
  } else if (profile.fuelType === "diesel") {
    mpg = Math.round(mpg * 1.12);
  }

  const bodyLabel =
    profile.bodyType === "compact"
      ? "Compact"
      : profile.bodyType === "sedan"
        ? "Sedan"
        : profile.bodyType === "suv"
          ? "SUV"
          : "Truck";

  const fuelLabel =
    profile.fuelType === "hybrid" ? "hybrid" : profile.fuelType === "diesel" ? "diesel" : "gas";

  return {
    estimatedMpg: mpg,
    suggestedGasPrice: DEFAULT_GAS_PRICE,
    summary: `Estimated ${mpg} MPG for a ${profile.ageBand === "new" ? "newer" : profile.ageBand === "older" ? "older" : "typical"} ${bodyLabel} (${fuelLabel}).`,
  };
}
