import { cockpitGlassCompact } from "./cockpitStyles";

type WeatherOverlayCardProps = {
  temperatureF: number;
  summary: string;
  riskLevel: string;
};

export function WeatherOverlayCard({
  temperatureF,
  summary,
  riskLevel,
}: WeatherOverlayCardProps) {
  const riskTone =
    riskLevel === "CRITICAL" || riskLevel === "HIGH_RISK"
      ? "text-amber-300"
      : riskLevel === "CAUTION"
        ? "text-amber-200/90"
        : "text-emerald-300";

  return (
    <aside
      data-testid="cockpit-weather-overlay"
      className={`${cockpitGlassCompact} pointer-events-auto w-[min(100%,11.5rem)] p-3`}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weather</p>
      <p className="mt-1 text-2xl font-bold text-white">{Math.round(temperatureF)}°F</p>
      <p className="mt-0.5 text-xs text-zinc-300">{summary}</p>
      <p data-testid="hud-weather-risk" className={`mt-2 text-xs font-semibold ${riskTone}`}>
        Risk: {riskLevel.replace("_", " ")}
      </p>
      <div
        className="mt-2 h-8 rounded-lg bg-gradient-to-r from-cyan-900/40 via-slate-800/60 to-amber-900/30"
        aria-hidden
      />
    </aside>
  );
}
