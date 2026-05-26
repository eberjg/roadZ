import { cockpitGlassCompact } from "./cockpitStyles";

type NextStopOverlayCardProps = {
  stopName: string;
  stopCity: string;
  milesAhead: number;
  etaLabel: string;
  gasPrice?: number;
};

export function NextStopOverlayCard({
  stopName,
  stopCity,
  milesAhead,
  etaLabel,
  gasPrice,
}: NextStopOverlayCardProps) {
  return (
    <aside
      data-testid="cockpit-next-stop-overlay"
      className={`${cockpitGlassCompact} pointer-events-auto w-[min(100%,12rem)] p-3`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-lg">
          ⛽
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Next stop
          </p>
          <p data-testid="hud-next-stop" className="truncate text-sm font-semibold text-white">
            {stopName}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-400">{stopCity}</p>
      <p data-testid="cockpit-overlay-stop-distance" className="mt-1 text-sm font-semibold text-cyan-300">
        {milesAhead.toLocaleString()} mi · {etaLabel}
      </p>
      {gasPrice ? (
        <p className="mt-1 text-xs text-emerald-300">${gasPrice.toFixed(2)}/gal</p>
      ) : null}
    </aside>
  );
}
