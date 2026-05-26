"use client";

import { ui } from "@/components/ui/theme";
import type { VehicleEstimate } from "@/services/vehicle/types";

type MPGEstimateCardProps = {
  estimate: VehicleEstimate;
};

export function MPGEstimateCard({ estimate }: MPGEstimateCardProps) {
  const costPer100Miles =
    !estimate.isElectric && estimate.highwayMpg > 0
      ? ((100 / estimate.highwayMpg) * estimate.suggestedGasPrice).toFixed(2)
      : null;

  return (
    <section data-testid="mpg-estimate-card" className={ui.panelNested}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className={ui.h3}>Fuel efficiency</h3>
        {estimate.epaVerified ? (
          <span
            data-testid="vehicle-epa-verified"
            className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300"
          >
            EPA official
          </span>
        ) : (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
            Select trim for official MPG
          </span>
        )}
      </div>
      <p className={`mt-2 ${ui.body}`} data-testid="vehicle-estimate-summary">
        {estimate.summary}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">City</p>
          <p className="text-lg font-bold text-white" data-testid="vehicle-estimate-city-mpg">
            {estimate.isElectric ? "—" : `${estimate.cityMpg}`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Highway</p>
          <p className="text-lg font-bold text-emerald-300" data-testid="vehicle-estimate-mpg">
            {estimate.isElectric ? "EV" : `${estimate.highwayMpg} MPG`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Combined</p>
          <p className="text-lg font-bold text-cyan-300" data-testid="vehicle-estimate-combined-mpg">
            {estimate.isElectric ? "—" : `${estimate.combinedMpg} MPG`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Range</p>
          <p className="text-lg font-bold text-amber-200" data-testid="vehicle-estimate-range">
            ~{estimate.rangeMiles.toLocaleString()} mi
          </p>
        </div>
      </div>
      {!estimate.isElectric ? (
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-400">
          <span data-testid="vehicle-estimate-tank">{estimate.tankGallons} gal tank</span>
          {costPer100Miles ? (
            <span data-testid="vehicle-estimate-cost-per-100">
              ~${costPer100Miles} / 100 mi @ ${estimate.suggestedGasPrice.toFixed(2)}/gal
            </span>
          ) : null}
        </div>
      ) : null}
      <p className="mt-2 text-xs text-zinc-500">
        Used for live fuel tracking, stop planning, and driver efficiency score while you drive.
      </p>
    </section>
  );
}
