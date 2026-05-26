import type { WeatherIntelligence } from "@/services/weather/types";
import { statusStyles } from "@/components/operations/statusStyles";

type RiskPanelProps = {
  intelligence: WeatherIntelligence;
};

export function RiskPanel({ intelligence }: RiskPanelProps) {
  const { risk } = intelligence;
  const styles = statusStyles[risk.level];

  return (
    <section
      data-testid="risk-panel"
      className={`rounded-2xl border-2 bg-white p-6 shadow-sm ${styles.border}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-zinc-900">Road Risk Score</h2>
        <span
          data-testid="risk-level"
          className={`rounded-full border-2 px-4 py-2 text-lg font-bold ${styles.badge}`}
        >
          {risk.level.replace("_", " ")}
        </span>
      </div>

      <p data-testid="risk-score" className="mt-4 text-5xl font-bold text-zinc-900">
        {risk.score}
        <span className="text-2xl text-zinc-600"> / 100</span>
      </p>

      <p data-testid="risk-combined-fatigue" className="mt-4 text-xl font-semibold text-zinc-800">
        {risk.combinedFatigueWeatherRisk}
      </p>

      <p className="mt-2 text-lg text-zinc-700">
        Visibility risk: <span data-testid="risk-visibility">{risk.visibilityRisk}</span>
      </p>

      <ul className="mt-4 space-y-2">
        {risk.factors.map((factor) => (
          <li key={factor} className="text-lg text-zinc-700">
            · {factor}
          </li>
        ))}
      </ul>
    </section>
  );
}
