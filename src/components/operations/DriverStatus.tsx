import { ui, cn } from "@/components/ui/theme";
import type { OperationalState } from "@/services/operations/types";
import { statusStyles } from "./statusStyles";

type DriverStatusProps = {
  state: OperationalState;
};

export function DriverStatus({ state }: DriverStatusProps) {
  const styles = statusStyles[state.fatigue.status];

  return (
    <section data-testid="driver-status" className={cn(ui.panelNested, styles.border)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={ui.h3}>Driver Status</h3>
        <span
          data-testid="driver-status-level"
          className={cn("rounded-full border-2 px-4 py-2 text-lg font-bold", styles.badge)}
        >
          {state.fatigue.status.replace("_", " ")}
        </span>
      </div>

      <p
        data-testid="driver-fatigue-message"
        className={`mt-4 text-xl font-semibold ${styles.text}`}
      >
        {state.fatigue.message}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div data-testid="driver-fatigue-score" className={ui.panelInset}>
          <p className={ui.statLabel}>Fatigue score</p>
          <p className={`mt-2 ${ui.valueXl}`}>{state.fatigue.score}</p>
        </div>
        <div data-testid="driver-effective-hours" className={ui.panelInset}>
          <p className={ui.statLabel}>Effective hours</p>
          <p className={`mt-2 ${ui.valueXl}`}>{state.fatigue.effectiveDrivingHours}</p>
        </div>
        <div data-testid="driver-hours-since-stop" className={ui.panelInset}>
          <p className={ui.statLabel}>Hours since stop</p>
          <p className={`mt-2 ${ui.valueXl}`}>{state.fatigue.hoursSinceLastStop}</p>
        </div>
      </div>
    </section>
  );
}
