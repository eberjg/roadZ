import type { OperationalState } from "@/services/operations/types";
import { statusStyles } from "./statusStyles";

type DriverStatusProps = {
  state: OperationalState;
};

export function DriverStatus({ state }: DriverStatusProps) {
  const styles = statusStyles[state.fatigue.status];

  return (
    <section
      data-testid="driver-status"
      className={`rounded-2xl border-2 bg-white p-6 shadow-sm ${styles.border}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-bold text-zinc-900">Driver Status</h3>
        <span
          data-testid="driver-status-level"
          className={`rounded-full border-2 px-4 py-2 text-lg font-bold ${styles.badge}`}
        >
          {state.fatigue.status.replace("_", " ")}
        </span>
      </div>

      <p data-testid="driver-fatigue-message" className={`mt-4 text-xl font-semibold ${styles.text}`}>
        {state.fatigue.message}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div data-testid="driver-fatigue-score" className="rounded-xl bg-zinc-50 p-4">
          <p className="text-sm font-semibold uppercase text-zinc-600">Fatigue score</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{state.fatigue.score}</p>
        </div>
        <div data-testid="driver-effective-hours" className="rounded-xl bg-zinc-50 p-4">
          <p className="text-sm font-semibold uppercase text-zinc-600">Effective hours</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {state.fatigue.effectiveDrivingHours}
          </p>
        </div>
        <div data-testid="driver-hours-since-stop" className="rounded-xl bg-zinc-50 p-4">
          <p className="text-sm font-semibold uppercase text-zinc-600">Hours since stop</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {state.fatigue.hoursSinceLastStop}
          </p>
        </div>
      </div>
    </section>
  );
}
