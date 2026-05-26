import { formatDurationLabel } from "@/services/location/sessionEngine";
import type { TripTrackingState } from "@/services/location/types";

type DrivingSessionProps = {
  tracking: TripTrackingState;
};

export function DrivingSession({ tracking }: DrivingSessionProps) {
  const session = tracking.session;
  return (
    <section
      data-testid="driving-session"
      className="rounded-2xl border-2 border-zinc-900 bg-white p-5 shadow-sm"
    >
      <h3 className="text-2xl font-bold text-zinc-900">Driving Session</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-sm font-semibold uppercase text-zinc-600">Active drive</p>
          <p data-testid="session-active-drive" className="text-xl font-bold text-zinc-900">
            {formatDurationLabel(session.activeDrivingMs)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-sm font-semibold uppercase text-zinc-600">Break time</p>
          <p data-testid="session-break-time" className="text-xl font-bold text-zinc-900">
            {formatDurationLabel(session.breakMs)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-sm font-semibold uppercase text-zinc-600">Sleep estimate</p>
          <p data-testid="session-sleep-estimate" className="text-xl font-bold text-zinc-900">
            {formatDurationLabel(session.sleepEstimateMs)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-sm font-semibold uppercase text-zinc-600">Operational</p>
          <p data-testid="session-total-hours" className="text-xl font-bold text-zinc-900">
            {formatDurationLabel(session.totalOperationalMs)}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-sm font-semibold uppercase text-zinc-600">Fatigue roll</p>
          <p data-testid="session-fatigue-roll" className="text-xl font-bold text-zinc-900">
            {tracking.session.rollingFatigueHours} h
          </p>
        </div>
      </div>
    </section>
  );
}
