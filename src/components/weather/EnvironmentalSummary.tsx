import type { WeatherIntelligence } from "@/services/weather/types";
import { statusStyles } from "@/components/operations/statusStyles";

type EnvironmentalSummaryProps = {
  intelligence: WeatherIntelligence;
};

export function EnvironmentalSummary({ intelligence }: EnvironmentalSummaryProps) {
  const styles = statusStyles[intelligence.risk.level];
  const severeCount = intelligence.severeAlerts.length;
  const zonesAhead = intelligence.routeZones.filter(
    (zone) => zone.mileStart > intelligence.completedMile,
  ).length;

  return (
    <section
      data-testid="environmental-summary"
      className={`rounded-2xl border-2 bg-white p-6 shadow-sm ${styles.border}`}
    >
      <h2 className="text-2xl font-bold text-zinc-900">Environmental Awareness</h2>
      <p className="mt-3 text-xl text-zinc-800">
        {intelligence.current.icon} {intelligence.current.summary} · {intelligence.current.temperatureF}°F
      </p>
      <p className="mt-2 text-lg text-zinc-700">
        {zonesAhead} weather zones ahead · {severeCount} severe alert{severeCount === 1 ? "" : "s"}
      </p>
      <p data-testid="environmental-risk-score" className="mt-4 text-3xl font-bold text-zinc-900">
        Route risk: {intelligence.risk.score}/100
      </p>
    </section>
  );
}
