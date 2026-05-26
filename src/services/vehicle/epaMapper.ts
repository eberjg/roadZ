import type { EpaVehicleRecord } from "./epaApi";
import type { VehicleDatabaseEntry, VehicleDrivetrain, VehicleFuelType } from "./types";

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

/** Estimate tank from EPA vehicle class when gallons are not published. */
export function estimateTankGallons(vClass: string, fuelType: VehicleFuelType): number {
  if (fuelType === "electric") {
    return 0;
  }
  const value = vClass.toLowerCase();
  if (value.includes("pickup") || value.includes("standard pickup")) {
    return 26;
  }
  if (value.includes("suv") || value.includes("sport utility")) {
    return 18;
  }
  if (value.includes("van") || value.includes("minivan")) {
    return 20;
  }
  if (value.includes("compact")) {
    return 13.5;
  }
  if (value.includes("midsize")) {
    return 15.8;
  }
  if (value.includes("large") || value.includes("full")) {
    return 19;
  }
  return 15;
}

export function epaRecordToDatabaseEntry(record: EpaVehicleRecord): VehicleDatabaseEntry {
  const fuelType = mapEpaFuelType(record.fuelTypeRaw);
  const drivetrain = mapEpaDrivetrain(record.driveRaw);
  const tankGallons = estimateTankGallons(record.vClass, fuelType);
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
