import { cockpitGlass } from "./cockpitStyles";

type MissionChromeProps = {
  destination: string;
  completedMiles: number;
  totalMiles: number;
  etaLabel: string;
  remainingMiles: number;
  efficiencyScore: number;
  liveMpg: number;
  fuelRangeMiles: number;
  liveActive: boolean;
  onOpenPlanner?: () => void;
};

/** Single compact top card: mission + tactical metrics (mockup-aligned). */
export function MissionChrome({
  destination,
  completedMiles,
  totalMiles,
  etaLabel,
  remainingMiles,
  efficiencyScore,
  liveMpg,
  fuelRangeMiles,
  liveActive,
  onOpenPlanner,
}: MissionChromeProps) {
  const percent =
    totalMiles > 0 ? Math.min(100, Math.round((completedMiles / totalMiles) * 100)) : 0;

  return (
    <header
      data-testid="cockpit-mission-header"
      className={`${cockpitGlass} pointer-events-auto overflow-hidden`}
    >
      <div className="px-3 pb-2 pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400/90">
              Active mission
            </p>
            <p
              data-testid="cockpit-trip-route"
              className="mt-0.5 truncate text-base font-semibold leading-snug text-white"
            >
              {destination}
            </p>
          </div>
          {onOpenPlanner ? (
            <button
              type="button"
              data-testid="cockpit-open-planner"
              onClick={onOpenPlanner}
              className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Plan
            </button>
          ) : null}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          <span data-testid="cockpit-trip-progress" className="text-zinc-400">
            {completedMiles.toLocaleString()} / {totalMiles.toLocaleString()} mi · {percent}%
          </span>
          <span data-testid="cockpit-trip-eta" className="font-semibold text-cyan-300">
            ETA <span data-testid="hud-eta">{etaLabel}</span>
          </span>
          {liveActive ? (
            <span
              data-testid="cockpit-live-pulse"
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-px text-[9px] font-bold uppercase text-emerald-300"
            >
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
              Live
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div
        data-testid="cockpit-metrics-strip"
        className="grid grid-cols-4 border-t border-white/10 bg-black/25 px-1 py-1.5"
      >
        <MetricCell label="ETA" value={etaLabel} testId="cockpit-metric-eta" valueClass="text-cyan-300" />
        <MetricCell
          label="Distance"
          value={`${remainingMiles.toLocaleString()} mi`}
          testId="cockpit-metric-distance"
        />
        <div className="text-center" data-testid="hud-efficiency-score">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-zinc-500">
            Efficiency
          </p>
          <p className="mt-0.5 text-[11px] font-bold leading-tight text-emerald-300">
            {efficiencyScore}
          </p>
          <p data-testid="hud-live-mpg" className="text-[9px] font-medium text-cyan-300/90">
            {liveMpg} MPG
          </p>
        </div>
        <MetricCell
          label="Range"
          value={`~${fuelRangeMiles} mi`}
          testId="cockpit-metric-range"
          valueClass="text-amber-200"
        />
      </div>
    </header>
  );
}

function MetricCell({
  label,
  value,
  testId,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  testId: string;
  valueClass?: string;
}) {
  return (
    <div className="text-center" data-testid={testId}>
      <p className="text-[8px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-0.5 text-[11px] font-bold leading-tight ${valueClass}`}>{value}</p>
    </div>
  );
}
