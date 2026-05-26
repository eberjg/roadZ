"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ui } from "@/components/ui/theme";
import { pickDefaultTrim } from "@/services/vehicle/pickDefaultTrim";
import { mapEpaDrivetrain, mapEpaFuelType } from "@/services/vehicle/epaMapper";
import { estimateVehicle } from "@/services/vehicle/vehicleEstimator";
import type { VehicleProfile } from "@/services/vehicle/types";

type TrimOption = { id: string; label: string };

type VehicleFormProps = {
  value: VehicleProfile;
  onChange: (profile: VehicleProfile) => void;
  /** Collapsed summary first (trip planner). Always open in wizard. */
  defaultExpanded?: boolean;
  gasPrice?: string;
  onGasPriceChange?: (price: string) => void;
  showGasPrice?: boolean;
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

export function VehicleForm({
  value,
  onChange,
  defaultExpanded = false,
  gasPrice,
  onGasPriceChange,
  showGasPrice = false,
}: VehicleFormProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [trims, setTrims] = useState<TrimOption[]>([]);
  const [modelFilter, setModelFilter] = useState("");
  const [loading, setLoading] = useState<"models" | "years" | "trims" | "detail" | null>(null);

  const modelsLoadedFor = useRef<string | null>(null);
  const yearsLoadedFor = useRef<string | null>(null);
  const trimsLoadedFor = useRef<string | null>(null);
  const trimAppliedId = useRef<string | null>(null);
  const profileRef = useRef(value);

  useEffect(() => {
    profileRef.current = value;
  }, [value]);

  useEffect(() => {
    void fetchCatalog<{ makes: string[] }>("step=makes")
      .then((payload) => setMakes(payload.makes))
      .catch(() => setMakes([]));
  }, []);

  const applyTrim = useCallback(
    async (trimId: string) => {
      if (!trimId || trimAppliedId.current === trimId) {
        return;
      }
      trimAppliedId.current = trimId;
      setLoading("detail");
      try {
        const base = profileRef.current;
        const payload = await fetchCatalog<{
          record: {
            year: number;
            make: string;
            model: string;
            trimLabel: string;
            driveRaw: string;
            fuelTypeRaw: string;
            combinedMpg: number;
          };
          entry: { tankGallons: number; highwayMpg: number; cityMpg: number };
        }>(`step=detail&id=${encodeURIComponent(trimId)}`);

        onChange({
          ...base,
          make: payload.record.make,
          model: payload.record.model,
          year: payload.record.year,
          fuelType: mapEpaFuelType(payload.record.fuelTypeRaw),
          drivetrain: mapEpaDrivetrain(payload.record.driveRaw),
          epaVehicleId: trimId,
          trimLabel: payload.record.trimLabel,
          highwayMpgOverride: payload.entry.highwayMpg,
          cityMpgOverride: payload.entry.cityMpg,
          combinedMpgOverride: payload.record.combinedMpg,
          tankGallonsOverride: payload.entry.tankGallons,
          profileComplete: true,
        });
      } catch {
        trimAppliedId.current = null;
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
          onChange({ ...current, make: value.make, model: payload.models[0], profileComplete: true });
        }
      })
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
          onChange({ ...current, year: payload.years[0], profileComplete: true });
        }
      })
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
        const defaultTrim = pickDefaultTrim(payload.trims);
        if (defaultTrim) {
          const saved = profileRef.current.epaVehicleId;
          const savedStillValid =
            saved && payload.trims.some((t) => t.id === saved);
          if (savedStillValid) {
            trimAppliedId.current = saved ?? null;
          } else {
            void applyTrim(defaultTrim.id);
          }
        }
      })
      .finally(() => setLoading(null));
  }, [value.make, value.model, value.year, applyTrim]);

  const estimate = estimateVehicle(value);
  const costPer100 =
    !estimate.isElectric && estimate.combinedMpg > 0 && gasPrice
      ? ((100 / estimate.combinedMpg) * Number(gasPrice)).toFixed(2)
      : null;

  const summaryLine = `${value.year} ${value.make} ${value.model}`;
  const mpgLine = estimate.isElectric
    ? `~${estimate.rangeMiles} mi range`
    : `${estimate.combinedMpg} MPG avg · ${estimate.tankGallons} gal`;

  return (
    <section data-testid="vehicle-form" className="rounded-2xl border border-white/10 bg-slate-950/60">
      <button
        type="button"
        data-testid="vehicle-form-toggle"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-lg">
          🚗
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Your vehicle
          </span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-white">{summaryLine}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-2">
            <span data-testid="vehicle-form-summary-fuel" className="text-xs text-emerald-300">
              {mpgLine}
            </span>
            {estimate.epaVerified ? (
              <span data-testid="vehicle-epa-verified" className="text-[10px] font-bold text-cyan-400">
                EPA
              </span>
            ) : null}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-cyan-300">
          {expanded ? "Done" : "Change"}
        </span>
      </button>

      {expanded ? (
        <div
          data-testid="vehicle-form-fields"
          className="space-y-3 border-t border-white/10 px-4 pb-4 pt-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <Field label="Make">
              <select
                data-testid="wizard-vehicle-make"
                value={value.make}
                onChange={(e) => {
                  modelsLoadedFor.current = null;
                  setModelFilter("");
                  onChange({
                    ...value,
                    make: e.target.value,
                    epaVehicleId: undefined,
                    trimLabel: undefined,
                    highwayMpgOverride: undefined,
                    cityMpgOverride: undefined,
                    profileComplete: true,
                  });
                }}
                className={ui.input}
              >
                {makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Year">
              <select
                data-testid="wizard-vehicle-year"
                value={String(value.year)}
                disabled={loading === "years"}
                onChange={(e) => {
                  trimsLoadedFor.current = null;
                  onChange({
                    ...value,
                    year: Number(e.target.value),
                    epaVehicleId: undefined,
                    trimLabel: undefined,
                    highwayMpgOverride: undefined,
                    cityMpgOverride: undefined,
                    profileComplete: true,
                  });
                }}
                className={ui.input}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Model" className="col-span-2">
              {models.length > 15 ? (
                <input
                  data-testid="wizard-vehicle-model-filter"
                  type="search"
                  placeholder="Search model…"
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                  className={`${ui.input} mb-2`}
                />
              ) : null}
              <select
                data-testid="wizard-vehicle-model"
                value={value.model}
                disabled={loading === "models"}
                onChange={(e) => {
                  yearsLoadedFor.current = null;
                  onChange({
                    ...value,
                    model: e.target.value,
                    epaVehicleId: undefined,
                    trimLabel: undefined,
                    highwayMpgOverride: undefined,
                    cityMpgOverride: undefined,
                    profileComplete: true,
                  });
                }}
                className={ui.input}
              >
                {models
                  .filter((m) =>
                    modelFilter.trim()
                      ? m.toLowerCase().includes(modelFilter.trim().toLowerCase())
                      : true,
                  )
                  .map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Trim" className="col-span-2">
              <select
                data-testid="wizard-vehicle-trim"
                value={value.epaVehicleId ?? ""}
                disabled={loading === "trims" || loading === "detail"}
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) {
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
                  void applyTrim(id);
                }}
                className={ui.input}
              >
                <option value="">{trims.length ? "Select engine trim" : "Loading…"}</option>
                {trims.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div
            data-testid="mpg-estimate-card"
            className="flex flex-wrap gap-2 rounded-xl bg-black/30 px-3 py-2 text-xs"
          >
            {!estimate.isElectric ? (
              <>
                <StatPill label="Avg" value={`${estimate.combinedMpg} MPG`} testId="vehicle-estimate-mpg" />
                <StatPill label="City" value={`${estimate.cityMpg}`} testId="vehicle-estimate-city-mpg" />
                <StatPill label="Hwy" value={`${estimate.highwayMpg}`} testId="vehicle-estimate-hwy-mpg" />
                <StatPill label="Tank" value={`${estimate.tankGallons} gal`} testId="vehicle-estimate-tank" />
                <StatPill label="Range" value={`~${estimate.rangeMiles} mi`} testId="vehicle-estimate-range" />
              </>
            ) : (
              <StatPill label="Range" value={`~${estimate.rangeMiles} mi`} testId="vehicle-estimate-range" />
            )}
            {costPer100 ? (
              <StatPill label="Fuel" value={`~$${costPer100}/100mi`} testId="vehicle-estimate-cost-per-100" />
            ) : null}
          </div>

          {showGasPrice && onGasPriceChange ? (
            <Field label="Gas price ($/gal)">
              <input
                data-testid="input-gas-price-visible"
                type="number"
                min="0.01"
                step="0.01"
                value={gasPrice ?? "3.85"}
                onChange={(e) => onGasPriceChange(e.target.value)}
                className={ui.input}
              />
            </Field>
          ) : null}

          {!estimate.isElectric ? (
            <Field label="Tank size (gal) — adjust if yours differs">
              <input
                data-testid="input-tank-gallons"
                type="number"
                min="5"
                max="50"
                step="0.1"
                value={value.tankGallonsOverride ?? estimate.tankGallons}
                onChange={(e) => {
                  const gallons = Number(e.target.value);
                  if (!Number.isFinite(gallons) || gallons <= 0) {
                    return;
                  }
                  onChange({
                    ...value,
                    tankGallonsOverride: gallons,
                    profileComplete: true,
                  });
                }}
                className={ui.input}
              />
            </Field>
          ) : null}
        </div>
      ) : (
        <div data-testid="mpg-estimate-card" className="sr-only" aria-hidden>
          {estimate.highwayMpg} MPG
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatPill({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId?: string;
}) {
  return (
    <span
      data-testid={testId}
      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-zinc-300"
    >
      <span className="text-[9px] uppercase text-zinc-500">{label} </span>
      <span className="font-semibold text-white">{value}</span>
    </span>
  );
}
