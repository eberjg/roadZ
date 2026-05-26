import type { ReactNode } from "react";
import { glass } from "@/components/ui/glass";
import { cn } from "@/components/ui/theme";

type FloatingPanelProps = {
  children: ReactNode;
  className?: string;
  testId?: string;
  pulse?: boolean;
};

export function FloatingPanel({
  children,
  className,
  testId,
  pulse = false,
}: FloatingPanelProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        glass.panel,
        "pointer-events-auto rounded-2xl border border-white/15 bg-slate-950/75 px-3 py-2 shadow-lg shadow-black/40 backdrop-blur-md",
        pulse ? "animate-pulse" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}
