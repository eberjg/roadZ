import type { TripResult } from "@/services/trip/types";

type TripResultsProps = {
  result: TripResult;
};

export function TripResults({ result }: TripResultsProps) {
  return (
    <div
      data-testid="trip-results"
      className="grid gap-4 sm:grid-cols-2"
    >
      <article
        data-testid="result-distance"
        className="rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-5"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
          Estimated Distance
        </p>
        <p className="mt-2 text-2xl font-bold text-zinc-900">
          {result.distanceMiles.toLocaleString()} miles
        </p>
      </article>

      <article
        data-testid="result-gallons"
        className="rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-5"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
          Estimated Gallons Needed
        </p>
        <p className="mt-2 text-2xl font-bold text-zinc-900">
          {result.gallonsNeeded.toLocaleString()} gal
        </p>
      </article>

      <article
        data-testid="result-fuel-cost"
        className="rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-5"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
          Estimated Fuel Cost
        </p>
        <p className="mt-2 text-2xl font-bold text-zinc-900">
          ${result.fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </article>

      <article
        data-testid="result-drive-time"
        className="rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-5"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
          Estimated Drive Time
        </p>
        <p className="mt-2 text-2xl font-bold text-zinc-900">
          {result.driveTimeLabel}
        </p>
      </article>
    </div>
  );
}
