import { cockpitGlassCompact } from "./cockpitStyles";

type MetricsStripProps = {
  etaLabel: string;
  remainingMiles: number;
  efficiencyScore: number;
  liveMpg: number;
  fuelRangeMiles: number;
};

export function MetricsStrip({
  etaLabel,
  remainingMiles,
  efficiencyScore,
  liveMpg,
  fuelRangeMiles,
}: MetricsStripProps) {
  const items = [
    { label: "ETA", value: etaLabel, testId: "cockpit-metric-eta" },
    {
      label: "Distance",
      value: `${remainingMiles.toLocaleString()} mi`,
      testId: "cockpit-metric-distance",
    },
    {
      label: "Efficiency",
      value: `${efficiencyScore}`,
      testId: "hud-efficiency-score",
    },
    {
      label: "MPG",
      value: `${liveMpg}`,
      testId: "hud-live-mpg",
    },
    {
      label: "Range",
      value: `~${fuelRangeMiles} mi`,
      testId: "cockpit-metric-range",
    },
  ];

  return (
    <div
      data-testid="cockpit-metrics-strip"
      className={`${cockpitGlassCompact} pointer-events-auto grid grid-cols-5 gap-1 px-2 py-2`}
    >
      {items.map((item) => (
        <div key={item.testId} className="text-center" data-testid={item.testId}>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
            {item.label}
          </p>
          <p className="mt-0.5 text-xs font-bold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
