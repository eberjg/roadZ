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
      className={`${cockpitGlassCompact} pointer-events-auto p-2.5`}
    >
      <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Weather</p>
      <p className="text-xl font-bold leading-none text-white">{Math.round(temperatureF)}°F</p>
      <p className="mt-0.5 line-clamp-1 text-[10px] text-zinc-400">{summary}</p>
      <p data-testid="hud-weather-risk" className={`mt-1 text-[10px] font-semibold ${riskTone}`}>
        {riskLevel.replace("_", " ")}
      </p>
    </aside>
  );
}
