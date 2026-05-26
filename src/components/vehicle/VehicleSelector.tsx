"use client";

import { useCallback, useEffect, useState } from "react";
import { ui } from "@/components/ui/theme";
import { estimateVehicle } from "@/services/vehicle/vehicleEstimator";
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

export function VehicleSelector({
  value,
  onChange,
  showEstimate = true,
  compact = false,
}: VehicleSelectorProps) {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [trims, setTrims] = useState<TrimOption[]>([]);
  const [loading, setLoading] = useState<"models" | "years" | "trims" | "detail" | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedTrimId, setSelectedTrimId] = useState(value.epaVehicleId ?? "");

  useEffect(() => {
    void fetchCatalog<{ makes: string[] }>("step=makes")
      .then((payload) => setMakes(payload.makes))
      .catch(() => setCatalogError("Could not load vehicle makes."));
  }, []);

  const applyTrim = useCallback(
    async (trimId: string, baseProfile: VehicleProfile) => {
      if (!trimId) {
        return;
      }
      setLoading("detail");
      setSelectedTrimId(trimId);
      try {
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
        setCatalogError("Could not load EPA fuel data for this trim.");
      } finally {
        setLoading(null);
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (!value.make) {
      return;
    }
    // Catalog fetch on make change
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async catalog load
    setLoading("models");
    void fetchCatalog<{ models: string[] }>(`step=models&make=${encodeURIComponent(value.make)}`)
      .then((payload) => {
        setModels(payload.models);
        if (payload.models.length > 0 && !payload.models.includes(value.model)) {
          onChange({ ...value, model: payload.models[0] });
        }
      })
      .catch(() => setCatalogError("Could not load models for this make."))
      .finally(() => setLoading(null));
  }, [value.make]); // eslint-disable-line react-hooks/exhaustive-deps -- model reset only when make changes

  useEffect(() => {
    if (!value.make || !value.model) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async catalog load
    setLoading("years");
    void fetchCatalog<{ years: number[] }>(
      `step=years&make=${encodeURIComponent(value.make)}&model=${encodeURIComponent(value.model)}`,
    )
      .then((payload) => {
        setYears(payload.years);
        if (payload.years.length > 0 && !payload.years.includes(value.year)) {
          onChange({ ...value, year: payload.years[0] });
        }
      })
      .catch(() => setCatalogError("Could not load model years."))
      .finally(() => setLoading(null));
  }, [value.make, value.model]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!value.make || !value.model || !value.year) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async catalog load
    setLoading("trims");
    void fetchCatalog<{ trims: TrimOption[] }>(
      `step=trims&make=${encodeURIComponent(value.make)}&model=${encodeURIComponent(value.model)}&year=${value.year}`,
    )
      .then((payload) => {
        setTrims(payload.trims);
        if (payload.trims.length === 1) {
          void applyTrim(payload.trims[0].id, value);
        } else if (value.epaVehicleId && payload.trims.some((t) => t.id === value.epaVehicleId)) {
          setSelectedTrimId(value.epaVehicleId);
        } else {
          setSelectedTrimId("");
        }
      })
      .catch(() => {
        setTrims([]);
        setCatalogError("No EPA trims — using smart estimate.");
      })
      .finally(() => setLoading(null));
  }, [value.make, value.model, value.year, applyTrim, value]);

  const trimSelectValue = selectedTrimId || value.epaVehicleId || "";

  const estimate = estimateVehicle(value);

  return (
    <div data-testid="vehicle-selector" className={compact ? "space-y-3" : "space-y-4"}>
      <p className={compact ? "text-xs text-zinc-400" : ui.body}>
        Pick your car — roadZ uses EPA fuel-economy data when available.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={ui.label}>Make</span>
          <select
            data-testid="wizard-vehicle-make"
            value={value.make}
            onChange={(event) => {
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

        <label className="block">
          <span className={ui.label}>Model</span>
          <select
            data-testid="wizard-vehicle-model"
            value={value.model}
            disabled={loading === "models" || models.length === 0}
            onChange={(event) => {
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
            {models.map((model) => (
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
            onChange={(event) => void applyTrim(event.target.value, value)}
            className={ui.input}
          >
            <option value="">
              {trims.length === 0 ? "Smart estimate" : "Select trim"}
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
