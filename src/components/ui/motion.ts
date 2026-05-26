import { animations } from "./animations";

/** Deterministic motion presets (CSS classes only — no runtime animation lib). */
export const motion = {
  pageEnter: animations.fadeInSlow,
  cardEnter: animations.slideUp,
  onboardingStep: animations.permissionEnter,
  loading: animations.shimmer,
  alert: animations.pulseAlert,
  dashboard: animations.fadeIn,
} as const;

export function staggerDelay(index: number, baseMs = 60): string {
  return `${index * baseMs}ms`;
}
