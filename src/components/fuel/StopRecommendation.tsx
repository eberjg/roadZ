import type { FuelIntelligence } from "@/services/fuel/types";

type StopRecommendationProps = {
  intelligence: FuelIntelligence;
};

export function StopRecommendation({ intelligence }: StopRecommendationProps) {
  const nextStop = intelligence.recommendedNextStop;
  const upcoming = intelligence.plannedStops.slice(0, 3);

  return (
    <section
      data-testid="stop-card"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold text-zinc-900">Stop Recommendation</h2>

      {nextStop ? (
        <>
          <p data-testid="stop-recommendation-name" className="mt-4 text-xl font-semibold text-zinc-900">
            {nextStop.station.name}
          </p>
          <p className="text-lg text-zinc-700">{nextStop.station.city}</p>
          <p data-testid="stop-recommendation-timing" className="mt-2 text-lg text-zinc-700">
            Refuel by mile {nextStop.mileMarker} · {nextStop.estimatedTimingLabel} drive time
          </p>
          <p data-testid="stop-safe-threshold" className="mt-2 text-lg font-semibold text-zinc-900">
            Safe refuel threshold: never below 15% tank reserve
          </p>
          <p className="mt-2 text-lg text-zinc-700">{nextStop.reason}</p>
          {nextStop.foodRestSuggestion ? (
            <p data-testid="stop-food-rest" className="mt-3 rounded-lg bg-zinc-100 px-4 py-3 text-lg text-zinc-800">
              {nextStop.foodRestSuggestion}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-lg text-zinc-700">No fuel stops required for this trip length.</p>
      )}

      {upcoming.length > 1 ? (
        <ul data-testid="stop-upcoming-list" className="mt-5 space-y-2">
          {upcoming.slice(1).map((stop) => (
            <li key={stop.station.id} className="text-lg text-zinc-700">
              Then: {stop.station.name} (mile {stop.mileMarker})
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
