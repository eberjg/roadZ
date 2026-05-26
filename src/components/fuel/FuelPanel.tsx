import type { FuelIntelligence } from "@/services/fuel/types";

type FuelPanelProps = {
  intelligence: FuelIntelligence;
};

export function FuelPanel({ intelligence }: FuelPanelProps) {
  const nextStop = intelligence.recommendedNextStop;

  return (
    <section
      data-testid="fuel-card"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-zinc-900">Fuel Intelligence</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div
          data-testid="fuel-total-cost"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
            Total Fuel Cost
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            $
            {intelligence.totalFuelCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div
          data-testid="fuel-range-remaining"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
            Estimated Range Remaining
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {intelligence.estimatedRangeMiles.toLocaleString()} mi
          </p>
          <p className="mt-1 text-lg text-zinc-700">
            {intelligence.estimatedFuelRemainingGallons} gal usable
          </p>
        </div>

        <div
          data-testid="fuel-safety-buffer"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
            Fuel Safety Buffer (15%)
          </p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {intelligence.fuelSafetyBufferMiles} mi · {intelligence.fuelSafetyBufferGallons} gal
          </p>
        </div>

        <div
          data-testid="fuel-burn-rate"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
            Fuel Burn Rate
          </p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {intelligence.fuelBurnRateGallonsPerMile} gal/mi
          </p>
          <p className="mt-1 text-lg text-zinc-700">
            {intelligence.totalGallonsRequired.toLocaleString()} gal total trip
          </p>
        </div>
      </div>

      {nextStop ? (
        <div
          data-testid="fuel-next-stop"
          className="mt-5 rounded-xl border-2 border-emerald-700 bg-emerald-50 p-4"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Next Recommended Fuel Stop
          </p>
          <p className="mt-2 text-xl font-bold text-emerald-950">{nextStop.station.name}</p>
          <p className="text-lg text-emerald-900">
            {nextStop.station.city} · mile {nextStop.mileMarker}
          </p>
          <p data-testid="fuel-stop-distance" className="mt-2 text-lg font-semibold text-emerald-950">
            {nextStop.stopDistanceMiles.toLocaleString()} mi ahead · ETA {nextStop.estimatedTimingLabel}
          </p>
        </div>
      ) : null}

      <p data-testid="fuel-remaining-drive" className="mt-4 text-lg text-zinc-700">
        Remaining drive distance: {intelligence.remainingDriveMiles.toLocaleString()} mi
      </p>
    </section>
  );
}
