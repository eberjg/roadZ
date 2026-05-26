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

  const statusShort = status === "NORMAL" ? "Clear" : status.replace("_", " ");

  return (
    <aside
      data-testid="cockpit-safety-overlay"
      className={`${cockpitGlassCompact} pointer-events-auto p-2.5`}
    >
      <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Safety</p>
      <div className="mt-1 flex items-center gap-2">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${ringColor} bg-black/30 text-center text-[9px] font-bold uppercase leading-tight`}
        >
          {statusShort}
        </div>
        <ul className="min-w-0 space-y-0.5 text-[10px] leading-tight text-zinc-400">
          <li>Fatigue {fatigueStatus.replace("_", " ")}</li>
          <li>Wx {weatherRisk.replace("_", " ")}</li>
          <li data-testid="cockpit-alert-count">Alerts {alertCount}</li>
        </ul>
      </div>
      <span data-testid="hud-safety-relay" className="sr-only">
        {relayActive ? "on" : "off"}
      </span>
    </aside>
  );
}

// relay line removed from visible overlay — family strip covers relay status
