import type { FuelIntelligence } from "@/services/fuel/types";

type FuelWarningsProps = {
  intelligence: FuelIntelligence;
};

const severityStyles: Record<string, string> = {
  info: "border-zinc-500/40 bg-zinc-800/80 text-zinc-200",
  warning: "border-amber-500/50 bg-amber-500/10 text-amber-200",
  critical: "border-red-500/50 bg-red-500/10 text-red-300",
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
