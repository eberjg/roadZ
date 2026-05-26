import { findDatabaseMatch } from "./vehicleDatabase";
import type { VehicleFuelType } from "./types";

/** OEM tank sizes when EPA does not publish gallons (make|model keys, lowercase). */
const TANK_BY_MAKE_MODEL: Record<string, number> = {
  "lexus|nx 300": 15.9,
  "lexus|nx 300h": 14.8,
  "lexus|nx": 15.9,
  "toyota|rav4": 14.5,
  "honda|cr-v": 14,
  "mazda|cx-5": 14.8,
  "bmw|x3": 17.2,
  "mercedes-benz|glc 300": 17.4,
};

function normalizeKey(make: string, model: string): string {
  return `${make.trim().toLowerCase()}|${model.trim().toLowerCase()}`;
}

/**
 * Resolve fuel tank gallons: curated DB → make/model table → vehicle class heuristic.
 * EPA fueleconomy.gov does not expose tank size in the API.
 */
export function resolveTankGallons(input: {
  make: string;
  model: string;
  year: number;
  vClass: string;
  fuelType: VehicleFuelType;
}): number {
  const db = findDatabaseMatch(input);
  if (db && db.tankGallons > 0) {
    return db.tankGallons;
  }

  const modelKey = normalizeKey(input.make, input.model);
  if (TANK_BY_MAKE_MODEL[modelKey]) {
    return TANK_BY_MAKE_MODEL[modelKey];
  }

  const baseModel = input.model.split(/\s+/)[0]?.toLowerCase() ?? "";
  const makeModelBase = `${input.make.trim().toLowerCase()}|${baseModel}`;
  if (TANK_BY_MAKE_MODEL[makeModelBase]) {
    return TANK_BY_MAKE_MODEL[makeModelBase];
  }

  if (input.fuelType === "electric") {
    return 0;
  }

  const value = input.vClass.toLowerCase();
  const isHybrid = input.fuelType === "hybrid";

  if (value.includes("small sport utility") || value.includes("compact sport utility")) {
    return isHybrid ? 14.8 : 15.5;
  }
  if (value.includes("standard sport utility") || value.includes("large sport utility")) {
    return isHybrid ? 17 : 19;
  }
  if (value.includes("sport utility") || value.includes("suv")) {
    return isHybrid ? 14.8 : 16.5;
  }
  if (value.includes("pickup") || value.includes("standard pickup")) {
    return 26;
  }
  if (value.includes("van") || value.includes("minivan")) {
    return isHybrid ? 17 : 20;
  }
  if (value.includes("compact") || value.includes("subcompact")) {
    return isHybrid ? 11.3 : 13.2;
  }
  if (value.includes("midsize")) {
    return isHybrid ? 13.2 : 15.8;
  }
  if (value.includes("large") || value.includes("full")) {
    return 19;
  }
  if (value.includes("two seater") || value.includes("minicompact")) {
    return 11.9;
  }

  return isHybrid ? 11.3 : 15;
}
