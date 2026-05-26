import { NextResponse } from "next/server";
import { listModelsForMake, VEHICLE_DATABASE } from "@/services/vehicle/vehicleDatabase";
import { EPA_VEHICLE_MAKES } from "@/services/vehicle/epaMakes";
import {
  epaRecordToDatabaseEntry,
  mapEpaFuelType,
} from "@/services/vehicle/epaMapper";
import { fetchEpaMenu, fetchEpaVehicleById } from "@/services/vehicle/epaApi";

export const dynamic = "force-dynamic";

function mergeUnique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.trim();
    if (!key || seen.has(key.toLowerCase())) {
      continue;
    }
    seen.add(key.toLowerCase());
    out.push(key);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const step = searchParams.get("step") ?? "makes";

  try {
    if (step === "makes") {
      return NextResponse.json({ makes: [...EPA_VEHICLE_MAKES] });
    }

    const make = searchParams.get("make")?.trim() ?? "";
    if (step === "models") {
      if (!make) {
        return NextResponse.json({ error: "make is required" }, { status: 400 });
      }

      let epaModels: string[] = [];
      try {
        const items = await fetchEpaMenu(
          `/vehicle/menu/model?make=${encodeURIComponent(make)}`,
        );
        epaModels = items.map((item) => item.text);
      } catch {
        epaModels = [];
      }

      const localModels =
        make.toLowerCase() === "other"
          ? ["Sedan", "SUV", "Truck"]
          : listModelsForMake(make);

      return NextResponse.json({
        models: mergeUnique([...epaModels, ...localModels]),
        source: epaModels.length > 0 ? "epa+local" : "local",
      });
    }

    const model = searchParams.get("model")?.trim() ?? "";
    if (step === "years") {
      if (!make || !model) {
        return NextResponse.json({ error: "make and model are required" }, { status: 400 });
      }

      let years: number[] = [];
      try {
        const items = await fetchEpaMenu(
          `/vehicle/menu/year?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
        );
        years = items.map((item) => Number(item.value)).filter((y) => Number.isFinite(y));
      } catch {
        years = [];
      }

      if (years.length === 0) {
        const local = VEHICLE_DATABASE.find(
          (entry) =>
            entry.make.toLowerCase() === make.toLowerCase() &&
            entry.model.toLowerCase() === model.toLowerCase(),
        );
        if (local) {
          years = Array.from(
            { length: local.yearTo - local.yearFrom + 1 },
            (_, index) => local.yearTo - index,
          );
        } else {
          const current = new Date().getFullYear();
          years = Array.from({ length: 12 }, (_, index) => current - index);
        }
      }

      return NextResponse.json({ years: years.sort((a, b) => b - a) });
    }

    const year = Number(searchParams.get("year"));
    if (step === "trims") {
      if (!make || !model || !Number.isFinite(year)) {
        return NextResponse.json({ error: "make, model, and year are required" }, { status: 400 });
      }

      const items = await fetchEpaMenu(
        `/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
      );

      return NextResponse.json({
        trims: items.map((item) => ({
          id: item.value,
          label: item.text,
        })),
      });
    }

    const id = searchParams.get("id")?.trim() ?? "";
    if (step === "detail") {
      if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }

      const record = await fetchEpaVehicleById(id);
      if (!record) {
        return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
      }

      const entry = epaRecordToDatabaseEntry(record);
      const fuelType = mapEpaFuelType(record.fuelTypeRaw);

      return NextResponse.json({
        record,
        entry,
        fuelType,
        summary: `${record.year} ${record.make} ${record.model} · ${record.highwayMpg} MPG highway`,
      });
    }

    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vehicle catalog failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
