import { ui } from "@/components/ui/theme";
import type { RouteData } from "@/services/maps/types";

type RouteSummaryProps = {
  route: RouteData;
};

export function RouteSummary({ route }: RouteSummaryProps) {
  return (
    <section data-testid="route-summary" className={ui.panel}>
      <h2 className={ui.h2}>Live Route Summary</h2>
      <p className={`mt-2 ${ui.body}`}>
        {route.start.label} → {route.end.label}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div data-testid="route-summary-distance" className={ui.panelInset}>
          <p className={ui.statLabel}>Distance</p>
          <p className={`mt-2 ${ui.valueXl}`}>
            {route.distanceMiles.toLocaleString()} mi
          </p>
        </div>
        <div data-testid="route-summary-eta" className={ui.panelInset}>
          <p className={ui.statLabel}>ETA</p>
          <p className={`mt-2 ${ui.valueXl}`}>{route.etaLabel}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-zinc-500">
        Source:{" "}
        {route.source === "mapbox" ? "Mapbox live routing" : "Deterministic fallback routing"}
      </p>
    </section>
  );
}
