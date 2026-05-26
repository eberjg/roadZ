import { ui } from "@/components/ui/theme";
import type { OperationalState } from "@/services/operations/types";

type TripTimelineProps = {
  state: OperationalState;
};

const typeLabels: Record<string, string> = {
  start: "Start",
  fuel: "Fuel",
  rest: "Rest",
  sleep: "Sleep",
  arrival: "Arrival",
};

export function TripTimeline({ state }: TripTimelineProps) {
  return (
    <section data-testid="trip-timeline" className={ui.panelNested}>
      <h3 className={ui.h3}>Trip Timeline</h3>
      <ol className="mt-5 flex flex-col gap-3">
        {state.timeline.map((event) => (
          <li
            key={event.id}
            data-testid={`timeline-event-${event.id}`}
            className={`rounded-xl border-2 px-4 py-3 ${
              event.completed
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-white/10 bg-zinc-950/70"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={`text-lg font-bold ${event.completed ? "text-emerald-200" : "text-white"}`}>
                {event.label}
              </p>
              <span className={ui.statLabel}>{typeLabels[event.type]}</span>
            </div>
            <p className={ui.body}>
              Mile {event.mileMarker.toLocaleString()} · {event.timeLabel}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
