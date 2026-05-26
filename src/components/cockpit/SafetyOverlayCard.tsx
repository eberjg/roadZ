import { cockpitGlassCompact } from "./cockpitStyles";

type SafetyOverlayCardProps = {
  status: string;
  fatigueStatus: string;
  weatherRisk: string;
  alertCount: number;
  relayActive?: boolean;
};

export function SafetyOverlayCard({
  status,
  fatigueStatus,
  weatherRisk,
  alertCount,
  relayActive = false,
}: SafetyOverlayCardProps) {
  const ringColor =
    status === "CRITICAL"
      ? "border-red-500/60 text-red-300"
      : status === "HIGH_RISK"
        ? "border-amber-500/60 text-amber-300"
        : "border-emerald-500/50 text-emerald-300";

  return (
    <aside
      data-testid="cockpit-safety-overlay"
      className={`${cockpitGlassCompact} pointer-events-auto w-[min(100%,11.5rem)] p-3`}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Safety</p>
      <div
        className={`mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full border-2 ${ringColor} bg-black/30 text-center text-[10px] font-bold uppercase leading-tight`}
      >
        {status.replace("_", " ")}
      </div>
      <ul className="mt-3 space-y-1 text-xs text-zinc-300">
        <li>Fatigue: {fatigueStatus.replace("_", " ")}</li>
        <li>Weather: {weatherRisk.replace("_", " ")}</li>
        <li data-testid="cockpit-alert-count">Alerts: {alertCount}</li>
        {relayActive ? (
          <li data-testid="hud-safety-relay" className="text-cyan-300">
            Family relay on
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
