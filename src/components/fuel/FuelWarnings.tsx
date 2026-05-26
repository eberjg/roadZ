import { animations } from "@/components/ui/animations";
import { semantic } from "@/components/ui/colors";
import type { FuelIntelligence } from "@/services/fuel/types";

type FuelWarningsProps = {
  intelligence: FuelIntelligence;
};

const severityStyles: Record<string, string> = {
  info: `${semantic.info.border} ${semantic.info.bg} ${semantic.info.text}`,
  warning: `${semantic.caution.border} ${semantic.caution.bg} ${semantic.caution.text} ${animations.pulseAlert}`,
  critical: `${semantic.critical.border} ${semantic.critical.bg} ${semantic.critical.text} ${animations.pulseAlert}`,
};

export function FuelWarnings({ intelligence }: FuelWarningsProps) {
  if (intelligence.warnings.length === 0) {
    return null;
  }

  return (
    <section data-testid="fuel-warnings" className="flex flex-col gap-3">
      {intelligence.warnings.map((warning) => (
        <div
          key={`${warning.code}-${warning.message}`}
          data-testid={`fuel-warning-${warning.code.toLowerCase()}`}
          className={`rounded-xl border-2 px-4 py-3 text-lg font-semibold ${severityStyles[warning.severity]}`}
          role="alert"
        >
          {warning.message}
        </div>
      ))}
    </section>
  );
}
