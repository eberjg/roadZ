import { ui } from "@/components/ui/theme";
import { formatDurationLabel } from "@/services/location/sessionEngine";
import type { TripTrackingState } from "@/services/location/types";

type DrivingSessionProps = {
  tracking: TripTrackingState;
};

export function DrivingSession({ tracking }: DrivingSessionProps) {
  const session = tracking.session;
  return (
    <section data-testid="driving-session" className={ui.panelNested}>
      <h3 className={ui.h3}>Driving Session</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={ui.chip}>
          <p className={ui.statLabel}>Active drive</p>
          <p data-testid="session-active-drive" className={`mt-1 ${ui.value}`}>
            {formatDurationLabel(session.activeDrivingMs)}
          </p>
        </div>
        <div className={ui.chip}>
          <p className={ui.statLabel}>Break time</p>
          <p data-testid="session-break-time" className={`mt-1 ${ui.value}`}>
            {formatDurationLabel(session.breakMs)}
          </p>
        </div>
        <div className={ui.chip}>
          <p className={ui.statLabel}>Sleep estimate</p>
          <p data-testid="session-sleep-estimate" className={`mt-1 ${ui.value}`}>
            {formatDurationLabel(session.sleepEstimateMs)}
          </p>
        </div>
        <div className={ui.chip}>
          <p className={ui.statLabel}>Operational</p>
          <p data-testid="session-total-hours" className={`mt-1 ${ui.value}`}>
            {formatDurationLabel(session.totalOperationalMs)}
          </p>
        </div>
        <div className={ui.chip}>
          <p className={ui.statLabel}>Fatigue roll</p>
          <p data-testid="session-fatigue-roll" className={`mt-1 ${ui.value}`}>
            {tracking.session.rollingFatigueHours} h
          </p>
        </div>
      </div>
    </section>
  );
}
