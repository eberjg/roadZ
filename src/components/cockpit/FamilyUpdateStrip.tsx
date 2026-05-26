import { cockpitGlassCompact } from "./cockpitStyles";

type FamilyUpdateStripProps = {
  sentAtMs: number | null;
  relayEnabled: boolean;
  onView?: () => void;
};

export function FamilyUpdateStrip({ sentAtMs, relayEnabled, onView }: FamilyUpdateStripProps) {
  const timeLabel = sentAtMs
    ? new Date(sentAtMs).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div
      data-testid="cockpit-family-strip"
      className={`${cockpitGlassCompact} pointer-events-auto mx-2 mb-2 flex items-center justify-between gap-2 px-3 py-2`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm">
          👤
        </span>
        <p className="truncate text-xs text-zinc-300">
          {relayEnabled ? (
            timeLabel ? (
              <>
                Family update sent <span className="text-emerald-400">✓</span> {timeLabel}
              </>
            ) : (
              "Family relay armed — updates on trip events"
            )
          ) : (
            "Family relay off — enable in Safety tab"
          )}
        </p>
      </div>
      {onView ? (
        <button
          type="button"
          data-testid="cockpit-family-view"
          onClick={onView}
          className="shrink-0 text-xs font-semibold text-cyan-300"
        >
          View ›
        </button>
      ) : null}
    </div>
  );
}
