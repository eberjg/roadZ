"use client";

import { useSyncExternalStore } from "react";
import { ui } from "@/components/ui/theme";
import { estimateVehicle } from "@/services/vehicle/vehicleEstimator";
import { defaultVehicleProfile } from "@/services/vehicle/vehicleEstimator";
import {
  getVehicleProfile,
  subscribeVehicleProfile,
} from "@/services/vehicle/vehicleStorage";

type VehicleSummaryProps = {
  onEdit?: () => void;
};

export function VehicleSummary({ onEdit }: VehicleSummaryProps) {
  const profile = useSyncExternalStore(
    subscribeVehicleProfile,
    getVehicleProfile,
    () => defaultVehicleProfile,
  );

  if (!profile.profileComplete) {
    return null;
  }

  const estimate = estimateVehicle(profile);

  return (
    <div
      data-testid="vehicle-summary-chip"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400/90">
          Your vehicle
        </p>
        <p className={`mt-1 ${ui.value}`}>
          {profile.year} {profile.make} {profile.model}
        </p>
        <p className={`mt-1 ${ui.bodyMuted}`}>
          {estimate.isElectric
            ? `~${estimate.rangeMiles} mi range`
            : `~${estimate.highwayMpg} MPG · ${estimate.tankGallons} gal`}
        </p>
      </div>
      {onEdit ? (
        <button type="button" data-testid="btn-edit-vehicle" onClick={onEdit} className={ui.btnSecondary}>
          Edit
        </button>
      ) : null}
    </div>
  );
}
