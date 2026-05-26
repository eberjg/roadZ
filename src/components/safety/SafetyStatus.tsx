import { ui, cn } from "@/components/ui/theme";
import type { SafetyStatus as SafetyStatusType } from "@/services/safety/types";

type SafetyStatusProps = {
  status: SafetyStatusType;
};

export function SafetyStatus({ status }: SafetyStatusProps) {
  const relayLabel = status.relayEnabled ? "Relay ON" : "Relay OFF";
  const modeLabel = status.mode === "twilio" ? "Twilio live" : "Simulated mode";

  return (
    <section data-testid="safety-status" className={ui.panelNested}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={ui.h3}>Safety relay</h3>
        <span
          data-testid="safety-relay-badge"
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold",
            status.relayEnabled
              ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : "border border-zinc-500/40 bg-zinc-800/60 text-zinc-400",
          )}
        >
          {relayLabel}
        </span>
      </div>
      <p className={`mt-2 ${ui.body}`} data-testid="safety-mode-label">
        {modeLabel} · {status.activeContacts} active contact
        {status.activeContacts === 1 ? "" : "s"}
      </p>
      {status.lastBroadcast ? (
        <p className={`mt-2 ${ui.bodyMuted}`} data-testid="safety-last-sent">
          Last update {new Date(status.lastBroadcast.sentAtMs).toLocaleTimeString()} ·{" "}
          {status.lastBroadcast.eventType.replace("_", " ")}
        </p>
      ) : (
        <p className={`mt-2 ${ui.bodyMuted}`} data-testid="safety-last-sent">
          No updates sent yet
        </p>
      )}
      {status.emergency.active ? (
        <p
          data-testid="safety-emergency-warning"
          className={`mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 ${ui.body} ${ui.errorText}`}
        >
          {status.emergency.message}
        </p>
      ) : null}
    </section>
  );
}
