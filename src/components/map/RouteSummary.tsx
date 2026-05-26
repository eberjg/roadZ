import type { RouteData } from "@/services/maps/types";

type RouteSummaryProps = {
  route: RouteData;
};

export function RouteSummary({ route }: RouteSummaryProps) {
  return (
    <section
      data-testid="route-summary"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-zinc-900">Live Route Summary</h2>
      <p className="mt-2 text-lg text-zinc-700">
        {route.start.label} → {route.end.label}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div
          data-testid="route-summary-distance"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
            Distance
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {route.distanceMiles.toLocaleString()} mi
          </p>
        </div>
        <div
          data-testid="route-summary-eta"
          className="rounded-xl border-2 border-zinc-900 bg-zinc-50 p-4"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600">
            ETA
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{route.etaLabel}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-zinc-600">
        Source: {route.source === "mapbox" ? "Mapbox live routing" : "Deterministic fallback routing"}
      </p>
    </section>
  );
}
