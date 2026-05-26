import { ui } from "@/components/ui/theme";
import type { FuelIntelligence } from "@/services/fuel/types";

type FuelPanelProps = {
  intelligence: FuelIntelligence;
};

export function FuelPanel({ intelligence }: FuelPanelProps) {
  const nextStop = intelligence.recommendedNextStop;

  return (
    <section data-testid="fuel-card" className={ui.panel}>
      <h2 className={ui.h2}>Fuel Intelligence</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div data-testid="fuel-total-cost" className={ui.panelInset}>
          <p className={ui.statLabel}>Total Fuel Cost</p>
          <p className={`mt-2 ${ui.valueXl}`}>
            $
            {intelligence.totalFuelCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div data-testid="fuel-range-remaining" className={ui.panelInset}>
          <p className={ui.statLabel}>Estimated Range Remaining</p>
          <p className={`mt-2 ${ui.valueXl}`}>
            {intelligence.estimatedRangeMiles.toLocaleString()} mi
          </p>
          <p className={`mt-1 ${ui.body}`}>
            {intelligence.estimatedFuelRemainingGallons} gal usable
          </p>
        </div>

        <div data-testid="fuel-safety-buffer" className={ui.panelInset}>
          <p className={ui.statLabel}>Fuel Safety Buffer (15%)</p>
          <p className={`mt-2 ${ui.valueLg}`}>
            {intelligence.fuelSafetyBufferMiles} mi · {intelligence.fuelSafetyBufferGallons} gal
          </p>
        </div>

        <div data-testid="fuel-burn-rate" className={ui.panelInset}>
          <p className={ui.statLabel}>Fuel Burn Rate</p>
          <p className={`mt-2 ${ui.valueLg}`}>
            {intelligence.fuelBurnRateGallonsPerMile} gal/mi
          </p>
          <p className={`mt-1 ${ui.body}`}>
            {intelligence.totalGallonsRequired.toLocaleString()} gal total trip
          </p>
        </div>
      </div>

      {nextStop ? (
        <div
          data-testid="fuel-next-stop"
          className="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
            Next Recommended Fuel Stop
          </p>
          <p className="mt-2 text-xl font-bold text-emerald-200">{nextStop.station.name}</p>
          <p className="text-lg text-emerald-300/90">
            {nextStop.station.city} · mile {nextStop.mileMarker}
          </p>
          <p
            data-testid="fuel-stop-distance"
            className="mt-2 text-lg font-semibold text-emerald-200"
          >
            {nextStop.stopDistanceMiles.toLocaleString()} mi ahead · ETA{" "}
            {nextStop.estimatedTimingLabel}
          </p>
        </div>
      ) : null}

      <p data-testid="fuel-remaining-drive" className={`mt-4 ${ui.body}`}>
        Remaining drive distance: {intelligence.remainingDriveMiles.toLocaleString()} mi
      </p>
    </section>
  );
}
