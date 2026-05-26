import type { TripTrackingState } from "@/services/location/types";

type MovementStatusProps = {
  tracking: TripTrackingState;
};

export function MovementStatus({ tracking }: MovementStatusProps) {
  return (
    <section
      data-testid="movement-status"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-5 shadow-sm"
    >
      <h3 className="text-2xl font-bold text-zinc-900">Movement</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-sm font-semibold uppercase text-zinc-600">State</p>
          <p data-testid="movement-state" className="text-xl font-bold text-zinc-900">
            {tracking.movementState}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-sm font-semibold uppercase text-zinc-600">Speed</p>
          <p data-testid="movement-speed" className="text-xl font-bold text-zinc-900">
            {tracking.speedMph} mph
          </p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-sm font-semibold uppercase text-zinc-600">Idle</p>
          <p data-testid="movement-idle" className="text-xl font-bold text-zinc-900">
            {tracking.idleMinutes} min
          </p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-sm font-semibold uppercase text-zinc-600">Heading</p>
          <p data-testid="movement-heading" className="text-xl font-bold text-zinc-900">
            {tracking.heading === null ? "N/A" : `${Math.round(tracking.heading)}°`}
          </p>
        </div>
      </div>
    </section>
  );
}
