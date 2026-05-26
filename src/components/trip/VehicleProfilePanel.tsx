"use client";

import { useSyncExternalStore } from "react";
import { ui } from "@/components/ui/theme";
import {
  defaultVehicleProfile,
  estimateFuelFromVehicle,
  type VehicleAgeBand,
  type VehicleBodyType,
  type VehicleFuelType,
} from "@/services/fuel/vehicleEstimate";
import {
  getVehicleProfile,
  setVehicleProfile,
  subscribeVehicleProfile,
} from "@/services/preferences/vehicleProfileStorage";

type VehicleProfilePanelProps = {
  mpgValue: string;
  gasPriceValue: string;
  onMpgChange: (value: string) => void;
  onGasPriceChange: (value: string) => void;
};

export function VehicleProfilePanel({
  mpgValue,
  gasPriceValue,
  onMpgChange,
  onGasPriceChange,
}: VehicleProfilePanelProps) {
  const profile = useSyncExternalStore(
    subscribeVehicleProfile,
    getVehicleProfile,
    () => defaultVehicleProfile,
  );
  const estimate = estimateFuelFromVehicle(profile);

  function updateProfile(patch: Partial<typeof profile>) {
    const next = { ...profile, ...patch };
    setVehicleProfile(next);
    const nextEstimate = estimateFuelFromVehicle(next);
    onMpgChange(String(nextEstimate.estimatedMpg));
    onGasPriceChange(String(nextEstimate.suggestedGasPrice));
  }

  return (
    <section data-testid="vehicle-profile-panel" className={ui.panelNested}>
      <h3 className={ui.h3}>Your vehicle</h3>
      <p className={`mt-2 ${ui.bodyMuted}`}>
        Answer three quick questions — we estimate MPG and gas price. You can still edit the
        numbers below.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={ui.label}>Vehicle type</span>
          <select
            data-testid="select-vehicle-body"
            value={profile.bodyType}
            onChange={(event) =>
              updateProfile({ bodyType: event.target.value as VehicleBodyType })
            }
            className={ui.input}
          >
            <option value="compact">Compact car</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="truck">Truck / van</option>
          </select>
        </label>

        <label className="block">
          <span className={ui.label}>Fuel type</span>
          <select
            data-testid="select-vehicle-fuel"
            value={profile.fuelType}
            onChange={(event) =>
              updateProfile({ fuelType: event.target.value as VehicleFuelType })
            }
            className={ui.input}
          >
            <option value="gas">Gasoline</option>
            <option value="hybrid">Hybrid</option>
            <option value="diesel">Diesel</option>
          </select>
        </label>

        <label className="block">
          <span className={ui.label}>Vehicle age</span>
          <select
            data-testid="select-vehicle-age"
            value={profile.ageBand}
            onChange={(event) =>
              updateProfile({ ageBand: event.target.value as VehicleAgeBand })
            }
            className={ui.input}
          >
            <option value="new">2020 or newer</option>
            <option value="average">2012 – 2019</option>
            <option value="older">Before 2012</option>
          </select>
        </label>
      </div>

      <p className={`mt-4 ${ui.body}`} data-testid="vehicle-estimate-summary">
        {estimate.summary}
      </p>
      <p className={`mt-1 text-sm text-sky-300`} data-testid="vehicle-estimate-values">
        Using {mpgValue || estimate.estimatedMpg} MPG · $
        {gasPriceValue || estimate.suggestedGasPrice.toFixed(2)}/gal
      </p>
    </section>
  );
}
