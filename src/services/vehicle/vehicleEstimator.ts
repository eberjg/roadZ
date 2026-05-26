import { fallbackByFuelType, findDatabaseMatch } from "./vehicleDatabase";
import type { VehicleEstimate, VehicleProfile } from "./types";

const DEFAULT_GAS_PRICE = 3.85;

export const defaultVehicleProfile: VehicleProfile = {
  make: "Toyota",
  model: "Camry",
  year: 2018,
  fuelType: "gas",
  profileComplete: false,
};

export function estimateVehicle(profile: VehicleProfile): VehicleEstimate {
  const epaVerified = Boolean(profile.epaVehicleId && profile.highwayMpgOverride);

  if (epaVerified && profile.highwayMpgOverride) {
    const highwayMpg = profile.highwayMpgOverride;
    const cityMpg = profile.cityMpgOverride ?? highwayMpg;
    const combinedMpg =
      profile.combinedMpgOverride ?? Math.round((cityMpg + highwayMpg) / 2);
    const tankGallons = profile.tankGallonsOverride ?? 15;
    const isElectric = profile.fuelType === "electric";
    const rangeMiles = isElectric
      ? 280
      : Math.round(combinedMpg * tankGallons);

    const trimNote = profile.trimLabel ? ` · ${profile.trimLabel}` : "";
    const summary = isElectric
      ? `${profile.year} ${profile.make} ${profile.model}${trimNote} · EPA electric · ~${rangeMiles} mi range`
      : `${profile.year} ${profile.make} ${profile.model}${trimNote} · EPA ${combinedMpg} avg MPG (${highwayMpg} hwy)`;

    return {
      highwayMpg,
      cityMpg,
      combinedMpg,
      tankGallons,
      rangeMiles,
      suggestedGasPrice: isElectric ? 0 : DEFAULT_GAS_PRICE,
      summary,
      isElectric,
      matchedDatabaseId: `epa-${profile.epaVehicleId}`,
      epaVerified: true,
      trimLabel: profile.trimLabel,
    };
  }

  const match = findDatabaseMatch(profile);
  const entry = match ?? fallbackByFuelType(profile.fuelType, profile.year);

  const isElectric = profile.fuelType === "electric" || entry.fuelType === "electric";
  const highwayMpg = entry.highwayMpg;
  const cityMpg = entry.cityMpg;
  const combinedMpg = Math.round((cityMpg + highwayMpg) / 2);
  const tankGallons = entry.tankGallons;
  const rangeMiles = isElectric
    ? (entry.electricRangeMiles ?? 280)
    : Math.round(highwayMpg * tankGallons);

  const summary = isElectric
    ? `${profile.year} ${profile.make} ${profile.model} · ~${rangeMiles} mi range (electric)`
    : `${profile.year} ${profile.make} ${profile.model} · ~${highwayMpg} MPG highway (estimate — pick trim for EPA data)`;

  return {
    highwayMpg,
    cityMpg,
    combinedMpg,
    tankGallons,
    rangeMiles,
    suggestedGasPrice: isElectric ? 0 : DEFAULT_GAS_PRICE,
    summary,
    isElectric,
    matchedDatabaseId: match?.id ?? null,
    epaVerified: false,
  };
}

/** @deprecated Use estimateVehicle — kept for trip planner fuel fields */
export function estimateFuelFromLegacyProfile(profile: VehicleProfile): {
  estimatedMpg: number;
  suggestedGasPrice: number;
  summary: string;
} {
  const estimate = estimateVehicle(profile);
  return {
    estimatedMpg: estimate.highwayMpg,
    suggestedGasPrice: estimate.suggestedGasPrice || DEFAULT_GAS_PRICE,
    summary: estimate.summary,
  };
}
