"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ui } from "@/components/ui/theme";
import {
  applySmartVehicleEstimate,
  estimateVehicle,
} from "@/services/vehicle/vehicleEstimator";
import { mapEpaDrivetrain, mapEpaFuelType } from "@/services/vehicle/epaMapper";
import type { VehicleProfile } from "@/services/vehicle/types";
import { MPGEstimateCard } from "./MPGEstimateCard";

type TrimOption = { id: string; label: string };

type VehicleSelectorProps = {
  value: VehicleProfile;
  onChange: (profile: VehicleProfile) => void;
  showEstimate?: boolean;
  compact?: boolean;
};

async function fetchCatalog<T>(query: string): Promise<T> {
  const response = await fetch(`/api/vehicles/catalog?${query}`);
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Vehicle catalog request failed");
  }
  return payload;
}

function catalogKey(make: string, model: string, year: number) {
  return `${make}|${model}|${year}`;
}

export function VehicleSelector({
  value,
  onChange,
  showEstimate = true,
  compact = false,
}: VehicleSelectorProps) {
  const [makes, setMakes] = useState<string[]>([]);
  const [makeCount, setMakeCount] = useState(0);
  const [models, setModels] = useState<string[]>([]);
  const [modelFilter, setModelFilter] = useState("");
  const [years, setYears] = useState<number[]>([]);
  const [trims, setTrims] = useState<TrimOption[]>([]);
  const [loading, setLoading] = useState<"models" | "years" | "trims" | "detail" | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const modelsLoadedFor = useRef<string | null>(null);
  const yearsLoadedFor = useRef<string | null>(null);
  const trimsLoadedFor = useRef<string | null>(null);
  const trimAppliedId = useRef<string | null>(null);
  const profileRef = useRef(value);

  useEffect(() => {
    profileRef.current = value;
  }, [value]);

  useEffect(() => {
    void fetchCatalog<{ makes: string[]; makeCount?: number }>("step=makes")
      .then((payload) => {
        setMakes(payload.makes);
        setMakeCount(payload.makeCount ?? payload.makes.length);
      })
      .catch(() => setCatalogError("Could not load vehicle makes."));
  }, []);

  const applyTrim = useCallback(
    async (trimId: string) => {
      if (!trimId || trimAppliedId.current === trimId) {
        return;
      }
      trimAppliedId.current = trimId;
      setLoading("detail");
      try {
        const baseProfile = profileRef.current;
        const payload = await fetchCatalog<{
          record: {
            year: number;
            make: string;
            model: string;
            trimLabel: string;
            driveRaw: string;
            fuelTypeRaw: string;
          };
          entry: { tankGallons: number; highwayMpg: number; cityMpg: number };
        }>(`step=detail&id=${encodeURIComponent(trimId)}`);

        const fuelType = mapEpaFuelType(payload.record.fuelTypeRaw);
        const drivetrain = mapEpaDrivetrain(payload.record.driveRaw);

        onChange({
          ...baseProfile,
          make: payload.record.make,
          model: payload.record.model,
          year: payload.record.year,
          fuelType,
          drivetrain,
          epaVehicleId: trimId,
          trimLabel: payload.record.trimLabel,
          highwayMpgOverride: payload.entry.highwayMpg,
          cityMpgOverride: payload.entry.cityMpg,
          tankGallonsOverride: payload.entry.tankGallons,
        });
        setCatalogError(null);
      } catch {
        trimAppliedId.current = null;
        setCatalogError("Could not load EPA fuel data for this trim.");
      } finally {
        setLoading(null);
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (!value.make || modelsLoadedFor.current === value.make) {
      return;
    }
    modelsLoadedFor.current = value.make;
    yearsLoadedFor.current = null;
    trimsLoadedFor.current = null;
    trimAppliedId.current = null;

    setLoading("models");
    void fetchCatalog<{ models: string[] }>(`step=models&make=${encodeURIComponent(value.make)}`)
      .then((payload) => {
        setModels(payload.models);
        const current = profileRef.current;
        if (payload.models.length > 0 && !payload.models.includes(current.model)) {
          onChange({
            ...current,
            make: value.make,
            model: payload.models[0],
            epaVehicleId: undefined,
            trimLabel: undefined,
            highwayMpgOverride: undefined,
            cityMpgOverride: undefined,
          });
        }
      })
      .catch(() => setCatalogError("Could not load models for this make."))
      .finally(() => setLoading(null));
  }, [value.make, onChange]);

  useEffect(() => {
    const key = `${value.make}|${value.model}`;
    if (!value.make || !value.model || yearsLoadedFor.current === key) {
      return;
    }
    yearsLoadedFor.current = key;
    trimsLoadedFor.current = null;
    trimAppliedId.current = null;

    setLoading("years");
    void fetchCatalog<{ years: number[] }>(
      `step=years&make=${encodeURIComponent(value.make)}&model=${encodeURIComponent(value.model)}`,
    )
      .then((payload) => {
        setYears(payload.years);
        const current = profileRef.current;
        if (payload.years.length > 0 && !payload.years.includes(current.year)) {
          onChange({
            ...current,
            year: payload.years[0],
            epaVehicleId: undefined,
            trimLabel: undefined,
            highwayMpgOverride: undefined,
            cityMpgOverride: undefined,
          });
        }
      })
      .catch(() => setCatalogError("Could not load model years."))
      .finally(() => setLoading(null));
  }, [value.make, value.model, onChange]);

  useEffect(() => {
    const key = catalogKey(value.make, value.model, value.year);
    if (!value.make || !value.model || !value.year || trimsLoadedFor.current === key) {
      return;
    }
    trimsLoadedFor.current = key;

    setLoading("trims");
    void fetchCatalog<{ trims: TrimOption[] }>(
      `step=trims&make=${encodeURIComponent(value.make)}&model=${encodeURIComponent(value.model)}&year=${value.year}`,
    )
      .then((payload) => {
        setTrims(payload.trims);
        const current = profileRef.current;

        if (payload.trims.length === 1) {
          void applyTrim(payload.trims[0].id);
          return;
        }

        if (payload.trims.length === 0) {
          trimAppliedId.current = null;
          setCatalogError("EPA has no trim list for this car — using smart estimate.");
          onChange(applySmartVehicleEstimate(current));
          return;
        }

        if (
          current.epaVehicleId &&
          payload.trims.some((trim) => trim.id === current.epaVehicleId)
        ) {
          trimAppliedId.current = current.epaVehicleId;
          return;
        }

        trimAppliedId.current = null;
      })
      .catch(() => {
        trimsLoadedFor.current = null;
        setTrims([]);
        setCatalogError("Could not load EPA trims — using smart estimate.");
        onChange(applySmartVehicleEstimate(profileRef.current));
      })
      .finally(() => setLoading(null));
  }, [value.make, value.model, value.year, applyTrim, onChange]);

  function clearTrimSelection() {
    trimAppliedId.current = null;
    trimsLoadedFor.current = null;
  }

  const trimSelectValue = value.epaVehicleId ?? "";
  const estimate = estimateVehicle(value);

  return (
    <div data-testid="vehicle-selector" className={compact ? "space-y-3" : "space-y-4"}>
      <p className={compact ? "text-xs text-zinc-400" : ui.body}>
        {makeCount > 0
          ? `${makeCount} brands from the official EPA database — pick trim for real MPG used while you drive.`
          : "Pick your car — official EPA fuel economy when you select a trim."}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={ui.label}>Make</span>
          <select
            data-testid="wizard-vehicle-make"
            value={value.make}
            onChange={(event) => {
              clearTrimSelection();
              modelsLoadedFor.current = null;
              setModelFilter("");
              onChange({
                ...value,
                make: event.target.value,
                epaVehicleId: undefined,
                trimLabel: undefined,
                highwayMpgOverride: undefined,
                cityMpgOverride: undefined,
              });
            }}
            className={ui.input}
          >
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-2 block sm:col-span-1">
          <span className={ui.label}>
            Model {models.length > 0 ? `(${models.length})` : ""}
          </span>
          {models.length > 12 ? (
            <input
              data-testid="wizard-vehicle-model-filter"
              type="search"
              placeholder="Search models…"
              value={modelFilter}
              onChange={(event) => setModelFilter(event.target.value)}
              className={`${ui.input} mb-2`}
            />
          ) : null}
          <select
            data-testid="wizard-vehicle-model"
            value={value.model}
            disabled={loading === "models" || models.length === 0}
            onChange={(event) => {
              clearTrimSelection();
              yearsLoadedFor.current = null;
              onChange({
                ...value,
                model: event.target.value,
                epaVehicleId: undefined,
                trimLabel: undefined,
                highwayMpgOverride: undefined,
                cityMpgOverride: undefined,
              });
            }}
            className={ui.input}
          >
            {models
              .filter((model) =>
                modelFilter.trim()
                  ? model.toLowerCase().includes(modelFilter.trim().toLowerCase())
                  : true,
              )
              .map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
          </select>
        </label>

        <label className="block">
          <span className={ui.label}>Year</span>
          <select
            data-testid="wizard-vehicle-year"
            value={String(value.year)}
            disabled={loading === "years" || years.length === 0}
            onChange={(event) => {
              clearTrimSelection();
              onChange({
                ...value,
                year: Number(event.target.value),
                epaVehicleId: undefined,
                trimLabel: undefined,
                highwayMpgOverride: undefined,
                cityMpgOverride: undefined,
              });
            }}
            className={ui.input}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={ui.label}>Trim</span>
          <select
            data-testid="wizard-vehicle-trim"
            value={trimSelectValue}
            disabled={loading === "trims" || loading === "detail"}
            onChange={(event) => {
              const trimId = event.target.value;
              if (!trimId) {
                trimAppliedId.current = null;
                onChange({
                  ...value,
                  epaVehicleId: undefined,
                  trimLabel: undefined,
                  highwayMpgOverride: undefined,
                  cityMpgOverride: undefined,
                });
                return;
              }
              void applyTrim(trimId);
            }}
            className={ui.input}
          >
            <option value="">
              {loading === "trims" || loading === "detail"
                ? "Loading trims…"
                : trims.length > 0
                  ? "Select trim"
                  : "No EPA trim — smart estimate"}
            </option>
            {trims.map((trim) => (
              <option key={trim.id} value={trim.id}>
                {trim.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {value.trimLabel ? (
        <p data-testid="vehicle-trim-label" className="text-xs text-cyan-300/90">
          {value.trimLabel}
          {value.epaVehicleId ? " · EPA data" : ""}
        </p>
      ) : null}

      {catalogError ? (
        <p data-testid="vehicle-catalog-notice" className="text-xs text-amber-200/90">
          {catalogError}
        </p>
      ) : null}

      {showEstimate ? <MPGEstimateCard estimate={estimate} /> : null}
    </div>
  );
}
