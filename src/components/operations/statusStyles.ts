import type { OperationalStatus } from "@/services/operations/types";

export const statusStyles: Record<
  OperationalStatus,
  { badge: string; border: string; text: string }
> = {
  NORMAL: {
    badge: "bg-emerald-100 text-emerald-950 border-emerald-700",
    border: "border-emerald-700",
    text: "text-emerald-950",
  },
  CAUTION: {
    badge: "bg-amber-100 text-amber-950 border-amber-600",
    border: "border-amber-600",
    text: "text-amber-950",
  },
  HIGH_RISK: {
    badge: "bg-orange-100 text-orange-950 border-orange-700",
    border: "border-orange-700",
    text: "text-orange-950",
  },
  CRITICAL: {
    badge: "bg-red-100 text-red-950 border-red-700",
    border: "border-red-700",
    text: "text-red-950",
  },
};
