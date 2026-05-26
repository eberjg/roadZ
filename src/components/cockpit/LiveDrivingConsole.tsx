import { cockpitGlass } from "./cockpitStyles";

type LiveDrivingConsoleProps = {
  speedMph: number;
  efficiencyScore: number;
  driveTimeLabel: string;
};

export function LiveDrivingConsole({
  speedMph,
  efficiencyScore,
  driveTimeLabel,
}: LiveDrivingConsoleProps) {
  const arcPercent = Math.min(100, efficiencyScore);

  return (
    <section
      data-testid="cockpit-live-console"
      className={`${cockpitGlass} pointer-events-auto mx-2 px-4 py-3`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
            Live driving
          </p>
          <p data-testid="cockpit-speed" className="mt-1 text-2xl font-bold text-white">
            {Math.round(speedMph)}{" "}
            <span className="text-sm font-semibold text-zinc-400">MPH</span>
          </p>
        </div>
        <div className="relative flex h-14 w-24 items-end justify-center">
          <svg viewBox="0 0 100 50" className="h-12 w-full overflow-visible">
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
            className="absolute bottom-0 text-lg font-bold text-cyan-300"
          >
            {efficiencyScore}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Drive time
          </p>
          <p data-testid="cockpit-drive-time" className="mt-1 text-sm font-semibold text-white">
            {driveTimeLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
