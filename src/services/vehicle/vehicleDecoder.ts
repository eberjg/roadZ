import { resolvePlanningFillGallons, resolveTankCapacityGallons } from "./planningFuel";
import { fallbackByFuelType, findDatabaseMatch } from "./vehicleDatabase";
import type { VehicleDatabaseEntry, VehicleEfficiencyProfile, VehicleProfile } from "./types";

export type DecodedVehicle = {
  profile: VehicleProfile;
  entry: VehicleDatabaseEntry;
  matched: boolean;
};

function entryFromProfileOverrides(profile: VehicleProfile): VehicleDatabaseEntry | null {
  if (!profile.highwayMpgOverride) {
    return null;
  }
  const match = findDatabaseMatch(profile);
  const base = match ?? fallbackByFuelType(profile.fuelType, profile.year);
  return {
    ...base,
    id: profile.epaVehicleId ? `epa-${profile.epaVehicleId}` : base.id,
    make: profile.make,
    model: profile.model,
    yearFrom: profile.year,
    yearTo: profile.year,
    highwayMpg: profile.highwayMpgOverride,
    cityMpg: profile.cityMpgOverride ?? profile.highwayMpgOverride,
    tankGallons: resolveTankCapacityGallons(profile, base.tankGallons),
    drivetrain: profile.drivetrain ?? base.drivetrain,
    fuelType: profile.fuelType,
  };
}

export function decodeVehicleProfile(profile: VehicleProfile): DecodedVehicle {
  const overrideEntry = entryFromProfileOverrides(profile);
  if (overrideEntry) {
    return {
      profile,
      entry: overrideEntry,
      matched: Boolean(profile.epaVehicleId || findDatabaseMatch(profile)),
    };
  }

  const match = findDatabaseMatch(profile);
  const entry = match ?? fallbackByFuelType(profile.fuelType, profile.year);
  return {
    profile,
    entry,
    matched: Boolean(match),
  };
}

export function toEfficiencyProfile(decoded: DecodedVehicle): VehicleEfficiencyProfile {
  const { entry, profile } = decoded;
  const isElectric = profile.fuelType === "electric" || entry.fuelType === "electric";
  const blendedMpg = Math.round((entry.highwayMpg + entry.cityMpg) / 2);
  const tankCapacity = entry.tankGallons;
  const planningFill = resolvePlanningFillGallons(profile, tankCapacity);
  const rangeMiles = isElectric
    ? (entry.electricRangeMiles ?? 280)
    : Math.round(blendedMpg * planningFill);

  return {
    highwayMpg: entry.highwayMpg,
    cityMpg: entry.cityMpg,
    blendedMpg,
    tankGallons: planningFill,
    rangeMiles,
    fuelType: entry.fuelType,
    isElectric,
    kwhPer100Miles: entry.kwhPer100Miles ?? null,
    databaseId: decoded.matched ? entry.id : null,
  };
}
