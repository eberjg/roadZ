import { semantic } from "@/components/ui/colors";
import type { OperationalStatus } from "@/services/operations/types";

export const statusStyles: Record<
  OperationalStatus,
  { badge: string; border: string; text: string }
> = {
  NORMAL: {
    badge: semantic.success.badge,
    border: semantic.success.border,
    text: semantic.success.text,
  },
  CAUTION: {
    badge: semantic.caution.badge,
    border: semantic.caution.border,
    text: semantic.caution.text,
  },
  HIGH_RISK: {
    badge: semantic.high_risk.badge,
    border: semantic.high_risk.border,
    text: semantic.high_risk.text,
  },
  CRITICAL: {
    badge: semantic.critical.badge,
    border: semantic.critical.border,
    text: semantic.critical.text,
  },
};
