import { cockpitGlass } from "./cockpitStyles";

type LiveDrivingConsoleProps = {
  speedMph: number;
  efficiencyScore: number;
  driveTimeLabel: string;
  liveActive: boolean;
  gpsStatusLabel: string;
};

export function LiveDrivingConsole({
  speedMph,
  efficiencyScore,
  driveTimeLabel,
  liveActive,
  gpsStatusLabel,
}: LiveDrivingConsoleProps) {
  const arcPercent = Math.min(100, efficiencyScore);

  return (
    <section
      data-testid="cockpit-live-console"
      className={`${cockpitGlass} pointer-events-auto mx-2 px-3 py-2`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/80">
              Live driving
            </p>
            <span
              data-testid="cockpit-gps-status"
              className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${
                liveActive
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-zinc-700/80 text-zinc-400"
              }`}
            >
              {gpsStatusLabel}
            </span>
          </div>
          <p data-testid="cockpit-speed" className="text-xl font-bold leading-tight text-white">
            {Math.round(speedMph)}{" "}
            <span className="text-xs font-semibold text-zinc-500">MPH</span>
          </p>
        </div>
        <div className="relative flex h-12 w-20 items-end justify-center">
          <svg viewBox="0 0 100 50" className="h-10 w-full overflow-visible" aria-hidden>
            <path
              d="M 8 48 A 42 42 0 0 1 92 48"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 8 48 A 42 42 0 0 1 92 48"
              fill="none"
              stroke="url(#effGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(arcPercent / 100) * 132} 132`}
            />
            <defs>
              <linearGradient id="effGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <span
            data-testid="cockpit-efficiency-gauge"
            className="absolute bottom-0 text-base font-bold text-cyan-300"
          >
            {efficiencyScore}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Drive</p>
          <p data-testid="cockpit-drive-time" className="text-xs font-semibold text-white">
            {driveTimeLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
