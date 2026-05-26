import { ui } from "@/components/ui/theme";
import type { TripResult } from "@/services/trip/types";

type TripResultsProps = {
  result: TripResult;
};

export function TripResults({ result }: TripResultsProps) {
  return (
    <div data-testid="trip-results" className="grid gap-4 sm:grid-cols-2">
      <article data-testid="result-distance" className={ui.panelInset}>
        <p className={ui.statLabel}>Estimated Distance</p>
        <p className={`mt-2 ${ui.valueLg}`}>
          {result.distanceMiles.toLocaleString()} miles
        </p>
      </article>

      <article data-testid="result-gallons" className={ui.panelInset}>
        <p className={ui.statLabel}>Estimated Gallons Needed</p>
        <p className={`mt-2 ${ui.valueLg}`}>
          {result.gallonsNeeded.toLocaleString()} gal
        </p>
      </article>

      <article data-testid="result-fuel-cost" className={ui.panelInset}>
        <p className={ui.statLabel}>Estimated Fuel Cost</p>
        <p className={`mt-2 ${ui.valueLg}`}>
          $
          {result.fuelCost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </article>

      <article data-testid="result-drive-time" className={ui.panelInset}>
        <p className={ui.statLabel}>Estimated Drive Time</p>
        <p className={`mt-2 ${ui.valueLg}`}>{result.driveTimeLabel}</p>
      </article>
    </div>
  );
}
