import { ui } from "@/components/ui/theme";
import type { WeatherIntelligence } from "@/services/weather/types";
import { statusStyles } from "@/components/operations/statusStyles";

type SevereAlertsProps = {
  intelligence: WeatherIntelligence;
};

export function SevereAlerts({ intelligence }: SevereAlertsProps) {
  if (intelligence.severeAlerts.length === 0) {
    return (
      <section data-testid="severe-alerts" className={ui.successBox}>
        <p className={ui.successText}>No severe weather alerts ahead</p>
      </section>
    );
  }

  return (
    <section data-testid="severe-alerts" className="flex flex-col gap-3">
      {intelligence.severeAlerts.map((alert) => {
        const styles = statusStyles[alert.severity];
        return (
          <div
            key={alert.id}
            data-testid={`severe-alert-${alert.code.toLowerCase()}`}
            className={`rounded-xl border-2 px-4 py-3 ${styles.badge}`}
            role="alert"
          >
            <p className="text-lg font-bold">{alert.code.replace(/_/g, " ")}</p>
            <p className="text-lg">{alert.message}</p>
            <p className="text-sm font-semibold text-zinc-400">Mile {alert.mileMarker}</p>
          </div>
        );
      })}
    </section>
  );
}
