/** Shared dark UI tokens — mobile-first, high contrast for in-car use. */
export const ui = {
  page: "min-h-full bg-gradient-to-b from-zinc-950 via-slate-950 to-black text-zinc-100",
  main: "mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-8 pb-24",
  title: "text-4xl font-bold tracking-tight text-white",
  subtitle: "mt-2 text-lg text-zinc-400",

  panel:
    "rounded-2xl border border-white/10 bg-zinc-900/90 p-6 shadow-xl shadow-black/50 backdrop-blur-sm",
  panelNested:
    "rounded-2xl border border-white/10 bg-zinc-800/70 p-5 shadow-lg shadow-black/40",
  panelInset: "rounded-xl border border-white/10 bg-zinc-950/70 p-4",
  panelMuted:
    "rounded-2xl border border-dashed border-white/15 bg-zinc-900/50 p-6 text-zinc-400",

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

  statBox: "rounded-xl border border-white/10 bg-zinc-950/80 p-4",
  statLabel: "text-xs font-semibold uppercase tracking-wider text-zinc-500",
  chip: "rounded-lg border border-white/5 bg-zinc-800/90 p-3",

  input:
    "mt-2 w-full rounded-xl border border-white/15 bg-zinc-950 px-4 py-4 text-xl text-white placeholder:text-zinc-500 focus:border-sky-400/60 focus:outline-none focus:ring-4 focus:ring-sky-500/25",
  label: "text-lg font-semibold text-zinc-200",

  btnPrimary:
    "rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-lg font-bold text-zinc-950 shadow-lg shadow-sky-500/30 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45",
  btnPrimaryBlock:
    "w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-5 text-xl font-bold text-zinc-950 shadow-lg shadow-sky-500/30 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45",
  btnSecondary:
    "rounded-xl border border-white/20 bg-zinc-800 px-4 py-2.5 text-lg font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.99]",
  badge:
    "rounded-full border border-white/15 bg-zinc-800 px-3 py-1 text-sm font-bold text-zinc-100",

  errorBox: "rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4",
  errorText: "text-lg font-semibold text-red-300",
  successBox: "rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5",
  successText: "text-lg font-semibold text-emerald-300",

  mapFrame:
    "overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/50",
  mapCaption: "text-sm font-semibold text-zinc-400",
} as const;

export function cn(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}
