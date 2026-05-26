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
    <section
      data-testid="trip-timeline"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-6 shadow-sm"
    >
      <h3 className="text-2xl font-bold text-zinc-900">Trip Timeline</h3>
      <ol className="mt-5 flex flex-col gap-3">
        {state.timeline.map((event) => (
          <li
            key={event.id}
            data-testid={`timeline-event-${event.id}`}
            className={`rounded-xl border-2 px-4 py-3 ${
              event.completed
                ? "border-emerald-700 bg-emerald-50"
                : "border-zinc-300 bg-zinc-50"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-lg font-bold text-zinc-900">{event.label}</p>
              <span className="text-sm font-semibold uppercase text-zinc-600">
                {typeLabels[event.type]}
              </span>
            </div>
            <p className="text-lg text-zinc-700">
              Mile {event.mileMarker.toLocaleString()} · {event.timeLabel}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
