import { ui } from "@/components/ui/theme";

type TripStatusStripProps = {
  startPlace: string;
  destinationPlace: string;
  completedMiles: number;
  totalMiles: number;
  etaLabel: string;
  liveActive: boolean;
  onOpenPlanner?: () => void;
};

export function TripStatusStrip({
  startPlace,
  destinationPlace,
  completedMiles,
  totalMiles,
  etaLabel,
  liveActive,
  onOpenPlanner,
}: TripStatusStripProps) {
  const percent =
    totalMiles > 0 ? Math.min(100, Math.round((completedMiles / totalMiles) * 100)) : 0;

  return (
    <header
      data-testid="cockpit-trip-strip"
      className="relative z-30 shrink-0 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-widest text-sky-400/90">
            Active mission
          </p>
          <p
            data-testid="cockpit-trip-route"
            className="truncate text-base font-semibold text-white sm:text-lg"
          >
            {startPlace} → {destinationPlace}
          </p>
        </div>
        {onOpenPlanner ? (
          <button
            type="button"
            data-testid="cockpit-open-planner"
            onClick={onOpenPlanner}
            className={ui.btnSecondary}
          >
            Plan
          </button>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
        <span data-testid="cockpit-trip-progress">
          {completedMiles.toLocaleString()} / {totalMiles.toLocaleString()} mi · {percent}%
        </span>
        <span data-testid="cockpit-trip-eta" className="text-sky-300">
          ETA {etaLabel}
        </span>
        {liveActive ? (
          <span
            data-testid="cockpit-live-pulse"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            LIVE
          </span>
        ) : null}
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </header>
  );
}
