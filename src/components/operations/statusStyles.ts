import type { OperationalStatus } from "@/services/operations/types";

export const statusStyles: Record<
  OperationalStatus,
  { badge: string; border: string; text: string }
> = {
  NORMAL: {
    badge: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
    border: "border-emerald-500/50",
    text: "text-emerald-300",
  },
  CAUTION: {
    badge: "border-amber-500/50 bg-amber-500/15 text-amber-200",
    border: "border-amber-500/50",
    text: "text-amber-200",
  },
  HIGH_RISK: {
    badge: "border-orange-500/50 bg-orange-500/15 text-orange-200",
    border: "border-orange-500/50",
    text: "text-orange-200",
  },
  CRITICAL: {
    badge: "border-red-500/50 bg-red-500/15 text-red-300",
    border: "border-red-500/50",
    text: "text-red-300",
  },
};
