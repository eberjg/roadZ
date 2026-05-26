import { cockpitGlass } from "./cockpitStyles";

type MissionHeaderProps = {
  destination: string;
  completedMiles: number;
  totalMiles: number;
  etaLabel: string;
  liveActive: boolean;
  onOpenPlanner?: () => void;
};

export function MissionHeader({
  destination,
  completedMiles,
  totalMiles,
  etaLabel,
  liveActive,
  onOpenPlanner,
}: MissionHeaderProps) {
  const percent =
    totalMiles > 0 ? Math.min(100, Math.round((completedMiles / totalMiles) * 100)) : 0;

  return (
    <header
      data-testid="cockpit-mission-header"
      className={`${cockpitGlass} pointer-events-auto px-4 py-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">
            Active mission
          </p>
          <p
            data-testid="cockpit-trip-route"
            className="mt-1 truncate text-lg font-semibold leading-tight text-white"
          >
            {destination}
          </p>
        </div>
        {onOpenPlanner ? (
          <button
            type="button"
            data-testid="cockpit-open-planner"
            onClick={onOpenPlanner}
            className="shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md"
          >
            Plan
          </button>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span data-testid="cockpit-trip-progress" className="text-zinc-300">
          {completedMiles.toLocaleString()} / {totalMiles.toLocaleString()} mi · {percent}%
        </span>
        <span data-testid="cockpit-trip-eta" className="font-semibold text-cyan-300">
          ETA <span data-testid="hud-eta">{etaLabel}</span>
        </span>
        {liveActive ? (
          <span
            data-testid="cockpit-live-pulse"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
        ) : null}
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </header>
  );
}
