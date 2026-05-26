import { fallbackByFuelType, findDatabaseMatch } from "./vehicleDatabase";
import type { VehicleDatabaseEntry, VehicleEfficiencyProfile, VehicleProfile } from "./types";

export type DecodedVehicle = {
  profile: VehicleProfile;
  entry: VehicleDatabaseEntry;
  matched: boolean;
};

export function decodeVehicleProfile(profile: VehicleProfile): DecodedVehicle {
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
  const rangeMiles = isElectric
    ? (entry.electricRangeMiles ?? 280)
    : Math.round(entry.highwayMpg * entry.tankGallons);

  return {
    highwayMpg: entry.highwayMpg,
    cityMpg: entry.cityMpg,
    blendedMpg,
    tankGallons: entry.tankGallons,
    rangeMiles,
    fuelType: entry.fuelType,
    isElectric,
    kwhPer100Miles: entry.kwhPer100Miles ?? null,
    databaseId: decoded.matched ? entry.id : null,
  };
}
