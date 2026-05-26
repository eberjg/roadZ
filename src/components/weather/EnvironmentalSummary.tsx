import { ui, cn } from "@/components/ui/theme";
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
      className={cn(ui.panel, styles.border)}
    >
      <h2 className={ui.h2}>Environmental Awareness</h2>
      <p className={`mt-3 text-xl text-zinc-200`}>
        {intelligence.current.icon} {intelligence.current.summary} ·{" "}
        {intelligence.current.temperatureF}°F
      </p>
      <p className={`mt-2 ${ui.body}`}>
        {zonesAhead} weather zones ahead · {severeCount} severe alert
        {severeCount === 1 ? "" : "s"}
      </p>
      <p data-testid="environmental-risk-score" className={`mt-4 ${ui.valueXl}`}>
        Route risk: {intelligence.risk.score}/100
      </p>
    </section>
  );
}
