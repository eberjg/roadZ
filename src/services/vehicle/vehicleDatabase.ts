import type { VehicleDatabaseEntry, VehicleFuelType } from "./types";

export const VEHICLE_DATABASE: VehicleDatabaseEntry[] = [
  {
    id: "lexus-nx300",
    make: "Lexus",
    model: "NX 300",
    yearFrom: 2018,
    yearTo: 2024,
    drivetrain: "awd",
    fuelType: "gas",
    highwayMpg: 28,
    cityMpg: 22,
    tankGallons: 15.9,
  },
  {
    id: "tesla-modely",
    make: "Tesla",
    model: "Model Y",
    yearFrom: 2020,
    yearTo: 2026,
    drivetrain: "electric",
    fuelType: "electric",
    highwayMpg: 117,
    cityMpg: 125,
    tankGallons: 0,
    electricRangeMiles: 310,
    kwhPer100Miles: 28,
  },
  {
    id: "ford-f150",
    make: "Ford",
    model: "F-150",
    yearFrom: 2015,
    yearTo: 2026,
    drivetrain: "4wd",
    fuelType: "gas",
    highwayMpg: 22,
    cityMpg: 18,
    tankGallons: 26,
  },
  {
    id: "toyota-prius",
    make: "Toyota",
    model: "Prius",
    yearFrom: 2016,
    yearTo: 2026,
    fuelType: "hybrid",
    highwayMpg: 52,
    cityMpg: 58,
    tankGallons: 11.3,
  },
  {
    id: "toyota-camry",
    make: "Toyota",
    model: "Camry",
    yearFrom: 2015,
    yearTo: 2026,
    fuelType: "gas",
    highwayMpg: 32,
    cityMpg: 26,
    tankGallons: 15.8,
  },
  {
    id: "honda-crv",
    make: "Honda",
    model: "CR-V",
    yearFrom: 2017,
    yearTo: 2026,
    fuelType: "hybrid",
    highwayMpg: 38,
    cityMpg: 33,
    tankGallons: 14,
  },
  {
    id: "generic-sedan",
    make: "Other",
    model: "Sedan",
    yearFrom: 1990,
    yearTo: 2030,
    fuelType: "gas",
    highwayMpg: 30,
    cityMpg: 24,
    tankGallons: 15,
  },
  {
    id: "generic-suv",
    make: "Other",
    model: "SUV",
    yearFrom: 1990,
    yearTo: 2030,
    fuelType: "gas",
    highwayMpg: 24,
    cityMpg: 20,
    tankGallons: 18,
  },
  {
    id: "generic-truck",
    make: "Other",
    model: "Truck",
    yearFrom: 1990,
    yearTo: 2030,
    fuelType: "gas",
    highwayMpg: 20,
    cityMpg: 16,
    tankGallons: 24,
  },
];

export function listVehicleMakes(): string[] {
  const makes = new Set(VEHICLE_DATABASE.map((entry) => entry.make));
  return Array.from(makes).sort();
}

export function listModelsForMake(make: string): string[] {
  return VEHICLE_DATABASE.filter((entry) => entry.make === make)
    .map((entry) => entry.model)
    .sort();
}

export function findDatabaseMatch(input: {
  make: string;
  model: string;
  year: number;
}): VehicleDatabaseEntry | null {
  const make = input.make.trim();
  const model = input.model.trim();
  const year = input.year;

  const exact = VEHICLE_DATABASE.find(
    (entry) =>
      entry.make.toLowerCase() === make.toLowerCase() &&
      entry.model.toLowerCase() === model.toLowerCase() &&
      year >= entry.yearFrom &&
      year <= entry.yearTo,
  );
  if (exact) {
    return exact;
  }

  if (make.toLowerCase() === "other") {
    if (model.toLowerCase().includes("suv")) {
      return VEHICLE_DATABASE.find((e) => e.id === "generic-suv") ?? null;
    }
    if (model.toLowerCase().includes("truck")) {
      return VEHICLE_DATABASE.find((e) => e.id === "generic-truck") ?? null;
    }
    return VEHICLE_DATABASE.find((e) => e.id === "generic-sedan") ?? null;
  }

  return null;
}

export function fallbackByFuelType(fuelType: VehicleFuelType, year: number): VehicleDatabaseEntry {
  const ageFactor = year >= 2020 ? 1 : year >= 2012 ? 0.95 : 0.88;
  const base =
    fuelType === "electric"
      ? VEHICLE_DATABASE.find((e) => e.id === "tesla-modely")!
      : fuelType === "hybrid"
        ? VEHICLE_DATABASE.find((e) => e.id === "toyota-prius")!
        : fuelType === "diesel"
          ? VEHICLE_DATABASE.find((e) => e.id === "ford-f150")!
          : VEHICLE_DATABASE.find((e) => e.id === "generic-sedan")!;

  return {
    ...base,
    highwayMpg: Math.round(base.highwayMpg * ageFactor),
    cityMpg: Math.round(base.cityMpg * ageFactor),
    tankGallons: base.tankGallons,
  };
}
