import type { EpaVehicleRecord } from "./epaApi";
import type { VehicleDatabaseEntry, VehicleDrivetrain, VehicleFuelType } from "./types";
import { resolveTankGallons } from "./tankCapacity";

export function mapEpaFuelType(raw: string): VehicleFuelType {
  const value = raw.toLowerCase();
  if (value.includes("electric") && !value.includes("gas")) {
    return "electric";
  }
  if (value.includes("diesel")) {
    return "diesel";
  }
  if (value.includes("hybrid") || value.includes("plug-in")) {
    return "hybrid";
  }
  return "gas";
}

export function mapEpaDrivetrain(raw: string): VehicleDrivetrain | undefined {
  const value = raw.toLowerCase();
  if (value.includes("4wd") || value.includes("4-wheel")) {
    return "4wd";
  }
  if (value.includes("awd") || value.includes("all-wheel")) {
    return "awd";
  }
  if (value.includes("rear")) {
    return "rwd";
  }
  if (value.includes("front")) {
    return "fwd";
  }
  if (value.includes("electric")) {
    return "electric";
  }
  return undefined;
}

/** @deprecated Use resolveTankGallons — kept for tests */
export function estimateTankGallons(vClass: string, fuelType: VehicleFuelType): number {
  return resolveTankGallons({
    make: "",
    model: "",
    year: 2020,
    vClass,
    fuelType,
  });
}

export function epaRecordToDatabaseEntry(record: EpaVehicleRecord): VehicleDatabaseEntry {
  const fuelType = mapEpaFuelType(record.fuelTypeRaw);
  const drivetrain = mapEpaDrivetrain(record.driveRaw);
  const tankGallons = resolveTankGallons({
    make: record.make,
    model: record.model,
    year: record.year,
    vClass: record.vClass,
    fuelType,
  });
  const isElectric = fuelType === "electric";

  return {
    id: `epa-${record.id}`,
    make: record.make,
    model: record.model,
    yearFrom: record.year,
    yearTo: record.year,
    drivetrain,
    fuelType,
    highwayMpg: record.highwayMpg,
    cityMpg: record.cityMpg,
    tankGallons,
    electricRangeMiles: isElectric ? (record.rangeMiles ?? 280) : undefined,
    kwhPer100Miles: isElectric ? Math.max(25, Math.round(10000 / Math.max(record.combinedMpg, 80))) : undefined,
  };
}
