/** Semantic status colors — dark mode only. */
export const semantic = {
  info: {
    border: "border-sky-500/40",
    bg: "bg-sky-500/10",
    text: "text-sky-200",
    badge: "border-sky-500/50 bg-sky-500/15 text-sky-200",
    glow: "shadow-sky-500/20",
  },
  success: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    badge: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
    glow: "shadow-emerald-500/20",
  },
  caution: {
    border: "border-amber-500/50",
    bg: "bg-amber-500/10",
    text: "text-amber-200",
    badge: "border-amber-500/50 bg-amber-500/15 text-amber-200",
    glow: "shadow-amber-500/20",
  },
  high_risk: {
    border: "border-orange-500/50",
    bg: "bg-orange-500/10",
    text: "text-orange-200",
    badge: "border-orange-500/50 bg-orange-500/15 text-orange-200",
    glow: "shadow-orange-500/20",
  },
  critical: {
    border: "border-red-500/50",
    bg: "bg-red-500/10",
    text: "text-red-300",
    badge: "border-red-500/50 bg-red-500/15 text-red-300",
    glow: "shadow-red-500/20",
  },
} as const;

export type SemanticTone = keyof typeof semantic;
