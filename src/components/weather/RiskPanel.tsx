import { ui, cn } from "@/components/ui/theme";
import type { WeatherIntelligence } from "@/services/weather/types";
import { statusStyles } from "@/components/operations/statusStyles";

type RiskPanelProps = {
  intelligence: WeatherIntelligence;
};

export function RiskPanel({ intelligence }: RiskPanelProps) {
  const { risk } = intelligence;
  const styles = statusStyles[risk.level];

  return (
    <section data-testid="risk-panel" className={cn(ui.panel, styles.border)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={ui.h2}>Road Risk Score</h2>
        <span
          data-testid="risk-level"
          className={cn("rounded-full border-2 px-4 py-2 text-lg font-bold", styles.badge)}
        >
          {risk.level.replace("_", " ")}
        </span>
      </div>

      <p data-testid="risk-score" className={`mt-4 ${ui.valueMega}`}>
        {risk.score}
        <span className="text-2xl text-zinc-500"> / 100</span>
      </p>

      <p data-testid="risk-combined-fatigue" className={`mt-4 text-xl font-semibold ${styles.text}`}>
        {risk.combinedFatigueWeatherRisk}
      </p>

      <p className={`mt-2 ${ui.body}`}>
        Visibility risk: <span data-testid="risk-visibility">{risk.visibilityRisk}</span>
      </p>

      <ul className="mt-4 space-y-2">
        {risk.factors.map((factor) => (
          <li key={factor} className={ui.body}>
            · {factor}
          </li>
        ))}
      </ul>
    </section>
  );
}
