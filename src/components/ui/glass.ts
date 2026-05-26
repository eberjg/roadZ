import { gradients } from "./gradients";

export const glass = {
  shell:
    "relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/35 shadow-2xl shadow-black/60 backdrop-blur-2xl ring-1 ring-white/[0.06]",
  shellGlow: `${gradients.cardSheen} pointer-events-none absolute inset-0`,
  panel:
    "rounded-2xl border border-white/10 bg-zinc-900/45 p-6 shadow-xl shadow-black/50 backdrop-blur-xl ring-1 ring-white/[0.05]",
  panelNested:
    "rounded-2xl border border-white/10 bg-zinc-800/40 p-5 shadow-lg shadow-black/40 backdrop-blur-lg ring-1 ring-white/[0.04]",
  panelInset:
    "rounded-xl border border-white/10 bg-zinc-950/55 p-4 backdrop-blur-md",
  panelMuted:
    "rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 p-6 backdrop-blur-md",
  chip: "rounded-lg border border-white/8 bg-zinc-900/60 p-3 backdrop-blur-sm",
  immersive:
    "fixed inset-0 z-50 flex min-h-[100dvh] flex-col overflow-y-auto overscroll-y-contain px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]",
} as const;
