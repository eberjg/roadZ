import type { FuelIntelligence } from "@/services/fuel/types";

type FuelWarningsProps = {
  intelligence: FuelIntelligence;
};

const severityStyles: Record<string, string> = {
  info: "border-zinc-400 bg-zinc-50 text-zinc-800",
  warning: "border-amber-600 bg-amber-50 text-amber-950",
  critical: "border-red-700 bg-red-50 text-red-950",
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
