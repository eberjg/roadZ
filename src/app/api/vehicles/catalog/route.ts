import { NextResponse } from "next/server";
import { getEpaCatalogMeta, getEpaCatalogMakes, getEpaModelsForMake } from "@/services/vehicle/epaCatalog";
import {
  epaRecordToDatabaseEntry,
  mapEpaFuelType,
} from "@/services/vehicle/epaMapper";
import { fetchEpaMenu, fetchEpaVehicleById } from "@/services/vehicle/epaApi";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const step = searchParams.get("step") ?? "makes";

  try {
    if (step === "makes") {
      const meta = getEpaCatalogMeta();
      return NextResponse.json({
        ...meta,
        makes: getEpaCatalogMakes(),
        catalogSource: "epa-vehicle-database",
      });
    }

    const make = searchParams.get("make")?.trim() ?? "";
    if (step === "models") {
      if (!make) {
        return NextResponse.json({ error: "make is required" }, { status: 400 });
      }

      const models = getEpaModelsForMake(make);
      if (models.length === 0) {
        return NextResponse.json({
          models: make.toLowerCase() === "other" ? ["Sedan", "SUV", "Truck"] : [],
          source: "none",
        });
      }

      return NextResponse.json({
        models,
        source: "epa-catalog",
        count: models.length,
      });
    }

    const model = searchParams.get("model")?.trim() ?? "";
    if (step === "years") {
      if (!make || !model) {
        return NextResponse.json({ error: "make and model are required" }, { status: 400 });
      }

      const items = await fetchEpaMenu(
        `/vehicle/menu/year?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
      );
      let years = items.map((item) => Number(item.value)).filter((y) => Number.isFinite(y));

      if (years.length === 0) {
        const current = new Date().getFullYear();
        years = Array.from({ length: 15 }, (_, index) => current - index);
      }

      return NextResponse.json({ years: years.sort((a, b) => b - a), source: "epa-live" });
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
        source: "epa-live",
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
        dataSource: "epa-official",
        summary: `${record.year} ${record.make} ${record.model}`,
        fuelEfficiency: {
          cityMpg: record.cityMpg,
          highwayMpg: record.highwayMpg,
          combinedMpg: record.combinedMpg,
          fuelType: record.fuelTypeRaw,
          drive: record.driveRaw,
          vClass: record.vClass,
        },
      });
    }

    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vehicle catalog failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
