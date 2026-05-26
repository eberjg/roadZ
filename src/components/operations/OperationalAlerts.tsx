import type { OperationalState } from "@/services/operations/types";
import { statusStyles } from "./statusStyles";

type OperationalAlertsProps = {
  state: OperationalState;
};

export function OperationalAlerts({ state }: OperationalAlertsProps) {
  if (state.alerts.length === 0) {
    return (
      <section
        data-testid="operational-alerts"
        className="rounded-2xl border-2 border-emerald-700 bg-emerald-50 p-5"
      >
        <p className="text-lg font-semibold text-emerald-950">No active operational alerts</p>
      </section>
    );
  }

  return (
    <section data-testid="operational-alerts" className="flex flex-col gap-3">
      {state.alerts.map((alert) => {
        const styles = statusStyles[alert.severity];
        return (
          <div
            key={alert.id}
            data-testid={`operational-alert-${alert.code.toLowerCase()}`}
            className={`rounded-xl border-2 px-4 py-3 ${styles.badge}`}
            role="alert"
          >
            <p className="text-lg font-bold">{alert.code.replace(/_/g, " ")}</p>
            <p className="text-lg">{alert.message}</p>
          </div>
        );
      })}
    </section>
  );
}
