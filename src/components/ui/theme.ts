import { semantic } from "./colors";
import { glass } from "./glass";
import { gradients } from "./gradients";

/** Shared dark UI tokens — mobile-first, premium glass system. */
export const ui = {
  page: `${gradients.page} text-zinc-100`,
  main: "mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8 pb-28",
  immersiveMain: "mx-auto flex w-full max-w-xl flex-1 flex-col gap-6",

  title: "text-4xl font-bold tracking-tight text-white",
  subtitle: "mt-2 text-lg text-zinc-400",
  eyebrow: "text-sm font-semibold uppercase tracking-[0.2em] text-sky-400/90",

  panel: glass.panel,
  panelNested: glass.panelNested,
  panelInset: glass.panelInset,
  panelMuted: glass.panelMuted,
  glassShell: glass.shell,
  glassSheen: glass.shellGlow,
  chip: glass.chip,

  h2: "text-2xl font-bold tracking-tight text-white",
  h3: "text-2xl font-bold text-white",
  hHero: "text-3xl font-bold text-white",

  body: "text-lg text-zinc-300",
  bodyMuted: "text-lg text-zinc-400",
  value: "text-xl font-semibold text-white",
  valueLg: "text-2xl font-bold text-white",
  valueXl: "text-3xl font-bold text-white",
  valueHero: "text-4xl font-bold text-white",
  valueMega: "text-5xl font-bold text-white",

  statLabel: "text-xs font-semibold uppercase tracking-wider text-zinc-500",

  input:
    "mt-2 w-full rounded-xl border border-white/15 bg-zinc-950/80 px-4 py-4 text-xl text-white placeholder:text-zinc-500 backdrop-blur-sm focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-500/25",
  label: "text-lg font-semibold text-zinc-200",

  btnPrimary: `rounded-xl ${gradients.cta} px-5 py-3.5 text-lg font-bold text-zinc-950 shadow-lg shadow-sky-500/30 transition ${gradients.ctaHover} active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45`,
  btnPrimaryBlock: `w-full rounded-2xl ${gradients.cta} px-6 py-5 text-xl font-bold text-zinc-950 shadow-lg shadow-sky-500/35 transition ${gradients.ctaHover} active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45`,
  btnSecondary:
    "rounded-2xl border border-white/20 bg-zinc-900/60 px-4 py-3.5 text-lg font-semibold text-white backdrop-blur-md transition hover:bg-zinc-800/80 active:scale-[0.98]",
  btnGhost:
    "rounded-2xl px-4 py-3 text-lg font-semibold text-zinc-400 transition hover:text-white",

  badge:
    "rounded-full border border-white/15 bg-zinc-900/70 px-3 py-1 text-sm font-bold text-zinc-100 backdrop-blur-sm",

  errorBox: `${semantic.critical.border} ${semantic.critical.bg} rounded-2xl border px-5 py-4`,
  errorText: `${semantic.critical.text} text-lg font-semibold`,
  successBox: `${semantic.success.border} ${semantic.success.bg} rounded-2xl border p-5`,
  successText: `${semantic.success.text} text-lg font-semibold`,

  mapFrame:
    "overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl shadow-black/50 backdrop-blur-sm",
  mapCaption: "text-sm font-semibold text-zinc-400",

  semantic,
} as const;

export function cn(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

export { glass, gradients, semantic };
