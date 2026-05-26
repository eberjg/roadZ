import { ui } from "@/components/ui/theme";
import type { FuelIntelligence } from "@/services/fuel/types";

type StopRecommendationProps = {
  intelligence: FuelIntelligence;
};

export function StopRecommendation({ intelligence }: StopRecommendationProps) {
  const nextStop = intelligence.recommendedNextStop;
  const upcoming = intelligence.plannedStops.slice(0, 3);

  return (
    <section data-testid="stop-card" className={ui.panel}>
      <h2 className={ui.h2}>Stop Recommendation</h2>

      {nextStop ? (
        <>
          <p data-testid="stop-recommendation-name" className={`mt-4 ${ui.value}`}>
            {nextStop.station.name}
          </p>
          <p className={ui.body}>{nextStop.station.city}</p>
          <p data-testid="stop-recommendation-timing" className={`mt-2 ${ui.body}`}>
            Refuel by mile {nextStop.mileMarker} · {nextStop.estimatedTimingLabel} drive time
          </p>
          <p data-testid="stop-safe-threshold" className={`mt-2 ${ui.value}`}>
            Safe refuel threshold: never below 15% tank reserve
          </p>
          <p className={`mt-2 ${ui.body}`}>{nextStop.reason}</p>
          {nextStop.foodRestSuggestion ? (
            <p
              data-testid="stop-food-rest"
              className={`mt-3 rounded-lg border border-white/10 bg-zinc-800/80 px-4 py-3 ${ui.body}`}
            >
              {nextStop.foodRestSuggestion}
            </p>
          ) : null}
        </>
      ) : (
        <p className={`mt-4 ${ui.body}`}>No fuel stops required for this trip length.</p>
      )}

      {upcoming.length > 1 ? (
        <ul data-testid="stop-upcoming-list" className="mt-5 space-y-2">
          {upcoming.slice(1).map((stop) => (
            <li key={stop.station.id} className={ui.body}>
              Then: {stop.station.name} (mile {stop.mileMarker})
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
