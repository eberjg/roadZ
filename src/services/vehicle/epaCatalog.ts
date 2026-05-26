import catalogData from "@/data/epaVehicleCatalog.json";

export type EpaVehicleCatalog = {
  generatedAt: string;
  source: string;
  makeCount: number;
  makes: string[];
  modelsByMake: Record<string, string[]>;
};

const catalog = catalogData as EpaVehicleCatalog;

export function getEpaCatalogMakes(): string[] {
  return catalog.makes;
}

export function getEpaModelsForMake(make: string): string[] {
  return catalog.modelsByMake[make] ?? [];
}

export function getEpaCatalogMeta() {
  return {
    generatedAt: catalog.generatedAt,
    source: catalog.source,
    makeCount: catalog.makeCount,
  };
}
