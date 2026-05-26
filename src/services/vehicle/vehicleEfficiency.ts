import type { VehicleEfficiencyProfile, VehicleProfile } from "./types";
import { decodeVehicleProfile, toEfficiencyProfile } from "./vehicleDecoder";

export function buildVehicleEfficiencyProfile(profile: VehicleProfile): VehicleEfficiencyProfile {
  return toEfficiencyProfile(decodeVehicleProfile(profile));
}

export function blendedMpgForSpeed(
  profile: VehicleEfficiencyProfile,
  averageSpeedMph: number,
): number {
  if (profile.isElectric) {
    return profile.highwayMpg;
  }
  const highwayWeight = Math.min(1, Math.max(0, (averageSpeedMph - 35) / 35));
  const cityWeight = 1 - highwayWeight;
  return Math.round(profile.highwayMpg * highwayWeight + profile.cityMpg * cityWeight);
}
