import { defaultPlanningFillGallons } from "./tankCapacity";
import { findDatabaseMatch } from "./vehicleDatabase";
import type { VehicleProfile } from "./types";

export function resolveTankCapacityGallons(profile: VehicleProfile, fallback = 15): number {
  if (profile.tankCapacityGallons && profile.tankCapacityGallons > 0) {
    return profile.tankCapacityGallons;
  }
  const match = findDatabaseMatch(profile);
  if (match && match.tankGallons > 0) {
    return match.tankGallons;
  }
  return fallback;
}

export function resolvePlanningFillGallons(
  profile: VehicleProfile,
  tankCapacityGallons?: number,
): number {
  const capacity = tankCapacityGallons ?? resolveTankCapacityGallons(profile);
  if (profile.planningFillGallons && profile.planningFillGallons > 0) {
    return profile.planningFillGallons;
  }
  if (
    profile.tankGallonsOverride &&
    profile.tankGallonsOverride > 0 &&
    profile.tankGallonsOverride < capacity
  ) {
    return profile.tankGallonsOverride;
  }
  return defaultPlanningFillGallons(capacity);
}
